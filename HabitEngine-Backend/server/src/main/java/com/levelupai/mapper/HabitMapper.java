package com.levelupai.mapper;

import com.levelupai.dto.request.CreateHabitRequest;
import com.levelupai.dto.response.HabitResponse;
import com.levelupai.entity.Habit;

/**
 * Mapper for Habit conversions.
 */
public final class HabitMapper {

    private HabitMapper() {
        // Prevent instantiation
    }

    public static Habit toEntity(CreateHabitRequest request) {
        if (request == null) {
            return null;
        }
        return Habit.builder()
                .name(request.getName())
                .description(request.getDescription())
                .frequency(request.getFrequency())
                .frequencyConfig(request.getFrequencyConfig())
                .color(request.getColor())
                .icon(request.getIcon())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
    }

    public static HabitResponse toResponse(Habit entity) {
        if (entity == null) {
            return null;
        }

        com.levelupai.dto.response.HabitStreakResponse streakResponse = null;
        if (entity.getStreak() != null) {
            streakResponse = com.levelupai.dto.response.HabitStreakResponse.builder()
                    .currentStreak(entity.getStreak().getCurrentStreak())
                    .longestStreak(entity.getStreak().getLongestStreak())
                    .streakStartDate(entity.getStreak().getStreakStartDate())
                    .lastCompletionDate(entity.getStreak().getLastCompletionDate())
                    .build();
        }

        return HabitResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .category(CategoryMapper.toResponse(entity.getCategory()))
                .name(entity.getName())
                .description(entity.getDescription())
                .frequency(entity.getFrequency())
                .frequencyConfig(entity.getFrequencyConfig())
                .color(entity.getColor())
                .icon(entity.getIcon())
                .isActive(entity.isActive())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .streak(streakResponse)
                .goalId(entity.getGoal() != null ? entity.getGoal().getId() : null)
                .goalName(entity.getGoal() != null ? entity.getGoal().getName() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
