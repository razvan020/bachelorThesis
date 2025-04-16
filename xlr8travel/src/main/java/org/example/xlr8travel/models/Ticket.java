package org.example.xlr8travel.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString(exclude = {})
@Getter
@Setter
public class Ticket {

    @Id
    @GeneratedValue
    private Long id;
    private float price; // price of the ticket all in all
    private LocalDateTime purchaseTime;
    private TicketStatus ticketStatus;


    public Ticket(float price, LocalDateTime purchaseTime, TicketStatus ticketStatus, Seat seat) {
        this.price = price;
        this.purchaseTime = purchaseTime;
        this.ticketStatus = ticketStatus;
        this.seat = seat;
    }

    public Ticket(TicketStatus ticketStatus) {
        this.ticketStatus = ticketStatus;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Ticket ticket = (Ticket) o;
        return Float.compare(price, ticket.price) == 0 && Objects.equals(purchaseTime, ticket.purchaseTime) && ticketStatus == ticket.ticketStatus && Objects.equals(seat, ticket.seat);
    }

    @Override
    public int hashCode() {
        return Objects.hash(price, purchaseTime, ticketStatus, seat);
    }

    @ManyToOne
    private User user;


    @ManyToOne
    private Flight flight;

    @OneToOne(cascade = CascadeType.PERSIST)
    private Seat seat;


    /*@OneToMany(mappedBy = "ticket", cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    //@OneToMany(mappedBy = "ticket", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    private Set<Baggage> baggages = new HashSet<>();

    public void addBaggage(Baggage baggage){
        this.getBaggages().add(baggage);
        baggage.setTicket(this);
    }

    public void setBaggages(Set<Baggage> baggages) {
        this.baggages = baggages;
    }*/

    @ManyToMany(cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
            @JoinTable(
                    name = "ticket_baggage",
                    joinColumns = @JoinColumn(name = "ticket_id"),
                    inverseJoinColumns = @JoinColumn(name = "baggage_id")
            )
    private Set<Baggage> baggages = new HashSet<>();

    public void addBaggage(Baggage baggage){
        baggages.add(baggage);
        baggage.getTickets().add(this);
    }

    @ManyToOne(cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private FlightClass flightClass;

    @Override
    public String toString() {
        // only id + name, never print cities
        return "Country{" +
                "id=" + id +
                ", name='" + ticketStatus + '\'' +
                '}';
    }
}
