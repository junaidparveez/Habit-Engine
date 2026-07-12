package com.habitengine.controller;

import com.habitengine.constants.AppConstants;
import com.habitengine.dto.request.LoginRequest;
import com.habitengine.dto.request.RefreshTokenRequest;
import com.habitengine.dto.request.RegisterRequest;
import com.habitengine.dto.request.UpdateProfileRequest;
import com.habitengine.dto.response.ApiResponse;
import com.habitengine.dto.response.AuthResponse;
import com.habitengine.entity.User;
import com.habitengine.repository.UserRepository;
import com.habitengine.service.AuthService;
import com.habitengine.service.GamificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller.
 * Handles user registration, login, token refresh, and current user retrieval.
 */
@Slf4j
@RestController
@RequestMapping(AppConstants.API_PREFIX + "/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GamificationService gamificationService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request for email: {}", request.getEmail());
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.MSG_REGISTER_SUCCESS, authResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request for email: {}", request.getEmail());
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_LOGIN_SUCCESS, authResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh request");
        AuthResponse authResponse = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_TOKEN_REFRESHED, authResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        AuthResponse response = AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .role(user.getRole().name())
                .level(user.getLevel())
                .currentXp(user.getCurrentXp())
                .build();

        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<com.habitengine.dto.response.UserProgressResponse>> getProgress() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        
        com.habitengine.dto.response.UserProgressResponse response = gamificationService.getUserProgress(user.getId());
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<AuthResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
            userRepository.save(user);
        }

        AuthResponse response = AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .role(user.getRole().name())
                .level(user.getLevel())
                .currentXp(user.getCurrentXp())
                .build();

        log.info("Profile updated for user: {}", user.getId());
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_UPDATED, response));
    }
}
