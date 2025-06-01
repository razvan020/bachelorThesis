package org.example.xlr8travel.services;

import org.example.xlr8travel.dto.CartDTO;
import org.example.xlr8travel.dto.FlightCartItemDTO;
import org.example.xlr8travel.models.Cart;
import org.example.xlr8travel.models.CartItemModel;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.repositories.CartItemRepository;
import org.example.xlr8travel.repositories.CartRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException; // Or your custom exception
import java.math.BigDecimal; // Import if using BigDecimal for price
import java.util.Collections;
import java.util.HashSet;
import java.util.Objects; // Needed for filter(Objects::nonNull)
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional // Add transactional behavior to service methods
public class CartServiceImpl implements CartService {

    private static final Logger log = LoggerFactory.getLogger(CartServiceImpl.class);

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    // No FlightRepository needed if Flight object is passed in

    public CartServiceImpl(CartRepository cartRepository, CartItemRepository cartItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Override
    public CartDTO getCartForUser(User user) {
        Cart cart = findOrCreateCartByUser(user);
        return mapCartToDTO(cart);
    }

    @Override
    public CartDTO addItemToCart(User user, Flight flight, Long seatId, boolean deferSeatSelection, boolean allocateRandomSeat, String baggageType) {
        Cart cart = findOrCreateCartByUser(user);

        // Check if item already exists in cart
        Optional<CartItemModel> existingItemOpt = cart.getCartItems().stream()
                // Make sure Flight ID getter is correct
                .filter(item -> item.getFlight() != null && item.getFlight().getId().equals(flight.getId()))
                .findFirst();

        CartItemModel cartItem;
        if (existingItemOpt.isPresent()) {
            // Update existing item
            cartItem = existingItemOpt.get();
            cartItem.setQuantity(cartItem.getQuantity() + 1);
            // Update seat and baggage information
            cartItem.setSeatId(seatId);
            cartItem.setDeferSeatSelection(deferSeatSelection);
            cartItem.setAllocateRandomSeat(allocateRandomSeat);
            cartItem.setBaggageType(baggageType);
            cartItemRepository.save(cartItem); // Save updated item
            log.info("Updated flight ID {} in cart for user {}", flight.getId(), user.getUsername());
        } else {
            // Add new item
            cartItem = new CartItemModel();
            cartItem.setCart(cart);
            cartItem.setFlight(flight);
            cartItem.setQuantity(1);
            // Set seat and baggage information
            cartItem.setSeatId(seatId);
            cartItem.setDeferSeatSelection(deferSeatSelection);
            cartItem.setAllocateRandomSeat(allocateRandomSeat);
            cartItem.setBaggageType(baggageType);
            cart.getCartItems().add(cartItem); // Add to the collection in the Cart entity
            log.info("Added new flight ID {} to cart for user {}", flight.getId(), user.getUsername());
        }

        // Save the cart to persist new items or relationship changes
        cartRepository.save(cart);
        // Fetch fresh cart data before mapping to DTO to ensure consistency
        Cart updatedCart = findCartByUserOrThrow(user);
        return mapCartToDTO(updatedCart);
    }

    @Override
    public CartDTO decreaseItemQuantity(User user, Flight flight) throws EntityNotFoundException {
        Cart cart = findCartByUserOrThrow(user);

        // Find the item in the cart
        CartItemModel itemToDecrease = cart.getCartItems().stream()
                .filter(item -> item.getFlight() != null && item.getFlight().getId().equals(flight.getId()))
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Attempted to decrease quantity for flight ID {} not found in cart for user {}", flight.getId(), user.getUsername());
                    return new EntityNotFoundException("Item not found in cart.");
                });

        // Decrease quantity
        itemToDecrease.setQuantity(itemToDecrease.getQuantity() - 1);
        log.info("Decreased quantity for flight ID {}. New quantity: {}", flight.getId(), itemToDecrease.getQuantity());

        if (itemToDecrease.getQuantity() <= 0) {
            // Remove item if quantity is zero or less
            // Removing from the collection managed by Cart entity
            boolean removed = cart.getCartItems().remove(itemToDecrease);
            // Explicitly delete the standalone CartItemModel entity
            // This is needed especially if CascadeType doesn't cover REMOVE or if orphanRemoval=false
            cartItemRepository.delete(itemToDecrease);
            log.info("Quantity reached zero. Removed flight ID {} (removed={}) from cart for user {}.", flight.getId(), removed, user.getUsername());
        } else {
            // Save the updated quantity
            cartItemRepository.save(itemToDecrease);
        }

        // Save cart potentially needed if relationship management requires it or just to update timestamps
        cartRepository.save(cart);
        // Fetch fresh cart data before mapping to DTO
        Cart updatedCart = findCartByUserOrThrow(user);
        return mapCartToDTO(updatedCart);
    }

    @Override
    public CartDTO removeItemFromCart(User user, Flight flight) throws EntityNotFoundException {
        Cart cart = findCartByUserOrThrow(user);

        // Find the item
        CartItemModel itemToRemove = cart.getCartItems().stream()
                .filter(item -> item.getFlight() != null && item.getFlight().getId().equals(flight.getId()))
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Attempted to remove flight ID {} not found in cart for user {}", flight.getId(), user.getUsername());
                    return new EntityNotFoundException("Item not found in cart.");
                });

        // Remove the item from the Cart's collection
        boolean removed = cart.getCartItems().remove(itemToRemove);
        // Explicitly delete the entity from the database
        cartItemRepository.delete(itemToRemove);
        log.info("Removed flight ID {} entirely (removed={}) from cart for user {}.", flight.getId(), removed, user.getUsername());

        // Save cart potentially needed if relationship management requires it or just to update timestamps
        cartRepository.save(cart);
        // Fetch fresh cart data before mapping to DTO
        Cart updatedCart = findCartByUserOrThrow(user);
        return mapCartToDTO(updatedCart);
    }


    @Override
    public CartDTO clearCart(User user) {
        Cart cart = findCartByUserOrThrow(user); // Find the cart first

        // Efficiently delete all items associated with the cart
        if (cart.getCartItems() != null && !cart.getCartItems().isEmpty()) {
            // Thanks to CascadeType.ALL and orphanRemoval=true on Cart's cartItems collection,
            // simply clearing the collection and saving the cart *should* remove the items.
            // However, explicit deletion can be safer or required depending on exact JPA provider behavior.
            log.info("Clearing {} items from cart for user {}", cart.getCartItems().size(), user.getUsername());
            // Option 1: Explicit Deletion (Safer)
            // cartItemRepository.deleteAllInBatch(cart.getCartItems()); // More efficient for large carts
            cartItemRepository.deleteAll(cart.getCartItems()); // Simpler delete

            // Option 2: Relying on Cascade/Orphan Removal (if configured on Cart entity)
            cart.getCartItems().clear(); // Clear the collection in the entity
            cartRepository.save(cart); // Save the cart with the empty collection

        } else {
            log.info("Cart was already empty for user {}", user.getUsername());
        }
        // Fetch fresh cart data before mapping to DTO
        Cart updatedCart = findCartByUserOrThrow(user);
        return mapCartToDTO(updatedCart); // Return the now empty cart DTO
    }


    // --- Helper Methods ---

    private Cart findOrCreateCartByUser(User user) {
        // Check if user is null before querying
        if (user == null || user.getId() == null) {
            log.error("findOrCreateCartByUser called with null user or user without ID.");
            throw new IllegalArgumentException("User cannot be null and must have an ID to find or create a cart.");
        }
        return cartRepository.findByUserId(user.getId()).orElseGet(() -> {
            log.info("No existing cart found for user {} with ID {}, creating a new one.", user.getUsername(), user.getId());
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setCartItems(new HashSet<>()); // Initialize the collection
            return cartRepository.save(newCart);
        });
    }

    private Cart findCartByUserOrThrow(User user) {
        // Check if user is null before querying
        if (user == null || user.getId() == null) {
            log.error("findCartByUserOrThrow called with null user or user without ID.");
            throw new IllegalArgumentException("User cannot be null and must have an ID to find a cart.");
        }
        return cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> {
                    log.error("Cart not found for user {} (ID: {}) when it was expected.", user.getUsername(), user.getId());
                    // Consider if this should be an Internal Server Error or if an empty cart is plausible here.
                    // If an empty cart is valid state, perhaps return an empty Cart object or Optional<Cart>.
                    return new EntityNotFoundException("Cart could not be found for the specified user.");
                });
    }

    // *** CORRECTED mapCartToDTO using Lambda Expression ***
    private CartDTO mapCartToDTO(Cart cart) {
        CartDTO cartDTO = new CartDTO();

        // Ensure cart items collection is not null before streaming
        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            cartDTO.setItems(Collections.emptyList());
            cartDTO.setTotalQuantity(0);
            cartDTO.setTotalPrice(0.0); // Assuming Double for totalPrice DTO field
            // Or: cartDTO.setTotalPrice(BigDecimal.ZERO); // If using BigDecimal
        } else {
            // Use a lambda expression instead of a method reference
            cartDTO.setItems(cart.getCartItems().stream()
                    .map(cartItemModel -> { // Lambda takes CartItemModel as input
                        if (cartItemModel == null || cartItemModel.getFlight() == null) {
                            log.warn("Skipping null CartItemModel or CartItemModel with null Flight during mapping.");
                            return null; // Filter out nulls later
                        }
                        Flight flight = cartItemModel.getFlight();
                        FlightCartItemDTO dto = new FlightCartItemDTO();

                        // Manually map fields from CartItemModel & Flight to the DTO
                        // Ensure these getters exist on your Flight entity and match DTO fields/types
                        dto.setId(flight.getId()); // Assuming DTO 'id' field refers to Flight ID
                        dto.setFlightName(flight.getName()); // Example: Assuming Flight has getName()
                        dto.setOrigin(flight.getOrigin());     // Assuming Flight has getOrigin()
                        dto.setDestination(flight.getDestination()); // Assuming Flight has getDestination()
                        dto.setDepartureDate(flight.getDepartureDate());
                        dto.setDepartureTime(flight.getDepartureTime());
                        dto.setArrivalDate(flight.getArrivalDate());
                        dto.setArrivalTime(flight.getArrivalTime());
                        dto.setPrice(flight.getPrice()); // Ensure price type compatibility (e.g., Double)
                        // Or: dto.setPrice(flight.getPrice()); // If Flight price is BigDecimal and DTO price is BigDecimal
                        dto.setQuantity(cartItemModel.getQuantity()); // Get quantity from CartItemModel
                        dto.setSeatId(cartItemModel.getSeatId());
                        dto.setDeferSeatSelection(cartItemModel.isDeferSeatSelection());
                        dto.setAllocateRandomSeat(cartItemModel.isAllocateRandomSeat());
                        dto.setBaggageType(cartItemModel.getBaggageType());
                        // Flight doesn't have a getCode() method, so we'll use the flight name as a fallback
                        dto.setCode(flight.getName());

                        return dto;
                    })
                    .filter(Objects::nonNull) // Remove any null DTOs potentially created above
                    .collect(Collectors.toList()));

            int totalQuantity = cart.getCartItems().stream()
                    .mapToInt(CartItemModel::getQuantity)
                    .sum();
            cartDTO.setTotalQuantity(totalQuantity);

            // Calculate total price - ensure correct type handling (Double vs BigDecimal)
            BigDecimal totalPrice = cart.getCartItems().stream()
                    // Ensure you have valid items, flights, and prices first
                    .filter(item -> item != null && item.getFlight() != null && item.getFlight().getPrice() != null && item.getQuantity() > 0)
                    // Map each valid item to its total price (Price * Quantity) as BigDecimal
                    .map(item -> item.getFlight().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    // Sum all the BigDecimal totals together, starting from zero
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Set the total price in the DTO. Convert to double if the DTO field is double.
            cartDTO.setTotalPrice(totalPrice.doubleValue());// Assuming CartDTO.totalPrice is Double

            // If using BigDecimal for price:
            /*
            BigDecimal totalPrice = cart.getCartItems().stream()
                    .filter(item -> item.getFlight() != null && item.getFlight().getPrice() != null)
                    .map(item -> item.getFlight().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))) // Assuming price is BigDecimal
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            cartDTO.setTotalPrice(totalPrice); // Assuming CartDTO.totalPrice is BigDecimal
            */
        }

        return cartDTO;
    }
}
