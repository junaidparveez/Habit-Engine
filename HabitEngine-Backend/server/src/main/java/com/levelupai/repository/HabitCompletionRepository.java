package com.levelupai.repository;

import com.levelupai.entity.HabitCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitCompletionRepository extends JpaRepository<HabitCompletion, Long> {
    List<HabitCompletion> findByHabitId(Long habitId);
    List<HabitCompletion> findByCompletionDate(LocalDate completionDate);
    Optional<HabitCompletion> findByHabitIdAndCompletionDate(Long habitId, LocalDate completionDate);
    List<HabitCompletion> findByCompletionDateBetween(LocalDate startDate, LocalDate endDate);
    List<HabitCompletion> findByHabitUserIdAndCompletionDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
