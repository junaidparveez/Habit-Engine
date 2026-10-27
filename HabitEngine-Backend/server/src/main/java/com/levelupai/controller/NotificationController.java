package com.levelupai.controller;

import com.levelupai.constants.AppConstants;
import com.levelupai.dto.request.UpdateNotificationPreferenceRequest;
import com.levelupai.dto.response.ApiResponse;
import com.levelupai.dto.response.NotificationPreferenceResponse;
import com.levelupai.entity.User;
import com.levelupai.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for notification preferences.
 * Base path: /api/v1/notifications
 */
@Slf4j
@RestController
@RequestMapping(AppConstants.API_PREFIX + "/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> getPreferences() {
        User user = getCurrentUser();
        log.debug("REST request to get notification preferences for user: {}", user.getId());
        NotificationPreferenceResponse response = notificationService.getPreferences(user.getId());
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> updatePreferences(
            @RequestBody UpdateNotificationPreferenceRequest request) {
        User user = getCurrentUser();
        log.debug("REST request to update notification preferences for user: {}", user.getId());
        NotificationPreferenceResponse response = notificationService.updatePreferences(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_UPDATED, response));
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
