package org.example.xlr8travel.controllers;

import org.example.xlr8travel.dto.UserDTO;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/user") // Base path for general user info
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Endpoint for the currently authenticated user to get their own details.
     * Used by frontend to verify session and retrieve user info.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            // This check is defensive. Spring Security configured with .authenticated()
            // should prevent unauthenticated access entirely, resulting in a 401/403
            // before this method is even called.
            log.warn("/api/user/me called without authenticated principal.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = userDetails.getUsername();
        log.info("Request received for current user details: {}", username);
        try {
            // Fetch the full User entity from the database using the username
            User user = userService.findByUsername(username);

            // Map the User entity to a UserDTO before sending
            UserDTO userDto = UserDTO.fromUser(user);
            log.info("Returning details for user: {}", username);
            return ResponseEntity.ok(userDto);

        } catch (ResponseStatusException rse) {
            // Catch specific exception from findByUsername if needed
            throw rse; // Re-throw to let Spring handle the status code
        } catch (Exception e) {
            log.error("Error fetching details for user {}: {}", username, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Add other endpoints here specific to the logged-in user modifying THEIR OWN profile, etc.
    // Example:
    // @PutMapping("/me/profile")
    // public ResponseEntity<?> updateMyProfile(...) { ... }

}