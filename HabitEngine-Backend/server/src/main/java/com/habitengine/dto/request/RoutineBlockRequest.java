package com.habitengine.dto.request;

import com.habitengine.enums.RoutineCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineBlockRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotNull(message = "Category is required")
    private RoutineCategory category;

    private String daysOfWeek;
    private Long linkedHabitId;
    private Long linkedGoalId;
    private Long linkedMilestoneId;
}
