package com.habitengine.repository;

import com.habitengine.entity.StudyResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyResourceRepository extends JpaRepository<StudyResource, Long> {
    List<StudyResource> findByUserId(Long userId);
    List<StudyResource> findByGoalId(Long goalId);
    List<StudyResource> findByMilestoneId(Long milestoneId);
}
