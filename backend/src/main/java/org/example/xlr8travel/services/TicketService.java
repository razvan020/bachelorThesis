package org.example.xlr8travel.services;

import org.example.xlr8travel.dto.CheckInDTO;
import org.example.xlr8travel.models.Ticket;
import org.example.xlr8travel.models.TicketStatus;

import java.util.List;

public interface TicketService {

    public void save(Ticket ticket);

    List<Ticket> findAll();

    Ticket findById(Long id);

    /**
     * Check in a ticket with a selected seat
     * 
     * @param ticketId The ID of the ticket to check in
     * @param seatNumber The selected seat number (e.g., "12A")
     * @param seatType The type of seat (STANDARD, UPFRONT, EXTRA_LEGROOM)
     * @return A CheckInDTO with the result of the check-in operation
     */
    CheckInDTO checkInWithSeat(Long ticketId, String seatNumber, String seatType);

    /**
     * Check in a ticket without selecting a seat
     * 
     * @param ticketId The ID of the ticket to check in
     * @return A CheckInDTO with the result of the check-in operation
     */
    CheckInDTO checkInWithoutSeat(Long ticketId);

    /**
     * Get all tickets for a user that are eligible for check-in
     * (i.e., confirmed but not checked in or cancelled)
     * 
     * @param userId The ID of the user
     * @return A list of tickets eligible for check-in
     */
    List<Ticket> findEligibleForCheckIn(Long userId);

    /**
     * Check if a seat is already booked for a specific flight
     * 
     * @param flightId The ID of the flight
     * @param seatNumber The seat number to check
     * @return true if the seat is already booked, false otherwise
     */
    boolean isSeatBooked(Long flightId, String seatNumber);

    /**
     * Get all checked-in tickets for a user
     * 
     * @param userId The ID of the user
     * @return A list of checked-in tickets
     */
    List<Ticket> findCheckedInTickets(Long userId);

    /**
     * Get all booked seats for a flight
     * 
     * @param flightId The ID of the flight
     * @return A list of seat numbers that are already booked
     */
    List<String> getBookedSeats(Long flightId);
}
