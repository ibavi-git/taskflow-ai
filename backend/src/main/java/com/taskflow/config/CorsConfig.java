package com.taskflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

/**
 * CORS Configuration for TaskFlow AI Backend
 * 
 * Reads allowed origins from environment variable: CORS_ALLOWED_ORIGINS
 * Example: "http://localhost:3000,http://localhost:5173,https://taskflow-ai-frontend.onrender.com"
 */
@Configuration
public class CorsConfig {
    
    @Value("${cors.allowedOrigins:http://localhost:3000,http://localhost:5173}")
    private String allowedOrigins;
    
    @Value("${cors.allowedMethods:GET,POST,PUT,DELETE,OPTIONS}")
    private String allowedMethods;
    
    @Value("${cors.allowedHeaders:*}")
    private String allowedHeaders;
    
    @Value("${cors.allowCredentials:true}")
    private boolean allowCredentials;
    
    @Value("${cors.maxAge:3600}")
    private long maxAge;
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Parse comma-separated origins
        List<String> origins = Arrays.asList(allowedOrigins.split(",\\s*"));
        configuration.setAllowedOrigins(origins);
        
        // Parse comma-separated methods
        List<String> methods = Arrays.asList(allowedMethods.split(",\\s*"));
        configuration.setAllowedMethods(methods);
        
        // Set allowed headers
        if ("*".equals(allowedHeaders.trim())) {
            configuration.setAllowedHeaders(Arrays.asList("*"));
        } else {
            List<String> headers = Arrays.asList(allowedHeaders.split(",\\s*"));
            configuration.setAllowedHeaders(headers);
        }
        
        // Set credentials and max age
        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(maxAge);
        
        // Apply to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}