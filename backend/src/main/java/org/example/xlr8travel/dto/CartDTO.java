package org.example.xlr8travel.dto;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class CartDTO {
    private List<FlightCartItemDTO> items;
    private double totalPrice;
    private int totalQuantity; // Renamed from itemCount for clarity
}