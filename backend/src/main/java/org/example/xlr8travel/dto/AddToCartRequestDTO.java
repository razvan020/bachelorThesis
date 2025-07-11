package org.example.xlr8travel.dto;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class AddToCartRequestDTO {
    @NotNull(message = "Flight ID cannot be null")
    private Long flightId;
    private Long seatId;
    private String seatNumber;
    private String seatType;
    private boolean deferSeatSelection;
    private boolean allocateRandomSeat;
    private String baggageType;
}
