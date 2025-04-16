package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Order;
import org.example.xlr8travel.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Finds all Orders placed by a specific User.
     * You might want to order them, for example, by order date descending.
     *
     * @param user The user whose orders are to be retrieved.
     * @return A list of Orders placed by the user, ordered by order date descending.
     */
    List<Order> findByUserOrderByOrderDateDesc(User user);

    // You can add other custom query methods here as needed, e.g.,
    // List<Order> findByStatus(String status);
    // List<Order> findByUserAndStatus(User user, String status);

}