-- ============================================================================
-- V7 — User target CEFR level (2026-10-13)
--   * users.target_level (onboarding + PATCH /api/users/me)
--     The app sends targetLevel A1..C2; target_score is kept for compatibility.
-- ============================================================================

ALTER TABLE users ADD COLUMN target_level VARCHAR(10);
