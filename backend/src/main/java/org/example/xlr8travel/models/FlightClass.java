package org.example.xlr8travel.models;


import lombok.*;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString(exclude = {})
@Getter
@Setter
public class FlightClass {

    @Id
    @GeneratedValue
    private Long id;
    private float fare; // fare for the class which is a price
    private FlightClassType flightClassType; // enum

    public FlightClass(float fare, FlightClassType flightClassType) {
        this.fare = fare;
        this.flightClassType = flightClassType;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FlightClass that = (FlightClass) o;
        return Float.compare(fare, that.fare) == 0 && flightClassType == that.flightClassType;
    }

    @Override
    public int hashCode() {
        return Objects.hash(fare, flightClassType);
    }

    @JsonBackReference
    @OneToMany(mappedBy = "flightClass", cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<Ticket> tickets = new HashSet<>();

    public void addTicket(Ticket ticket) {
        this.getTickets().add(ticket);
        ticket.setFlightClass(this);
    }

}
