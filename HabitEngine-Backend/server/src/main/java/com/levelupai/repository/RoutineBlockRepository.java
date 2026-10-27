package com.levelupai.repository;

import com.levelupai.entity.RoutineBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineBlockRepository extends JpaRepository<RoutineBlock, Long> {
    List<RoutineBlock> findByUserIdOrderByStartTimeAsc(Long userId);
    List<RoutineBlock> findByLinkedGoalId(Long goalId);
    List<RoutineBlock> findByLinkedMilestoneId(Long milestoneId);
}
