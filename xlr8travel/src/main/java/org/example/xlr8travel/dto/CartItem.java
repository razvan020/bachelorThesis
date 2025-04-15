package org.example.xlr8travel.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.xlr8travel.models.Flight; // Import your entity

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Flight flight; // Store the actual flight entity or a FlightDTO
    private int quantity;

    // You might want methods to increment quantity, etc.
    public void incrementQuantity() {
        this.quantity++;
    }
}