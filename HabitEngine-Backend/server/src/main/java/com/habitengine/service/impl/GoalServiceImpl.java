package com.habitengine.service.impl;

import com.habitengine.dto.request.CreateGoalRequest;
import com.habitengine.dto.request.UpdateGoalRequest;
import com.habitengine.dto.response.GoalResponse;
import com.habitengine.entity.Goal;
import com.habitengine.entity.Habit;
import com.habitengine.exception.DuplicateResourceException;
import com.habitengine.exception.ResourceNotFoundException;
import com.habitengine.mapper.GoalMapper;
import com.habitengine.repository.GoalRepository;
import com.habitengine.service.GoalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;

    @Override
    @Transactional
    public GoalResponse createGoal(CreateGoalRequest request, Long userId) {
        log.info("Creating goal: {} for user: {}", request.getName(), userId);

        if (goalRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new DuplicateResourceException("Goal", "name", request.getName());
        }

        Goal goal = GoalMapper.toEntity(request);
        goal.setUserId(userId);
        Goal saved = goalRepository.save(goal);
        
        return enrichWithProgress(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalResponse> getAllGoals(Long userId, boolean isAdmin) {
        log.debug("Fetching goals for user: {}", userId);
        List<Goal> goals = isAdmin ? 
                goalRepository.findAll() : 
                goalRepository.findAllByUserId(userId);
                
        return goals.stream()
                .map(this::enrichWithProgress)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GoalResponse getGoalById(Long id, Long userId, boolean isAdmin) {
        Goal goal = isAdmin ? 
                goalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id)) :
                goalRepository.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));
        return enrichWithProgress(goal);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(Long id, UpdateGoalRequest request, Long userId, boolean isAdmin) {
        Goal goal = isAdmin ? 
                goalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id)) :
                goalRepository.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));

        if (!goal.getName().equalsIgnoreCase(request.getName()) && goalRepository.existsByNameAndUserId(request.getName(), goal.getUserId())) {
            throw new DuplicateResourceException("Goal", "name", request.getName());
        }

        goal.setName(request.getName());
        goal.setDescription(request.getDescription());
        goal.setTargetDate(request.getTargetDate());
        
        if (request.getStatus() != null) {
            goal.setStatus(request.getStatus());
        }

        Goal updated = goalRepository.save(goal);
        return enrichWithProgress(updated);
    }

    @Override
    @Transactional
    public void deleteGoal(Long id, Long userId, boolean isAdmin) {
        Goal goal = isAdmin ? 
                goalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id)) :
                goalRepository.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));
        
        // Unlink habits from this goal
        for (Habit habit : goal.getHabits()) {
            habit.setGoal(null);
        }
        
        goalRepository.delete(goal);
    }
    
    private GoalResponse enrichWithProgress(Goal goal) {
        GoalResponse response = GoalMapper.toResponse(goal);
        
        // Very basic progress calculation based on linked habits' active status or streaks.
        // If a goal has habits, we could calculate progress.
        // If a goal is ACHIEVED, progress is 100.
        if ("ACHIEVED".equalsIgnoreCase(goal.getStatus())) {
            response.setProgress(100);
        } else if (goal.getHabits() != null && !goal.getHabits().isEmpty()) {
            int totalHabits = goal.getHabits().size();
            int activeStreaks = 0;
            for (Habit h : goal.getHabits()) {
                if (h.getStreak() != null && h.getStreak().getCurrentStreak() > 0) {
                    activeStreaks++;
                }
            }
            response.setProgress(Math.round(((float) activeStreaks / totalHabits) * 100));
        } else {
            response.setProgress(0);
        }
        
        return response;
    }
}
