package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface UserRepository extends CrudRepository<User, Long> {

        List<User> findByUsername(String username);

        User findByEmail(String email);


        //List<User> findByRoles(String role);

        List<User> findAll();

        long count();

        List<User> findByCreatedAtAfter(LocalDateTime date);

        List<User> findByLastLoginAfter(LocalDateTime date);

        @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt > :date")
        long countUsersCreatedAfter(@Param("date") LocalDateTime date);

        @Query("SELECT COUNT(u) FROM User u WHERE u.lastLogin > :date")
        long countActiveUsersAfter(@Param("date") LocalDateTime date);
}
