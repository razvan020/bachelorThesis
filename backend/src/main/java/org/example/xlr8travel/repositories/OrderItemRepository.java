package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Order;
import org.example.xlr8travel.models.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Finds all OrderItems associated with a specific Order.
     * While often managed via the Order entity's collection and cascading,
     * this method can be useful for direct queries if needed.
     *
     * @param order The order whose items are to be retrieved.
     * @return A list of OrderItems belonging to the specified order.
     */
    List<OrderItem> findByOrder(Order order);

    // You generally might not need many custom methods here if OrderItems
    // are primarily accessed and modified through the Order entity due to
    // the CascadeType.ALL setting on the Order's orderItems collection.
    // Basic CRUD operations are inherited from JpaRepository.

}