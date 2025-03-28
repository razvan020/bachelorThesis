package org.example.xlr8travel.models;

import lombok.*;
import jakarta.persistence.*;

import java.util.*;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString(exclude = {})
@Getter
@Setter
public class Airport {

    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private String iataCode;
    private String description;

    public Airport(String name, String iataCode, String description) {
        this.name = name;
        this.iataCode = iataCode;
        this.description = description;
    }

    public Airport(String name, String iataCode,  City city) {
        this.name = name;
        this.iataCode = iataCode;
        this.city = city;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Airport airport = (Airport) o;
        return Objects.equals(name, airport.name) && Objects.equals(iataCode, airport.iataCode) && Objects.equals(description, airport.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, iataCode, description);
    }

    @ManyToOne(cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private City city;


    @OneToMany(mappedBy = "sourceAirport",cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<Route> sourceRoutes = new HashSet<>();

    public void addSourceRoute(Route route){
        this.getSourceRoutes().add(route);
        route.setSourceAirport(this);
    }

    @OneToMany(mappedBy = "destinationAirport",cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<Route> destinationRoutes = new HashSet<>();

    public void addDestinationRoute(Route route){
        this.getDestinationRoutes().add(route);
        route.setDestinationAirport(this);
    }


}
