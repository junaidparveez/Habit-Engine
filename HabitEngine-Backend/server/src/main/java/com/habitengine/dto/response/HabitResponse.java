package com.habitengine.dto.response;

import com.habitengine.enums.HabitFrequency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Response DTO for Habit.
 * Never exposes the raw entity to the API layer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitResponse {
    private Long id;
    private Long userId;
    private CategoryResponse category;
    private String name;
    private String description;
    private HabitFrequency frequency;
    private String frequencyConfig;
    private String color;
    private String icon;
    private boolean isActive;
    private LocalDate startDate;
    private LocalDate endDate;
    private HabitStreakResponse streak;
    private Instant createdAt;
    private Instant updatedAt;
    
    private Long goalId;
    private String goalName;
}
