package org.example.xlr8travel.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString(exclude = {})
@Getter
@Setter
public class Seat {

    @Id
    @GeneratedValue
    private Long id;
    private String seatNumber;
    private boolean isBooked;
    private SeatType seatType; // for comfort not class
    private SeatPrice seatPrice; // for price

    public Seat(String seatNumber, boolean isBooked, SeatType seatType) {
        this.seatNumber = seatNumber;
        this.isBooked = isBooked;
        this.seatType = seatType;
        this.seatPrice = SeatPrice.getPriceByType(seatType);  // Correctly determine price from type
    }

    public void setSeatType(SeatType seatType) {
        this.seatType = seatType;
        this.seatPrice = SeatPrice.getPriceByType(seatType);
        // Correctly determine price from type
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Seat seat = (Seat) o;
        return isBooked == seat.isBooked && seatNumber.equals(seat.seatNumber) && seatType == seat.seatType && seatPrice == seat.seatPrice;
    }

    @Override
    public int hashCode() {
        return Objects.hash(seatNumber, isBooked, seatType, seatPrice);
    }


}
