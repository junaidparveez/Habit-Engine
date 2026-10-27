package com.levelupai.service.impl;

import com.levelupai.constants.AppConstants;
import com.levelupai.dto.request.LoginRequest;
import com.levelupai.dto.request.RefreshTokenRequest;
import com.levelupai.dto.request.RegisterRequest;
import com.levelupai.dto.response.AuthResponse;
import com.levelupai.entity.User;
import com.levelupai.enums.Role;
import com.levelupai.repository.UserRepository;
import com.levelupai.security.JwtService;
import com.levelupai.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Authentication service implementation.
 * Handles user registration, login, and token refresh.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(AppConstants.MSG_EMAIL_EXISTS);
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException(AppConstants.MSG_USERNAME_EXISTS);
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .role(Role.USER)
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully with id: {}", user.getId());

        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return buildAuthResponse(user, token, refreshToken);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException(AppConstants.MSG_INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException(AppConstants.MSG_INVALID_CREDENTIALS);
        }

        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        log.info("User logged in successfully: {}", user.getEmail());
        return buildAuthResponse(user, token, refreshToken);
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        log.info("Token refresh requested");

        String refreshToken = request.getRefreshToken();
        String email = jwtService.extractUsername(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException(AppConstants.MSG_INVALID_CREDENTIALS));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new BadCredentialsException(AppConstants.MSG_INVALID_CREDENTIALS);
        }

        String newToken = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        log.info("Token refreshed successfully for user: {}", email);
        return buildAuthResponse(user, newToken, newRefreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String token, String refreshToken) {
        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .role(user.getRole().name())
                .level(user.getLevel())
                .currentXp(user.getCurrentXp())
                .build();
    }
}
