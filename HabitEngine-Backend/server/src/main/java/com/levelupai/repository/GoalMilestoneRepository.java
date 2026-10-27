package com.levelupai.repository;

import com.levelupai.entity.GoalMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalMilestoneRepository extends JpaRepository<GoalMilestone, Long> {
    List<GoalMilestone> findByGoalIdOrderBySortOrderAscTargetWeekAsc(Long goalId);
}
