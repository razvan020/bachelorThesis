package org.example.xlr8travel.services;

import org.example.xlr8travel.models.Flight;
// import org.springframework.web.server.ResponseStatusException; // Consider using Exceptions for not found

import java.time.LocalDate;
// import java.util.Date; // Removed unused import java.util.Date
import java.util.List;
import java.util.Optional; // Consider using Optional for findById

public interface FlightService {

    /**
     * Saves a new flight or updates an existing one.
     * @param flight The flight entity to save.
     * @return The saved flight entity (including generated ID for new flights).
     */
    Flight save(Flight flight); // Changed return type to Flight

    /**
     * Retrieves all flights.
     * @return A list of all flights.
     */
    List<Flight> findAll();

    /**
     * Finds a flight by its ID.
     * @param id The ID of the flight to find.
     * @return The found Flight, or null/empty Optional if not found.
     * (Returning Flight directly as per previous impl, but Optional is safer).
     */
    Flight findById(Long id); // Keep as Flight for consistency with impl, but consider Optional<Flight>

    /**
     * Updates an existing flight identified by its ID with new details.
     * @param id The ID of the flight to update.
     * @param flightDetails An object containing the updated flight details.
     * @return The updated Flight entity.
     * @throws RuntimeException // Or a custom exception like ResourceNotFoundException if flight not found
     */
    Flight updateFlightById(Long id, Flight flightDetails); // <-- Renamed and added ID parameter

    /**
     * Deletes a flight by its ID.
     * @param flightId The ID of the flight to delete.
     */
    void deleteFlightById(Long flightId);

    /**
     * Finds flights based on specific search criteria.
     * @param origin Origin location.
     * @param destination Destination location.
     * @param arrivalDate Arrival date.
     * @param departureDate Departure date.
     * @return A list of matching flights.
     */
    List<Flight> findByOriginAndDestinationAndArrivalDateAndDepartureDate(String origin, String destination, LocalDate arrivalDate, LocalDate departureDate);
}