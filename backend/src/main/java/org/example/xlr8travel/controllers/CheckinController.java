package org.example.xlr8travel.controllers;

import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.dto.CheckInDTO;
import org.example.xlr8travel.models.Ticket;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.services.TicketService;
import org.example.xlr8travel.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Controller for handling flight check-in operations.
 */
@RestController
@RequestMapping("/api/check-in")
@RequiredArgsConstructor
public class CheckinController {

    private static final Logger log = LoggerFactory.getLogger(CheckinController.class);
    private final TicketService ticketService;
    private final UserService userService;

    /**
     * Get all tickets eligible for check-in for the authenticated user.
     *
     * @param userDetails The authenticated user details
     * @return A list of tickets eligible for check-in
     */
    @GetMapping("/eligible-tickets")
    public ResponseEntity<List<Ticket>> getEligibleTickets(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getCurrentUser(userDetails);
            log.info("Getting eligible tickets for check-in for user: {}", user.getUsername());

            List<Ticket> eligibleTickets = ticketService.findEligibleForCheckIn(user.getId());
            return ResponseEntity.ok(eligibleTickets);
        } catch (ResponseStatusException rse) {
            log.warn("Failed to get eligible tickets: {}", rse.getReason());
            throw rse;
        } catch (Exception e) {
            log.error("Error getting eligible tickets", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error getting eligible tickets");
        }
    }

    /**
     * Check in a ticket with a selected seat.
     *
     * @param ticketId The ID of the ticket to check in
     * @param requestBody The request body containing seat information
     * @param userDetails The authenticated user details
     * @return The result of the check-in operation
     */
    @PostMapping("/{ticketId}/with-seat")
    public ResponseEntity<CheckInDTO> checkInWithSeat(
            @PathVariable Long ticketId,
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            User user = getCurrentUser(userDetails);
            log.info("Checking in ticket {} with seat for user: {}", ticketId, user.getUsername());

            // Validate ownership of the ticket
            Ticket ticket = ticketService.findById(ticketId);
            if (ticket == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
            }

            if (ticket.getUser() == null || !ticket.getUser().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to check in this ticket");
            }

            // Extract seat information
            String seatNumber = requestBody.get("seatNumber");
            String seatType = requestBody.get("seatType");

            if (seatNumber == null || seatNumber.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seat number is required");
            }

            if (seatType == null || seatType.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seat type is required");
            }

            // Perform check-in
            CheckInDTO result = ticketService.checkInWithSeat(ticketId, seatNumber, seatType);

            if (!result.isSuccessful()) {
                return ResponseEntity.badRequest().body(result);
            }

            return ResponseEntity.ok(result);
        } catch (ResponseStatusException rse) {
            log.warn("Failed to check in ticket {}: {}", ticketId, rse.getReason());
            throw rse;
        } catch (Exception e) {
            log.error("Error checking in ticket {}", ticketId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error checking in ticket");
        }
    }

    /**
     * Check in a ticket without selecting a seat.
     *
     * @param ticketId The ID of the ticket to check in
     * @param userDetails The authenticated user details
     * @return The result of the check-in operation
     */
    @PostMapping("/{ticketId}/without-seat")
    public ResponseEntity<CheckInDTO> checkInWithoutSeat(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            User user = getCurrentUser(userDetails);
            log.info("Checking in ticket {} without seat for user: {}", ticketId, user.getUsername());

            // Validate ownership of the ticket
            Ticket ticket = ticketService.findById(ticketId);
            if (ticket == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
            }

            if (ticket.getUser() == null || !ticket.getUser().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to check in this ticket");
            }

            // Perform check-in
            CheckInDTO result = ticketService.checkInWithoutSeat(ticketId);

            if (!result.isSuccessful()) {
                return ResponseEntity.badRequest().body(result);
            }

            return ResponseEntity.ok(result);
        } catch (ResponseStatusException rse) {
            log.warn("Failed to check in ticket {}: {}", ticketId, rse.getReason());
            throw rse;
        } catch (Exception e) {
            log.error("Error checking in ticket {}", ticketId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error checking in ticket");
        }
    }

    /**
     * Get all booked seats for a flight.
     *
     * @param flightId The ID of the flight
     * @return A list of seat numbers that are already booked
     */
    @GetMapping("/flights/{flightId}/booked-seats")
    public ResponseEntity<List<String>> getBookedSeats(@PathVariable Long flightId) {
        try {
            log.info("Getting booked seats for flight: {}", flightId);
            List<String> bookedSeats = ticketService.getBookedSeats(flightId);
            return ResponseEntity.ok(bookedSeats);
        } catch (Exception e) {
            log.error("Error getting booked seats for flight {}", flightId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error getting booked seats");
        }
    }

    /**
     * Get all checked-in tickets for the authenticated user.
     *
     * @param userDetails The authenticated user details
     * @return A list of checked-in tickets
     */
    @GetMapping("/boarding-passes")
    public ResponseEntity<List<Ticket>> getBoardingPasses(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getCurrentUser(userDetails);
            log.info("Getting boarding passes for user: {}", user.getUsername());

            List<Ticket> checkedInTickets = ticketService.findCheckedInTickets(user.getId());
            return ResponseEntity.ok(checkedInTickets);
        } catch (ResponseStatusException rse) {
            log.warn("Failed to get boarding passes: {}", rse.getReason());
            throw rse;
        } catch (Exception e) {
            log.error("Error getting boarding passes", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error getting boarding passes");
        }
    }

    /**
     * Helper method to get the current authenticated user.
     *
     * @param userDetails The authenticated user details
     * @return The User entity
     */
    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) {
            log.warn("No authenticated user found");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        String username = userDetails.getUsername();
        User user = userService.findByUsername(username);

        if (user == null) {
            log.warn("User not found: {}", username);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        return user;
    }
}
