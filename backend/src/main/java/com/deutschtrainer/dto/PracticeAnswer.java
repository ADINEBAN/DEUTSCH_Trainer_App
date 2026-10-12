package com.deutschtrainer.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record PracticeAnswer(
        UUID questionId,
        /** "selected" is the key the app sends; "selectedIndex" is kept for legacy callers. */
        @JsonAlias("selected") Integer selectedIndex) {
}
