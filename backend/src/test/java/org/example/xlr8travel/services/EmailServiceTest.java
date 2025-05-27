package org.example.xlr8travel.services;

import org.example.xlr8travel.models.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessagePreparator;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailServiceImpl emailService;

    private User user;
    private Order order;
    private Flight flight;
    private OrderItem orderItem;

    @BeforeEach
    void setUp() {
        // Create test user
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setFirstname("Test");
        user.setLastname("User");

        // Create test flight
        flight = new Flight();
        flight.setId(1L);
        flight.setName("Test Flight");
        flight.setOrigin("Origin City");
        flight.setDestination("Destination City");
        flight.setDepartureDate(LocalDate.now());
        flight.setArrivalDate(LocalDate.now());
        flight.setDepartureTime(LocalTime.of(10, 0));
        flight.setArrivalTime(LocalTime.of(12, 0));
        flight.setPrice(BigDecimal.valueOf(100.0));

        // Create test order
        order = new Order();
        order.setId(1L);
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setTotalPrice(BigDecimal.valueOf(100.0));
        order.setStatus("COMPLETED");
        order.setBillingName("Test User");
        order.setBillingEmail("test@example.com");

        // Create test order item
        orderItem = new OrderItem();
        orderItem.setId(1L);
        orderItem.setOrder(order);
        orderItem.setFlight(flight);
        orderItem.setQuantity(1);
        orderItem.setPricePerItem(BigDecimal.valueOf(100.0));

        // Add order item to order
        Set<OrderItem> orderItems = new HashSet<>();
        orderItems.add(orderItem);
        order.setOrderItems(orderItems);
    }

    @Test
    void testSendPurchaseConfirmationEmail() {
        // Mock MimeMessage
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Test sending purchase confirmation email
        boolean result = emailService.sendPurchaseConfirmationEmail(order, user, "€");

        // Verify that the email was sent
        verify(mailSender, times(1)).send(any(MimeMessage.class));
        assertTrue(result);
    }

    @Test
    void testSendSimpleEmail() {
        // Test sending simple email
        boolean result = emailService.sendSimpleEmail("test@example.com", "Test Subject", "Test Content");

        // Verify that the email was sent
        verify(mailSender, times(1)).send(any(org.springframework.mail.SimpleMailMessage.class));
        assertTrue(result);
    }
}
