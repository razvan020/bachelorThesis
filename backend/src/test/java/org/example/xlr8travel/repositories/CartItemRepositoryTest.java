package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
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
public class CartItemRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CartItemRepository cartItemRepository;

    private User user;
    private Cart cart;
    private Flight flight1;
    private Flight flight2;
    private CartItemModel cartItem1;
    private CartItemModel cartItem2;

    @BeforeEach
    void setUp() {
        // Create test user
        user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setRoles(new ArrayList<>());
        user.getRoles().add(Role.ROLE_USER);

        // Save user to the database
        entityManager.persist(user);

        // Create test cart
        cart = new Cart();
        cart.setUser(user);
        cart.setCreatedAt(LocalDateTime.now());
        cart.setUpdatedAt(LocalDateTime.now());

        // Save cart to the database
        entityManager.persist(cart);

        // Create test flights
        flight1 = new Flight();
        flight1.setName("Flight 101");
        flight1.setOrigin("Origin1");
        flight1.setDestination("Destination1");
        flight1.setDepartureDate(LocalDate.now());
        flight1.setArrivalDate(LocalDate.now().plusDays(1));
        flight1.setDepartureTime(LocalTime.of(10, 0));
        flight1.setArrivalTime(LocalTime.of(12, 0));
        flight1.setPrice(BigDecimal.valueOf(100.0));
        flight1.setLastUpdated(LocalDateTime.now());

        flight2 = new Flight();
        flight2.setName("Flight 102");
        flight2.setOrigin("Origin2");
        flight2.setDestination("Destination2");
        flight2.setDepartureDate(LocalDate.now().plusDays(2));
        flight2.setArrivalDate(LocalDate.now().plusDays(3));
        flight2.setDepartureTime(LocalTime.of(14, 0));
        flight2.setArrivalTime(LocalTime.of(16, 0));
        flight2.setPrice(BigDecimal.valueOf(200.0));
        flight2.setLastUpdated(LocalDateTime.now());

        // Save flights to the database
        entityManager.persist(flight1);
        entityManager.persist(flight2);

        // Create test cart items
        cartItem1 = new CartItemModel();
        cartItem1.setCart(cart);
        cartItem1.setFlight(flight1);
        cartItem1.setQuantity(2);

        cartItem2 = new CartItemModel();
        cartItem2.setCart(cart);
        cartItem2.setFlight(flight2);
        cartItem2.setQuantity(1);

        // Save cart items to the database
        entityManager.persist(cartItem1);
        entityManager.persist(cartItem2);
        entityManager.flush();
    }

    @Test
    void findAll_ShouldReturnAllCartItems() {
        // Act
        List<CartItemModel> cartItems = cartItemRepository.findAll();

        // Assert
        assertEquals(2, cartItems.size());
        assertTrue(cartItems.stream().anyMatch(item -> item.getId().equals(cartItem1.getId())));
        assertTrue(cartItems.stream().anyMatch(item -> item.getId().equals(cartItem2.getId())));
    }

    @Test
    void findById_WhenCartItemExists_ShouldReturnCartItem() {
        // Act
        Optional<CartItemModel> foundCartItem = cartItemRepository.findById(cartItem1.getId());

        // Assert
        assertTrue(foundCartItem.isPresent());
        assertEquals(cartItem1.getId(), foundCartItem.get().getId());
        assertEquals(2, foundCartItem.get().getQuantity());
    }

    @Test
    void findById_WhenCartItemDoesNotExist_ShouldReturnEmptyOptional() {
        // Act
        Optional<CartItemModel> foundCartItem = cartItemRepository.findById(999L);

        // Assert
        assertFalse(foundCartItem.isPresent());
    }

    @Test
    void save_ShouldCreateNewCartItem() {
        // Arrange
        CartItemModel newCartItem = new CartItemModel();
        newCartItem.setCart(cart);
        newCartItem.setFlight(flight1);
        newCartItem.setQuantity(3);

        // Act
        CartItemModel savedCartItem = cartItemRepository.save(newCartItem);

        // Assert
        assertNotNull(savedCartItem.getId());
        assertEquals(3, savedCartItem.getQuantity());

        // Verify it was saved to the database
        Optional<CartItemModel> foundCartItem = cartItemRepository.findById(savedCartItem.getId());
        assertTrue(foundCartItem.isPresent());
        assertEquals(3, foundCartItem.get().getQuantity());
    }

    @Test
    void delete_ShouldRemoveCartItem() {
        // Act
        cartItemRepository.delete(cartItem1);
        entityManager.flush();

        // Assert
        Optional<CartItemModel> foundCartItem = cartItemRepository.findById(cartItem1.getId());
        assertFalse(foundCartItem.isPresent());
    }
}
