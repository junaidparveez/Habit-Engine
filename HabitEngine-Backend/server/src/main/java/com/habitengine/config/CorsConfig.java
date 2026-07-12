package com.habitengine.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CORS configuration to allow the React frontend to communicate with the backend.
 *
 * <p>Allows requests from the Vite dev server (localhost:3000) during development.
 * This should be tightened for production deployment.</p>
 */
@Slf4j
@Configuration
public class CorsConfig {

    private static final String FRONTEND_DEV_URL = "http://localhost:3000";

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.info("Configuring CORS: allowing origin {}", FRONTEND_DEV_URL);

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(FRONTEND_DEV_URL));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
