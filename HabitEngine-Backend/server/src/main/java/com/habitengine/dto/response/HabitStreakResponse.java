package com.habitengine.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitStreakResponse {
    private int currentStreak;
    private int longestStreak;
    private LocalDate streakStartDate;
    private LocalDate lastCompletionDate;
}
