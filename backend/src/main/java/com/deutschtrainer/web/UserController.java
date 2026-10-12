package com.deutschtrainer.web;

import com.deutschtrainer.common.ApiResponse;
import com.deutschtrainer.security.SecurityUtils;
import com.deutschtrainer.service.AuthService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Current user profile. */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me() {
        return ApiResponse.ok(authService.me(SecurityUtils.currentUserId()));
    }

    @PatchMapping("/me")
    public ApiResponse<Map<String, Object>> updateMe(@RequestBody Map<String, Object> body) {
        String name = body == null || body.get("name") == null
                ? null : String.valueOf(body.get("name"));
        Integer targetScore = body != null && body.get("targetScore") instanceof Number n
                ? n.intValue() : null;
        String targetLevel = body != null && body.get("targetLevel") != null
                ? String.valueOf(body.get("targetLevel")) : null;
        return ApiResponse.ok(
                authService.updateMe(SecurityUtils.currentUserId(), name, targetScore, targetLevel),
                "Đã cập nhật thông tin.");
    }
}
