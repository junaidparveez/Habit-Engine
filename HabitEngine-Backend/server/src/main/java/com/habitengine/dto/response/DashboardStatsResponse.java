package com.habitengine.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private int totalXp;
    private int globalCurrentStreak; // Max current streak across active habits
    private int globalLongestStreak; // Max longest streak across all habits
    private int todayCompletionRate; // Percentage (0-100)
    private int completedToday;
    private int totalToday;
}
