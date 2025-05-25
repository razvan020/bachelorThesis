package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Cart;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.models.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

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
public class CartRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CartRepository cartRepository;

    private User user1;
    private User user2;
    private Cart cart1;
    private Cart cart2;

    @BeforeEach
    void setUp() {
        // Create test users
        user1 = new User();
        user1.setUsername("testuser1");
        user1.setEmail("test1@example.com");
        user1.setPassword("password1");
        user1.setRoles(new ArrayList<>());
        user1.getRoles().add(Role.ROLE_USER);

        user2 = new User();
        user2.setUsername("testuser2");
        user2.setEmail("test2@example.com");
        user2.setPassword("password2");
        user2.setRoles(new ArrayList<>());
        user2.getRoles().add(Role.ROLE_USER);

        // Save users to the database
        entityManager.persist(user1);
        entityManager.persist(user2);
        entityManager.flush();

        // Create test carts
        cart1 = new Cart();
        cart1.setUser(user1);
        cart1.setCreatedAt(LocalDateTime.now());
        cart1.setUpdatedAt(LocalDateTime.now());

        cart2 = new Cart();
        cart2.setUser(user2);
        cart2.setCreatedAt(LocalDateTime.now());
        cart2.setUpdatedAt(LocalDateTime.now());

        // Save carts to the database
        entityManager.persist(cart1);
        entityManager.persist(cart2);
        entityManager.flush();
    }

    @Test
    void findByUser_WhenCartExists_ShouldReturnCart() {
        // Act
        Optional<Cart> foundCart = cartRepository.findByUser(user1);

        // Assert
        assertTrue(foundCart.isPresent());
        assertEquals(cart1.getId(), foundCart.get().getId());
        assertEquals(user1.getId(), foundCart.get().getUser().getId());
    }

    @Test
    void findByUser_WhenCartDoesNotExist_ShouldReturnEmptyOptional() {
        // Create a user without a cart
        User userWithoutCart = new User();
        userWithoutCart.setUsername("nocart");
        userWithoutCart.setEmail("nocart@example.com");
        userWithoutCart.setPassword("password");
        userWithoutCart.setRoles(new ArrayList<>());
        userWithoutCart.getRoles().add(Role.ROLE_USER);

        entityManager.persist(userWithoutCart);
        entityManager.flush();

        // Act
        Optional<Cart> foundCart = cartRepository.findByUser(userWithoutCart);

        // Assert
        assertFalse(foundCart.isPresent());
    }

    @Test
    void findByUserId_WhenCartExists_ShouldReturnCart() {
        // Act
        Optional<Cart> foundCart = cartRepository.findByUserId(user2.getId());

        // Assert
        assertTrue(foundCart.isPresent());
        assertEquals(cart2.getId(), foundCart.get().getId());
        assertEquals(user2.getId(), foundCart.get().getUser().getId());
    }

    @Test
    void findByUserId_WhenCartDoesNotExist_ShouldReturnEmptyOptional() {
        // Act
        Optional<Cart> foundCart = cartRepository.findByUserId(999L); // Non-existent user ID

        // Assert
        assertFalse(foundCart.isPresent());
    }
}
