package com.habitengine.repository;

import com.habitengine.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    Optional<Goal> findByName(String name);
    Optional<Goal> findByNameAndUserId(String name, Long userId);
    List<Goal> findAllByUserId(Long userId);
    Optional<Goal> findByIdAndUserId(Long id, Long userId);
    boolean existsByName(String name);
    boolean existsByNameAndUserId(String name, Long userId);
    List<Goal> findAllByStatus(String status);
    List<Goal> findAllByUserIdAndStatus(Long userId, String status);
}
