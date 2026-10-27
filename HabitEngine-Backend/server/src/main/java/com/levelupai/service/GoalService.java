package com.levelupai.service;

import com.levelupai.dto.request.CreateGoalRequest;
import com.levelupai.dto.request.UpdateGoalRequest;
import com.levelupai.dto.response.GoalResponse;

import java.util.List;

public interface GoalService {
    GoalResponse createGoal(CreateGoalRequest request, Long userId);
    List<GoalResponse> getAllGoals(Long userId, boolean isAdmin);
    GoalResponse getGoalById(Long id, Long userId, boolean isAdmin);
    GoalResponse updateGoal(Long id, UpdateGoalRequest request, Long userId, boolean isAdmin);
    void deleteGoal(Long id, Long userId, boolean isAdmin);

    com.levelupai.dto.GoalMilestoneDTO addMilestone(Long goalId, com.levelupai.dto.GoalMilestoneDTO dto, Long userId);
    com.levelupai.dto.GoalMilestoneDTO toggleMilestone(Long milestoneId, Long userId);
    void deleteMilestone(Long milestoneId, Long userId);

    com.levelupai.dto.StudyResourceDTO addResource(Long userId, com.levelupai.dto.StudyResourceDTO dto);
    void deleteResource(Long resourceId, Long userId);
    List<com.levelupai.dto.StudyResourceDTO> getUserResources(Long userId);
}
