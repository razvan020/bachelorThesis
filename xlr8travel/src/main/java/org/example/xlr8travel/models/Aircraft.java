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
public class Aircraft {

    @Id
    @GeneratedValue
    private Long id;
    private String name; // name or model of the aircraft
    private String manufacturer;
    private String type;
    private int seatCapacity;
    private int cargoCapacity;
    private String facility; // wifi, food, entertainment, etc
    private String maxTakeoffWeight;
    private int fuelCapacity;
    private double maxFlightRangeKm; // distance in km
    private double maxFlightRangeMiles; // distance in miles

    public Aircraft(String name, String manufacturer, String type, int seatCapacity, int cargoCapacity, String facility, String maxTakeoffWeight, int fuelCapacity, double maxFlightRangeKm, double maxFlightRangeMiles) {
        this.name = name;
        this.manufacturer = manufacturer;
        this.type = type;
        this.seatCapacity = seatCapacity;
        this.cargoCapacity = cargoCapacity;
        this.facility = facility;
        this.maxTakeoffWeight = maxTakeoffWeight;
        this.fuelCapacity = fuelCapacity;
        this.maxFlightRangeKm = maxFlightRangeKm;
        this.maxFlightRangeMiles = maxFlightRangeMiles;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Aircraft aircraft = (Aircraft) o;
        return seatCapacity == aircraft.seatCapacity && cargoCapacity == aircraft.cargoCapacity && fuelCapacity == aircraft.fuelCapacity && Double.compare(maxFlightRangeKm, aircraft.maxFlightRangeKm) == 0 && Double.compare(maxFlightRangeMiles, aircraft.maxFlightRangeMiles) == 0 && Objects.equals(name, aircraft.name) && Objects.equals(manufacturer, aircraft.manufacturer) && Objects.equals(type, aircraft.type) && Objects.equals(facility, aircraft.facility) && Objects.equals(maxTakeoffWeight, aircraft.maxTakeoffWeight);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, manufacturer, type, seatCapacity, cargoCapacity, facility, maxTakeoffWeight, fuelCapacity, maxFlightRangeKm, maxFlightRangeMiles);
    }

    @ManyToOne
    private Airline airline;

}
