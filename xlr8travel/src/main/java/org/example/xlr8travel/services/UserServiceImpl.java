package org.example.xlr8travel.services;

import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public void save(User user) {
        userRepository.save(user);
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
}
