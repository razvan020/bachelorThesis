package org.example.xlr8travel.controllers;

import org.example.xlr8travel.dto.LoginRequest;
import org.example.xlr8travel.dto.LoginResponse;
import org.example.xlr8travel.security.JwtUtils;
import org.example.xlr8travel.services.MetricsService;
import org.example.xlr8travel.services.RecaptchaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class LoginController {

    private static final Logger log = LoggerFactory.getLogger(LoginController.class);
    private final AuthenticationManager authenticationManager;
    private final MetricsService metricsService;
    private final JwtUtils jwtUtils;
    private final RecaptchaService recaptchaService;

    public LoginController(AuthenticationManager authenticationManager, MetricsService metricsService, 
                          JwtUtils jwtUtils, RecaptchaService recaptchaService) {
        this.authenticationManager = authenticationManager;
        this.metricsService = metricsService;
        this.jwtUtils = jwtUtils;
        this.recaptchaService = recaptchaService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        log.info("Attempting authentication for user: {}", loginRequest.getUsername());
        try {
            // Verify reCAPTCHA token
            String recaptchaToken = loginRequest.getRecaptchaToken();
            if (recaptchaToken == null || recaptchaToken.isEmpty()) {
                log.warn("reCAPTCHA token is missing for user: {}", loginRequest.getUsername());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "reCAPTCHA verification is required."));
            }

            if (!recaptchaService.verifyToken(recaptchaToken)) {
                log.warn("reCAPTCHA verification failed for user: {}", loginRequest.getUsername());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "reCAPTCHA verification failed."));
            }

            log.info("reCAPTCHA verification successful for user: {}", loginRequest.getUsername());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
            log.info("Authentication successful for user: {}", authentication.getName());

            // Set authentication in the current context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String jwt = jwtUtils.generateJwtToken(authentication);

            // Generate refresh token
            String refreshToken = jwtUtils.generateRefreshToken(authentication.getName());

            String username = authentication.getName();

            // Update last login time
            metricsService.updateLastLogin(username);
            log.info("Updated last login time for user: {}", username);

            log.info("Returning successful response with JWT token for user: {}", username);
            return ResponseEntity.ok(new LoginResponse("Login successful", jwt, refreshToken, username));

        } catch (BadCredentialsException e) {
            log.warn("Authentication failed for user {}: Invalid credentials", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password."));
        } catch (Exception e) {
            log.error("An unexpected error occurred during authentication for user {}", loginRequest.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed due to an internal error."));
        }
    }
}
