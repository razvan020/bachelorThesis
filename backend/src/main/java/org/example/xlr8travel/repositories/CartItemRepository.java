package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.CartItemModel;
// import org.example.xlr8travel.models.Cart; // If using findByCart method
// import java.util.List; // If using findByCart method
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItemModel, Long> {

    // Often, specific find methods aren't needed here if you manage items
    // primarily through the Cart entity and its relationships (using Cascade).
    // However, you could add methods if required:
    // List<CartItemModel> findByCart(Cart cart);
    // void deleteByCart(Cart cart); // For bulk deletion if needed differently than cascade

}