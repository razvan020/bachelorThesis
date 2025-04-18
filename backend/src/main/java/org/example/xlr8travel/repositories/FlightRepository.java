package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Flight;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
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

}