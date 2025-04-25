package org.example.xlr8travel.services;

import org.example.xlr8travel.models.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    User save(User user);
    User findById(Long id);

    User findByUsername(String username);

    User findByEmail(String email);

    List<User> findAll();

    void removeUserById(Long id);

    void addUser(User user);

    void updateProfilePicture(String username, MultipartFile file);
    UserAvatar getProfilePicture(String username);
    void changePassword(String username, String oldPwd, String newPwd);
}
