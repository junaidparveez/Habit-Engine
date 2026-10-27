package com.levelupai.service.impl;

import com.levelupai.dto.request.RoutineBlockRequest;
import com.levelupai.dto.response.RoutineBlockResponse;
import com.levelupai.entity.Goal;
import com.levelupai.entity.GoalMilestone;
import com.levelupai.entity.Habit;
import com.levelupai.entity.RoutineBlock;
import com.levelupai.entity.User;
import com.levelupai.repository.GoalMilestoneRepository;
import com.levelupai.repository.GoalRepository;
import com.levelupai.repository.HabitRepository;
import com.levelupai.repository.RoutineBlockRepository;
import com.levelupai.service.RoutineBlockService;
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
public class RoutineBlockServiceImpl implements RoutineBlockService {

    private final RoutineBlockRepository routineBlockRepository;
    private final HabitRepository habitRepository;
    private final GoalRepository goalRepository;
    private final GoalMilestoneRepository milestoneRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoutineBlockResponse> getUserRoutine(User user) {
        List<RoutineBlock> blocks = routineBlockRepository.findByUserIdOrderByStartTimeAsc(user.getId());
        return blocks.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoutineBlockResponse createRoutineBlock(User user, RoutineBlockRequest request) {
        Habit habit = null;
        if (request.getLinkedHabitId() != null) {
            habit = habitRepository.findById(request.getLinkedHabitId()).orElse(null);
        }

        Goal goal = null;
        if (request.getLinkedGoalId() != null) {
            goal = goalRepository.findById(request.getLinkedGoalId()).orElse(null);
        }

        GoalMilestone milestone = null;
        if (request.getLinkedMilestoneId() != null) {
            milestone = milestoneRepository.findById(request.getLinkedMilestoneId()).orElse(null);
        }

        RoutineBlock block = RoutineBlock.builder()
                .userId(user.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .category(request.getCategory())
                .daysOfWeek(request.getDaysOfWeek() != null ? request.getDaysOfWeek() : "1,2,3,4,5,6,7")
                .linkedHabit(habit)
                .linkedGoal(goal)
                .linkedMilestone(milestone)
                .build();

        RoutineBlock saved = routineBlockRepository.save(block);
        log.info("Created routine block {} for user {}", saved.getId(), user.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RoutineBlockResponse updateRoutineBlock(User user, Long blockId, RoutineBlockRequest request) {
        RoutineBlock block = routineBlockRepository.findById(blockId)
                .filter(b -> b.getUserId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Routine block not found"));

        block.setTitle(request.getTitle());
        block.setDescription(request.getDescription());
        block.setStartTime(request.getStartTime());
        block.setEndTime(request.getEndTime());
        block.setCategory(request.getCategory());
        if (request.getDaysOfWeek() != null) {
            block.setDaysOfWeek(request.getDaysOfWeek());
        }

        if (request.getLinkedHabitId() != null) {
            Habit habit = habitRepository.findById(request.getLinkedHabitId()).orElse(null);
            block.setLinkedHabit(habit);
        } else {
            block.setLinkedHabit(null);
        }

        if (request.getLinkedGoalId() != null) {
            Goal goal = goalRepository.findById(request.getLinkedGoalId()).orElse(null);
            block.setLinkedGoal(goal);
        } else {
            block.setLinkedGoal(null);
        }

        if (request.getLinkedMilestoneId() != null) {
            GoalMilestone milestone = milestoneRepository.findById(request.getLinkedMilestoneId()).orElse(null);
            block.setLinkedMilestone(milestone);
        } else {
            block.setLinkedMilestone(null);
        }

        RoutineBlock updated = routineBlockRepository.save(block);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public RoutineBlockResponse toggleRoutineBlock(User user, Long blockId) {
        RoutineBlock block = routineBlockRepository.findById(blockId)
                .filter(b -> b.getUserId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Routine block not found"));

        LocalDate today = LocalDate.now();
        if (today.equals(block.getLastCompletedDate())) {
            block.setLastCompletedDate(null); // Uncheck
        } else {
            block.setLastCompletedDate(today); // Check
        }

        RoutineBlock updated = routineBlockRepository.save(block);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteRoutineBlock(User user, Long blockId) {
        RoutineBlock block = routineBlockRepository.findById(blockId)
                .filter(b -> b.getUserId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Routine block not found"));
        routineBlockRepository.delete(block);
        log.info("Deleted routine block {} for user {}", blockId, user.getId());
    }

    private RoutineBlockResponse mapToResponse(RoutineBlock b) {
        boolean completedToday = LocalDate.now().equals(b.getLastCompletedDate());
        return RoutineBlockResponse.builder()
                .id(b.getId())
                .userId(b.getUserId())
                .title(b.getTitle())
                .description(b.getDescription())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .category(b.getCategory())
                .daysOfWeek(b.getDaysOfWeek())
                .isCompletedToday(completedToday)
                .lastCompletedDate(b.getLastCompletedDate())
                .linkedHabitId(b.getLinkedHabit() != null ? b.getLinkedHabit().getId() : null)
                .linkedHabitName(b.getLinkedHabit() != null ? b.getLinkedHabit().getName() : null)
                .linkedGoalId(b.getLinkedGoal() != null ? b.getLinkedGoal().getId() : null)
                .linkedGoalName(b.getLinkedGoal() != null ? b.getLinkedGoal().getName() : null)
                .linkedMilestoneId(b.getLinkedMilestone() != null ? b.getLinkedMilestone().getId() : null)
                .linkedMilestoneTitle(b.getLinkedMilestone() != null ? b.getLinkedMilestone().getTitle() : null)
                .build();
    }
}
