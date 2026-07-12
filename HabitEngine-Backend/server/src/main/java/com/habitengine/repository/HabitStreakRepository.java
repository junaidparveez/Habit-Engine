package com.habitengine.repository;

import com.habitengine.entity.HabitStreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HabitStreakRepository extends JpaRepository<HabitStreak, Long> {
    Optional<HabitStreak> findByHabitId(Long habitId);
}
