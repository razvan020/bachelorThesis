package org.example.xlr8travel.controllers;

import jakarta.validation.Valid;
import org.example.xlr8travel.dto.AddToCartRequestDTO;
import org.example.xlr8travel.dto.CartDTO;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.services.CartService; // Use persistent CartService
import org.example.xlr8travel.services.FlightService;
import org.example.xlr8travel.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.persistence.EntityNotFoundException; // Import exception
import java.util.Map; // For error response

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private static final Logger log = LoggerFactory.getLogger(CartController.class);
    private final FlightService flightService;
    private final CartService cartService; // Inject PERSISTENT CartService
    private final UserService userService;

    public CartController(FlightService flightService, CartService cartService, UserService userService) {
        this.flightService = flightService;
        this.cartService = cartService;
        this.userService = userService;
    }

    // Helper to get User (reuse or centralize)
    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        String username = userDetails.getUsername();
        return userService.findByUsername(username);
    }

    // --- GET CART CONTENT ---
    @GetMapping
    public ResponseEntity<CartDTO> showCart(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("Request received to view persistent cart");
        try {
            User user = getCurrentUser(userDetails);
            CartDTO cartDTO = cartService.getCartForUser(user); // Use service
            log.info("Returning persistent cart for user {} with {} items, {} total quantity.", user.getUsername(), cartDTO.getItems().size(), cartDTO.getTotalQuantity());
            return ResponseEntity.ok(cartDTO);
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode()).body(null);
        } catch (Exception e) {
            log.error("Error retrieving persistent cart", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- ADD ITEM TO CART ---
    @PostMapping("/add")
    public ResponseEntity<?> addFlightToCart(
            @Valid @RequestBody AddToCartRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getCurrentUser(userDetails); // Get authenticated user
            Long flightId = request.getFlightId();
            log.info("User {} request to add flight ID {} to persistent cart", user.getUsername(), flightId);

            Flight flight = flightService.findById(flightId);
            if (flight == null) {
                log.warn("Attempted to add non-existent flight ID {} by user {}", flightId, user.getUsername());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Flight not found"));
            }

            log.info("AddToCart request: flightId={}, seatNumber={}, seatType={}, deferSeat={}, randomSeat={}",
                    request.getFlightId(),
                    request.getSeatNumber(),  // Log seat number
                    request.getSeatType(),    // Log seat type
                    request.isDeferSeatSelection(),
                    request.isAllocateRandomSeat());

            // Pass all the request parameters to the service
            CartDTO updatedCart = cartService.addItemToCart(
                user, 
                flight, 
                request.getSeatId(),
                    request.getSeatNumber(),
                    request.getSeatType(),
                    request.isDeferSeatSelection(),
                request.isAllocateRandomSeat(),
                request.getBaggageType()
            );

            log.info("Flight ID {} added/incremented in persistent cart for user {}.", flight.getId(), user.getUsername());
            return ResponseEntity.ok(updatedCart);

        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode()).body(Map.of("error", rse.getReason()));
        } catch (Exception e) {
            log.error("Error adding item to persistent cart for user {}", (userDetails != null ? userDetails.getUsername() : "UNKNOWN"), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to add item to cart."));
        }
    }

    // --- DECREASE ITEM QUANTITY ---
    @PostMapping("/decrease/{flightId}")
    public ResponseEntity<?> decreaseQuantity(
            @PathVariable Long flightId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getCurrentUser(userDetails);
            log.info("User {} request to decrease quantity for flight ID {}", user.getUsername(), flightId);

            Flight flight = flightService.findById(flightId);
            if (flight == null) {
                log.warn("Attempted to decrease quantity for non-existent flight ID {}", flightId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Flight not found in catalog"));
            }

            CartDTO updatedCart = cartService.decreaseItemQuantity(user, flight); // Use service
            log.info("Quantity decreased/item potentially removed for flight ID {} in persistent cart for user {}.", flight.getId(), user.getUsername());
            return ResponseEntity.ok(updatedCart);

        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode()).body(Map.of("error", rse.getReason()));
        } catch (EntityNotFoundException enfe) { // Catch service exception
            log.warn("Attempted to decrease quantity for flight ID {} not found in persistent cart for user {}", flightId, (userDetails != null ? userDetails.getUsername() : "UNKNOWN"));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Item not found in cart"));
        } catch (Exception e) {
            log.error("Error decreasing item quantity for user {}", (userDetails != null ? userDetails.getUsername() : "UNKNOWN"), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to decrease item quantity."));
        }
    }

    // --- REMOVE ITEM FROM CART ---
    @DeleteMapping("/remove/{flightId}")
    public ResponseEntity<?> removeFlightFromCart(
            @PathVariable Long flightId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getCurrentUser(userDetails);
            log.info("User {} request to remove flight ID {} from persistent cart", user.getUsername(), flightId);

            Flight flight = flightService.findById(flightId);
            if (flight == null) {
                log.warn("Attempted to remove non-existent flight ID {}", flightId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Flight not found in catalog"));
            }

            CartDTO updatedCart = cartService.removeItemFromCart(user, flight); // Use service
            log.info("Item removed for flight ID {} in persistent cart for user {}.", flight.getId(), user.getUsername());
            return ResponseEntity.ok(updatedCart);

        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode()).body(Map.of("error", rse.getReason()));
        } catch (EntityNotFoundException enfe) { // Catch service exception
            log.warn("Attempted to remove flight ID {} not found in persistent cart for user {}", flightId, (userDetails != null ? userDetails.getUsername() : "UNKNOWN"));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Item not found in cart"));
        } catch (Exception e) {
            log.error("Error removing item from persistent cart for user {}", (userDetails != null ? userDetails.getUsername() : "UNKNOWN"), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to remove item from cart."));
        }
    }
}
