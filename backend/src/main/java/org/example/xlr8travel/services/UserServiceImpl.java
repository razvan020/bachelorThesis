package org.example.xlr8travel.services;

import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private static final long MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User save(User user) {
        userRepository.save(user);
        return user;
    }

    @Override
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public void removeUserById(Long id) {
        Optional<User> userOptional = userRepository.findById(id);

        // Step 2: Check if the user exists
        if (userOptional.isPresent()) {
            // User found, proceed to delete
            User user = userOptional.get();
            userRepository.delete(user);
        } else {
            // User not found, handle the scenario accordingly
            // For example, you could throw an exception or log a message
            throw new IllegalArgumentException("User not found with ID: " + id);
        }
    }

    @Override
    public void addUser(User user) {
        // Check if the username already exists


        // Check if the email address already exists

        // Perform any additional validation if needed

        // Save the user to the database
        userRepository.save(user);
    }

    @Override
    public void updateProfilePicture(String username, MultipartFile file) {
        if (file.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No file uploaded");
        if (file.getSize() > MAX_AVATAR_SIZE)
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE, "Avatar must be ≤ 2 MB"
            );
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/"))
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only image files allowed"
            );

        User u = userRepository.findByUsername(username);
        if (u == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");

        try {
            u.setProfilePicture(file.getBytes());
            u.setProfilePictureContentType(ct);
            userRepository.save(u);
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store image"
            );
        }
    }

    @Override
    public UserAvatar getProfilePicture(String username) {
        User u = userRepository.findByUsername(username);
        if (u == null || u.getProfilePicture() == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No avatar");
        return new UserAvatar(u.getProfilePicture(), u.getProfilePictureContentType());
    }

    @Override
    public void changePassword(String username, String oldPwd, String newPwd) {
        User u = userRepository.findByUsername(username);
        if (u == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        if (!passwordEncoder.matches(oldPwd, u.getPassword()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Wrong current password");
        u.setPassword(passwordEncoder.encode(newPwd));
        userRepository.save(u);
    }
}
