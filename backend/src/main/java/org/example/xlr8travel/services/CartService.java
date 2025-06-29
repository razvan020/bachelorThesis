package org.example.xlr8travel.services;

import org.example.xlr8travel.dto.CartDTO;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.models.User;

// Using jakarta.persistence.EntityNotFoundException or define your own
import jakarta.persistence.EntityNotFoundException;

public interface CartService {

    /**
     * Retrieves or creates a cart for the given user and returns it as a DTO.
     *
     * @param user The user whose cart is to be retrieved.
     * @return CartDTO representing the user's cart.
     */
    CartDTO getCartForUser(User user);

    /**
     * Adds one unit of the specified flight to the user's cart.
     * If the item already exists, increments the quantity.
     *
     * @param user                The user adding the item.
     * @param flight              The flight to add.
     * @param seatId              The ID of the selected seat (can be null).
     * @param deferSeatSelection  Whether seat selection is deferred to check-in.
     * @param allocateRandomSeat  Whether a random seat should be allocated.
     * @param baggageType         The type of baggage selected.
     * @return Updated CartDTO.
     */
    CartDTO addItemToCart(User user, Flight flight, Long seatId, String seatNumber, String seatType, boolean deferSeatSelection, boolean allocateRandomSeat, String baggageType);

    /**
     * Decreases the quantity of a specific flight in the user's cart by one.
     * If the quantity reaches zero or less, the item is removed from the cart.
     *
     * @param user   The user whose cart is being modified.
     * @param flight The flight whose quantity should be decreased.
     * @return Updated CartDTO.
     * @throws EntityNotFoundException if the flight is not found in the user's cart.
     */
    CartDTO decreaseItemQuantity(User user, Flight flight) throws EntityNotFoundException;

    /**
     * Removes a flight entirely (regardless of quantity) from the user's cart.
     *
     * @param user   The user whose cart is being modified.
     * @param flight The flight to remove.
     * @return Updated CartDTO.
     * @throws EntityNotFoundException if the flight is not found in the user's cart.
     */
    CartDTO removeItemFromCart(User user, Flight flight) throws EntityNotFoundException;

    /**
     * Removes all items from the user's cart.
     *
     * @param user The user whose cart should be cleared.
     * @return An empty CartDTO.
     */
    CartDTO clearCart(User user);
}
