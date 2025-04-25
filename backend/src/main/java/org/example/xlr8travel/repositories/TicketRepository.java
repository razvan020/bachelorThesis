package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Ticket;
import org.example.xlr8travel.models.TicketStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends CrudRepository<Ticket, Long> {

    List<Ticket> findAll();

    // Find tickets by purchase time after a certain date
    List<Ticket> findByPurchaseTimeAfter(LocalDateTime date);

    // Find tickets by purchase time between two dates
    List<Ticket> findByPurchaseTimeBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Count tickets by status
    long countByTicketStatus(TicketStatus status);

    // Count tickets created after a certain date
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.purchaseTime > :date")
    long countTicketsCreatedAfter(@Param("date") LocalDateTime date);

    // Sum of ticket prices (total revenue)
    @Query("SELECT SUM(t.price) FROM Ticket t")
    float sumTicketPrices();

    // Average ticket price
    @Query("SELECT AVG(t.price) FROM Ticket t")
    float averageTicketPrice();

    // Count tickets created per day
    @Query("SELECT CAST(t.purchaseTime AS date) as day, COUNT(t) FROM Ticket t GROUP BY CAST(t.purchaseTime AS date)")
    List<Object[]> countTicketsPerDay();

    // Count tickets created per week
    @Query("SELECT FUNCTION('YEARWEEK', t.purchaseTime) as week, COUNT(t) FROM Ticket t GROUP BY FUNCTION('YEARWEEK', t.purchaseTime)")
    List<Object[]> countTicketsPerWeek();
}
