package com.habitengine.service;

import com.habitengine.dto.response.UserProgressResponse;

public interface GamificationService {
    
    /**
     * Adds XP to the user and handles level ups.
     *
     * @param userId The ID of the user.
     * @param xpToAdd The amount of XP to add.
     * @return The updated UserProgressResponse.
     */
    UserProgressResponse addXp(Long userId, int xpToAdd);

    /**
     * Gets the current progress for a user.
     *
     * @param userId The ID of the user.
     * @return The current UserProgressResponse.
     */
    UserProgressResponse getUserProgress(Long userId);
    
    /**
     * Calculates the required XP for the next level based on the current level.
     *
     * @param currentLevel The user's current level.
     * @return The XP required for the next level.
     */
    int getXpForNextLevel(int currentLevel);
}
