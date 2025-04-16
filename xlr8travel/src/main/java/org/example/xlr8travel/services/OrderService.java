package org.example.xlr8travel.services;

// Import CartItem DTO
import org.example.xlr8travel.dto.CartDTO;
import org.example.xlr8travel.dto.CartItem;
import org.example.xlr8travel.dto.CheckoutRequestDTO;
import org.example.xlr8travel.models.Order; // ASSUMING THIS ENTITY EXISTS
import org.example.xlr8travel.models.User;

import java.util.List; // Import List

public interface OrderService {

    /**
     * Creates an order from items stored in the session cart.
     *
     * @param user The user placing the order.
     * @param sessionCartItems The list of CartItem DTOs from the session.
     * @param checkoutRequest Billing and potentially payment information.
     * @return A confirmation detail (e.g., Order ID as String).
     * @throws Exception if order creation fails.
     */
    String createOrderFromCart(User user, CartDTO cart, CheckoutRequestDTO checkoutRequest) throws Exception;

}