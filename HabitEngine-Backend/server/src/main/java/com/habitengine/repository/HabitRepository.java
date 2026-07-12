package com.habitengine.repository;

import com.habitengine.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Habit entity.
 */
@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findAllByIsActive(boolean isActive);
    List<Habit> findAllByUserId(Long userId);
    List<Habit> findAllByUserIdAndIsActive(Long userId, boolean isActive);
    List<Habit> findAllByCategoryId(Long categoryId);
    List<Habit> findAllByCategoryIdAndUserId(Long categoryId, Long userId);
    Optional<Habit> findByIdAndUserId(Long id, Long userId);
    boolean existsByName(String name);
    boolean existsByNameAndUserId(String name, Long userId);
}
