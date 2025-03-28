package org.example.xlr8travel.models;

import lombok.*;
import jakarta.persistence.*;

import java.time.LocalTime;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString(exclude = {})
@Getter
@Setter
public class Route {

    @Id
    @GeneratedValue
    private Long id;
    private int distance;// in km
    private LocalTime duration; // in hours and minutes

    public Route(int distance, LocalTime duration) {
        this.distance = distance;
        this.duration = duration;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Route route = (Route) o;
        return distance == route.distance && Objects.equals(duration, route.duration);
    }

    @Override
    public int hashCode() {
        return Objects.hash(distance, duration);
    }

    @ManyToOne(cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Airport sourceAirport;

    @ManyToOne(cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Airport destinationAirport;

    @ManyToOne
    private Airline airline;

}
