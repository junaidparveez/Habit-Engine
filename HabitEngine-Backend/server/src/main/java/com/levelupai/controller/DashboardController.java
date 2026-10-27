package com.levelupai.controller;

import com.levelupai.constants.AppConstants;
import com.levelupai.dto.response.ApiResponse;
import com.levelupai.dto.response.TodayHabitResponse;
import com.levelupai.service.HabitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.levelupai.entity.User;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping(AppConstants.API_PREFIX + "/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final HabitService habitService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new RuntimeException("Unauthorized");
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<TodayHabitResponse>>> getTodayHabits(
            @RequestParam(required = false) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        log.debug("REST request to get dashboard habits for date: {}", targetDate);
        
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        List<TodayHabitResponse> response = habitService.getTodayHabits(targetDate, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<com.levelupai.dto.response.DashboardStatsResponse>> getDashboardStats(
            @RequestParam(required = false) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        log.debug("REST request to get dashboard stats for date: {}", targetDate);
        
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        com.levelupai.dto.response.DashboardStatsResponse response = habitService.getDashboardStats(targetDate, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }
}
