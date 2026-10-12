package com.deutschtrainer.common;

import java.util.List;

/**
 * Goethe module <-> legacy Part mapping, plus CEFR helpers.
 *
 * <p>Seed questions use part 1 = WORTSCHATZ, 2 = GRAMMATIK,
 * 3 = LESEVERSTEHEN, 4 = HOERVERSTEHEN. The app sends module names
 * (case-insensitive); the DB keeps the numeric part column.</p>
 */
public final class GermanModules {

    public static final List<String> MODULES =
            List.of("WORTSCHATZ", "GRAMMATIK", "LESEVERSTEHEN", "HOERVERSTEHEN");

    public static final List<String> CEFR_LEVELS =
            List.of("A1", "A2", "B1", "B2", "C1", "C2");

    private GermanModules() {
    }

    /** Part 1-4 -> module name, or {@code null} for legacy parts outside 1-4. */
    public static String moduleForPart(int part) {
        return switch (part) {
            case 1 -> "WORTSCHATZ";
            case 2 -> "GRAMMATIK";
            case 3 -> "LESEVERSTEHEN";
            case 4 -> "HOERVERSTEHEN";
            default -> null;
        };
    }

    /** Module name (case-insensitive) -> part 1-4. Throws 400 on unknown. */
    public static int partForModule(String module) {
        if (module == null) {
            throw ApiException.badRequest("Module không hợp lệ.");
        }
        return switch (module.trim().toUpperCase()) {
            case "WORTSCHATZ" -> 1;
            case "GRAMMATIK" -> 2;
            case "LESEVERSTEHEN" -> 3;
            case "HOERVERSTEHEN" -> 4;
            default -> throw ApiException.badRequest(
                    "Module phải là WORTSCHATZ|GRAMMATIK|LESEVERSTEHEN|HOERVERSTEHEN.");
        };
    }

    /** Validates a CEFR level (case-insensitive) and returns it upper-cased. Throws 400 on unknown. */
    public static String normalizeLevel(String level) {
        if (level == null) {
            throw ApiException.badRequest("Trình độ phải là A1–C2.");
        }
        String l = level.trim().toUpperCase();
        if (!CEFR_LEVELS.contains(l)) {
            throw ApiException.badRequest("Trình độ phải là A1–C2.");
        }
        return l;
    }

    /** Goethe 0-100 score -> CEFR level (same bands as PlacementService). */
    public static String levelForScore(int score) {
        if (score < 30) {
            return "A1";
        }
        if (score < 45) {
            return "A2";
        }
        if (score < 60) {
            return "B1";
        }
        if (score < 75) {
            return "B2";
        }
        if (score < 88) {
            return "C1";
        }
        return "C2";
    }

    /** CEFR level -> representative Goethe 0-100 score (the placement band score). */
    public static int scoreForLevel(String level) {
        return switch (normalizeLevel(level)) {
            case "A1" -> 20;
            case "A2" -> 35;
            case "B1" -> 50;
            case "B2" -> 65;
            case "C1" -> 80;
            default -> 93; // C2
        };
    }
}
