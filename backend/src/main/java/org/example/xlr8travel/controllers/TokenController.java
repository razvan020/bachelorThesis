package org.example.xlr8travel.controllers;

import org.example.xlr8travel.dto.TokenRefreshRequest;
import org.example.xlr8travel.dto.TokenRefreshResponse;
import org.example.xlr8travel.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/token")
public class TokenController {

    private static final Logger log = LoggerFactory.getLogger(TokenController.class);
    private final JwtUtils jwtUtils;

    public TokenController(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        
        try {
            // Validate refresh token
            if (!jwtUtils.validateJwtToken(refreshToken)) {
                log.warn("Invalid refresh token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid refresh token"));
            }
            
            // Extract username from refresh token
            String username = jwtUtils.getUsernameFromJwtToken(refreshToken);
            
            // Generate new access token
            String newAccessToken = jwtUtils.generateTokenFromUsername(username);
            
            log.info("Generated new access token for user: {}", username);
            return ResponseEntity.ok(new TokenRefreshResponse(newAccessToken, refreshToken));
            
        } catch (Exception e) {
            log.error("Error refreshing token: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to refresh token"));
        }
    }
}