package com.deutschtrainer.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/** Question bank entry (Parts 1-7, practice / placement / mock). */
@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private int part;

    @Column(nullable = false)
    private String mode = "practice"; // practice|placement|mock

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "question_json", nullable = false, columnDefinition = "jsonb")
    private String questionJson;

    private String topic;

    private String level;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
