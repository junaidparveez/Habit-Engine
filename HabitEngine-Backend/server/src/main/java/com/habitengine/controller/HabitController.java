package com.habitengine.controller;

import com.habitengine.constants.AppConstants;
import com.habitengine.dto.request.CreateHabitRequest;
import com.habitengine.dto.request.UpdateHabitRequest;
import com.habitengine.dto.response.ApiResponse;
import com.habitengine.dto.response.HabitResponse;
import com.habitengine.service.HabitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.habitengine.entity.User;

import java.util.List;

/**
 * REST Controller for Habit management.
 * Base path: /api/v1/habits
 */
@Slf4j
@RestController
@RequestMapping(AppConstants.API_PREFIX + "/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new RuntimeException("Unauthorized");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HabitResponse>> createHabit(
            @Valid @RequestBody CreateHabitRequest request) {
        log.debug("REST request to create habit: {}", request.getName());
        User user = getCurrentUser();
        HabitResponse response = habitService.createHabit(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.MSG_CREATED, response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HabitResponse>>> getAllHabits(
            @RequestParam(required = false) Boolean activeOnly) {
        log.debug("REST request to get all habits (activeOnly={})", activeOnly);
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        
        List<HabitResponse> response;
        if (Boolean.TRUE.equals(activeOnly)) {
            response = habitService.getActiveHabits(user.getId(), isAdmin);
        } else {
            response = habitService.getAllHabits(user.getId(), isAdmin);
        }
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HabitResponse>> getHabitById(@PathVariable Long id) {
        log.debug("REST request to get habit with ID: {}", id);
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        HabitResponse response = habitService.getHabitById(id, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HabitResponse>> updateHabit(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHabitRequest request) {
        log.debug("REST request to update habit with ID: {}", id);
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        HabitResponse response = habitService.updateHabit(id, request, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_UPDATED, response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHabit(@PathVariable Long id) {
        log.debug("REST request to delete habit with ID: {}", id);
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        habitService.deleteHabit(id, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_DELETED));
    }

    @PostMapping("/{id}/completions")
    public ResponseEntity<ApiResponse<com.habitengine.dto.response.HabitCompletionResponse>> markHabitCompleted(
            @PathVariable Long id,
            @Valid @RequestBody com.habitengine.dto.request.CreateHabitCompletionRequest request) {
        log.debug("REST request to mark habit {} as completed", id);
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        com.habitengine.dto.response.HabitCompletionResponse response = habitService.markHabitCompleted(id, request, user.getId(), isAdmin);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.MSG_CREATED, response));
    }

    @DeleteMapping("/{id}/completions")
    public ResponseEntity<ApiResponse<Void>> unmarkHabitCompleted(
            @PathVariable Long id,
            @RequestParam java.time.LocalDate date) {
        log.debug("REST request to unmark habit {} as completed for date: {}", id, date);
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        habitService.unmarkHabitCompleted(id, date, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_DELETED));
    }

    @GetMapping("/{id}/completions")
    public ResponseEntity<ApiResponse<List<com.habitengine.dto.response.HabitCompletionResponse>>> getCompletions(@PathVariable Long id) {
        log.debug("REST request to get completions for habit ID: {}", id);
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        List<com.habitengine.dto.response.HabitCompletionResponse> response = habitService.getCompletions(id, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }
}
