package org.example.xlr8travel.models;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "cart_items") // Optional: specify table name
public class CartItemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many items belong to one cart
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    // Many items can refer to the same flight
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @Column(nullable = false)
    private int quantity;

    // Seat and baggage information
    private Long seatId;

    @Column
    private String seatNumber;

    @Column
    private String seatType;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean deferSeatSelection = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean allocateRandomSeat = false;

    private String baggageType;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public void setSeatType(String seatType) {
        this.seatType = seatType;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public String getSeatType() {
        return seatType;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public Flight getFlight() {
        return flight;
    }

    public void setFlight(Flight flight) {
        this.flight = flight;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Long getSeatId() {
        return seatId;
    }

    public void setSeatId(Long seatId) {
        this.seatId = seatId;
    }

    public boolean isDeferSeatSelection() {
        return deferSeatSelection;
    }

    public void setDeferSeatSelection(boolean deferSeatSelection) {
        this.deferSeatSelection = deferSeatSelection;
    }

    public boolean isAllocateRandomSeat() {
        return allocateRandomSeat;
    }

    public void setAllocateRandomSeat(boolean allocateRandomSeat) {
        this.allocateRandomSeat = allocateRandomSeat;
    }

    public String getBaggageType() {
        return baggageType;
    }

    public void setBaggageType(String baggageType) {
        this.baggageType = baggageType;
    }

    // --- equals() and hashCode() ---
    // Based on ID for persisted entities.

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartItemModel that = (CartItemModel) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? Objects.hash(id) : Objects.hash(getClass());
    }
}
