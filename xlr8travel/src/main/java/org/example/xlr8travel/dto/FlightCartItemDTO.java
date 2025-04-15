package org.example.xlr8travel.dto;
import lombok.Getter;
import lombok.Setter;
import org.example.xlr8travel.models.Flight;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class FlightCartItemDTO {
    private Long id;
    private String flightName; // Use 'name' if that's the entity field
    private String origin;
    private String destination;
    private LocalDate departureDate;
    private LocalTime departureTime;
    private LocalDate arrivalDate;
    private LocalTime arrivalTime;
    private Double price;
    private int quantity; // <-- Added quantity

    // Static factory method to map from CartItem (which contains Flight)
    public static FlightCartItemDTO fromCartItem(CartItem cartItem) {
        if (cartItem == null || cartItem.getFlight() == null) return null;
        Flight flight = cartItem.getFlight();
        FlightCartItemDTO dto = new FlightCartItemDTO();
        dto.setId(flight.getId());
        dto.setFlightName(flight.getName()); // Use the correct getter
        dto.setOrigin(flight.getOrigin());
        dto.setDestination(flight.getDestination());
        dto.setDepartureDate(flight.getDepartureDate());
        dto.setDepartureTime(flight.getDepartureTime());
        dto.setArrivalDate(flight.getArrivalDate());
        dto.setArrivalTime(flight.getArrivalTime());
        dto.setPrice(flight.getPrice());
        dto.setQuantity(cartItem.getQuantity()); // <-- Set quantity
        return dto;
    }
}