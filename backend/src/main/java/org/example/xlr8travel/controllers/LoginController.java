package org.example.xlr8travel.controllers;

import org.example.xlr8travel.dto.LoginRequest;
import org.example.xlr8travel.dto.LoginResponse;
import org.example.xlr8travel.services.MetricsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// *** Add Imports ***
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
// *** End Imports ***

import java.util.Map;

@RestController
@RequestMapping("/api")
public class LoginController {

    private static final Logger log = LoggerFactory.getLogger(LoginController.class);
    private final AuthenticationManager authenticationManager;
    private final MetricsService metricsService;

    public LoginController(AuthenticationManager authenticationManager, MetricsService metricsService) {
        this.authenticationManager = authenticationManager;
        this.metricsService = metricsService;
    }

    @PostMapping("/login")
    // *** Remove HttpServletRequest parameter ***
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        log.info("Attempting authentication for user: {}", loginRequest.getUsername());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
            log.info("Authentication successful for user: {}", authentication.getName());

            // Set authentication in the current context.
            // Relying SOLELY on Spring Security filters to persist this.
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // *** Explicit session save REMOVED ***

            String username = authentication.getName();

            // Update last login time
            metricsService.updateLastLogin(username);
            log.info("Updated last login time for user: {}", username);

            log.info("Returning successful response for user: {}", username);
            return ResponseEntity.ok(new LoginResponse("Login successful", null, username));

        } catch (BadCredentialsException e) {
            // ... keep catch blocks ...
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
