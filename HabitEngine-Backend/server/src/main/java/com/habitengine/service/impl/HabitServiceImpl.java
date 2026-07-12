package com.habitengine.service.impl;

import com.habitengine.dto.request.CreateHabitRequest;
import com.habitengine.dto.request.UpdateHabitRequest;
import com.habitengine.dto.response.HabitResponse;
import com.habitengine.entity.Category;
import com.habitengine.entity.Habit;
import com.habitengine.exception.DuplicateResourceException;
import com.habitengine.exception.ResourceNotFoundException;
import com.habitengine.mapper.HabitMapper;
import com.habitengine.repository.CategoryRepository;
import com.habitengine.repository.HabitRepository;
import com.habitengine.service.HabitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of HabitService.
 * Handles business logic for habits.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HabitServiceImpl implements HabitService {

    private final HabitRepository habitRepository;
    private final CategoryRepository categoryRepository;
    private final com.habitengine.repository.HabitCompletionRepository habitCompletionRepository;
    private final com.habitengine.service.StreakService streakService;
    private final com.habitengine.repository.GoalRepository goalRepository;
    private final com.habitengine.service.GamificationService gamificationService;

    @Override
    @Transactional
    public HabitResponse createHabit(CreateHabitRequest request, Long userId) {
        log.info("Creating habit: {} for user: {}", request.getName(), userId);

        if (habitRepository.existsByNameAndUserId(request.getName(), userId)) {
            log.warn("Habit name: {} already exists for user: {}", request.getName(), userId);
            throw new DuplicateResourceException("Habit", "name", request.getName());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        if (request.getEndDate() != null && request.getEndDate().isBefore(startDate)) {
            log.warn("End date {} is before start date {}", request.getEndDate(), startDate);
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        Habit habit = HabitMapper.toEntity(request);
        habit.setUserId(userId);
        habit.setCategory(category);
        habit.setStartDate(startDate);
        
        if (request.getGoalId() != null) {
            com.habitengine.entity.Goal goal = goalRepository.findById(request.getGoalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", request.getGoalId()));
            habit.setGoal(goal);
        }

        Habit saved = habitRepository.save(habit);
        log.info("Habit created successfully with ID: {}", saved.getId());
        
        // Initialize empty streak for new habit
        streakService.recalculateStreak(saved);

        return HabitMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HabitResponse> getAllHabits(Long userId, boolean isAdmin) {
        log.debug("Fetching all habits for user: {}", userId);
        List<Habit> habits = isAdmin ? habitRepository.findAll() : habitRepository.findAllByUserId(userId);
        return habits.stream()
                .map(HabitMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HabitResponse> getActiveHabits(Long userId, boolean isAdmin) {
        log.debug("Fetching active habits for user: {}", userId);
        List<Habit> habits = isAdmin ? habitRepository.findAllByIsActive(true) : habitRepository.findAllByUserIdAndIsActive(userId, true);
        return habits.stream()
                .map(HabitMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HabitResponse getHabitById(Long id, Long userId, boolean isAdmin) {
        log.debug("Fetching habit with ID: {}", id);
        Habit habit = isAdmin ? 
                habitRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Habit", "id", id)) :
                habitRepository.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Habit", "id", id));
        return HabitMapper.toResponse(habit);
    }

    @Override
    @Transactional
    public HabitResponse updateHabit(Long id, UpdateHabitRequest request, Long userId, boolean isAdmin) {
        log.info("Updating habit with ID: {}", id);

        Habit habit = isAdmin ? 
                habitRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Habit", "id", id)) :
                habitRepository.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Habit", "id", id));

        // Duplicate name verification (excluding own ID)
        if (!habit.getName().equalsIgnoreCase(request.getName()) && habitRepository.existsByNameAndUserId(request.getName(), habit.getUserId())) {
            log.warn("Habit name: {} already exists during update", request.getName());
            throw new DuplicateResourceException("Habit", "name", request.getName());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : habit.getStartDate();
        if (request.getEndDate() != null && request.getEndDate().isBefore(startDate)) {
            log.warn("Update failed: End date {} is before start date {}", request.getEndDate(), startDate);
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        habit.setName(request.getName());
        habit.setDescription(request.getDescription());
        habit.setFrequency(request.getFrequency());
        habit.setFrequencyConfig(request.getFrequencyConfig());
        habit.setCategory(category);
        habit.setColor(request.getColor());
        habit.setIcon(request.getIcon());
        habit.setStartDate(startDate);
        habit.setEndDate(request.getEndDate());

        if (request.getIsActive() != null) {
            habit.setActive(request.getIsActive());
        }
        
        if (request.getGoalId() != null) {
            com.habitengine.entity.Goal goal = goalRepository.findById(request.getGoalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", request.getGoalId()));
            habit.setGoal(goal);
        } else {
            habit.setGoal(null);
        }

        Habit updated = habitRepository.save(habit);
        log.info("Habit with ID: {} updated successfully", id);

        return HabitMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteHabit(Long id, Long userId, boolean isAdmin) {
        log.info("Deleting habit with ID: {}", id);
        Habit habit = isAdmin ? 
                habitRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Habit", "id", id)) :
                habitRepository.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Habit", "id", id));
        habitRepository.delete(habit);
        log.info("Habit with ID: {} deleted successfully", id);
    }

    @Override
    @Transactional
    public com.habitengine.dto.response.HabitCompletionResponse markHabitCompleted(Long habitId, com.habitengine.dto.request.CreateHabitCompletionRequest request, Long userId, boolean isAdmin) {
        log.info("Marking habit {} as completed for date: {}", habitId, request.getCompletionDate());
        Habit habit = isAdmin ? 
                habitRepository.findById(habitId).orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId)) :
                habitRepository.findByIdAndUserId(habitId, userId).orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId));

        if (habitCompletionRepository.findByHabitIdAndCompletionDate(habitId, request.getCompletionDate()).isPresent()) {
            throw new DuplicateResourceException("HabitCompletion", "date", request.getCompletionDate().toString());
        }

        com.habitengine.entity.HabitCompletion completion = com.habitengine.entity.HabitCompletion.builder()
                .habit(habit)
                .completionDate(request.getCompletionDate())
                .note(request.getNote())
                .build();

        com.habitengine.entity.HabitCompletion saved = habitCompletionRepository.save(completion);
        
        // Recalculate streak
        streakService.recalculateStreak(habit);

        // Gamification: Add XP to the current user (base + streak bonus)
        int xpToAdd = 10; // base XP for completion
        
        // Streak bonus logic: +5 XP for every 3 days in current streak
        if (habit.getStreak() != null && habit.getStreak().getCurrentStreak() > 0) {
            int currentStreak = habit.getStreak().getCurrentStreak();
            if (currentStreak % 3 == 0) {
                xpToAdd += 5; // Bonus for milestone streak
            }
        }
        gamificationService.addXp(userId, xpToAdd);
        
        return com.habitengine.mapper.HabitCompletionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void unmarkHabitCompleted(Long habitId, LocalDate date, Long userId, boolean isAdmin) {
        log.info("Unmarking habit {} as completed for date: {}", habitId, date);
        Habit habit = isAdmin ? 
                habitRepository.findById(habitId).orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId)) :
                habitRepository.findByIdAndUserId(habitId, userId).orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId));

        com.habitengine.entity.HabitCompletion completion = habitCompletionRepository.findByHabitIdAndCompletionDate(habitId, date)
                .orElseThrow(() -> new ResourceNotFoundException("HabitCompletion", "date", date.toString()));
        habitCompletionRepository.delete(completion);
        
        // Recalculate streak
        streakService.recalculateStreak(habit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.habitengine.dto.response.HabitCompletionResponse> getCompletions(Long habitId, Long userId, boolean isAdmin) {
        log.debug("Fetching completions for habit ID: {}", habitId);
        Habit habit = isAdmin ? 
                habitRepository.findById(habitId).orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId)) :
                habitRepository.findByIdAndUserId(habitId, userId).orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId));

        return habitCompletionRepository.findByHabitId(habitId).stream()
                .map(com.habitengine.mapper.HabitCompletionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.habitengine.dto.response.TodayHabitResponse> getTodayHabits(LocalDate date, Long userId, boolean isAdmin) {
        log.debug("Fetching today's habits for date: {}", date);
        List<Habit> activeHabits = isAdmin ? 
                habitRepository.findAllByIsActive(true) : 
                habitRepository.findAllByUserIdAndIsActive(userId, true);
        // For Milestone 4, we assume all active habits should be done daily.
        // In Milestone 5 (streaks/frequencies), this will be filtered by frequency config.

        return activeHabits.stream().map(habit -> {
            var completionOpt = habitCompletionRepository.findByHabitIdAndCompletionDate(habit.getId(), date);
            return com.habitengine.dto.response.TodayHabitResponse.builder()
                    .habit(HabitMapper.toResponse(habit))
                    .completedToday(completionOpt.isPresent())
                    .completionDetails(completionOpt.map(com.habitengine.mapper.HabitCompletionMapper::toResponse).orElse(null))
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public com.habitengine.dto.response.DashboardStatsResponse getDashboardStats(LocalDate date, Long userId, boolean isAdmin) {
        log.debug("Calculating dashboard stats for date: {}", date);
        List<Habit> activeHabits = isAdmin ? 
                habitRepository.findAllByIsActive(true) : 
                habitRepository.findAllByUserIdAndIsActive(userId, true);
        
        int totalActive = activeHabits.size();
        int completedToday = 0;
        int globalCurrentStreak = 0;
        int globalLongestStreak = 0;
        
        int totalXp = 0;
        if (!isAdmin) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.habitengine.entity.User) {
                totalXp = ((com.habitengine.entity.User) auth.getPrincipal()).getCurrentXp();
            }
        }

        for (Habit habit : activeHabits) {
            boolean isCompleted = habitCompletionRepository.findByHabitIdAndCompletionDate(habit.getId(), date).isPresent();
            if (isCompleted) {
                completedToday++;
            }
            
            if (habit.getStreak() != null) {
                globalCurrentStreak = Math.max(globalCurrentStreak, habit.getStreak().getCurrentStreak());
                globalLongestStreak = Math.max(globalLongestStreak, habit.getStreak().getLongestStreak());
            }
        }
        
        int completionRate = totalActive == 0 ? 0 : Math.round(((float) completedToday / totalActive) * 100);

        return com.habitengine.dto.response.DashboardStatsResponse.builder()
                .totalXp(totalXp)
                .globalCurrentStreak(globalCurrentStreak)
                .globalLongestStreak(globalLongestStreak)
                .todayCompletionRate(completionRate)
                .completedToday(completedToday)
                .totalToday(totalActive)
                .build();
    }
}
