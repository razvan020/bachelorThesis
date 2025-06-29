package org.example.xlr8travel.services;

import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.dto.CheckInDTO;
import org.example.xlr8travel.models.*;
import org.example.xlr8travel.repositories.TicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketServiceImpl.class);
    private final TicketRepository ticketRepository;

    @Override
    public void save(Ticket ticket) {
        ticketRepository.save(ticket);
    }

    @Override
    public List<Ticket> findAll() {
        return ticketRepository.findAll();
    }

    @Override
    public Ticket findById(Long id) {
        return ticketRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public CheckInDTO checkInWithSeat(Long ticketId, String seatNumber, String seatTypeStr) {
        log.info("Checking in ticket {} with seat {} of type {}", ticketId, seatNumber, seatTypeStr);

        // Find the ticket
        Ticket ticket = ticketRepository.findById(ticketId).orElse(null);
        if (ticket == null) {
            log.warn("Ticket not found: {}", ticketId);
            return createErrorResponse("Ticket not found");
        }

        // Validate ticket status
        if (ticket.getTicketStatus() == TicketStatus.TICKET_STATUS_CANCELLED) {
            log.warn("Cannot check in cancelled ticket: {}", ticketId);
            return createErrorResponse("Cannot check in a cancelled ticket");
        }

        if (ticket.getTicketStatus() == TicketStatus.TICKET_STATUS_CHECKED_IN) {
            log.warn("Ticket already checked in: {}", ticketId);
            return createErrorResponse("Ticket already checked in");
        }

        // Check if the seat is already booked for this flight
        if (ticket.getFlight() != null && isSeatBooked(ticket.getFlight().getId(), seatNumber)) {
            log.warn("Seat {} is already booked for flight {}", seatNumber, ticket.getFlight().getId());
            return createErrorResponse("This seat is already booked. Please choose another seat.");
        }

        // Parse seat type
        SeatType seatType;
        try {
            seatType = SeatType.valueOf(seatTypeStr);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid seat type: {}", seatTypeStr);
            return createErrorResponse("Invalid seat type");
        }

        // Create or update seat
        Seat seat = ticket.getSeat();
        if (seat == null) {
            seat = new Seat(seatNumber, true, seatType);
        } else {
            seat.setSeatNumber(seatNumber);
            seat.setBooked(true);
            seat.setSeatType(seatType);
        }

        // Update ticket

        ticket.setSeat(seat);
        ticket.setSeatSelectionDeferred(false); // Seat has been selected, so it's no longer deferred
        ticket.setTicketStatus(TicketStatus.TICKET_STATUS_CHECKED_IN);
        ticketRepository.save(ticket);

        log.info("Successfully checked in ticket {} with seat {}", ticketId, seatNumber);

        // Create response
        return createSuccessResponse(ticket);
    }

    @Override
    @Transactional
    public CheckInDTO checkInWithoutSeat(Long ticketId) {
        log.info("Checking in ticket {} without seat selection", ticketId);

        // Find the ticket
        Ticket ticket = ticketRepository.findById(ticketId).orElse(null);
        if (ticket == null) {
            log.warn("Ticket not found: {}", ticketId);
            return createErrorResponse("Ticket not found");
        }

        // Validate ticket status
        if (ticket.getTicketStatus() == TicketStatus.TICKET_STATUS_CANCELLED) {
            log.warn("Cannot check in cancelled ticket: {}", ticketId);
            return createErrorResponse("Cannot check in a cancelled ticket");
        }

        if (ticket.getTicketStatus() == TicketStatus.TICKET_STATUS_CHECKED_IN) {
            log.warn("Ticket already checked in: {}", ticketId);
            return createErrorResponse("Ticket already checked in");
        }

        // If this is a random seat allocation ticket, allocate a random seat
        if (ticket.isRandomSeatAllocation()) {
            log.info("Allocating random seat for ticket {}", ticketId);
            allocateRandomSeat(ticket);
        }

        // We no longer force seat selection for tickets with deferred seat selection
        // This allows users to check in without selecting a seat, regardless of whether they chose to defer seat selection or have a random seat allocated

        // Update ticket status
        ticket.setTicketStatus(TicketStatus.TICKET_STATUS_CHECKED_IN);
        ticketRepository.save(ticket);

        log.info("Successfully checked in ticket {} without seat selection", ticketId);

        // Create response
        return createSuccessResponse(ticket);
    }

    /**
     * Allocates a random seat for a ticket
     * @param ticket The ticket to allocate a seat for
     */
    private void allocateRandomSeat(Ticket ticket) {
        if (ticket.getFlight() == null) {
            log.warn("Cannot allocate random seat for ticket {} - no flight associated", ticket.getId());
            return;
        }

        // Get all booked seats for this flight
        List<String> bookedSeats = getBookedSeats(ticket.getFlight().getId());

        // Define possible seat rows and columns
        int[] rows = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30};
        char[] columns = {'A', 'B', 'C', 'D', 'E', 'F'};

        // Try to find an available seat
        String seatNumber = null;
        SeatType seatType = SeatType.SEAT_TYPE_STANDARD;

        // Shuffle the rows and columns to make the selection more random
        java.util.Collections.shuffle(java.util.Arrays.asList(rows));

        // Try to find an available seat
        for (int row : rows) {
            for (char column : columns) {
                String candidateSeat = row + String.valueOf(column);
                if (!bookedSeats.contains(candidateSeat)) {
                    seatNumber = candidateSeat;

                    // Determine seat type based on row
                    if (row <= 5) {
                        seatType = SeatType.SEAT_TYPE_UPFRONT;
                    } else if (row == 14 || row == 15 || row == 30) {
                        seatType = SeatType.SEAT_TYPE_EXTRA_LEGROOM;
                    } else {
                        seatType = SeatType.SEAT_TYPE_STANDARD;
                    }

                    break;
                }
            }
            if (seatNumber != null) {
                break;
            }
        }

        if (seatNumber == null) {
            log.warn("Could not find an available seat for random allocation for ticket {}", ticket.getId());
            return;
        }

        // Create and set the seat
        Seat seat = new Seat(seatNumber, true, seatType);
        ticket.setSeat(seat);
        ticket.setSeatSelectionDeferred(false);

        log.info("Randomly allocated seat {} of type {} for ticket {}", seatNumber, seatType, ticket.getId());
    }

    @Override
    public List<Ticket> findEligibleForCheckIn(Long userId) {
        log.info("Finding tickets eligible for check-in for user {}", userId);

        // Find all tickets for the user
        List<Ticket> tickets = ticketRepository.findAll().stream()
                .filter(ticket -> ticket.getUser() != null && ticket.getUser().getId().equals(userId))
                .filter(ticket -> ticket.getTicketStatus() == TicketStatus.TICKET_STATUS_CONFIRMED)
                .collect(Collectors.toList());

        log.info("Found {} tickets eligible for check-in for user {}", tickets.size(), userId);

        return tickets;
    }

    // Helper methods

    private CheckInDTO createErrorResponse(String errorMessage) {
        CheckInDTO response = new CheckInDTO();
        response.setSuccessful(false);
        response.setErrorMessage(errorMessage);
        return response;
    }

    private CheckInDTO createSuccessResponse(Ticket ticket) {
        CheckInDTO response = new CheckInDTO();
        response.setSuccessful(true);
        response.setTicketId(ticket.getId());
        response.setSeatSelectionDeferred(ticket.isSeatSelectionDeferred()); // Set whether seat selection was deferred
        response.setRandomSeatAllocation(ticket.isRandomSeatAllocation()); // Set whether random seat allocation was requested

        // Set seat info if available
        if (ticket.getSeat() != null) {
            response.setSeatNumber(ticket.getSeat().getSeatNumber());
            response.setSeatType(ticket.getSeat().getSeatType().toString());
        }

        // Set flight info if available
        Flight flight = ticket.getFlight();
        if (flight != null) {
            response.setFlightNumber(flight.getName());
            response.setOrigin(flight.getOrigin());
            response.setDestination(flight.getDestination());

            // Format dates and times
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            if (flight.getDepartureDate() != null) {
                response.setDepartureDate(flight.getDepartureDate().format(dateFormatter));
            }

            if (flight.getDepartureTime() != null) {
                response.setDepartureTime(flight.getDepartureTime().format(timeFormatter));
            }

            response.setGate(flight.getGate());
            response.setTerminal(flight.getTerminal());
        }

        // Set passenger name if available
        User user = ticket.getUser();
        if (user != null) {
            String firstName = user.getFirstname() != null ? user.getFirstname() : "";
            String lastName = user.getLastname() != null ? user.getLastname() : "";
            response.setPassengerName(firstName + " " + lastName);
        }

        return response;
    }

    @Override
    public boolean isSeatBooked(Long flightId, String seatNumber) {
        log.info("Checking if seat {} is booked for flight {}", seatNumber, flightId);
        List<Ticket> tickets = ticketRepository.findByFlightIdAndSeatNumber(flightId, seatNumber);
        return !tickets.isEmpty();
    }

    @Override
    public List<Ticket> findCheckedInTickets(Long userId) {
        log.info("Finding checked-in tickets for user {}", userId);
        return ticketRepository.findByUserIdAndTicketStatus(userId, TicketStatus.TICKET_STATUS_CHECKED_IN);
    }

    @Override
    public List<String> getBookedSeats(Long flightId) {
        log.info("Getting booked seats for flight {}", flightId);
        List<Ticket> tickets = ticketRepository.findByFlightId(flightId);

        return tickets.stream()
            .filter(ticket -> ticket.getSeat() != null)
            .map(ticket -> ticket.getSeat().getSeatNumber())
            .collect(Collectors.toList());
    }
}
