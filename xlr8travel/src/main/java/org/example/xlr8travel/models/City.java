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
public class City {
    @Id
    @GeneratedValue
    private Long id;
    private String name;

    public City(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        City city = (City) o;
        return Objects.equals(name, city.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }

    @ManyToOne(cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Country country;

    @OneToMany(mappedBy = "city", cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<Airport> airports = new HashSet<>();

    public void addAirport(Airport airport) {
        this.getAirports().add(airport);
        airport.setCity(this);
    }

    @OneToMany(mappedBy = "city",  cascade = {CascadeType.PERSIST, CascadeType.MERGE})//, cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<Address> addresses = new HashSet<>();

    public void addAddress(Address address) {
        this.getAddresses().add(address);
        address.setCity(this);
    }

    @Override
    public String toString() {
        // only id + name, never print country or its cities
        return "City{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }


}