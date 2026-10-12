package com.deutschtrainer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.deutschtrainer.common.ApiException;
import com.deutschtrainer.domain.PlacementResult;
import com.deutschtrainer.domain.PracticeAttempt;
import com.deutschtrainer.domain.User;
import com.deutschtrainer.domain.UserStats;
import com.deutschtrainer.repo.PlacementResultRepository;
import com.deutschtrainer.repo.PracticeAttemptRepository;
import com.deutschtrainer.repo.UserRepository;
import com.deutschtrainer.repo.UserStatsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Home dashboard stats for the app. */
@Service
public class DashboardService {

    private final UserRepository users;
    private final UserStatsRepository stats;
    private final PlacementResultRepository placements;
    private final PracticeAttemptRepository attempts;
    private final ObjectMapper objectMapper;

    public DashboardService(UserRepository users,
                            UserStatsRepository stats,
                            PlacementResultRepository placements,
                            PracticeAttemptRepository attempts,
                            ObjectMapper objectMapper) {
        this.users = users;
        this.stats = stats;
        this.placements = placements;
        this.attempts = attempts;
        this.objectMapper = objectMapper;
    }

    /** GET /api/dashboard — app contract shape. */
    @Transactional(readOnly = true)
    public Map<String, Object> dashboard(UUID userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Tài khoản không tồn tại."));
        UserStats s = stats.findById(userId).orElseGet(() -> {
            UserStats fresh = new UserStats();
            fresh.setUserId(userId);
            return fresh;
        });

        int estimatedScore = estimatedScore(userId);

        Integer target = user.getTargetScore();
        Map<String, Object> milestone;
        if (target != null && estimatedScore >= target) {
            milestone = Map.of(
                    "title", "Đạt mục tiêu " + target + "!",
                    "description", "Bạn đã chạm mốc mục tiêu. Hãy đặt mục tiêu cao hơn hoặc duy trì streak mỗi ngày.");
        } else if (target != null) {
            milestone = Map.of(
                    "title", "Mốc tiếp theo: " + target,
                    "description", "Điểm ước tính hiện tại " + estimatedScore
                            + ". Hoàn thành 1 bài Mini Test mỗi tuần để tiến gần mục tiêu.");
        } else if (estimatedScore == 0) {
            milestone = Map.of(
                    "title", "Làm bài kiểm tra đầu vào",
                    "description", "Hoàn thành bài placement để nhận điểm ước tính và lộ trình học phù hợp.");
        } else {
            milestone = Map.of(
                    "title", "Chinh phục mốc " + (estimatedScore + 100),
                    "description", "Điểm ước tính hiện tại " + estimatedScore
                            + ". Ôn flashcard mỗi ngày để tăng thêm 100 điểm.");
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("estimatedScore", estimatedScore);
        out.put("estimatedLevel", estimatedScore == 0
                ? null : com.deutschtrainer.common.GermanModules.levelForScore(estimatedScore));
        out.put("streakDays", s.getStreak());
        out.put("xp", s.getXp());
        out.put("level", s.getLevel());
        // Daily study minutes are not tracked per-day yet — report honestly.
        out.put("dailyDoneMinutes", 0);
        out.put("dailyGoalMinutes", s.getDailyGoalMinutes());
        out.put("nextMilestone", milestone);
        return out;
    }

    /**
     * Latest placement score, else the average practice correct-ratio scaled to
     * the Goethe 0-100 scale, else 0 (honest: no fake baseline).
     */
    private int estimatedScore(UUID userId) {
        List<PlacementResult> history = placements.findByUserIdOrderByCreatedAtDesc(userId);
        if (!history.isEmpty()) {
            return bandScore(readCorrect(history.get(0)), readTotal(history.get(0)));
        }
        List<PracticeAttempt> recent = attempts.findByUserIdOrderByCreatedAtDesc(userId);
        int correct = 0, total = 0;
        for (PracticeAttempt a : recent.subList(0, Math.min(recent.size(), 10))) {
            correct += a.getScore();
            total += a.getTotal();
        }
        if (total == 0) {
            return 0;
        }
        return (int) Math.round((double) correct / total * 100);
    }

    /** Same CEFR bands as PlacementService so the dashboard agrees with placement. */
    private static int bandScore(int correct, int total) {
        double ratio = total == 0 ? 0 : (double) correct / total;
        if (ratio < 0.30) {
            return 20;   // A1
        }
        if (ratio < 0.45) {
            return 35;   // A2
        }
        if (ratio < 0.60) {
            return 50;   // B1
        }
        if (ratio < 0.75) {
            return 65;   // B2
        }
        if (ratio < 0.88) {
            return 80;   // C1
        }
        return 93;       // C2
    }

    private int readCorrect(PlacementResult r) {
        return readScores(r).getOrDefault("correct", 0);
    }

    private int readTotal(PlacementResult r) {
        return Math.max(readScores(r).getOrDefault("total", 0), 1);
    }

    private Map<String, Integer> readScores(PlacementResult r) {
        try {
            return objectMapper.readValue(r.getScores(), new TypeReference<>() {
            });
        } catch (Exception e) {
            return Map.of();
        }
    }
}
