package org.example.xlr8travel.services;

import jakarta.persistence.EntityNotFoundException; // Ensure this specific import
import org.example.xlr8travel.dto.CartDTO;
import org.example.xlr8travel.dto.CheckoutRequestDTO;
import org.example.xlr8travel.dto.FlightCartItemDTO;
import org.example.xlr8travel.models.*; // Import relevant entities
import org.example.xlr8travel.repositories.*; // Import relevant repositories
import org.example.xlr8travel.repositories.TicketRepository; // Explicitly import TicketRepository
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal; // Import BigDecimal
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
@Transactional // Ensures operations are atomic
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository; // Inject repository for OrderItems
    private final FlightRepository flightRepository;       // Inject repository to fetch Flights
    private final EmailService emailService;               // Inject email service
    private final TicketRepository ticketRepository;       // Inject repository for Tickets

    public OrderServiceImpl(OrderRepository orderRepository,
                            OrderItemRepository orderItemRepository,
                            FlightRepository flightRepository,
                            EmailService emailService,
                            TicketRepository ticketRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.flightRepository = flightRepository;
        this.emailService = emailService;
        this.ticketRepository = ticketRepository;
    }

    /**
     * Creates an order from items stored in the persistent cart (represented by CartDTO).
     *
     * @param user The user placing the order.
     * @param cart The user's cart data DTO from CartService.
     * @param checkoutRequest Billing and potentially payment information.
     * @return A confirmation detail (Order ID as String).
     * @throws Exception if order creation fails.
     */
    @Override
    public String createOrderFromCart(User user, CartDTO cart, CheckoutRequestDTO checkoutRequest) throws Exception {
        log.info("Creating order from persistent cart for user: {}", user.getUsername());

        // --- Basic Validation ---
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null for order creation.");
        }
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot create order from an empty cart.");
        }
        if (checkoutRequest == null) {
            throw new IllegalArgumentException("Checkout request data cannot be null.");
        }


        // --- Create the Order Entity ---
        Order order = new Order();
        // Assume Order entity has @Getter/@Setter via Lombok or manual methods
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING_PAYMENT"); // Initial status before payment simulation/call

        // Set billing details snapshot from request DTO onto the Order entity
        order.setBillingName(checkoutRequest.getCustomerName());
        order.setBillingEmail(checkoutRequest.getCustomerEmail());
        // Add other billing fields if needed (address, etc.)

        Set<OrderItem> orderItems = new HashSet<>();
        BigDecimal calculatedTotalPrice = BigDecimal.ZERO; // Calculate total server-side for accuracy

        // --- Create OrderItem Entities from Cart Items (FlightCartItemDTOs) ---
        for (FlightCartItemDTO cartItemDTO : cart.getItems()) {
            Long flightId = cartItemDTO.getId(); // Use getId() which should be the Flight ID
            if (flightId == null) {
                log.warn("Skipping cart item with null flight ID for user {}.", user.getUsername());
                continue; // Skip this invalid item
            }

            // Fetch the actual Flight entity
            Flight flight = flightRepository.findById(flightId)
                    .orElseThrow(() -> new EntityNotFoundException("Flight with ID " + flightId + " not found during order creation."));

            // --- Optional: Add stock/availability check here ---
            // if (flight.getAvailableSeats() < cartItemDTO.getQuantity()) {
            //     throw new IllegalStateException("Not enough seats available for flight " + flightId);
            // }

            // Determine the price per item *at the time of purchase* from the Flight entity
            BigDecimal priceAtPurchase;
            if (flight.getPrice() != null) {
                // Convert Double from Flight entity to BigDecimal for OrderItem
                priceAtPurchase = flight.getPrice();
                // If Flight.getPrice() already returns BigDecimal, just assign:
                // priceAtPurchase = flight.getPrice();
            } else {
                log.error("Flight {} (ID: {}) has a null price. Cannot proceed with order.", flight.getName(), flight.getId());
                throw new IllegalStateException("Flight price is missing. Cannot create order.");
            }

            // Create an OrderItem entity
            // Assume OrderItem entity has @Getter/@Setter via Lombok or manual methods
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);          // Link back to the Order being created
            orderItem.setFlight(flight);        // Link to the actual Flight entity
            orderItem.setQuantity(cartItemDTO.getQuantity());
            orderItem.setPricePerItem(priceAtPurchase); // Use fetched & converted price

            orderItems.add(orderItem);

            // Add item's contribution to calculated total price
            calculatedTotalPrice = calculatedTotalPrice.add(
                    priceAtPurchase.multiply(BigDecimal.valueOf(cartItemDTO.getQuantity()))
            );
        }

        // --- Final checks and setting total ---
        // Optional: Compare calculatedTotalPrice with cart.getTotalPrice() for consistency check
        double cartTotalDouble = cart.getTotalPrice(); // From DTO
        if (calculatedTotalPrice.compareTo(BigDecimal.valueOf(cartTotalDouble)) != 0) {
            log.warn("Calculated order total ({}) differs from cart DTO total ({}) for user {}",
                    calculatedTotalPrice, cartTotalDouble, user.getUsername());
            // Decide how to handle: use calculated total (safer), log warning, or throw error
        }
        order.setTotalPrice(calculatedTotalPrice); // Set the accurately calculated total price

        // Set the items collection on the order
        order.setOrderItems(orderItems); // Assumes Order entity has setOrderItems

        // --- Save the Order ---
        // CascadeType.ALL on Order.orderItems should handle saving the OrderItems too
        Order savedOrder = orderRepository.save(order);
        log.info("Order {} created for user {}, status: {}. Total: {}",
                savedOrder.getId(), user.getUsername(), savedOrder.getStatus(), savedOrder.getTotalPrice());


        // --- TODO: Implement Actual Payment Processing Here ---
        // Use a dedicated PaymentService, integrate with Stripe, PayPal, etc.
        // Pass necessary info like savedOrder.getId(), savedOrder.getTotalPrice(),
        // and payment token from checkoutRequest.getPaymentMethodToken()
        // boolean paymentSuccessful = paymentService.processPayment(...);
        // if (paymentSuccessful) {
        //      savedOrder.setStatus("COMPLETED"); // Or PAID, CONFIRMED, etc.
        //      orderRepository.save(savedOrder);
        //      log.info("Order {} payment successful.", savedOrder.getId());
        // } else {
        //      savedOrder.setStatus("PAYMENT_FAILED");
        //      orderRepository.save(savedOrder);
        //      log.error("Order {} payment failed.", savedOrder.getId());
        //      // Rollback or handle failed payment (maybe throw specific exception)
        //      throw new Exception("Payment processing failed for order " + savedOrder.getId());
        // }
        // --- End Payment Processing ---


        // --- Optional: Post-Save Actions ---
        // e.g., Decrease flight available seats? Send confirmation email?
        // inventoryService.updateStock(savedOrder);

        // Create tickets for each order item
// Create tickets for each order item
        for (OrderItem item : orderItems) {
            // Find the corresponding cart item DTO to get seat information
            FlightCartItemDTO cartItemDTO = cart.getItems().stream()
                    .filter(cartItem -> cartItem.getId().equals(item.getFlight().getId()))
                    .findFirst()
                    .orElse(null);

            if (cartItemDTO == null) {
                log.warn("Could not find cart item DTO for flight {}", item.getFlight().getId());
                continue;
            }

            // Create a ticket for each quantity in the order item
            for (int i = 0; i < item.getQuantity(); i++) {
                Ticket ticket;

                // Check the cart item's seat preferences
                if (cartItemDTO.isAllocateRandomSeat()) {
                    // Create ticket with random seat allocation (price = 0)
                    ticket = new Ticket(
                            0.0f, // Set price to 0 for random seat
                            LocalDateTime.now(),
                            TicketStatus.TICKET_STATUS_CONFIRMED,
                            false // seatSelectionDeferred = false
                    );
                    ticket.setRandomSeatAllocation(true);
                    log.info("Created ticket with random seat allocation (free) for flight {} for user {}",
                            item.getFlight().getName(), user.getUsername());

                } else if (cartItemDTO.isDeferSeatSelection()) {
                    // Create ticket with deferred seat selection
                    ticket = new Ticket(
                            item.getPricePerItem().floatValue(),
                            LocalDateTime.now(),
                            TicketStatus.TICKET_STATUS_CONFIRMED,
                            true // seatSelectionDeferred = true
                    );
                    ticket.setSeatSelectionDeferred(true);
                    log.info("Created ticket with deferred seat selection for flight {} for user {}",
                            item.getFlight().getName(), user.getUsername());

                }  else if (cartItemDTO.getSeatNumber() != null && !cartItemDTO.getSeatNumber().isEmpty()) {
                    // Create ticket with selected seat
                    ticket = new Ticket(
                            item.getPricePerItem().floatValue(),
                            LocalDateTime.now(),
                            TicketStatus.TICKET_STATUS_CONFIRMED,
                            false // seatSelectionDeferred = false
                    );

                    ticket.setSeatNumber(cartItemDTO.getSeatNumber());
                    ticket.setSeatType(cartItemDTO.getSeatType());

                    log.info("Created ticket with seat {} of type {} for flight {} for user {}",
                            cartItemDTO.getSeatNumber(), cartItemDTO.getSeatType(),
                            item.getFlight().getName(), user.getUsername());

                } else {
                    // Create ticket with deferred seat selection as fallback
                    ticket = new Ticket(
                            item.getPricePerItem().floatValue(),
                            LocalDateTime.now(),
                            TicketStatus.TICKET_STATUS_CONFIRMED,
                            true // seatSelectionDeferred = true
                    );
                    ticket.setSeatSelectionDeferred(true);
                    log.info("Created ticket with deferred seat selection (fallback) for flight {} for user {}",
                            item.getFlight().getName(), user.getUsername());
                }

                ticket.setUser(user);
                ticket.setFlight(item.getFlight());

                // Handle baggage if needed
                if (cartItemDTO.getBaggageType() != null) {
                    log.info("Ticket has baggage type: {}", cartItemDTO.getBaggageType());
                    // You can create baggage entities here if needed
                }

                // Save the ticket
                ticketRepository.save(ticket);
            }
        }

        // Send purchase confirmation email
        boolean emailSent = emailService.sendPurchaseConfirmationEmail(savedOrder, user, "€");
        if (emailSent) {
            log.info("Purchase confirmation email sent to user: {}", user.getUsername());
        } else {
            log.warn("Failed to send purchase confirmation email to user: {}", user.getUsername());
            // Note: We continue processing even if email fails - don't block the order completion
        }

        // Return confirmation (e.g., the Order ID as a String)
        // Assumes Order entity has getId() via Lombok or manual method
        return String.valueOf(savedOrder.getId());
    }
}
