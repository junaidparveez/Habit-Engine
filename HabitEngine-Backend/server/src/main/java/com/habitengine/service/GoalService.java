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

    com.habitengine.dto.GoalMilestoneDTO addMilestone(Long goalId, com.habitengine.dto.GoalMilestoneDTO dto, Long userId);
    com.habitengine.dto.GoalMilestoneDTO toggleMilestone(Long milestoneId, Long userId);
    void deleteMilestone(Long milestoneId, Long userId);

    com.habitengine.dto.StudyResourceDTO addResource(Long userId, com.habitengine.dto.StudyResourceDTO dto);
    void deleteResource(Long resourceId, Long userId);
    List<com.habitengine.dto.StudyResourceDTO> getUserResources(Long userId);
}
