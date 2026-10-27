package com.levelupai.service.impl;

import com.levelupai.dto.request.UpdateNotificationPreferenceRequest;
import com.levelupai.dto.response.NotificationPreferenceResponse;
import com.levelupai.entity.NotificationPreference;
import com.levelupai.entity.User;
import com.levelupai.exception.ResourceNotFoundException;
import com.levelupai.repository.NotificationPreferenceRepository;
import com.levelupai.repository.UserRepository;
import com.levelupai.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of NotificationService.
 * Manages notification preferences and sends email reminders.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Override
    @Transactional
    public NotificationPreferenceResponse getPreferences(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        NotificationPreference pref = preferenceRepository.findByUser(user)
                .orElseGet(() -> {
                    // Create default preferences
                    NotificationPreference newPref = NotificationPreference.builder()
                            .user(user)
                            .build();
                    return preferenceRepository.save(newPref);
                });

        return toResponse(pref);
    }

    @Override
    @Transactional
    public NotificationPreferenceResponse updatePreferences(Long userId, UpdateNotificationPreferenceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        NotificationPreference pref = preferenceRepository.findByUser(user)
                .orElseGet(() -> NotificationPreference.builder().user(user).build());

        if (request.getReminderEnabled() != null) {
            pref.setReminderEnabled(request.getReminderEnabled());
        }
        if (request.getReminderTime() != null) {
            pref.setReminderTime(request.getReminderTime());
        }
        if (request.getEmailFrequency() != null) {
            pref.setEmailFrequency(request.getEmailFrequency());
        }

        NotificationPreference saved = preferenceRepository.save(pref);
        log.info("Updated notification preferences for user {}", userId);
        return toResponse(saved);
    }

    @Override
    public void sendDailyReminders() {
        List<NotificationPreference> reminders = preferenceRepository.findAllByReminderEnabledTrue();
        log.info("Sending daily reminders to {} users", reminders.size());

        for (NotificationPreference pref : reminders) {
            try {
                sendReminderEmail(pref.getUser());
            } catch (Exception e) {
                log.error("Failed to send reminder email to user {}: {}", pref.getUser().getId(), e.getMessage());
            }
        }
    }

    private void sendReminderEmail(User user) {
        String to = user.getEmail();
        String displayName = user.getDisplayName() != null ? user.getDisplayName() : user.getUsername();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("🔥 Level Up AI Daily Reminder — Keep Your Streak Going!");
        message.setText(String.format(
                "Hi %s,\n\n" +
                "This is your daily reminder from Level Up AI!\n\n" +
                "Don't forget to check in and complete your habits today to maintain your streak. " +
                "Consistency is the key to building lasting habits.\n\n" +
                "→ Open Level Up AI: http://localhost:3000\n\n" +
                "Keep it up! 💪\n" +
                "— The Level Up AI Team",
                displayName
        ));

        mailSender.send(message);
        log.info("Daily reminder email sent to {}", to);
    }

    private NotificationPreferenceResponse toResponse(NotificationPreference pref) {
        return NotificationPreferenceResponse.builder()
                .id(pref.getId())
                .reminderEnabled(pref.getReminderEnabled())
                .reminderTime(pref.getReminderTime())
                .emailFrequency(pref.getEmailFrequency())
                .build();
    }
}
