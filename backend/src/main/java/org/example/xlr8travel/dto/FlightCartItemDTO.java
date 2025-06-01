package org.example.xlr8travel.dto;
import lombok.Getter;
import lombok.Setter;
import org.example.xlr8travel.models.Flight;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class FlightCartItemDTO {
    private Long id; // Should be Flight ID
    private String flightName;
    private String origin;
    private String destination;
    private LocalDate departureDate;
    private LocalTime departureTime;
    private LocalDate arrivalDate;
    private LocalTime arrivalTime;
    private BigDecimal price; // Ensure type consistency
    private int quantity;
    private Long seatId;
    private boolean deferSeatSelection;
    private boolean allocateRandomSeat;
    private String baggageType;
    private String code; // Flight code
}
