package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Order;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.models.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
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
public class OrderRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private OrderRepository orderRepository;

    private User user;
    private Order order1;
    private Order order2;
    private Order order3;

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
        entityManager.flush();

        // Create test orders with different dates
        order1 = new Order();
        order1.setUser(user);
        order1.setOrderDate(LocalDateTime.now().minusDays(1));
        order1.setTotalPrice(BigDecimal.valueOf(100.0));
        order1.setStatus("COMPLETED");
        order1.setBillingName("Test User");
        order1.setBillingEmail("test@example.com");

        order2 = new Order();
        order2.setUser(user);
        order2.setOrderDate(LocalDateTime.now().minusDays(2));
        order2.setTotalPrice(BigDecimal.valueOf(200.0));
        order2.setStatus("COMPLETED");
        order2.setBillingName("Test User");
        order2.setBillingEmail("test@example.com");

        order3 = new Order();
        order3.setUser(user);
        order3.setOrderDate(LocalDateTime.now());
        order3.setTotalPrice(BigDecimal.valueOf(300.0));
        order3.setStatus("PROCESSING");
        order3.setBillingName("Test User");
        order3.setBillingEmail("test@example.com");

        // Save orders to the database
        entityManager.persist(order1);
        entityManager.persist(order2);
        entityManager.persist(order3);
        entityManager.flush();
    }

    @Test
    void findByUserOrderByOrderDateDesc_ShouldReturnOrdersInDescendingOrderByDate() {
        // Act
        List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(user);

        // Assert
        assertEquals(3, orders.size());

        // Verify orders are sorted by order date in descending order
        assertTrue(orders.get(0).getOrderDate().isAfter(orders.get(1).getOrderDate()));
        assertTrue(orders.get(1).getOrderDate().isAfter(orders.get(2).getOrderDate()));

        // Verify the first order is the most recent one (order3)
        assertEquals(order3.getId(), orders.get(0).getId());
        assertEquals(BigDecimal.valueOf(300.0), orders.get(0).getTotalPrice());

        // Verify the last order is the oldest one (order2)
        assertEquals(order2.getId(), orders.get(2).getId());
        assertEquals(BigDecimal.valueOf(200.0), orders.get(2).getTotalPrice());
    }

    @Test
    void findByUserOrderByOrderDateDesc_WhenUserHasNoOrders_ShouldReturnEmptyList() {
        // Create a user with no orders
        User userWithNoOrders = new User();
        userWithNoOrders.setUsername("noorders");
        userWithNoOrders.setEmail("noorders@example.com");
        userWithNoOrders.setPassword("password");
        userWithNoOrders.setRoles(new ArrayList<>());
        userWithNoOrders.getRoles().add(Role.ROLE_USER);

        entityManager.persist(userWithNoOrders);
        entityManager.flush();

        // Act
        List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(userWithNoOrders);

        // Assert
        assertTrue(orders.isEmpty());
    }
}
