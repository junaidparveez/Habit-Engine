package com.habitengine.mapper;

import com.habitengine.dto.response.HabitCompletionResponse;
import com.habitengine.entity.HabitCompletion;

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
