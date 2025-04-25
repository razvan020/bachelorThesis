package org.example.xlr8travel.controllers;

import org.example.xlr8travel.dto.LoginResponse;
import org.example.xlr8travel.dto.UserSignupDTO; // Import the DTO
import org.example.xlr8travel.models.Role;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.security.JwtUtils;
import org.example.xlr8travel.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder; // Inject PasswordEncoder
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid; // For validating the DTO

import java.util.Map;
import java.util.Optional;

@RestController // Changed from @Controller
@RequestMapping("/api/signup") // Changed base path
public class SignupController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder; // Inject PasswordEncoder
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private static final Logger log = LoggerFactory.getLogger(SignupController.class);

    // Constructor Injection
    public SignupController(UserService userService, PasswordEncoder passwordEncoder, 
                           JwtUtils jwtUtils, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
    }

    // Removed showRegistrationForm GET method - React handles the UI

    @PostMapping // Handles POST requests to /api/signup
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserSignupDTO userSignupDTO) { // Use DTO and @Valid
        log.info("Received registration request for email: {}", userSignupDTO.getEmail());

        // --- Basic Validation Example: Check if email already exists ---
        // You might have a more specific method in UserService like existsByEmail()
        Optional<User> existingUser = Optional.ofNullable(userService.findByEmail(userSignupDTO.getEmail())); // Assumes findByEmail exists
        if (existingUser.isPresent()) {
            log.warn("Registration attempt with existing email: {}", userSignupDTO.getEmail());
            // Return 400 Bad Request with an error message
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "An account with this email already exists."));
        }
        // --- End Validation ---

        try {
            // Create new User entity from DTO
            User newUser = new User();
            // Map fields - Assuming User entity has these setters
            // Note: Your User constructor might vary based on the DataLoader example
            newUser.setFirstname(userSignupDTO.getFullname()); // Or parse first/last name if needed
            // newUser.setLastname(...) // Add if needed
            newUser.setEmail(userSignupDTO.getEmail());
            // Use the injected PasswordEncoder
            newUser.setPassword(passwordEncoder.encode(userSignupDTO.getPassword()));
            // Set default role(s)
            newUser.getRoles().add(Role.ROLE_USER);
            // Set other default fields if necessary (e.g., account status, dob if collected)
            // newUser.setAccountStatus(Account_Status.ACCOUNT_STATUS_ACTIVE);


            log.debug("Attempting to save new user: {}", newUser.getEmail());
            userService.save(newUser);
            log.info("User registered successfully: {}", newUser.getEmail());

            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            userSignupDTO.getEmail(),
                            userSignupDTO.getPassword()
                    )
            );

            // Set authentication in the current context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String jwt = jwtUtils.generateJwtToken(authentication);

            // Generate refresh token
            String refreshToken = jwtUtils.generateRefreshToken(authentication.getName());

            // Return 201 Created status with tokens
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new LoginResponse("User registered successfully!", jwt, refreshToken, authentication.getName()));

        } catch (Exception e) {
            log.error("Error during user registration for email {}: {}", userSignupDTO.getEmail(), e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed due to an internal error."));
        }
    }
}
