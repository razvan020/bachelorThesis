package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Flight;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends CrudRepository<Flight, Long> {

    // Inherited: save, findById, deleteById, existsById, etc.

    @Override // Keep override if you prefer List return type
    List<Flight> findAll();

    // Existing custom query for round trips (potentially still useful)
    List<Flight> findByOriginAndDestinationAndArrivalDateAndDepartureDate(String origin, String destination, LocalDate arrivalDate, LocalDate departureDate);

    // --- NEW: Query for One-Way or searches based only on departure date ---
    List<Flight> findByOriginAndDestinationAndDepartureDate(String origin, String destination, LocalDate departureDate);

    // --- Optional: Add other finders if needed ---
    // List<Flight> findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureDate(String origin, String destination, LocalDate departureDate);

    // Find flights by origin only (for nearby flights feature)
    List<Flight> findByOriginAndDepartureDateAfter(String origin, LocalDate departureDate);

    // --- Metrics related queries ---

    // Find flights with departure date after the given date
    List<Flight> findByDepartureDateAfter(LocalDate date);

    // Find flights with departure date between two dates
    List<Flight> findByDepartureDateBetween(LocalDate startDate, LocalDate endDate);

    // Count flights with available seats
    @Query("SELECT COUNT(f) FROM Flight f WHERE f.availableSeats > 0")
    long countAvailableFlights();

    // Count flights with no available seats
    @Query("SELECT COUNT(f) FROM Flight f WHERE f.availableSeats = 0")
    long countFullyBookedFlights();

    // Count flights added after a certain date
    @Query("SELECT COUNT(f) FROM Flight f WHERE f.createdAt > :date")
    long countFlightsAddedAfter(@Param("date") LocalDateTime date);
}
