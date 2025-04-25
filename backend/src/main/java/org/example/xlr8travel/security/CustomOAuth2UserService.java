package org.example.xlr8travel.security;

import org.example.xlr8travel.models.Role;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public CustomOAuth2UserService(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        // Extract user details from OAuth2User
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        if (email != null) {
            // Check if user exists
            User existingUser = userService.findByEmail(email);

            if (existingUser == null) {
                logger.info("Creating new user from OAuth2 login: {}", email);

                // Create new user
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setUsername(email); // Use email as username

                // Set name if available
                if (name != null) {
                    String[] nameParts = name.split(" ");
                    if (nameParts.length > 0) {
                        newUser.setFirstname(nameParts[0]);
                        if (nameParts.length > 1) {
                            newUser.setLastname(nameParts[nameParts.length - 1]);
                        }
                    }
                }

                // Generate a random password (user won't need this for OAuth login)
                String randomPassword = UUID.randomUUID().toString();
                newUser.setPassword(passwordEncoder.encode(randomPassword));

                // Set default role
                newUser.getRoles().add(Role.ROLE_USER);

                // Set creation time
                newUser.setCreatedAt(LocalDateTime.now());

                // Save user to database
                userService.save(newUser);
                logger.info("Successfully created new user from OAuth2 login: {}", email);
            } else {
                logger.info("User already exists: {}", email);

                // Update last login time
                existingUser.setLastLogin(LocalDateTime.now());
                userService.save(existingUser);
            }
        }

        return oauth2User;
    }
}