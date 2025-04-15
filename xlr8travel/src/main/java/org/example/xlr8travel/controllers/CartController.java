package org.example.xlr8travel.controllers;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.example.xlr8travel.dto.AddToCartRequestDTO;
import org.example.xlr8travel.dto.CartDTO;
import org.example.xlr8travel.dto.CartItem; // Import CartItem
import org.example.xlr8travel.dto.FlightCartItemDTO;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.services.FlightService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private static final Logger log = LoggerFactory.getLogger(CartController.class);
    private final FlightService flightService;
    private static final String CART_SESSION_KEY = "userCartItems";

    public CartController(FlightService flightService) {
        this.flightService = flightService;
    }

    // Helper method to get cart from session
    private List<CartItem> getCartFromSession(HttpSession session) {
        List<CartItem> cart = (List<CartItem>) session.getAttribute(CART_SESSION_KEY);
        if (cart == null) {
            cart = new ArrayList<>();
            session.setAttribute(CART_SESSION_KEY, cart);
        }
        return cart;
    }

    // Helper method to build CartDTO response
    private CartDTO buildCartDTO(List<CartItem> cart) {
        // ... (keep implementation from previous step - calculates total price/quantity) ...
        List<FlightCartItemDTO> itemDTOs = cart.stream()
                .map(FlightCartItemDTO::fromCartItem)
                .collect(Collectors.toList());
        double totalPrice = cart.stream()
                .filter(item -> item.getFlight() != null && item.getFlight().getPrice() != null)
                .mapToDouble(item -> item.getFlight().getPrice() * item.getQuantity())
                .sum();
        int totalQuantity = cart.stream().mapToInt(CartItem::getQuantity).sum();
        CartDTO cartDTO = new CartDTO();
        cartDTO.setItems(itemDTOs);
        cartDTO.setTotalPrice(totalPrice);
        cartDTO.setTotalQuantity(totalQuantity);
        return cartDTO;
    }

    // GET CART CONTENT (no changes needed)
    @GetMapping
    public ResponseEntity<CartDTO> showCart(HttpSession session) {
        log.info("Request received to view cart");
        List<CartItem> cart = getCartFromSession(session);
        CartDTO cartDTO = buildCartDTO(cart);
        log.info("Returning cart with {} unique items, {} total quantity.", cart.size(), cartDTO.getTotalQuantity());
        return ResponseEntity.ok(cartDTO);
    }

    // ADD ITEM TO CART (no changes needed, handles increment internally)
    @PostMapping("/add")
    public ResponseEntity<CartDTO> addFlightToCart(@Valid @RequestBody AddToCartRequestDTO request, HttpSession session) {
        // ... (keep implementation from previous step - finds item, increments or adds new) ...
        Long flightId = request.getFlightId();
        log.info("Request received to add flight ID {} to cart", flightId);
        Flight flight = flightService.findById(flightId);
        if (flight == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Flight not found");
        List<CartItem> cart = getCartFromSession(session);
        Optional<CartItem> existingItem = cart.stream().filter(item -> item.getFlight().getId().equals(flightId)).findFirst();
        if (existingItem.isPresent()) {
            existingItem.get().incrementQuantity(); log.info("Incremented quantity for flight ID {} in cart.", flightId);
        } else {
            cart.add(new CartItem(flight, 1)); log.info("Added new flight ID {} to cart.", flightId);
        }
        session.setAttribute(CART_SESSION_KEY, cart);
        return ResponseEntity.ok(buildCartDTO(cart));
    }

    // --- NEW: DECREASE ITEM QUANTITY ---
    @PostMapping("/decrease/{flightId}") // Could also be PUT
    public ResponseEntity<CartDTO> decreaseQuantity(@PathVariable Long flightId, HttpSession session) {
        log.info("Request received to decrease quantity for flight ID {}", flightId);
        List<CartItem> cart = getCartFromSession(session);

        Optional<CartItem> existingItem = cart.stream()
                .filter(item -> item.getFlight().getId().equals(flightId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() - 1); // Decrease quantity
            log.info("Decreased quantity for flight ID {}. New quantity: {}", flightId, item.getQuantity());
            // If quantity reaches zero, remove the item
            if (item.getQuantity() <= 0) {
                cart.remove(item);
                log.info("Quantity reached zero. Removed flight ID {} from cart.", flightId);
            }
            session.setAttribute(CART_SESSION_KEY, cart); // Update session
        } else {
            log.warn("Attempted to decrease quantity for flight ID {} not found in cart.", flightId);
            // Optionally throw NotFound or just return current cart state
        }
        return ResponseEntity.ok(buildCartDTO(cart)); // Return updated cart
    }

    // --- REMOVE ITEM FROM CART (no changes needed) ---
    @DeleteMapping("/remove/{flightId}")
    public ResponseEntity<CartDTO> removeFlightFromCart(@PathVariable Long flightId, HttpSession session) {
        // ... (keep implementation from previous step - removes the whole line item) ...
        log.info("Request received to remove flight ID {} from cart", flightId);
        List<CartItem> cart = getCartFromSession(session);
        boolean removed = cart.removeIf(item -> item.getFlight().getId().equals(flightId));
        if (removed) {
            session.setAttribute(CART_SESSION_KEY, cart); log.info("Flight ID {} removed from cart.", flightId);
        } else {
            log.warn("Attempted to remove flight ID {} not found in cart.", flightId);
        }
        return ResponseEntity.ok(buildCartDTO(cart));
    }
}