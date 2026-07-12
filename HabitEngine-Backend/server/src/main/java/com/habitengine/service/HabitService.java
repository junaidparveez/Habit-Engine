package com.habitengine.service;

import com.habitengine.dto.request.CreateHabitRequest;
import com.habitengine.dto.request.UpdateHabitRequest;
import com.habitengine.dto.response.HabitResponse;

import com.habitengine.dto.request.CreateHabitCompletionRequest;
import com.habitengine.dto.response.HabitCompletionResponse;
import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for Habit operations.
 */
public interface HabitService {
    HabitResponse createHabit(CreateHabitRequest request, Long userId);
    List<HabitResponse> getAllHabits(Long userId, boolean isAdmin);
    List<HabitResponse> getActiveHabits(Long userId, boolean isAdmin);
    HabitResponse getHabitById(Long id, Long userId, boolean isAdmin);
    HabitResponse updateHabit(Long id, UpdateHabitRequest request, Long userId, boolean isAdmin);
    void deleteHabit(Long id, Long userId, boolean isAdmin);

    HabitCompletionResponse markHabitCompleted(Long habitId, CreateHabitCompletionRequest request, Long userId, boolean isAdmin);
    void unmarkHabitCompleted(Long habitId, LocalDate date, Long userId, boolean isAdmin);
    List<HabitCompletionResponse> getCompletions(Long habitId, Long userId, boolean isAdmin);
    List<com.habitengine.dto.response.TodayHabitResponse> getTodayHabits(LocalDate date, Long userId, boolean isAdmin);
    com.habitengine.dto.response.DashboardStatsResponse getDashboardStats(LocalDate date, Long userId, boolean isAdmin);
}
