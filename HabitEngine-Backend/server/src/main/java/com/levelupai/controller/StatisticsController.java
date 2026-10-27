package com.levelupai.controller;

import com.levelupai.dto.response.ApiResponse;
import com.levelupai.dto.response.HeatmapResponse;
import com.levelupai.dto.response.TrendResponse;
import com.levelupai.service.StatisticsService;
import com.levelupai.constants.AppConstants;
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
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new RuntimeException("Unauthorized");
    }

    @GetMapping("/heatmap")
    public ResponseEntity<ApiResponse<List<HeatmapResponse>>> getHeatmap(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        LocalDate start = startDate != null ? startDate : end.minusDays(364); // Default to last 365 days
        
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");

        log.debug("REST request to get heatmap data from {} to {} for user {}", start, end, user.getId());
        List<HeatmapResponse> response = statisticsService.getHeatmapData(start, end, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }

    @GetMapping("/trends")
    public ResponseEntity<ApiResponse<List<TrendResponse>>> getTrends(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        LocalDate start = startDate != null ? startDate : end.minusWeeks(12); // Default to last 12 weeks
        
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");

        log.debug("REST request to get trends data from {} to {} for user {}", start, end, user.getId());
        List<TrendResponse> response = statisticsService.getWeeklyTrends(start, end, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }
}
