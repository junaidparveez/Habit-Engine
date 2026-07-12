package com.habitengine.service;

import com.habitengine.dto.request.LoginRequest;
import com.habitengine.dto.request.RefreshTokenRequest;
import com.habitengine.dto.request.RegisterRequest;
import com.habitengine.dto.response.AuthResponse;

/**
 * Authentication service interface.
 */
public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);
}
