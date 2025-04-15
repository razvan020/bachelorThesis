package org.example.xlr8travel.controllers;

import jakarta.persistence.EntityNotFoundException; // Keep for consistency if service throws it
import org.example.xlr8travel.dto.UserCreateDTO;
import org.example.xlr8travel.dto.UserDTO;
import org.example.xlr8travel.models.Role;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.services.UserService; // Assuming this service exists
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@Secured("ROLE_ADMIN")
public class UsersController {

    private static final Logger log = LoggerFactory.getLogger(UsersController.class);
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UsersController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    // --- GET ALL USERS ---
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        log.info("Request received for all users");
        try {
            List<User> users = userService.findAll();
            List<UserDTO> userDTOs = users.stream()
                    .map(UserDTO::fromUser)
                    .collect(Collectors.toList());
            log.info("Returning {} users.", userDTOs.size());
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            log.error("Error fetching all users", e);
            // Consider a more specific DTO for error responses
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- ADD NEW USER ---
    @PostMapping
    public ResponseEntity<?> addUser(@Valid @RequestBody UserCreateDTO userCreateDTO) {
        log.info("Request received to add new user with username: {}", userCreateDTO.getUsername());

        // --- FIXED: Check if user exists using != null ---
        // Assuming userService.findByUsername/findByEmail return User or null
        User existingByUsername = userService.findByUsername(userCreateDTO.getUsername());
        if (existingByUsername != null) {
            log.warn("Add user failed: Username '{}' already exists.", userCreateDTO.getUsername());
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists."));
        }
        User existingByEmail = userService.findByEmail(userCreateDTO.getEmail());
        if (existingByEmail != null) {
            log.warn("Add user failed: Email '{}' already exists.", userCreateDTO.getEmail());
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists."));
        }
        // --- End Fix ---

        try {
            User newUser = new User();
            // Map fields from DTO
            newUser.setUsername(userCreateDTO.getUsername());
            newUser.setEmail(userCreateDTO.getEmail());
            newUser.setFirstname(userCreateDTO.getFirstname());
            newUser.setLastname(userCreateDTO.getLastname());
            newUser.setPassword(passwordEncoder.encode(userCreateDTO.getPassword()));
            newUser.getRoles().add(Role.ROLE_USER); // Default role
            // Set other defaults if needed

            User savedUser = userService.save(newUser); // Use save method
            log.info("User added successfully: {}", savedUser.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED).body(UserDTO.fromUser(savedUser));

        } catch (Exception e) {
            log.error("Error adding user: {}", userCreateDTO.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add user due to an internal error."));
        }
    }

    // --- REMOVE USER ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeUser(@PathVariable Long id) {
        log.info("Request received to remove user ID: {}", id);
        try {
            // --- FIXED: Check if user exists using != null ---
            User userToDelete = userService.findById(id); // Fetch first
            if (userToDelete == null) {
                log.warn("Attempted to delete non-existent user ID: {}", id);
                return ResponseEntity.notFound().build(); // Return 404
            }
            // --- End Fix ---

            userService.removeUserById(id); // Now delete
            log.info("User deleted successfully: {}", id);
            return ResponseEntity.noContent().build(); // Return 204 No Content

        } catch (Exception e) {
            log.error("Error deleting user ID {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- Optional: GET SINGLE USER ---
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        log.info("Request received for user ID: {}", id);
        try {
            User user = userService.findById(id);
            if (user == null) {
                log.warn("User ID {} not found.", id);
                return ResponseEntity.notFound().build();
            }
            log.info("Returning user ID: {}", id);
            return ResponseEntity.ok(UserDTO.fromUser(user)); // Return DTO
        } catch (Exception e) {
            log.error("Error fetching user ID {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- Optional: UPDATE USER (Example) ---
    // Similar changes needed if you implement update
    // @PutMapping("/{id}")
    // public ResponseEntity<?> updateUser(...) { ... }

}