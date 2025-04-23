package org.example.xlr8travel.controllers;

import org.example.xlr8travel.dto.CartDTO;
import org.example.xlr8travel.dto.CheckoutRequestDTO;
import org.example.xlr8travel.dto.FlightCartItemDTO;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.services.CartService;
import org.example.xlr8travel.services.OrderService;
import org.example.xlr8travel.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CheckoutControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private OrderService orderService;

    @Mock
    private CartService cartService;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private CheckoutController checkoutController;

    private User testUser;
    private CartDTO testCart;
    private CheckoutRequestDTO testCheckoutRequest;
    private final String TEST_USERNAME = "testuser";

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername(TEST_USERNAME);

        // Create test cart with items
        testCart = new CartDTO();
        testCart.setTotalPrice(100.0);
        testCart.setTotalQuantity(1);

        // Create a non-empty items list
        List<FlightCartItemDTO> items = new ArrayList<>();
        FlightCartItemDTO item = new FlightCartItemDTO();
        item.setId(1L);
        item.setFlightName("Test Flight");
        item.setPrice(BigDecimal.valueOf(100.0));
        item.setQuantity(1);
        items.add(item);

        testCart.setItems(items);

        // Create test checkout request
        testCheckoutRequest = new CheckoutRequestDTO();
        // Set properties on testCheckoutRequest if needed

        // Mock UserDetails behavior with lenient stubbing
        lenient().when(userDetails.getUsername()).thenReturn(TEST_USERNAME);

        // Mock UserService behavior
        lenient().when(userService.findByUsername(TEST_USERNAME)).thenReturn(testUser);
    }

    @Test
    void confirmPurchase_WhenAuthenticated_AndCartNotEmpty_ReturnsSuccess() throws Exception {
        // Arrange
        when(cartService.getCartForUser(testUser)).thenReturn(testCart);
        when(orderService.createOrderFromCart(eq(testUser), eq(testCart), any(CheckoutRequestDTO.class)))
                .thenReturn("ORDER123");

        // Act
        ResponseEntity<?> response = checkoutController.confirmPurchase(testCheckoutRequest, userDetails);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals("Purchase successful! Confirmation: ORDER123", responseBody.get("message"));
        assertEquals("ORDER123", responseBody.get("orderId"));

        // Verify service calls
        verify(userService).findByUsername(TEST_USERNAME);
        verify(cartService).getCartForUser(testUser);
        verify(orderService).createOrderFromCart(eq(testUser), eq(testCart), any(CheckoutRequestDTO.class));
        verify(cartService).clearCart(testUser);
    }

    @Test
    void confirmPurchase_WhenCartEmpty_ReturnsBadRequest() throws Exception {
        // Arrange
        CartDTO emptyCart = new CartDTO();
        emptyCart.setItems(new ArrayList<>());
        when(cartService.getCartForUser(testUser)).thenReturn(emptyCart);

        // Act
        ResponseEntity<?> response = checkoutController.confirmPurchase(testCheckoutRequest, userDetails);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals("Cannot confirm purchase, your cart is empty.", responseBody.get("error"));

        // Verify service calls
        verify(userService).findByUsername(TEST_USERNAME);
        verify(cartService).getCartForUser(testUser);
        verify(orderService, never()).createOrderFromCart(any(), any(), any());
        verify(cartService, never()).clearCart(any());
    }

    @Test
    void confirmPurchase_WhenNotAuthenticated_ReturnsUnauthorized() throws Exception {
        // Arrange
        when(userService.findByUsername(anyString())).thenThrow(
            new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated")
        );

        // Act
        ResponseEntity<?> response = checkoutController.confirmPurchase(testCheckoutRequest, userDetails);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals("User not authenticated", responseBody.get("error"));

        // Verify service calls
        verify(userService).findByUsername(TEST_USERNAME);
        verify(cartService, never()).getCartForUser(any());
        verify(orderService, never()).createOrderFromCart(any(), any(), any());
        verify(cartService, never()).clearCart(any());
    }

    @Test
    void confirmPurchase_WhenOrderCreationFails_ReturnsBadRequest() throws Exception {
        // Arrange
        when(cartService.getCartForUser(testUser)).thenReturn(testCart);
        when(orderService.createOrderFromCart(eq(testUser), eq(testCart), any(CheckoutRequestDTO.class)))
                .thenThrow(new IllegalArgumentException("Invalid payment information"));

        // Act
        ResponseEntity<?> response = checkoutController.confirmPurchase(testCheckoutRequest, userDetails);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals("Invalid payment information", responseBody.get("error"));

        // Verify service calls
        verify(userService).findByUsername(TEST_USERNAME);
        verify(cartService).getCartForUser(testUser);
        verify(orderService).createOrderFromCart(eq(testUser), eq(testCart), any(CheckoutRequestDTO.class));
        verify(cartService, never()).clearCart(any());
    }

    @Test
    void confirmPurchase_WhenUnexpectedError_ReturnsInternalServerError() throws Exception {
        // Arrange
        when(cartService.getCartForUser(testUser)).thenReturn(testCart);
        when(orderService.createOrderFromCart(eq(testUser), eq(testCart), any(CheckoutRequestDTO.class)))
                .thenThrow(new RuntimeException("Database error"));

        // Act
        ResponseEntity<?> response = checkoutController.confirmPurchase(testCheckoutRequest, userDetails);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals("An unexpected error occurred processing your order.", responseBody.get("error"));

        // Verify service calls
        verify(userService).findByUsername(TEST_USERNAME);
        verify(cartService).getCartForUser(testUser);
        verify(orderService).createOrderFromCart(eq(testUser), eq(testCart), any(CheckoutRequestDTO.class));
        verify(cartService, never()).clearCart(any());
    }
}
