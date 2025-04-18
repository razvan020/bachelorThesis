package org.example.xlr8travel.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString(exclude = "airline")
@Getter
@Setter

public class Flight {

    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private String origin;
    private String destination;
    private LocalDate departureDate;
    private LocalDate arrivalDate;
    private String terminal;
    private String gate;
    private LocalDateTime lastUpdated; // last updated time
    private BigDecimal price;

    @ManyToOne
    @JsonIgnore
    private Airline airline;

    @OneToMany(mappedBy = "flight",cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    @JsonIgnore
    private Set<Ticket> tickets = new HashSet<>();

    public <E> Flight(Object o, String s, LocalTime of, LocalTime of1, String romania, String italy, LocalDate date, LocalDate date1, String a, String number, LocalDateTime now, Object o1, HashSet<E> es, BigDecimal price) {
        this.name = s;
        this.departureTime = of;
        this.arrivalTime = of1;
        this.origin = romania;
        this.destination = italy;
        this.departureDate = date;
        this.arrivalDate = date1;
        this.terminal = a;
        this.gate = number;
        this.lastUpdated = now;
        this.price = price;
    }

    public <E> Flight(Object o, String s, LocalTime of, LocalTime of1, String romania, String italy, LocalDate date, String a, String number, LocalDateTime now, Object o1, HashSet<E> es, BigDecimal price) {
        this.name = s;
        this.departureTime = of;
        this.arrivalTime = of1;
        this.origin = romania;
        this.destination = italy;
        this.departureDate = date;
        this.terminal = a;
        this.gate = number;
        this.lastUpdated = now;
        this.price = price;
    }

    public <E> Flight(Long o, String s, LocalTime of, LocalTime of1, String romania, String italy, LocalDate date, LocalDate date1, String a, String number, LocalDateTime now, BigDecimal o1, HashSet<E> es, double v) {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Flight flight = (Flight) o;
        return Objects.equals(name, flight.name) && Objects.equals(departureTime, flight.departureTime) && Objects.equals(arrivalTime, flight.arrivalTime) && Objects.equals(terminal, flight.terminal) && Objects.equals(gate, flight.gate) && Objects.equals(lastUpdated, flight.lastUpdated) && Objects.equals(price,flight.price);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, departureTime, arrivalTime, terminal, gate, lastUpdated, price);
    }

    public void addTicket(Ticket ticket){
        this.getTickets().add(ticket);
        ticket.setFlight(this);
    }



}
