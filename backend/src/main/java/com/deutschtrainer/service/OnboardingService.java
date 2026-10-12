package com.deutschtrainer.service;

import com.deutschtrainer.common.ApiException;
import com.deutschtrainer.common.GermanModules;
import com.deutschtrainer.domain.User;
import com.deutschtrainer.domain.UserStats;
import com.deutschtrainer.repo.UserRepository;
import com.deutschtrainer.repo.UserStatsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Onboarding: save the learner's goal and return a starter roadmap. */
@Service
public class OnboardingService {

    private final UserRepository users;
    private final UserStatsRepository stats;
    private final StatsService statsService;

    public OnboardingService(UserRepository users,
                             UserStatsRepository stats,
                             StatsService statsService) {
        this.users = users;
        this.stats = stats;
        this.statsService = statsService;
    }

    /**
     * POST /api/onboarding/complete — stores the learner's goal on the user and the
     * daily goal on user_stats, then returns a PlacementResult-like payload
     * {estimatedScore, level, roadmap[]} derived from the target.
     *
     * <p>The app sends {targetLevel, minutesPerDay, studyDays}; targetScore
     * (1-100) is still accepted for compatibility: when a targetLevel is given
     * it is stored directly (targetScore derived only if absent), when only a
     * targetScore is given the CEFR level is derived from it.</p>
     */
    @Transactional
    public Map<String, Object> complete(UUID userId, Integer targetScore, String targetLevel,
                                        Integer minutesPerDay, List<Integer> studyDays) {
        String level = null;
        Integer score = targetScore;
        if (targetLevel != null && !targetLevel.isBlank()) {
            level = GermanModules.normalizeLevel(targetLevel);
            if (score == null) {
                score = GermanModules.scoreForLevel(level);
            }
        } else if (score != null) {
            level = GermanModules.levelForScore(score);
        }
        if (score == null || score < 1 || score > 100) {
            throw ApiException.badRequest("Mục tiêu phải là trình độ A1–C2 hoặc điểm từ 1 đến 100.");
        }
        int minutes = minutesPerDay == null ? 30 : Math.min(Math.max(minutesPerDay, 5), 480);
        List<Integer> days = studyDays == null ? List.of() : studyDays;

        User user = users.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Tài khoản không tồn tại."));
        user.setTargetScore(score);
        user.setTargetLevel(level);
        users.save(user);

        UserStats s = stats.findById(userId).orElseGet(() -> {
            UserStats fresh = new UserStats();
            fresh.setUserId(userId);
            return fresh;
        });
        s.setDailyGoalMinutes(minutes);
        stats.save(s);
        statsService.touchActive(userId);

        List<Map<String, String>> roadmap = roadmapFor(score, minutes, days);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("estimatedScore", 0);
        out.put("level", level);
        out.put("roadmap", roadmap);
        out.put("targetLevel", level);
        out.put("targetScore", score);
        out.put("minutesPerDay", minutes);
        return out;
    }

    private static List<Map<String, String>> roadmapFor(int target, int minutes, List<Integer> days) {
        String schedule = days.isEmpty()
                ? "mỗi ngày"
                : days.size() + " ngày/tuần";
        List<Map<String, String>> steps = new ArrayList<>();
        steps.add(step("Đặt nền tảng từ vựng",
                "Học " + minutes + " phút " + schedule + ", ưu tiên flashcard SRS để ghi nhớ lâu."));
        if (target >= 50) {
            steps.add(step("Luyện nghe (Hörverstehen)",
                    "Nghe và nhắc lại (shadowing) 15 phút mỗi buổi để quen tốc độ đề thi Goethe."));
        }
        if (target >= 65) {
            steps.add(step("Luyện đọc (Leseverstehen)",
                    "Làm 20 câu đọc hiểu mỗi ngày, ghi lại lỗi sai vào sổ tay để ôn lại."));
        }
        steps.add(step("Kiểm tra tiến độ",
                "Làm 1 bài Mini Test mỗi tuần. Khi điểm ước tính chạm " + target
                        + ", chuyển sang Half/Full Test đúng giờ thi thật."));
        return steps;
    }

    private static Map<String, String> step(String title, String description) {
        return Map.of("title", title, "description", description);
    }
}
