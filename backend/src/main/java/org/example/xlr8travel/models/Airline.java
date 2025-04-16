package org.example.xlr8travel.models;


import lombok.*;
import jakarta.persistence.*;
import java.util.*;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString(exclude = "flights")
@Getter
@Setter
public class Airline {

    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private String iataCode;

    public Airline(String name, String iataCode) {
        this.name = name;
        this.iataCode = iataCode;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Airline airline = (Airline) o;
        return Objects.equals(name, airline.name) && Objects.equals(iataCode, airline.iataCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, iataCode);
    }

    @OneToMany(mappedBy = "airline",cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<Flight> flights = new HashSet<>();

    public void addFlight(Flight flight){
        this.getFlights().add(flight);
        flight.setAirline(this);
    }


    @OneToMany(mappedBy = "airline",cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<Aircraft> aircrafts = new HashSet<>();

    public void addAircraft(Aircraft aircraft){
        this.getAircrafts().add(aircraft);
        aircraft.setAirline(this);
    }


    @OneToMany(mappedBy = "airline",cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<Route> routes = new HashSet<>();

    public void addRoute(Route route){
        this.getRoutes().add(route);
        route.setAirline(this);
    }

}
