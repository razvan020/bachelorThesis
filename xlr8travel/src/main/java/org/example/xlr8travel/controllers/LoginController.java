package org.example.xlr8travel.controllers;

import org.example.xlr8travel.dto.LoginRequest;
import org.example.xlr8travel.dto.LoginResponse;
// It's better practice to use constructor injection instead of @Autowired on fields
// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory

import java.util.Map;

@RestController
@RequestMapping("/api")
public class LoginController {

    // Logger for better debugging
    private static final Logger log = LoggerFactory.getLogger(LoginController.class);

    private final AuthenticationManager authenticationManager;

    // Constructor Injection (Recommended over @Autowired field injection)
    public LoginController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        log.info("Attempting authentication for user: {}", loginRequest.getUsername()); // Log attempt
        try {
            // 1. Authenticate using the credentials from the request
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
            log.info("Authentication successful for user: {}", authentication.getName()); // Log success

            // 2. Set the successful authentication in the security context for the current request/session
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 3. Get the username DIRECTLY from the successful authentication object
            String username = authentication.getName(); // Use the principal's name from the *first* auth object

            log.info("Returning successful response for user: {}", username); // Log response data

            // 4. Return the success response with the CORRECT username
            return ResponseEntity.ok(new LoginResponse("Login successful", null, username));

        } catch (BadCredentialsException e) {
            log.warn("Authentication failed for user {}: Invalid credentials", loginRequest.getUsername()); // Log failure
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password."));
        } catch (Exception e) {
            log.error("An unexpected error occurred during authentication for user {}", loginRequest.getUsername(), e); // Log unexpected errors with stack trace
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed due to an internal error."));
        }
    }
}