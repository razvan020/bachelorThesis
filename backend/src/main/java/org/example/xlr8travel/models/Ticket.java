package org.example.xlr8travel.models;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;

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
    private boolean seatSelectionDeferred; // Flag to indicate if seat selection is deferred to check-in
    private boolean randomSeatAllocation; // Flag to indicate if a random seat should be allocated


    public Ticket(float price, LocalDateTime purchaseTime, TicketStatus ticketStatus, Seat seat) {
        this.price = price;
        this.purchaseTime = purchaseTime;
        this.ticketStatus = ticketStatus;
        this.seat = seat;
        this.seatSelectionDeferred = false;
        this.randomSeatAllocation = false;
    }

    public Ticket(float price, LocalDateTime purchaseTime, TicketStatus ticketStatus, boolean seatSelectionDeferred) {
        this.price = price;
        this.purchaseTime = purchaseTime;
        this.ticketStatus = ticketStatus;
        this.seatSelectionDeferred = seatSelectionDeferred;
        this.randomSeatAllocation = false;
    }

    public Ticket(TicketStatus ticketStatus) {
        this.ticketStatus = ticketStatus;
        this.randomSeatAllocation = false;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Ticket ticket = (Ticket) o;
        return Float.compare(price, ticket.price) == 0 && 
               Objects.equals(purchaseTime, ticket.purchaseTime) && 
               ticketStatus == ticket.ticketStatus && 
               seatSelectionDeferred == ticket.seatSelectionDeferred && 
               randomSeatAllocation == ticket.randomSeatAllocation && 
               Objects.equals(seat, ticket.seat);
    }

    @Override
    public int hashCode() {
        return Objects.hash(price, purchaseTime, ticketStatus, seatSelectionDeferred, randomSeatAllocation, seat);
    }

    @JsonManagedReference
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

    @JsonManagedReference
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

    @JsonManagedReference
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
