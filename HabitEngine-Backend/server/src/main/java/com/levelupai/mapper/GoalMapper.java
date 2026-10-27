package com.levelupai.mapper;

import com.levelupai.dto.request.CreateGoalRequest;
import com.levelupai.dto.response.GoalResponse;
import com.levelupai.entity.Goal;
import com.levelupai.entity.Habit;

public class GoalMapper {

    public static Goal toEntity(CreateGoalRequest request) {
        if (request == null) return null;
        
        return Goal.builder()
                .name(request.getName())
                .description(request.getDescription())
                .targetDate(request.getTargetDate())
                .build();
    }

    public static GoalResponse toResponse(Goal goal) {
        if (goal == null) return null;
        
        // Compute progress based on linked habits.
        // For simplicity, a goal's progress could be the average completion rate of its habits in the last 30 days.
        // For this milestone, we'll implement a simple progress: 
        // if there are habits, we check if they have streaks or active tracking, 
        // but to keep it simple without DB queries per habit here, we can set progress in the service layer, 
        // or just calculate based on a simple formula. For now, progress is populated by the service.
        
        return GoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .description(goal.getDescription())
                .targetDate(goal.getTargetDate())
                .status(goal.getStatus())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .totalHabits(goal.getHabits() != null ? goal.getHabits().size() : 0)
                .progress(0) // Overridden by service layer
                .build();
    }
}
