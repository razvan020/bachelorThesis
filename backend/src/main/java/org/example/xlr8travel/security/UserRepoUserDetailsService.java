package org.example.xlr8travel.security;

import org.example.xlr8travel.models.User;
import org.example.xlr8travel.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserRepoUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public UserRepoUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String s) throws UsernameNotFoundException {
        // First try to find by email
        User user = userRepository.findByEmail(s);

        // If not found by email, try by username
        if (user == null) {
            List<User> users = userRepository.findByUsername(s);
            if (!users.isEmpty()) {
                user = users.get(0);
            }
        }

        if (user != null)
            return user;

        throw new UsernameNotFoundException("User " + s + " not found");
    }
}
