package com.levelupai.service.impl;

import com.levelupai.dto.GoalMilestoneDTO;
import com.levelupai.dto.StudyResourceDTO;
import com.levelupai.dto.request.CreateGoalRequest;
import com.levelupai.dto.request.UpdateGoalRequest;
import com.levelupai.dto.response.GoalResponse;
import com.levelupai.entity.Goal;
import com.levelupai.entity.GoalMilestone;
import com.levelupai.entity.Habit;
import com.levelupai.entity.RoutineBlock;
import com.levelupai.entity.StudyResource;
import com.levelupai.exception.DuplicateResourceException;
import com.levelupai.exception.ResourceNotFoundException;
import com.levelupai.mapper.GoalMapper;
import com.levelupai.repository.GoalMilestoneRepository;
import com.levelupai.repository.GoalRepository;
import com.levelupai.repository.RoutineBlockRepository;
import com.levelupai.repository.StudyResourceRepository;
import com.levelupai.service.GoalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final GoalMilestoneRepository milestoneRepository;
    private final StudyResourceRepository resourceRepository;
    private final RoutineBlockRepository routineBlockRepository;

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

        // Unlink routine blocks referencing this goal
        List<RoutineBlock> blocks = routineBlockRepository.findByLinkedGoalId(id);
        for (RoutineBlock block : blocks) {
            block.setLinkedGoal(null);
            block.setLinkedMilestone(null);
            routineBlockRepository.save(block);
        }
        
        goalRepository.delete(goal);
    }

    @Override
    @Transactional
    public GoalMilestoneDTO addMilestone(Long goalId, GoalMilestoneDTO dto, Long userId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", goalId));

        GoalMilestone milestone = GoalMilestone.builder()
                .goal(goal)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .targetWeek(dto.getTargetWeek())
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .isCompleted(false)
                .build();

        GoalMilestone saved = milestoneRepository.save(milestone);
        return mapMilestoneToDTO(saved);
    }

    @Override
    @Transactional
    public GoalMilestoneDTO toggleMilestone(Long milestoneId, Long userId) {
        GoalMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", "id", milestoneId));

        milestone.setCompleted(!milestone.isCompleted());
        GoalMilestone updated = milestoneRepository.save(milestone);
        return mapMilestoneToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteMilestone(Long milestoneId, Long userId) {
        GoalMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", "id", milestoneId));

        // Unlink routine blocks referencing this milestone
        List<RoutineBlock> blocks = routineBlockRepository.findByLinkedMilestoneId(milestoneId);
        for (RoutineBlock block : blocks) {
            block.setLinkedMilestone(null);
            routineBlockRepository.save(block);
        }

        milestoneRepository.delete(milestone);
    }

    @Override
    @Transactional
    public StudyResourceDTO addResource(Long userId, StudyResourceDTO dto) {
        Goal goal = dto.getGoalId() != null ? goalRepository.findById(dto.getGoalId()).orElse(null) : null;
        GoalMilestone milestone = dto.getMilestoneId() != null ? milestoneRepository.findById(dto.getMilestoneId()).orElse(null) : null;

        StudyResource resource = StudyResource.builder()
                .userId(userId)
                .goal(goal)
                .milestone(milestone)
                .title(dto.getTitle())
                .resourceType(dto.getResourceType())
                .urlOrContent(dto.getUrlOrContent())
                .build();

        StudyResource saved = resourceRepository.save(resource);
        return mapResourceToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteResource(Long resourceId, Long userId) {
        StudyResource resource = resourceRepository.findById(resourceId)
                .filter(r -> r.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("StudyResource", "id", resourceId));
        resourceRepository.delete(resource);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudyResourceDTO> getUserResources(Long userId) {
        return resourceRepository.findByUserId(userId).stream()
                .map(this::mapResourceToDTO)
                .collect(Collectors.toList());
    }

    private GoalResponse enrichWithProgress(Goal goal) {
        GoalResponse response = GoalMapper.toResponse(goal);
        
        List<GoalMilestone> milestones = milestoneRepository.findByGoalIdOrderBySortOrderAscTargetWeekAsc(goal.getId());
        response.setMilestones(milestones.stream().map(this::mapMilestoneToDTO).collect(Collectors.toList()));

        List<StudyResource> resources = resourceRepository.findByGoalId(goal.getId());
        response.setResources(resources.stream().map(this::mapResourceToDTO).collect(Collectors.toList()));

        if ("ACHIEVED".equalsIgnoreCase(goal.getStatus())) {
            response.setProgress(100);
        } else if (!milestones.isEmpty()) {
            long completedMilestones = milestones.stream().filter(GoalMilestone::isCompleted).count();
            response.setProgress((int) Math.round(((double) completedMilestones / milestones.size()) * 100));
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

    private GoalMilestoneDTO mapMilestoneToDTO(GoalMilestone m) {
        return GoalMilestoneDTO.builder()
                .id(m.getId())
                .goalId(m.getGoal().getId())
                .title(m.getTitle())
                .description(m.getDescription())
                .targetWeek(m.getTargetWeek())
                .isCompleted(m.isCompleted())
                .sortOrder(m.getSortOrder())
                .build();
    }

    private StudyResourceDTO mapResourceToDTO(StudyResource r) {
        return StudyResourceDTO.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .goalId(r.getGoal() != null ? r.getGoal().getId() : null)
                .milestoneId(r.getMilestone() != null ? r.getMilestone().getId() : null)
                .title(r.getTitle())
                .resourceType(r.getResourceType())
                .urlOrContent(r.getUrlOrContent())
                .build();
    }
}
