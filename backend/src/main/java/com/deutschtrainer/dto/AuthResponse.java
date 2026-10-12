package com.deutschtrainer.dto;

import java.util.UUID;

/**
 * Login/register response matching the app contract: {token, user}.
 * user.name maps to the users.display_name column; targetScore and targetLevel
 * are optional (the app uses targetLevel A1..C2).
 */
public record AuthResponse(String token, UserSummary user) {

    public record UserSummary(
            UUID id,
            String email,
            String name,
            String role,
            Integer targetScore,
            String targetLevel) {
    }
}
