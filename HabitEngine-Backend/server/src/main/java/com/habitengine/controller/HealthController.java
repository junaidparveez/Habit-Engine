package com.habitengine.controller;

import com.habitengine.constants.AppConstants;
import com.habitengine.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health check controller.
 * Provides a simple endpoint to verify the API is running.
 */
@Slf4j
@RestController
@RequestMapping(AppConstants.API_PREFIX)
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        log.debug("Health check requested");

        Map<String, String> healthData = Map.of(
                "status", "UP",
                "application", "HabitEngine",
                "version", "0.0.1-SNAPSHOT"
        );

        return ResponseEntity.ok(
                ApiResponse.success("HabitEngine is running", healthData));
    }
}
