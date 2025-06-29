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
    public CartDTO addItemToCart(User user, Flight flight, Long seatId, String seatNumber, String seatType, boolean deferSeatSelection, boolean allocateRandomSeat, String baggageType) {
        Cart cart = findOrCreateCartByUser(user);
        Optional<CartItemModel> existingItemOpt = cart.getCartItems().stream()
                .filter(item -> item.getFlight() != null && item.getFlight().getId().equals(flight.getId()))
                .findFirst();

        CartItemModel cartItem;
        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            cartItem.setQuantity(cartItem.getQuantity() + 1);
            cartItem.setSeatId(seatId);
            cartItem.setSeatNumber(seatNumber);
            cartItem.setSeatType(seatType);
            cartItem.setDeferSeatSelection(deferSeatSelection);
            cartItem.setAllocateRandomSeat(allocateRandomSeat);
            cartItem.setBaggageType(baggageType);
            cartItemRepository.save(cartItem);
            log.info("Updated flight ID {} in cart for user {}", flight.getId(), user.getUsername());
        } else {
            cartItem = new CartItemModel();
            cartItem.setCart(cart);
            cartItem.setFlight(flight);
            cartItem.setQuantity(1);
            cartItem.setSeatId(seatId);
            cartItem.setSeatNumber(seatNumber);
            cartItem.setSeatType(seatType);
            cartItem.setDeferSeatSelection(deferSeatSelection);
            cartItem.setAllocateRandomSeat(allocateRandomSeat);
            cartItem.setBaggageType(baggageType);
            cart.getCartItems().add(cartItem);
            log.info("Added new flight ID {} to cart for user {}", flight.getId(), user.getUsername());
        }

        cartRepository.save(cart);
        Cart updatedCart = findCartByUserOrThrow(user);
        return mapCartToDTO(updatedCart);
    }

    @Override
    public CartDTO decreaseItemQuantity(User user, Flight flight) throws EntityNotFoundException {
        Cart cart = findCartByUserOrThrow(user);

        CartItemModel itemToDecrease = cart.getCartItems().stream()
                .filter(item -> item.getFlight() != null && item.getFlight().getId().equals(flight.getId()))
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Attempted to decrease quantity for flight ID {} not found in cart for user {}", flight.getId(), user.getUsername());
                    return new EntityNotFoundException("Item not found in cart.");
                });

        itemToDecrease.setQuantity(itemToDecrease.getQuantity() - 1);
        log.info("Decreased quantity for flight ID {}. New quantity: {}", flight.getId(), itemToDecrease.getQuantity());

        if (itemToDecrease.getQuantity() <= 0) {
            boolean removed = cart.getCartItems().remove(itemToDecrease);
            cartItemRepository.delete(itemToDecrease);
            log.info("Quantity reached zero. Removed flight ID {} (removed={}) from cart for user {}.", flight.getId(), removed, user.getUsername());
        } else {
            cartItemRepository.save(itemToDecrease);
        }

        cartRepository.save(cart);
        Cart updatedCart = findCartByUserOrThrow(user);
        return mapCartToDTO(updatedCart);
    }

    @Override
    public CartDTO removeItemFromCart(User user, Flight flight) throws EntityNotFoundException {
        Cart cart = findCartByUserOrThrow(user);

        CartItemModel itemToRemove = cart.getCartItems().stream()
                .filter(item -> item.getFlight() != null && item.getFlight().getId().equals(flight.getId()))
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Attempted to remove flight ID {} not found in cart for user {}", flight.getId(), user.getUsername());
                    return new EntityNotFoundException("Item not found in cart.");
                });

        boolean removed = cart.getCartItems().remove(itemToRemove);
        cartItemRepository.delete(itemToRemove);
        log.info("Removed flight ID {} entirely (removed={}) from cart for user {}.", flight.getId(), removed, user.getUsername());

        cartRepository.save(cart);
        Cart updatedCart = findCartByUserOrThrow(user);
        return mapCartToDTO(updatedCart);
    }


    @Override
    public CartDTO clearCart(User user) {
        Cart cart = findCartByUserOrThrow(user);

        if (cart.getCartItems() != null && !cart.getCartItems().isEmpty()) {
            log.info("Clearing {} items from cart for user {}", cart.getCartItems().size(), user.getUsername());
            cartItemRepository.deleteAll(cart.getCartItems());

            cart.getCartItems().clear();
            cartRepository.save(cart);

        } else {
            log.info("Cart was already empty for user {}", user.getUsername());
        }
        Cart updatedCart = findCartByUserOrThrow(user);
        return mapCartToDTO(updatedCart);
    }



    private Cart findOrCreateCartByUser(User user) {
        if (user == null || user.getId() == null) {
            log.error("findOrCreateCartByUser called with null user or user without ID.");
            throw new IllegalArgumentException("User cannot be null and must have an ID to find or create a cart.");
        }
        return cartRepository.findByUserId(user.getId()).orElseGet(() -> {
            log.info("No existing cart found for user {} with ID {}, creating a new one.", user.getUsername(), user.getId());
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setCartItems(new HashSet<>());
            return cartRepository.save(newCart);
        });
    }

    private Cart findCartByUserOrThrow(User user) {
        if (user == null || user.getId() == null) {
            log.error("findCartByUserOrThrow called with null user or user without ID.");
            throw new IllegalArgumentException("User cannot be null and must have an ID to find a cart.");
        }
        return cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> {
                    log.error("Cart not found for user {} (ID: {}) when it was expected.", user.getUsername(), user.getId());
                    return new EntityNotFoundException("Cart could not be found for the specified user.");
                });
    }

    private CartDTO mapCartToDTO(Cart cart) {
        CartDTO cartDTO = new CartDTO();

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            cartDTO.setItems(Collections.emptyList());
            cartDTO.setTotalQuantity(0);
            cartDTO.setTotalPrice(0.0);
        } else {
            cartDTO.setItems(cart.getCartItems().stream()
                    .map(cartItemModel -> {
                        if (cartItemModel == null || cartItemModel.getFlight() == null) {
                            log.warn("Skipping null CartItemModel or CartItemModel with null Flight during mapping.");
                            return null;
                        }
                        Flight flight = cartItemModel.getFlight();
                        FlightCartItemDTO dto = new FlightCartItemDTO();

                        dto.setId(flight.getId());
                        dto.setFlightName(flight.getName());
                        dto.setOrigin(flight.getOrigin());
                        dto.setDestination(flight.getDestination());
                        dto.setDepartureDate(flight.getDepartureDate());
                        dto.setDepartureTime(flight.getDepartureTime());
                        dto.setArrivalDate(flight.getArrivalDate());
                        dto.setArrivalTime(flight.getArrivalTime());
                        dto.setPrice(flight.getPrice());

                        dto.setQuantity(cartItemModel.getQuantity());
                        dto.setSeatId(cartItemModel.getSeatId());
                        dto.setSeatNumber(cartItemModel.getSeatNumber());
                        dto.setSeatType(cartItemModel.getSeatType());
                        dto.setDeferSeatSelection(cartItemModel.isDeferSeatSelection());
                        dto.setAllocateRandomSeat(cartItemModel.isAllocateRandomSeat());
                        dto.setBaggageType(cartItemModel.getBaggageType());

                        dto.setCode(flight.getName());

                        return dto;
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList()));

            int totalQuantity = cart.getCartItems().stream()
                    .mapToInt(CartItemModel::getQuantity)
                    .sum();
            cartDTO.setTotalQuantity(totalQuantity);

            BigDecimal totalPrice = cart.getCartItems().stream()
                    .filter(item -> item != null && item.getFlight() != null && item.getFlight().getPrice() != null && item.getQuantity() > 0)
                    .map(item -> item.getFlight().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            cartDTO.setTotalPrice(totalPrice.doubleValue());

        }
        return cartDTO;
    }
}
