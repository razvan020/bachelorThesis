package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.User;
import org.example.xlr8travel.models.Role;
import org.example.xlr8travel.models.Account_Status;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(
    properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
    }
)
public class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User user1;
    private User user2;
    private User user3;

    @BeforeEach
    void setUp() {
        // Create test users with different creation and login times
        user1 = new User();
        user1.setUsername("user1");
        user1.setEmail("user1@example.com");
        user1.setPassword("password1");
        user1.setFirstname("First1");
        user1.setLastname("Last1");
        user1.setRoles(new ArrayList<>());
        user1.getRoles().add(Role.ROLE_USER);
        user1.setCreatedAt(LocalDateTime.now().minusDays(30));
        user1.setLastLogin(LocalDateTime.now().minusDays(5));
        user1.setAccountStatus(Account_Status.ACCOUNT_STATUS_ACTIVE);

        user2 = new User();
        user2.setUsername("user2");
        user2.setEmail("user2@example.com");
        user2.setPassword("password2");
        user2.setFirstname("First2");
        user2.setLastname("Last2");
        user2.setRoles(new ArrayList<>());
        user2.getRoles().add(Role.ROLE_ADMIN);
        user2.setCreatedAt(LocalDateTime.now().minusDays(15));
        user2.setLastLogin(LocalDateTime.now().minusDays(2));
        user2.setAccountStatus(Account_Status.ACCOUNT_STATUS_ACTIVE);

        user3 = new User();
        user3.setUsername("user3");
        user3.setEmail("user3@example.com");
        user3.setPassword("password3");
        user3.setFirstname("First3");
        user3.setLastname("Last3");
        user3.setRoles(new ArrayList<>());
        user3.getRoles().add(Role.ROLE_USER);
        user3.setCreatedAt(LocalDateTime.now().minusDays(7));
        user3.setLastLogin(LocalDateTime.now().minusDays(1));
        user3.setAccountStatus(Account_Status.ACCOUNT_STATUS_ACTIVE);

        // Save users to the database
        entityManager.persist(user1);
        entityManager.persist(user2);
        entityManager.persist(user3);
        entityManager.flush();
    }

    @Test
    void findByUsername_ShouldReturnMatchingUsers() {
        // Act
        List<User> users = userRepository.findByUsername("user1");

        // Assert
        assertEquals(1, users.size());
        assertEquals("user1@example.com", users.get(0).getEmail());
    }

    @Test
    void findByEmail_ShouldReturnMatchingUser() {
        // Act
        User user = userRepository.findByEmail("user2@example.com");

        // Assert
        assertNotNull(user);
        assertEquals("user2", user.getUsername());
    }

    @Test
    void findAll_ShouldReturnAllUsers() {
        // Act
        List<User> users = userRepository.findAll();

        // Assert
        assertEquals(3, users.size());
    }

    @Test
    void count_ShouldReturnCorrectCount() {
        // Act
        long count = userRepository.count();

        // Assert
        assertEquals(3, count);
    }

    @Test
    void findByCreatedAtAfter_ShouldReturnUsersCreatedAfterDate() {
        // Arrange
        LocalDateTime date = LocalDateTime.now().minusDays(10);

        // Act
        List<User> users = userRepository.findByCreatedAtAfter(date);

        // Assert
        // In H2, only one user is being returned
        assertEquals(1, users.size());
        assertTrue(users.stream().anyMatch(u -> u.getUsername().equals("user3")));
    }

    @Test
    void findByLastLoginAfter_ShouldReturnUsersLoggedInAfterDate() {
        // Arrange
        LocalDateTime date = LocalDateTime.now().minusDays(3);

        // Act
        List<User> users = userRepository.findByLastLoginAfter(date);

        // Assert
        assertEquals(2, users.size());
        assertTrue(users.stream().anyMatch(u -> u.getUsername().equals("user2")));
        assertTrue(users.stream().anyMatch(u -> u.getUsername().equals("user3")));
    }

    @Test
    void countUsersCreatedAfter_ShouldReturnCorrectCount() {
        // Arrange
        LocalDateTime date = LocalDateTime.now().minusDays(20);

        // Act
        long count = userRepository.countUsersCreatedAfter(date);

        // Assert
        assertEquals(2, count);
    }

    @Test
    void countActiveUsersAfter_ShouldReturnCorrectCount() {
        // Arrange
        LocalDateTime date = LocalDateTime.now().minusDays(3);

        // Act
        long count = userRepository.countActiveUsersAfter(date);

        // Assert
        assertEquals(2, count);
    }
}
