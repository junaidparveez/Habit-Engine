package com.habitengine.service.impl;

import com.habitengine.entity.Habit;
import com.habitengine.entity.HabitCompletion;
import com.habitengine.entity.HabitStreak;
import com.habitengine.repository.HabitCompletionRepository;
import com.habitengine.repository.HabitStreakRepository;
import com.habitengine.service.StreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StreakServiceImpl implements StreakService {

    private final HabitStreakRepository streakRepository;
    private final HabitCompletionRepository completionRepository;

    @Override
    @Transactional
    public void recalculateStreak(Habit habit) {
        log.debug("Recalculating streak for habit ID: {}", habit.getId());
        
        List<HabitCompletion> completions = completionRepository.findByHabitId(habit.getId()).stream()
                .sorted(Comparator.comparing(HabitCompletion::getCompletionDate).reversed())
                .collect(Collectors.toList());

        HabitStreak streak = streakRepository.findByHabitId(habit.getId())
                .orElse(HabitStreak.builder()
                        .habit(habit)
                        .currentStreak(0)
                        .longestStreak(0)
                        .build());

        if (completions.isEmpty()) {
            streak.setCurrentStreak(0);
            streak.setStreakStartDate(null);
            streak.setLastCompletionDate(null);
            streakRepository.save(streak);
            return;
        }

        LocalDate today = LocalDate.now();
        int current = 0;
        int longest = streak.getLongestStreak(); // Preserve historical longest streak if it was higher
        LocalDate lastChecked = null;
        LocalDate streakStart = null;

        // Simplified for DAILY frequency in Milestone 5
        for (HabitCompletion completion : completions) {
            LocalDate date = completion.getCompletionDate();
            
            // Skip future dates if any accidentally exist
            if (date.isAfter(today)) continue;

            if (lastChecked == null) {
                // First one in the sorted list (most recent)
                // If the most recent is older than yesterday, the current streak is broken (0).
                if (date.isBefore(today.minusDays(1))) {
                    break;
                }
                current = 1;
                streakStart = date;
                lastChecked = date;
            } else {
                // Check if contiguous (exactly 1 day difference)
                if (date.equals(lastChecked.minusDays(1))) {
                    current++;
                    streakStart = date;
                    lastChecked = date;
                } else if (date.equals(lastChecked)) {
                    // Duplicate entry for same day, just ignore
                    continue;
                } else {
                    // Gap found, streak broken
                    break;
                }
            }
        }

        if (current > longest) {
            longest = current;
        }

        streak.setCurrentStreak(current);
        streak.setLongestStreak(longest);
        streak.setLastCompletionDate(completions.get(0).getCompletionDate());
        streak.setStreakStartDate(current > 0 ? streakStart : null);

        streakRepository.save(streak);
        log.debug("Streak recalculated for habit {}: current={}, longest={}", habit.getId(), current, longest);
    }
}
