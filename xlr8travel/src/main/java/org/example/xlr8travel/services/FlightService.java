package org.example.xlr8travel.services;

import org.example.xlr8travel.models.Flight;

import java.time.LocalDate;
import java.util.List;
// import java.util.Optional; // Optional if you change findById return type

public interface FlightService {

    Flight save(Flight flight);

    List<Flight> findAll();

    Flight findById(Long id); // Or Optional<Flight> findById(Long id);

    Flight updateFlightById(Long id, Flight flightDetails);

    void deleteFlightById(Long flightId);

    // Existing round-trip specific query (keep if needed)
    List<Flight> findByOriginAndDestinationAndArrivalDateAndDepartureDate(String origin, String destination, LocalDate arrivalDate, LocalDate departureDate);

    // --- NEW: Method for one-way search (or flexible search) ---
    List<Flight> findByOriginAndDestinationAndDepartureDate(String origin, String destination, LocalDate departureDate);

    // Optional: Add existsById if used in implementation
    // boolean existsById(Long id);
}