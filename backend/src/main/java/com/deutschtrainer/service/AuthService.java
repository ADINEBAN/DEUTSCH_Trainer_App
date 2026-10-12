package com.deutschtrainer.service;

import com.deutschtrainer.common.ApiException;
import com.deutschtrainer.common.GermanModules;
import com.deutschtrainer.domain.PasswordResetToken;
import com.deutschtrainer.domain.User;
import com.deutschtrainer.domain.UserStats;
import com.deutschtrainer.dto.AuthResponse;
import com.deutschtrainer.dto.LoginRequest;
import com.deutschtrainer.dto.RegisterRequest;
import com.deutschtrainer.repo.PasswordResetTokenRepository;
import com.deutschtrainer.repo.UserRepository;
import com.deutschtrainer.repo.UserStatsRepository;
import com.deutschtrainer.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/** Registration, login, and password-reset flows. */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository users;
    private final UserStatsRepository stats;
    private final PasswordResetTokenRepository resetTokens;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwt;
    private final long resetTokenExpirationMs;

    public AuthService(UserRepository users,
                       UserStatsRepository stats,
                       PasswordResetTokenRepository resetTokens,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwt,
                       @Value("${app.jwt.reset-token-expiration-ms}") long resetTokenExpirationMs) {
        this.users = users;
        this.stats = stats;
        this.resetTokens = resetTokens;
        this.passwordEncoder = passwordEncoder;
        this.jwt = jwt;
        this.resetTokenExpirationMs = resetTokenExpirationMs;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw ApiException.conflict("Email này đã được đăng ký.");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setDisplayName(req.displayName() == null || req.displayName().isBlank()
                ? email.split("@")[0] : req.displayName().trim());
        user.setRole("USER");
        users.save(user);

        UserStats userStats = new UserStats();
        userStats.setUserId(user.getId());
        stats.save(userStats);

        String token = jwt.generateToken(user.getId(), user.getEmail(), user.getRole());
        return toAuthResponse(user, token);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        User user = users.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Email hoặc mật khẩu không đúng."));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Email hoặc mật khẩu không đúng.");
        }
        String token = jwt.generateToken(user.getId(), user.getEmail(), user.getRole());
        return toAuthResponse(user, token);
    }

    /**
     * Admin sign-in: same credentials check as login, but the account must
     * carry ROLE_ADMIN, otherwise 403.
     */
    @Transactional(readOnly = true)
    public AuthResponse adminLogin(LoginRequest req) {
        AuthResponse res = login(req);
        if (!"ADMIN".equals(res.user().role())) {
            throw ApiException.forbidden("Tài khoản này không có quyền quản trị.");
        }
        return res;
    }

    /** GET /api/users/me — current user profile. */
    @Transactional(readOnly = true)
    public Map<String, Object> me(UUID userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Tài khoản không tồn tại."));
        return toUserMap(user);
    }

    /** PATCH /api/users/me — update display name, target score and/or target CEFR level. */
    @Transactional
    public Map<String, Object> updateMe(UUID userId, String name, Integer targetScore, String targetLevel) {
        User user = users.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Tài khoản không tồn tại."));
        if (name != null) {
            String trimmed = name.trim();
            if (trimmed.isEmpty()) {
                throw ApiException.badRequest("Tên hiển thị không được để trống.");
            }
            user.setDisplayName(trimmed);
        }
        if (targetScore != null) {
            if (targetScore < 1 || targetScore > 100) {
                throw ApiException.badRequest("Điểm mục tiêu phải từ 1 đến 100.");
            }
            user.setTargetScore(targetScore);
        }
        if (targetLevel != null) {
            if (targetLevel.isBlank()) {
                user.setTargetLevel(null); // explicit clear
            } else {
                user.setTargetLevel(GermanModules.normalizeLevel(targetLevel));
            }
        }
        return toUserMap(users.save(user));
    }

    /**
     * Generates a time-limited reset token. In dev the token is logged so the
     * developer can complete the flow; in production this must be emailed.
     */
    @Transactional
    public void forgotPassword(String email) {
        String normalized = email.trim().toLowerCase();
        users.findByEmail(normalized).ifPresent(user -> {
            String token = UUID.randomUUID() + "-" + UUID.randomUUID();
            PasswordResetToken prt = new PasswordResetToken();
            prt.setUserId(user.getId());
            prt.setTokenHash(sha256(token));
            prt.setExpiresAt(Instant.now().plusMillis(resetTokenExpirationMs));
            resetTokens.save(prt);
            // DEV ONLY: real deployments must email this link instead.
            log.warn("DEV password-reset token for {}: {} (valid {} ms). "
                    + "Wire an email sender before production use.", normalized, token, resetTokenExpirationMs);
        });
        // Always respond the same way to avoid email enumeration.
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = resetTokens.findByTokenHashAndUsedFalse(sha256(token))
                .orElseThrow(() -> ApiException.badRequest("Link đặt lại không hợp lệ hoặc đã hết hạn."));
        if (prt.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("Link đặt lại đã hết hạn. Vui lòng yêu cầu link mới.");
        }
        User user = users.findById(prt.getUserId())
                .orElseThrow(() -> ApiException.badRequest("Tài khoản không tồn tại."));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        prt.setUsed(true);
        users.save(user);
        resetTokens.save(prt);
    }

    private static AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(token, new AuthResponse.UserSummary(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getTargetScore(),
                user.getTargetLevel()));
    }

    /** App-facing user shape: {id, email, name, role, targetScore, targetLevel}. */
    private static Map<String, Object> toUserMap(User user) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", user.getId().toString());
        m.put("email", user.getEmail());
        m.put("name", user.getDisplayName() == null ? "" : user.getDisplayName());
        m.put("role", user.getRole());
        m.put("targetScore", user.getTargetScore());
        m.put("targetLevel", user.getTargetLevel());
        return m;
    }

    private static String sha256(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
