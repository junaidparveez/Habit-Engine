package com.levelupai.mapper;

import com.levelupai.dto.response.HabitCompletionResponse;
import com.levelupai.entity.HabitCompletion;

public class HabitCompletionMapper {
    
    private HabitCompletionMapper() {
        // Utility class
    }

    public static HabitCompletionResponse toResponse(HabitCompletion completion) {
        if (completion == null) {
            return null;
        }

        return HabitCompletionResponse.builder()
                .id(completion.getId())
                .habitId(completion.getHabit() != null ? completion.getHabit().getId() : null)
                .completionDate(completion.getCompletionDate())
                .note(completion.getNote())
                .completedAt(completion.getCompletedAt())
                .build();
    }
}
