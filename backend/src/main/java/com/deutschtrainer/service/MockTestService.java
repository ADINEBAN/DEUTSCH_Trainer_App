package com.deutschtrainer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.deutschtrainer.common.ApiException;
import com.deutschtrainer.common.GermanModules;
import com.deutschtrainer.domain.PracticeAttempt;
import com.deutschtrainer.domain.Question;
import com.deutschtrainer.domain.TestSession;
import com.deutschtrainer.dto.TestAnswer;
import com.deutschtrainer.repo.PracticeAttemptRepository;
import com.deutschtrainer.repo.QuestionRepository;
import com.deutschtrainer.repo.TestSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Mini/Half/Full mock tests. Questions are served WITHOUT answers;
 * grading uses the Goethe 0–100 scale per module: each module's score is
 * round(correct/total*100) and the total is the average of the modules.
 * A submitted test is also recorded as a practice_attempt so its mistakes
 * show up in the notebook.
 */
@Service
public class MockTestService {

    private final TestSessionRepository sessions;
    private final QuestionRepository questions;
    private final PracticeAttemptRepository attempts;
    private final PracticeService practiceService;
    private final StatsService statsService;
    private final ObjectMapper objectMapper;

    public MockTestService(TestSessionRepository sessions,
                           QuestionRepository questions,
                           PracticeAttemptRepository attempts,
                           PracticeService practiceService,
                           StatsService statsService,
                           ObjectMapper objectMapper) {
        this.sessions = sessions;
        this.questions = questions;
        this.attempts = attempts;
        this.practiceService = practiceService;
        this.statsService = statsService;
        this.objectMapper = objectMapper;
    }

    /** POST /api/tests/start — samples questions, hides answers. */
    @Transactional
    public Map<String, Object> start(UUID userId, String kind) {
        String k = kind == null ? "" : kind.trim().toUpperCase();
        int durationMinutes = switch (k) {
            case "MINI" -> 20;
            case "HALF" -> 60;
            case "FULL" -> 120;
            default -> throw ApiException.badRequest("kind phải là MINI|HALF|FULL.");
        };

        // Questions are split evenly across the 4 Goethe modules (part 1-4).
        // Prefer a dedicated 'mock' bank; fall back to the practice bank per module.
        int[][] plan = switch (k) {
            case "MINI" -> new int[][]{{1, 3}, {2, 3}, {3, 2}, {4, 2}};
            case "HALF" -> new int[][]{{1, 5}, {2, 5}, {3, 5}, {4, 5}};
            case "FULL" -> new int[][]{{1, 10}, {2, 10}, {3, 10}, {4, 10}};
            default -> throw ApiException.badRequest("kind phải là MINI|HALF|FULL.");
        };
        int count = 0;
        for (int[] p : plan) {
            count += p[1];
        }
        List<Question> bank = new ArrayList<>();
        for (int[] p : plan) {
            List<Question> got = questions.findRandomByModeAndPart("mock", p[0], p[1]);
            if (got.isEmpty()) {
                got = questions.findRandomByModeAndPart("practice", p[0], p[1]);
            }
            bank.addAll(got);
        }
        if (bank.isEmpty()) {
            throw ApiException.serviceUnavailable("Ngân hàng câu hỏi đang trống. Vui lòng thử lại sau.");
        }

        TestSession s = new TestSession();
        s.setUserId(userId);
        s.setKind(k);
        try {
            s.setQuestionIds(objectMapper.writeValueAsString(
                    bank.stream().map(q -> q.getId().toString()).toList()));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
        sessions.save(s);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("testId", s.getId().toString());
        out.put("kind", k);
        out.put("questions", bank.stream().map(q -> practiceService.toAppQuestionMap(q, false)).toList());
        out.put("durationMinutes", durationMinutes);
        out.put("note", bank.size() < count
                ? "Ngân hàng hiện chỉ có " + bank.size() + " câu nên bài thi dùng toàn bộ số câu có sẵn."
                : null);
        return out;
    }

    /** GET /api/tests/{id}/questions — the same question set, still without answers. */
    @Transactional(readOnly = true)
    public Map<String, Object> testQuestions(UUID userId, UUID testId) {
        TestSession s = load(userId, testId);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("testId", s.getId().toString());
        out.put("kind", s.getKind());
        out.put("questions", sessionQuestions(s).stream()
                .map(q -> practiceService.toAppQuestionMap(q, false)).toList());
        out.put("durationMinutes", durationMinutes(s.getKind()));
        out.put("submitted", s.isSubmitted());
        return out;
    }

    /** POST /api/tests/{id}/submit — grades, persists, and returns the full TestResult. */
    @Transactional
    public Map<String, Object> submit(UUID userId, UUID testId, List<TestAnswer> answers) {
        TestSession s = load(userId, testId);
        if (s.isSubmitted()) {
            return storedResult(s);
        }
        List<TestAnswer> list = answers == null ? List.of() : answers;
        Map<UUID, Integer> byQuestion = new LinkedHashMap<>();
        for (TestAnswer a : list) {
            if (a.questionId() != null) {
                byQuestion.put(a.questionId(), a.selected());
            }
        }

        List<Question> bank = sessionQuestions(s);
        List<Map<String, Object>> mistakes = new ArrayList<>();
        List<Map<String, Object>> detail = new ArrayList<>();
        int[] moduleCorrect = new int[5]; // index 1-4
        int[] moduleTotal = new int[5];

        for (Question q : bank) {
            Integer selected = byQuestion.get(q.getId());
            int correctIndex = practiceService.answerIndex(q);
            boolean correct = selected != null && selected == correctIndex;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("questionId", q.getId().toString());
            row.put("selectedIndex", selected);
            row.put("correctIndex", correctIndex);
            row.put("correct", correct);
            detail.add(row);

            if (q.getPart() >= 1 && q.getPart() <= 4) {
                moduleTotal[q.getPart()]++;
                if (correct) {
                    moduleCorrect[q.getPart()]++;
                }
            }
            if (!correct) {
                Map<String, Object> m = practiceService.toAppQuestionMap(q, true);
                m.put("selectedIndex", selected);
                mistakes.add(m);
            }
        }

        List<Map<String, Object>> moduleScores = moduleScores(moduleCorrect, moduleTotal);
        int listeningScore = scoreOf(moduleScores, "HOERVERSTEHEN"); // compat: Hörverstehen
        int readingScore = scoreOf(moduleScores, "LESEVERSTEHEN");   // compat: Leseverstehen
        int totalScore = (int) Math.round(moduleScores.stream()
                .mapToInt(ms -> (int) ms.get("score")).average().orElse(0));
        int correctCount = 0;
        for (int p = 1; p <= 4; p++) {
            correctCount += moduleCorrect[p];
        }

        s.setSubmitted(true);
        s.setListeningScore(listeningScore);
        s.setReadingScore(readingScore);
        s.setTotalScore(totalScore);
        try {
            s.setAnswers(objectMapper.writeValueAsString(detail));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
        sessions.save(s);

        // Mirror into practice_attempts so the mistakes surface in the notebook.
        PracticeAttempt attempt = new PracticeAttempt();
        attempt.setUserId(userId);
        attempt.setMode(s.getKind().toLowerCase()); // mini|half|full
        attempt.setScore(correctCount);
        attempt.setTotal(bank.size());
        try {
            attempt.setDetail(objectMapper.writeValueAsString(detail));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
        attempts.save(attempt);

        statsService.addXp(userId, correctCount * 10 + 20);

        return storedResult(s);
    }

    /** GET /api/tests/{id}/result — the stored, graded result. */
    @Transactional(readOnly = true)
    public Map<String, Object> result(UUID userId, UUID testId) {
        TestSession s = load(userId, testId);
        if (!s.isSubmitted()) {
            throw ApiException.notFound("Bài thi chưa được nộp.");
        }
        return storedResult(s);
    }

    // ------------------------------------------------------------------
    private TestSession load(UUID userId, UUID testId) {
        return sessions.findByIdAndUserId(testId, userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy bài thi."));
    }

    private List<Question> sessionQuestions(TestSession s) {
        List<String> ids = readIds(s.getQuestionIds());
        List<Question> out = new ArrayList<>();
        for (String id : ids) {
            questions.findById(UUID.fromString(id)).ifPresent(out::add);
        }
        return out;
    }

    private Map<String, Object> storedResult(TestSession s) {
        List<Question> bank = sessionQuestions(s);
        List<Map<String, Object>> mistakes = new ArrayList<>();
        List<Map<String, Object>> detail = readDetail(s.getAnswers());
        Map<String, Map<String, Object>> byId = new LinkedHashMap<>();
        for (Map<String, Object> row : detail) {
            byId.put(String.valueOf(row.get("questionId")), row);
        }
        int correctCount = 0;
        for (Question q : bank) {
            Map<String, Object> row = byId.get(q.getId().toString());
            boolean correct = row != null && Boolean.TRUE.equals(row.get("correct"));
            if (correct) {
                correctCount++;
            } else {
                Map<String, Object> m = practiceService.toAppQuestionMap(q, true);
                m.put("selectedIndex", row == null ? null : row.get("selectedIndex"));
                mistakes.add(m);
            }
        }
        List<Map<String, Object>> perPart = new ArrayList<>();
        int[] moduleCorrect = new int[5];
        int[] moduleTotal = new int[5];
        for (Question q : bank) {
            if (q.getPart() >= 1 && q.getPart() <= 4) {
                moduleTotal[q.getPart()]++;
                Map<String, Object> row = byId.get(q.getId().toString());
                if (row != null && Boolean.TRUE.equals(row.get("correct"))) {
                    moduleCorrect[q.getPart()]++;
                }
            }
        }
        List<Map<String, Object>> moduleScores = moduleScores(moduleCorrect, moduleTotal);
        for (int part = 1; part <= 4; part++) {
            if (moduleTotal[part] > 0) {
                Map<String, Object> e = new LinkedHashMap<>();
                e.put("part", part);
                e.put("module", GermanModules.moduleForPart(part));
                e.put("correct", moduleCorrect[part]);
                e.put("total", moduleTotal[part]);
                perPart.add(e);
            }
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("testId", s.getId().toString());
        out.put("kind", s.getKind());
        out.put("totalScore", s.getTotalScore() == null ? 0 : s.getTotalScore());
        out.put("correctCount", correctCount);
        out.put("totalCount", bank.size());
        out.put("moduleScores", moduleScores);
        // Compat keys kept for older consumers.
        out.put("listeningScore", s.getListeningScore() == null ? 0 : s.getListeningScore());
        out.put("readingScore", s.getReadingScore() == null ? 0 : s.getReadingScore());
        out.put("perPart", perPart);
        out.put("mistakes", mistakes);
        return out;
    }

    /** One entry per Goethe module: {module, score (0-100), correct, total}. */
    private static List<Map<String, Object>> moduleScores(int[] correct, int[] total) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (int part = 1; part <= 4; part++) {
            Map<String, Object> ms = new LinkedHashMap<>();
            ms.put("module", GermanModules.moduleForPart(part));
            ms.put("score", scale(correct[part], total[part]));
            ms.put("correct", correct[part]);
            ms.put("total", total[part]);
            out.add(ms);
        }
        return out;
    }

    private static int scoreOf(List<Map<String, Object>> moduleScores, String module) {
        for (Map<String, Object> ms : moduleScores) {
            if (module.equals(ms.get("module"))) {
                return (int) ms.get("score");
            }
        }
        return 0;
    }

    /** Goethe scale: a module's correct ratio mapped to 0–100, rounded. */
    private static int scale(int correct, int total) {
        if (total == 0) {
            return 0;
        }
        return (int) Math.round((double) correct / total * 100);
    }

    private static int durationMinutes(String kind) {
        return switch (kind) {
            case "MINI" -> 20;
            case "HALF" -> 60;
            default -> 120;
        };
    }

    private List<String> readIds(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }

    private List<Map<String, Object>> readDetail(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }
}
