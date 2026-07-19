package com.habitengine.dto.response;

import com.habitengine.enums.RoutineCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineBlockResponse {

    private Long id;
    private Long userId;
    private String title;
    private String description;
    private LocalTime startTime;
    private LocalTime endTime;
    private RoutineCategory category;
    private String daysOfWeek;
    private boolean isCompletedToday;
    private LocalDate lastCompletedDate;
    private Long linkedHabitId;
    private String linkedHabitName;
    private Long linkedGoalId;
    private String linkedGoalName;
    private Long linkedMilestoneId;
    private String linkedMilestoneTitle;
}
