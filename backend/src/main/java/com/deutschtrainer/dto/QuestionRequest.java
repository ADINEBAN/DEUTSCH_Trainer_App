package com.deutschtrainer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record QuestionRequest(
        /** Present on app upserts (PUT without an id path variable); ignored on create. */
        String id,
        Integer part,
        /** Goethe module name (WORTSCHATZ|GRAMMATIK|LESEVERSTEHEN|HOERVERSTEHEN); wins over part. */
        String module,
        String mode,
        String questionJson,
        String topic,
        String level,
        // App-shape fields (admin app sends these instead of questionJson;
        // the service synthesizes questionJson from them when it is blank).
        String prompt,
        List<String> options,
        Integer correctIndex,
        String explanation,
        String imageUrl,
        String audioUrl) {
}
