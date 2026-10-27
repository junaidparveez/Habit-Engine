package com.levelupai.service;

import com.levelupai.dto.request.LoginRequest;
import com.levelupai.dto.request.RefreshTokenRequest;
import com.levelupai.dto.request.RegisterRequest;
import com.levelupai.dto.response.AuthResponse;

/**
 * Authentication service interface.
 */
public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);
}
