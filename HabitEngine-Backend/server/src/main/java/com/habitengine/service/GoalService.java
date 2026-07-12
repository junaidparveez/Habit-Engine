package com.habitengine.service;

import com.habitengine.dto.request.CreateGoalRequest;
import com.habitengine.dto.request.UpdateGoalRequest;
import com.habitengine.dto.response.GoalResponse;

import java.util.List;

public interface GoalService {
    GoalResponse createGoal(CreateGoalRequest request, Long userId);
    List<GoalResponse> getAllGoals(Long userId, boolean isAdmin);
    GoalResponse getGoalById(Long id, Long userId, boolean isAdmin);
    GoalResponse updateGoal(Long id, UpdateGoalRequest request, Long userId, boolean isAdmin);
    void deleteGoal(Long id, Long userId, boolean isAdmin);
}
