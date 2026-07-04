package com.taskflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    /**
     * Comma-separated list of trusted origins. Override via CORS_ALLOWED_ORIGINS env var.
     * Defaults cover localhost dev, Replit preview domains, and Replit deployment domains.
     * Never use wildcard ("*") together with allowCredentials(true) — that violates the CORS spec
     * and is rejected by browsers.
     */
    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:21998}")
    private String allowedOriginsConfig;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Parse explicit origin list from config; also always permit Replit preview domains
        List<String> explicitOrigins = Arrays.asList(allowedOriginsConfig.split(","));

        // Pattern-based origins for Replit (*.replit.dev, *.repl.co, *.replit.app)
        config.setAllowedOriginPatterns(List.of(
            "https://*.replit.dev",
            "https://*.repl.co",
            "https://*.replit.app",
            "https://*.kirk.replit.dev"
        ));
        config.setAllowedOrigins(explicitOrigins);

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
