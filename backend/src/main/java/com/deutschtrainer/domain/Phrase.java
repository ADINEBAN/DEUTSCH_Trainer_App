package com.deutschtrainer.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/** Everyday communication sample sentence (created in V8). */
@Entity
@Table(name = "phrases")
@Getter
@Setter
@NoArgsConstructor
public class Phrase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String german;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String vietnamese;

    /** Communication situation, e.g. "begruessung", "restaurant". Max 80 chars. */
    @Column(length = 80, nullable = false)
    private String situation;

    /** CEFR level tag (A1..C2); null if not tagged. */
    @Column(length = 10)
    private String level;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
