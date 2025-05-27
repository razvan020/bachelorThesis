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
public class OrderItemRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private OrderItemRepository orderItemRepository;

    private User user;
    private Order order1;
    private Order order2;
    private Flight flight1;
    private Flight flight2;
    private OrderItem orderItem1;
    private OrderItem orderItem2;
    private OrderItem orderItem3;

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

        // Create test orders
        order1 = new Order();
        order1.setUser(user);
        order1.setOrderDate(LocalDateTime.now().minusDays(1));
        order1.setTotalPrice(BigDecimal.valueOf(300.0));
        order1.setStatus("COMPLETED");
        order1.setBillingName("Test User");
        order1.setBillingEmail("test@example.com");

        order2 = new Order();
        order2.setUser(user);
        order2.setOrderDate(LocalDateTime.now());
        order2.setTotalPrice(BigDecimal.valueOf(200.0));
        order2.setStatus("PROCESSING");
        order2.setBillingName("Test User");
        order2.setBillingEmail("test@example.com");

        // Save orders to the database
        entityManager.persist(order1);
        entityManager.persist(order2);

        // Create test order items
        orderItem1 = new OrderItem();
        orderItem1.setOrder(order1);
        orderItem1.setFlight(flight1);
        orderItem1.setQuantity(2);
        orderItem1.setPricePerItem(BigDecimal.valueOf(100.0));

        orderItem2 = new OrderItem();
        orderItem2.setOrder(order1);
        orderItem2.setFlight(flight2);
        orderItem2.setQuantity(1);
        orderItem2.setPricePerItem(BigDecimal.valueOf(200.0));

        orderItem3 = new OrderItem();
        orderItem3.setOrder(order2);
        orderItem3.setFlight(flight1);
        orderItem3.setQuantity(2);
        orderItem3.setPricePerItem(BigDecimal.valueOf(100.0));

        // Save order items to the database
        entityManager.persist(orderItem1);
        entityManager.persist(orderItem2);
        entityManager.persist(orderItem3);
        entityManager.flush();
    }

    @Test
    void findByOrder_ShouldReturnOrderItemsForSpecificOrder() {
        // Act
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order1);

        // Assert
        assertEquals(2, orderItems.size());
        assertTrue(orderItems.stream().anyMatch(item -> item.getId().equals(orderItem1.getId())));
        assertTrue(orderItems.stream().anyMatch(item -> item.getId().equals(orderItem2.getId())));
        assertFalse(orderItems.stream().anyMatch(item -> item.getId().equals(orderItem3.getId())));
    }

    @Test
    void findByOrder_WhenOrderHasNoItems_ShouldReturnEmptyList() {
        // Create an order with no items
        Order emptyOrder = new Order();
        emptyOrder.setUser(user);
        emptyOrder.setOrderDate(LocalDateTime.now().minusDays(3));
        emptyOrder.setTotalPrice(BigDecimal.ZERO);
        emptyOrder.setStatus("CANCELLED");
        emptyOrder.setBillingName("Test User");
        emptyOrder.setBillingEmail("test@example.com");

        entityManager.persist(emptyOrder);
        entityManager.flush();

        // Act
        List<OrderItem> orderItems = orderItemRepository.findByOrder(emptyOrder);

        // Assert
        assertTrue(orderItems.isEmpty());
    }
}
