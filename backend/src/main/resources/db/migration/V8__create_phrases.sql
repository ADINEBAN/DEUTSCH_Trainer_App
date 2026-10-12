-- ============================================================================
-- V8 — phrases table: everyday communication sample sentences (2026-10-13)
--   * phrases (german, vietnamese, situation, level)
--   * Seed data lives in V8_1__seed_phrases_partN.sql (written by a separate
--     agent). V8 sorts before V8_1 so Flyway runs this first.
-- ============================================================================

CREATE TABLE phrases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    german TEXT NOT NULL,
    vietnamese TEXT NOT NULL,
    situation VARCHAR(80) NOT NULL,
    level VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_phrases_situation ON phrases (situation);
