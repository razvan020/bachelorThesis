package org.example.xlr8travel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for check-in operations.
 * Used for both requests and responses related to flight check-ins.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckInDTO {
    
    /**
     * ID of the ticket being checked in
     */
    private Long ticketId;
    
    /**
     * Selected seat number (e.g., "12A", "23B")
     * Can be null if no seat is selected during check-in
     */
    private String seatNumber;
    
    /**
     * Type of seat selected (STANDARD, UPFRONT, EXTRA_LEGROOM)
     * Can be null if no seat is selected
     */
    private String seatType;
    
    /**
     * Whether the check-in was successful
     * Used in responses only
     */
    private boolean successful;
    
    /**
     * Error message if check-in failed
     * Used in responses only
     */
    private String errorMessage;
    
    /**
     * Flight details for display purposes
     * Used in responses only
     */
    private String flightNumber;
    private String origin;
    private String destination;
    private String departureDate;
    private String departureTime;
    private String gate;
    private String terminal;
    
    /**
     * Passenger name for display purposes
     * Used in responses only
     */
    private String passengerName;
}