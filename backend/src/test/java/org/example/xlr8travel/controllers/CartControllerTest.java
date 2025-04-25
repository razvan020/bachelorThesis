package org.example.xlr8travel.controllers;

import jakarta.persistence.EntityNotFoundException;
import org.example.xlr8travel.dto.AddToCartRequestDTO;
import org.example.xlr8travel.dto.CartDTO;
import org.example.xlr8travel.dto.FlightCartItemDTO;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.services.CartService;
import org.example.xlr8travel.services.FlightService;
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
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CartControllerTest {

    @Mock
    private FlightService flightService;

    @Mock
    private CartService cartService;

    @Mock
    private UserService userService;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private CartController cartController;

    private User testUser;
    private Flight testFlight;
    private CartDTO testCartDTO;
    private final Long TEST_FLIGHT_ID = 1L;
    private final String TEST_USERNAME = "testuser";

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername(TEST_USERNAME);

        // Create test flight
        testFlight = new Flight();
        testFlight.setId(TEST_FLIGHT_ID);
        testFlight.setName("Test Flight");
        testFlight.setOrigin("Origin");
        testFlight.setDestination("Destination");
        testFlight.setPrice(BigDecimal.valueOf(100.0));

        // Create test cart DTO
        testCartDTO = new CartDTO();
        List<FlightCartItemDTO> items = new ArrayList<>();
        FlightCartItemDTO item = new FlightCartItemDTO();
        item.setId(TEST_FLIGHT_ID);
        item.setFlightName("Test Flight");
        item.setOrigin("Origin");
        item.setDestination("Destination");
        item.setDepartureDate(LocalDate.now());
        item.setDepartureTime(LocalTime.now());
        item.setArrivalDate(LocalDate.now().plusDays(1));
        item.setArrivalTime(LocalTime.now().plusHours(2));
        item.setPrice(BigDecimal.valueOf(100.0));
        item.setQuantity(1);
        items.add(item);
        testCartDTO.setItems(items);
        testCartDTO.setTotalPrice(100.0);
        testCartDTO.setTotalQuantity(1);

        // Mock UserDetails behavior with lenient stubbing to avoid "unnecessary stubbing" errors
        // when userDetails is null in some tests
        lenient().when(userDetails.getUsername()).thenReturn(TEST_USERNAME);

        // Mock UserService behavior with lenient stubbing
        lenient().when(userService.findByUsername(TEST_USERNAME)).thenReturn(testUser);
    }

    @Test
    void showCart_WhenAuthenticated_ReturnsCart() {
        // Arrange
        when(cartService.getCartForUser(testUser)).thenReturn(testCartDTO);

        // Act
        ResponseEntity<CartDTO> response = cartController.showCart(userDetails);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getItems().size());
        assertEquals(TEST_FLIGHT_ID, response.getBody().getItems().get(0).getId());
        assertEquals(100.0, response.getBody().getTotalPrice());
        assertEquals(1, response.getBody().getTotalQuantity());

        // Verify service was called
        verify(cartService).getCartForUser(testUser);
    }

    @Test
    void showCart_WhenNotAuthenticated_ReturnsUnauthorized() {
        // Arrange
        when(userService.findByUsername(anyString())).thenThrow(
            new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated")
        );

        // Act
        ResponseEntity<CartDTO> response = cartController.showCart(userDetails);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void addFlightToCart_WhenFlightExists_ReturnsUpdatedCart() {
        // Arrange
        AddToCartRequestDTO request = new AddToCartRequestDTO();
        request.setFlightId(TEST_FLIGHT_ID);

        when(flightService.findById(TEST_FLIGHT_ID)).thenReturn(testFlight);
        when(cartService.addItemToCart(testUser, testFlight)).thenReturn(testCartDTO);

        // Act
        ResponseEntity<?> response = cartController.addFlightToCart(request, userDetails);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof CartDTO);
        CartDTO responseCart = (CartDTO) response.getBody();
        assertEquals(1, responseCart.getItems().size());
        assertEquals(TEST_FLIGHT_ID, responseCart.getItems().get(0).getId());

        // Verify services were called
        verify(flightService).findById(TEST_FLIGHT_ID);
        verify(cartService).addItemToCart(testUser, testFlight);
    }

    @Test
    void addFlightToCart_WhenFlightDoesNotExist_ReturnsNotFound() {
        // Arrange
        AddToCartRequestDTO request = new AddToCartRequestDTO();
        request.setFlightId(TEST_FLIGHT_ID);

        when(flightService.findById(TEST_FLIGHT_ID)).thenReturn(null);

        // Act
        ResponseEntity<?> response = cartController.addFlightToCart(request, userDetails);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> errorMap = (Map<String, String>) response.getBody();
        assertEquals("Flight not found", errorMap.get("error"));

        // Verify service was called
        verify(flightService).findById(TEST_FLIGHT_ID);
        verify(cartService, never()).addItemToCart(any(), any());
    }

    @Test
    void decreaseQuantity_WhenFlightExistsInCart_ReturnsUpdatedCart() {
        // Arrange
        when(flightService.findById(TEST_FLIGHT_ID)).thenReturn(testFlight);
        when(cartService.decreaseItemQuantity(testUser, testFlight)).thenReturn(testCartDTO);

        // Act
        ResponseEntity<?> response = cartController.decreaseQuantity(TEST_FLIGHT_ID, userDetails);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof CartDTO);
        CartDTO responseCart = (CartDTO) response.getBody();
        assertEquals(1, responseCart.getItems().size());
        assertEquals(TEST_FLIGHT_ID, responseCart.getItems().get(0).getId());

        // Verify services were called
        verify(flightService).findById(TEST_FLIGHT_ID);
        verify(cartService).decreaseItemQuantity(testUser, testFlight);
    }

    @Test
    void decreaseQuantity_WhenFlightDoesNotExistInCatalog_ReturnsNotFound() {
        // Arrange
        when(flightService.findById(TEST_FLIGHT_ID)).thenReturn(null);

        // Act
        ResponseEntity<?> response = cartController.decreaseQuantity(TEST_FLIGHT_ID, userDetails);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> errorMap = (Map<String, String>) response.getBody();
        assertEquals("Flight not found in catalog", errorMap.get("error"));

        // Verify service was called
        verify(flightService).findById(TEST_FLIGHT_ID);
        verify(cartService, never()).decreaseItemQuantity(any(), any());
    }

    @Test
    void decreaseQuantity_WhenFlightNotInCart_ReturnsNotFound() {
        // Arrange
        when(flightService.findById(TEST_FLIGHT_ID)).thenReturn(testFlight);
        when(cartService.decreaseItemQuantity(testUser, testFlight)).thenThrow(
            new EntityNotFoundException("Item not found in cart")
        );

        // Act
        ResponseEntity<?> response = cartController.decreaseQuantity(TEST_FLIGHT_ID, userDetails);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> errorMap = (Map<String, String>) response.getBody();
        assertEquals("Item not found in cart", errorMap.get("error"));

        // Verify services were called
        verify(flightService).findById(TEST_FLIGHT_ID);
        verify(cartService).decreaseItemQuantity(testUser, testFlight);
    }

    @Test
    void removeFlightFromCart_WhenFlightExistsInCart_ReturnsUpdatedCart() {
        // Arrange
        when(flightService.findById(TEST_FLIGHT_ID)).thenReturn(testFlight);
        when(cartService.removeItemFromCart(testUser, testFlight)).thenReturn(testCartDTO);

        // Act
        ResponseEntity<?> response = cartController.removeFlightFromCart(TEST_FLIGHT_ID, userDetails);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof CartDTO);
        CartDTO responseCart = (CartDTO) response.getBody();
        assertEquals(1, responseCart.getItems().size());
        assertEquals(TEST_FLIGHT_ID, responseCart.getItems().get(0).getId());

        // Verify services were called
        verify(flightService).findById(TEST_FLIGHT_ID);
        verify(cartService).removeItemFromCart(testUser, testFlight);
    }

    @Test
    void removeFlightFromCart_WhenFlightDoesNotExistInCatalog_ReturnsNotFound() {
        // Arrange
        when(flightService.findById(TEST_FLIGHT_ID)).thenReturn(null);

        // Act
        ResponseEntity<?> response = cartController.removeFlightFromCart(TEST_FLIGHT_ID, userDetails);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> errorMap = (Map<String, String>) response.getBody();
        assertEquals("Flight not found in catalog", errorMap.get("error"));

        // Verify service was called
        verify(flightService).findById(TEST_FLIGHT_ID);
        verify(cartService, never()).removeItemFromCart(any(), any());
    }

    @Test
    void removeFlightFromCart_WhenFlightNotInCart_ReturnsNotFound() {
        // Arrange
        when(flightService.findById(TEST_FLIGHT_ID)).thenReturn(testFlight);
        when(cartService.removeItemFromCart(testUser, testFlight)).thenThrow(
            new EntityNotFoundException("Item not found in cart")
        );

        // Act
        ResponseEntity<?> response = cartController.removeFlightFromCart(TEST_FLIGHT_ID, userDetails);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> errorMap = (Map<String, String>) response.getBody();
        assertEquals("Item not found in cart", errorMap.get("error"));

        // Verify services were called
        verify(flightService).findById(TEST_FLIGHT_ID);
        verify(cartService).removeItemFromCart(testUser, testFlight);
    }
}
