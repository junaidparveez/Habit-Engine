package com.habitengine.service.impl;

import com.habitengine.dto.response.UserProgressResponse;
import com.habitengine.entity.User;
import com.habitengine.exception.ResourceNotFoundException;
import com.habitengine.repository.UserRepository;
import com.habitengine.service.GamificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GamificationServiceImpl implements GamificationService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserProgressResponse addXp(Long userId, int xpToAdd) {
        log.info("Adding {} XP to user {}", xpToAdd, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        int currentXp = user.getCurrentXp() + xpToAdd;
        int currentLevel = user.getLevel();
        int xpForNextLevel = getXpForNextLevel(currentLevel);

        boolean leveledUp = false;
        while (currentXp >= xpForNextLevel) {
            currentXp -= xpForNextLevel;
            currentLevel++;
            xpForNextLevel = getXpForNextLevel(currentLevel);
            leveledUp = true;
            log.info("User {} leveled up to level {}", userId, currentLevel);
        }

        user.setCurrentXp(currentXp);
        user.setLevel(currentLevel);
        userRepository.save(user);

        return UserProgressResponse.builder()
                .level(currentLevel)
                .currentXp(currentXp)
                .xpToNextLevel(xpForNextLevel)
                .build();
    }

    @Override
    public UserProgressResponse getUserProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return UserProgressResponse.builder()
                .level(user.getLevel())
                .currentXp(user.getCurrentXp())
                .xpToNextLevel(getXpForNextLevel(user.getLevel()))
                .build();
    }

    @Override
    public int getXpForNextLevel(int currentLevel) {
        return 100 * currentLevel;
    }
}
