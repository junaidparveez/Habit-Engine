package com.habitengine.service.impl;

import com.habitengine.dto.response.HeatmapResponse;
import com.habitengine.dto.response.TrendResponse;
import com.habitengine.entity.HabitCompletion;
import com.habitengine.repository.HabitCompletionRepository;
import com.habitengine.repository.HabitRepository;
import com.habitengine.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final HabitCompletionRepository habitCompletionRepository;
    private final HabitRepository habitRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HeatmapResponse> getHeatmapData(LocalDate startDate, LocalDate endDate, Long userId, boolean isAdmin) {
        log.info("Generating heatmap data from {} to {} for user {}", startDate, endDate, userId);
        List<HabitCompletion> completions = isAdmin ? 
                habitCompletionRepository.findByCompletionDateBetween(startDate, endDate) :
                habitCompletionRepository.findByHabitUserIdAndCompletionDateBetween(userId, startDate, endDate);
        
        Map<LocalDate, Long> completionsPerDay = completions.stream()
                .collect(Collectors.groupingBy(HabitCompletion::getCompletionDate, Collectors.counting()));

        List<HeatmapResponse> response = new ArrayList<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            response.add(HeatmapResponse.builder()
                    .date(currentDate)
                    .completedCount(completionsPerDay.getOrDefault(currentDate, 0L).intValue())
                    .build());
            currentDate = currentDate.plusDays(1);
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrendResponse> getWeeklyTrends(LocalDate startDate, LocalDate endDate, Long userId, boolean isAdmin) {
        log.info("Generating weekly trends from {} to {} for user {}", startDate, endDate, userId);
        
        int totalActiveHabits = isAdmin ? 
                habitRepository.findAllByIsActive(true).size() : 
                habitRepository.findAllByUserIdAndIsActive(userId, true).size();
        List<TrendResponse> response = new ArrayList<>();
        
        LocalDate currentStart = startDate;
        while (currentStart.isBefore(endDate)) {
            LocalDate currentEnd = currentStart.plusDays(6);
            if (currentEnd.isAfter(endDate)) {
                currentEnd = endDate;
            }
            
            List<HabitCompletion> weekCompletions = isAdmin ? 
                    habitCompletionRepository.findByCompletionDateBetween(currentStart, currentEnd) :
                    habitCompletionRepository.findByHabitUserIdAndCompletionDateBetween(userId, currentStart, currentEnd);
            int completedCount = weekCompletions.size();
            int daysInWeek = (int) java.time.temporal.ChronoUnit.DAYS.between(currentStart, currentEnd) + 1;
            int totalPossible = totalActiveHabits * daysInWeek;
            
            int completionRate = totalPossible == 0 ? 0 : Math.round(((float) completedCount / totalPossible) * 100);
            
            response.add(TrendResponse.builder()
                    .startDate(currentStart)
                    .endDate(currentEnd)
                    .completionRate(completionRate)
                    .build());
                    
            currentStart = currentStart.plusDays(7);
        }
        
        return response;
    }
}
