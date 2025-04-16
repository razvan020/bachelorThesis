package org.example.xlr8travel.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal; // Recommended for currency
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many orders can belong to one user
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // One order contains many order items
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<OrderItem> orderItems = new HashSet<>(); // Initialize collection

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    // Using BigDecimal is preferred for monetary values to avoid precision issues
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2) // Example precision/scale
    private BigDecimal totalPrice;
    // If you used Double in Flight, you might use Double here for consistency,
    // but be aware of potential floating-point inaccuracies.
    // private Double totalPrice;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // e.g., "PROCESSING", "COMPLETED", "CANCELLED"
    // Consider using an Enum for status for better type safety

    // Optional: Store billing details snapshot at time of order
    @Column(name = "billing_name")
    private String billingName;

    @Column(name = "billing_email")
    private String billingEmail;

}
// Add other billing