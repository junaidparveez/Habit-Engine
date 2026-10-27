package com.levelupai.service;

import com.levelupai.dto.request.CreateHabitRequest;
import com.levelupai.dto.request.UpdateHabitRequest;
import com.levelupai.dto.response.HabitResponse;

import com.levelupai.dto.request.CreateHabitCompletionRequest;
import com.levelupai.dto.response.HabitCompletionResponse;
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
    List<com.levelupai.dto.response.TodayHabitResponse> getTodayHabits(LocalDate date, Long userId, boolean isAdmin);
    com.levelupai.dto.response.DashboardStatsResponse getDashboardStats(LocalDate date, Long userId, boolean isAdmin);
}
