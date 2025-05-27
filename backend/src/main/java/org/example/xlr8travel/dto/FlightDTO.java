package org.example.xlr8travel.dto;

import lombok.Getter;
import lombok.Setter;
import org.example.xlr8travel.models.Flight; // Import your Flight entity

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
public class FlightDTO {
    private Long id;
    private String name; // Changed from flightName to match entity
    private String origin;
    private String destination;
    private LocalDate departureDate;
    private LocalTime departureTime;
    private LocalDate arrivalDate;
    private LocalTime arrivalTime;
    private BigDecimal price; // Price in EUR
    private String terminal;
    private String gate;
    private LocalDateTime lastUpdated;
    // Add other fields you want to display in search results or manage page

    // Static factory method to map from Flight entity
    public static FlightDTO fromFlight(Flight flight) {
        if (flight == null) {
            return null;
        }
        FlightDTO dto = new FlightDTO();
        dto.setId(flight.getId());
        dto.setName(flight.getName()); // Use getName()
        dto.setOrigin(flight.getOrigin());
        dto.setDestination(flight.getDestination());
        dto.setDepartureDate(flight.getDepartureDate());
        dto.setDepartureTime(flight.getDepartureTime());
        dto.setArrivalDate(flight.getArrivalDate());
        dto.setArrivalTime(flight.getArrivalTime());
        dto.setPrice(flight.getPrice());
        dto.setTerminal(flight.getTerminal());
        dto.setGate(flight.getGate());
        dto.setLastUpdated(flight.getLastUpdated());
        // Map other needed fields...
        return dto;
    }
}
