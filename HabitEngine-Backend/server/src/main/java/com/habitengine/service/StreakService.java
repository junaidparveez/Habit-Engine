package com.habitengine.service;

import com.habitengine.entity.Habit;

public interface StreakService {
    void recalculateStreak(Habit habit);
}
