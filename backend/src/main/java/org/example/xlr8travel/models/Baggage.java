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
public class Baggage {

    @Id
    @GeneratedValue
    private Long id;
    private BaggageType baggageType;
    //private int count;// number of bags
    private int weight;
    private float price;

    public Baggage(BaggageType baggageType) {
        this.baggageType = baggageType;
        this.weight = BaggageTypeWeight.determineWeight(baggageType).getWeight();
        this.price = BaggageTypePrice.determinePrice(BaggageTypeWeight.determineWeight(baggageType)).getPrice();
    }

    public Baggage(BaggageType baggageType, BaggageTypeWeight weight) {
        this.baggageType = baggageType;
        this.weight = weight.getWeight();
        this.price = BaggageTypePrice.determinePrice(weight).getPrice();
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Baggage baggage = (Baggage) o;
        return id != null && id.equals(baggage.id) && weight == baggage.weight && Float.compare(price, baggage.price) == 0 && baggageType == baggage.baggageType;
    }

    @Override
    public int hashCode() {
        return Objects.hash(baggageType, weight, price, id);
    }

    /*@ManyToOne(cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Ticket ticket;

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public Ticket getTicket() {
        return ticket;
    }*/

    @ManyToMany(mappedBy = "baggages", cascade = CascadeType.PERSIST)
    private Set<Ticket> tickets = new HashSet<>();

}
