package org.example.xlr8travel.controllers;

// No longer need HttpSession here
import org.example.xlr8travel.dto.CartDTO; // Need CartDTO from persistent service
import org.example.xlr8travel.dto.CheckoutRequestDTO;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.services.CartService; // Use persistent CartService
import org.example.xlr8travel.services.OrderService;
import org.example.xlr8travel.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private static final Logger log = LoggerFactory.getLogger(CheckoutController.class);

    private final UserService userService;
    private final OrderService orderService;
    private final CartService cartService; // Inject persistent CartService

    public CheckoutController(UserService userService, OrderService orderService, CartService cartService) {
        this.userService = userService;
        this.orderService = orderService;
        this.cartService = cartService;
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPurchase(
            @RequestBody CheckoutRequestDTO checkoutRequest,
            @AuthenticationPrincipal UserDetails userDetails) { // Get authenticated user

        log.info("Received purchase confirmation request.");

        User user = null;
        CartDTO cart = null;
        try {
            // 1. Get Authenticated User
            user = getCurrentUser(userDetails);
            log.info("Processing purchase for user: {}", user.getUsername());

            // 2. Get Persistent Cart Contents for this user
            cart = cartService.getCartForUser(user); // Use service
            if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
                log.warn("User {} attempted purchase with an empty persistent cart.", user.getUsername());
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot confirm purchase, your cart is empty."));
            }
            log.info("User {} persistent cart has {} items.", user.getUsername(), cart.getItems().size());


            // 3. *** CRITICAL: Process Payment *** (Placeholder)
            log.warn("!!! SIMULATING successful payment processing for user {} !!!", user.getUsername());
            // ... payment logic ...


            // 4. Create Order / Tickets (Pass persistent CartDTO)
            // Ensure OrderService uses CartDTO or adapt signature/logic
            String orderConfirmation = orderService.createOrderFromCart(user, cart, checkoutRequest);
            log.info("Order successfully created for user {}. Confirmation: {}", user.getUsername(), orderConfirmation);

            // 5. Clear the User's PERSISTENT Cart
            cartService.clearCart(user); // Use service
            log.info("Persistent cart cleared for user {}.", user.getUsername());

            // 6. Return Success Response to Frontend
            return ResponseEntity.ok(Map.of(
                    "message", "Purchase successful! Confirmation: " + orderConfirmation,
                    "orderId", orderConfirmation
            ));

        } catch (ResponseStatusException rse) {
            log.warn("Checkout failed for user {}: {}", (user != null ? user.getUsername() : "UNKNOWN"), rse.getReason());
            return ResponseEntity.status(rse.getStatusCode()).body(Map.of("error", rse.getReason()));
        } catch (IllegalArgumentException iae) {
            log.warn("Invalid argument during order creation for user {}: {}", (user != null ? user.getUsername() : "UNKNOWN"), iae.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", iae.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during purchase confirmation for user {}: {}", (user != null ? user.getUsername() : "UNKNOWN"), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred processing your order."));
        }
    }

    // Helper to get User (reuse or centralize)
    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) {
            // This log should NO LONGER appear if SecurityConfig is fixed
            log.warn("Attempted checkout operation without authenticated user details provided.");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        String username = userDetails.getUsername();
        return userService.findByUsername(username);

    }
}