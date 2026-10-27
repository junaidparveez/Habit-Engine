package com.levelupai.exception;

import com.levelupai.constants.AppConstants;
import com.levelupai.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for all REST controllers.
 * Ensures consistent API error responses across the application.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles Bean Validation errors (e.g., @Valid failures).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation failed: {}", errors);

        ApiResponse<Map<String, String>> response = ApiResponse.error(
                AppConstants.MSG_VALIDATION_FAILED, errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles resource not found exceptions.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(
            ResourceNotFoundException ex) {

        log.warn("Resource not found: {}", ex.getMessage());

        ApiResponse<Void> response = ApiResponse.error(ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handles duplicate resource exceptions.
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateResourceException(
            DuplicateResourceException ex) {

        log.warn("Duplicate resource: {}", ex.getMessage());

        ApiResponse<Void> response = ApiResponse.error(ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * Handles invalid argument exceptions (e.g., business logic validation failures).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(
            IllegalArgumentException ex) {

        log.warn("Invalid argument: {}", ex.getMessage());

        ApiResponse<Void> response = ApiResponse.error(ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles type mismatch errors (e.g., invalid path variable types).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatchException(
            MethodArgumentTypeMismatchException ex) {

        String message = String.format("Invalid value '%s' for parameter '%s'. Expected type: %s",
                ex.getValue(), ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");

        log.warn("Type mismatch: {}", message);

        ApiResponse<Void> response = ApiResponse.error(message);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles bad credentials (wrong email/password).
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(
            BadCredentialsException ex) {

        log.warn("Bad credentials: {}", ex.getMessage());

        ApiResponse<Void> response = ApiResponse.error(ex.getMessage());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Handles access denied (insufficient permissions).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
            AccessDeniedException ex) {

        log.warn("Access denied: {}", ex.getMessage());

        ApiResponse<Void> response = ApiResponse.error("Access denied");

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Handles all uncaught exceptions.
     * This is the last-resort handler — logs the full stack trace.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {

        log.error("Unexpected error occurred: ", ex);

        ApiResponse<Void> response = ApiResponse.error(AppConstants.MSG_INTERNAL_ERROR);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
