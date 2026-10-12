package com.deutschtrainer.web;

import com.deutschtrainer.common.ApiResponse;
import com.deutschtrainer.dto.AuthResponse;
import com.deutschtrainer.dto.ForgotPasswordRequest;
import com.deutschtrainer.dto.LoginRequest;
import com.deutschtrainer.dto.RegisterRequest;
import com.deutschtrainer.dto.ResetPasswordRequest;
import com.deutschtrainer.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ApiResponse.ok(authService.register(req), "Đăng ký thành công.");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.ok(authService.login(req), "Đăng nhập thành công.");
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req.email());
        return ApiResponse.ok(
                Map.of("email", req.email()),
                "Nếu email tồn tại trong hệ thống, link đặt lại mật khẩu đã được gửi.");
    }

    @PostMapping("/reset-password")
    public ApiResponse<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.token(), req.newPassword());
        return ApiResponse.ok(Map.of(), "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
    }
}
