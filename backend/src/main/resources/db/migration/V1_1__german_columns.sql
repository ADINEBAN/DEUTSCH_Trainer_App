-- ============================================================================
-- V1.1 — German vocabulary columns (2026-10-13)
--   Runs right after V1 so that V2/V3 seeds can populate the new columns.
--   (Renamed from V5: seeds in V2 reference article/plural, so the columns
--   must exist before V2 executes under Flyway version ordering.)
--   * vocabulary.article / vocabulary.plural  (der|die|das + plural form for nouns)
--   * custom_words.article / custom_words.plural
--   * photo_words.article / photo_words.plural
--   NOTE: example_en / definition_en keep their column names for technical
--   compatibility but now store German example sentences/definitions.
--   Does NOT touch V1__schema, V2/V3 seeds (rewritten separately by CONTENT).
-- ============================================================================

ALTER TABLE vocabulary  ADD COLUMN article VARCHAR(10);
ALTER TABLE vocabulary  ADD COLUMN plural   VARCHAR(120);
ALTER TABLE custom_words ADD COLUMN article VARCHAR(10);
ALTER TABLE custom_words ADD COLUMN plural   VARCHAR(120);
ALTER TABLE photo_words  ADD COLUMN article VARCHAR(10);
ALTER TABLE photo_words  ADD COLUMN plural   VARCHAR(120);
