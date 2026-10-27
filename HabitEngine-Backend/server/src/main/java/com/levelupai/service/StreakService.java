package com.levelupai.service;

import com.levelupai.entity.Habit;

public interface StreakService {
    void recalculateStreak(Habit habit);
}
