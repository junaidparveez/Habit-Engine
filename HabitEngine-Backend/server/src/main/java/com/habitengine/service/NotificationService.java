package com.habitengine.service;

import com.habitengine.dto.request.UpdateNotificationPreferenceRequest;
import com.habitengine.dto.response.NotificationPreferenceResponse;

public interface NotificationService {

    /**
     * Gets the notification preferences for a user. Creates default preferences if none exist.
     *
     * @param userId The ID of the user.
     * @return The user's notification preference response.
     */
    NotificationPreferenceResponse getPreferences(Long userId);

    /**
     * Updates the notification preferences for a user.
     *
     * @param userId  The ID of the user.
     * @param request The new preferences.
     * @return The updated notification preference response.
     */
    NotificationPreferenceResponse updatePreferences(Long userId, UpdateNotificationPreferenceRequest request);

    /**
     * Sends daily reminder emails to all users with reminders enabled.
     * Intended to be called by the Quartz scheduler.
     */
    void sendDailyReminders();
}
