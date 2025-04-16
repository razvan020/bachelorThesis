package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Cart;
import org.example.xlr8travel.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    /**
     * Finds the Cart associated with a specific User.
     *
     * @param user The user whose cart is to be found.
     * @return An Optional containing the Cart if found, otherwise empty.
     */
    Optional<Cart> findByUser(User user);

    // Optional: Find by User ID if needed
    // Optional<Cart> findByUserId(Long userId);
}