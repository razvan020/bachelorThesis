package org.example.xlr8travel.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "carts")
@Getter
@Setter
// Optional: specify table name
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Or SEQUENCE if using sequences elsewhere
    private Long id;

    // Establish the relationship back to the User
    // One user has one cart. FetchType.LAZY is generally good practice.
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
    private User user;

    // One cart can have many items.
    // CascadeType.ALL: Operations (persist, merge, remove) on Cart cascade to CartItemModels.
    // orphanRemoval=true: If a CartItemModel is removed from this set, it's deleted from the DB.
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<CartItemModel> cartItems = new HashSet<>(); // Initialize to avoid NullPointerExceptions

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now(); // Also set on creation
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Set<CartItemModel> getCartItems() {
        return cartItems;
    }

    public void setCartItems(Set<CartItemModel> cartItems) {
        this.cartItems = cartItems;
    }

    // Optional: Helper method to add items consistently
    public void addCartItem(CartItemModel item) {
        this.cartItems.add(item);
        item.setCart(this);
    }

    // Optional: Helper method to remove items consistently
    public void removeCartItem(CartItemModel item) {
        this.cartItems.remove(item);
        item.setCart(null);
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // --- equals() and hashCode() ---
    // Important for collections if entities are managed before being persisted
    // Using ID is best practice once persisted.

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Cart cart = (Cart) o;
        // If entities are new (id is null), they are not equal
        // If ids are non-null, compare by id
        return id != null && Objects.equals(id, cart.id);
    }

    @Override
    public int hashCode() {
        // Use a prime number, consistently return 0 or a fixed value if id is null,
        // otherwise use the id's hashcode.
        return id != null ? Objects.hash(id) : Objects.hash(getClass()); // Or return fixed value like 31 if id is null
    }
}