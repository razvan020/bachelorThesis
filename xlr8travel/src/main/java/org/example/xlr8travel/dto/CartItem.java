package org.example.xlr8travel.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.xlr8travel.models.Flight; // We need flight details eventually

import java.math.BigDecimal; // Use consistent type for price

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    // Store flight ID for lookup, and potentially basic details for display
    private Long flightId;
    private String flightName;
    private BigDecimal price; // Or Double, be consistent!
    // Add other display fields if needed (origin, destination, etc.)

    private int quantity;

    // Convenience method
    public void incrementQuantity() {
        this.quantity++;
    }

    // Example constructor if needed (Lombok provides one)
    // public CartItem(Flight flight, int quantity) {
    //     this.flightId = flight.getId();
    //     this.flightName = flight.getName(); // Adapt to your Flight entity
    //     this.price = flight.getPrice(); // Adapt price type
    //     this.quantity = quantity;
    // }
}