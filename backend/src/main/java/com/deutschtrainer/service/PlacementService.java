package com.deutschtrainer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.deutschtrainer.common.ApiException;
import com.deutschtrainer.domain.PlacementResult;
import com.deutschtrainer.domain.Question;
import com.deutschtrainer.dto.PlacementSubmitRequest;
import com.deutschtrainer.dto.PracticeAnswer;
import com.deutschtrainer.repo.PlacementResultRepository;
import com.deutschtrainer.repo.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Placement test: short quiz -> estimated level + roadmap suggestion. */
@Service
public class PlacementService {

    private final QuestionRepository questions;
    private final PlacementResultRepository results;
    private final ObjectMapper objectMapper;

    public PlacementService(QuestionRepository questions,
                            PlacementResultRepository results,
                            ObjectMapper objectMapper) {
        this.questions = questions;
        this.results = results;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getQuiz() {
        List<Question> list = questions.findRandomByMode("placement", 12);
        if (list.isEmpty()) {
            throw ApiException.serviceUnavailable("Chưa có đề kiểm tra đầu vào. Vui lòng thử lại sau.");
        }
        return list.stream().map(q -> {
            Map<String, Object> body = readJson(q.getQuestionJson());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", q.getId().toString());
            m.put("part", q.getPart());
            m.putAll(body);
            return m;
        }).toList();
    }

    @Transactional
    public Map<String, Object> submit(UUID userId, PlacementSubmitRequest req) {
        List<PracticeAnswer> answers = req.answers() == null ? List.of() : req.answers();
        int correct = 0;
        for (PracticeAnswer a : answers) {
            Question q = questions.findById(a.questionId())
                    .orElseThrow(() -> ApiException.badRequest("Câu hỏi không tồn tại."));
            Object v = readJson(q.getQuestionJson()).get("answer_index");
            int correctIndex = v instanceof Number n ? n.intValue() : -1;
            if (a.selectedIndex() != null && a.selectedIndex() == correctIndex) {
                correct++;
            }
        }
        int total = Math.max(answers.size(), 1);
        double ratio = (double) correct / total;

        // CEFR placement bands (Goethe 0-100 scale): hard enough to classify up to C2.
        String level;
        int estimatedScore;
        if (ratio < 0.30) {
            level = "A1";
            estimatedScore = 20;
        } else if (ratio < 0.45) {
            level = "A2";
            estimatedScore = 35;
        } else if (ratio < 0.60) {
            level = "B1";
            estimatedScore = 50;
        } else if (ratio < 0.75) {
            level = "B2";
            estimatedScore = 65;
        } else if (ratio < 0.88) {
            level = "C1";
            estimatedScore = 80;
        } else {
            level = "C2";
            estimatedScore = 93;
        }

        PlacementResult r = new PlacementResult();
        r.setUserId(userId);
        r.setLevel(level);
        try {
            r.setScores(objectMapper.writeValueAsString(Map.of("correct", correct, "total", answers.size())));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
        results.save(r);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("correct", correct);
        out.put("total", answers.size());
        out.put("level", level);
        out.put("estimatedScore", estimatedScore);
        out.put("roadmap", roadmapFor(level));
        return out;
    }

    /**
     * Starter roadmap steps for a placed CEFR level, matching the app's
     * RoadmapStep shape [{title, description}].
     */
    private List<Map<String, String>> roadmapFor(String level) {
        List<Map<String, String>> steps = new ArrayList<>();
        steps.add(Map.of(
                "title", "Từ vựng trọng tâm " + level,
                "description", "Ôn flashcard SRS mỗi ngày theo chủ đề của trình độ " + level
                        + ": Wortschatz trước, mở rộng dần sang cụm từ và cách dùng."));
        switch (level) {
            case "A1" -> {
                steps.add(Map.of(
                        "title", "Ngữ pháp nền (Grammatik)",
                        "description", "Nắm chắc mạo từ der/die/das, chia động từ thì hiện tại và cấu trúc câu cơ bản."));
                steps.add(Map.of(
                        "title", "Luyện nghe chậm (Hörverstehen)",
                        "description", "Nghe các đoạn hội thoại ngắn tốc độ chậm, nhắc lại theo (shadowing) 15 phút mỗi ngày."));
            }
            case "A2" -> {
                steps.add(Map.of(
                        "title", "Ngữ pháp A2: thì quá khứ",
                        "description", "Học Perfekt và Präteritum, giới từ chỉ nơi chốn và cách dùng Akkusativ/Dativ."));
                steps.add(Map.of(
                        "title", "Đọc hiểu đoạn ngắn (Leseverstehen)",
                        "description", "Đọc email, thông báo và đoạn văn ngắn; làm 10 câu đọc hiểu mỗi ngày."));
            }
            case "B1" -> {
                steps.add(Map.of(
                        "title", "Ngữ pháp B1: câu phức",
                        "description", "Luyện mệnh đề phụ với weil/dass/wenn, câu bị động và Konjunktiv II cơ bản."));
                steps.add(Map.of(
                        "title", "Nghe tốc độ thật (Hörverstehen)",
                        "description", "Nghe tin tức ngắn và hội thoại đời thường, ghi lại ý chính sau mỗi lần nghe."));
            }
            case "B2" -> {
                steps.add(Map.of(
                        "title", "Từ vựng học thuật & công việc",
                        "description", "Mở rộng vốn từ theo chủ đề công sở, tranh luận; học collocation thay vì từ đơn lẻ."));
                steps.add(Map.of(
                        "title", "Mock test định kỳ",
                        "description", "Làm 1 bài Half Test mỗi 2 tuần, phân tích lỗi theo từng module (Wortschatz/Grammatik/Leseverstehen/Hörverstehen)."));
            }
            default -> { // C1, C2
                steps.add(Map.of(
                        "title", "Luyện đề Full đúng giờ thi",
                        "description", "Làm Full Test 40 câu đúng thời gian thi thật, rà soát lỗi sai theo module."));
                steps.add(Map.of(
                        "title", "Duy trì & nâng cao",
                        "description", "Dùng Speaking Coach chấm phát âm, đọc báo tiếng Đức mỗi ngày để giữ phong độ."));
            }
        }
        return steps;
    }

    private Map<String, Object> readJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            throw ApiException.serviceUnavailable("Dữ liệu câu hỏi bị lỗi.");
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> history(UUID userId) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (PlacementResult r : results.findByUserIdOrderByCreatedAtDesc(userId)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId().toString());
            m.put("level", r.getLevel());
            m.put("scores", r.getScores());
            m.put("createdAt", r.getCreatedAt().toString());
            out.add(m);
        }
        return out;
    }
}
