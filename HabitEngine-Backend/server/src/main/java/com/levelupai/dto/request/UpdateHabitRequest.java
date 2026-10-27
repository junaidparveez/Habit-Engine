package com.levelupai.dto.request;

import com.levelupai.enums.HabitFrequency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO for updating an existing Habit.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHabitRequest {

    @NotBlank(message = "Habit name is required")
    @Size(max = 100, message = "Habit name must not exceed 100 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Frequency is required")
    private HabitFrequency frequency;

    private String frequencyConfig;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String color;

    private String icon;

    private Boolean isActive;

    private LocalDate startDate;

    private LocalDate endDate;

    private Long goalId;
}
