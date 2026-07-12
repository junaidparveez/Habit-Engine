package com.habitengine.constants;

/**
 * Application-wide constants.
 * Centralizes magic strings and values to avoid duplication.
 */
public final class AppConstants {

    private AppConstants() {
        // Prevent instantiation
    }

    // --- API ---
    public static final String API_PREFIX = "/api/v1";

    // --- Messages ---
    public static final String MSG_SUCCESS = "Request processed successfully";
    public static final String MSG_CREATED = "Resource created successfully";
    public static final String MSG_UPDATED = "Resource updated successfully";
    public static final String MSG_DELETED = "Resource deleted successfully";
    public static final String MSG_NOT_FOUND = "Resource not found";
    public static final String MSG_VALIDATION_FAILED = "Validation failed";
    public static final String MSG_INTERNAL_ERROR = "An unexpected error occurred";

    // --- Defaults ---
    public static final String DEFAULT_TIMEZONE = "UTC";
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    // --- Auth Messages ---
    public static final String MSG_LOGIN_SUCCESS = "Login successful";
    public static final String MSG_REGISTER_SUCCESS = "Registration successful";
    public static final String MSG_TOKEN_REFRESHED = "Token refreshed successfully";
    public static final String MSG_INVALID_CREDENTIALS = "Invalid email or password";
    public static final String MSG_EMAIL_EXISTS = "Email is already registered";
    public static final String MSG_USERNAME_EXISTS = "Username is already taken";
    public static final String MSG_UNAUTHORIZED = "Authentication required";

    // --- Auth ---
    public static final String AUTH_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
}
