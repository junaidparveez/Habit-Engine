package com.habitengine.repository;

import com.habitengine.entity.HabitGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HabitGroupRepository extends JpaRepository<HabitGroup, Long> {
}
