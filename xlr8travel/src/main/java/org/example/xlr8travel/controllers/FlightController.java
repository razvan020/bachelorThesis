package org.example.xlr8travel.controllers;

import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.services.FlightService;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException; // For cleaner error handling

import jakarta.validation.Valid; // For input validation (add dependency if needed)
import java.util.List;
import java.util.Map;

@RestController // Changed from @Controller
@RequestMapping("/api/flights") // Changed base path for API clarity
public class FlightController {

    private static final Logger log = LoggerFactory.getLogger(FlightController.class);
    private final FlightService flightService;

    // Constructor Injection (preferred)
    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    // --- GET ALL FLIGHTS (Replaces /manage GET) ---
    @GetMapping
    @Secured("ROLE_ADMIN") // Keep security annotation
    public ResponseEntity<List<Flight>> getAllFlights() {
        log.info("Request received for all flights");
        try {
            List<Flight> flights = flightService.findAll();
            if (flights.isEmpty()) {
                log.info("No flights found.");
                // Consider returning 200 OK with empty list or 204 No Content
                // Returning 200 OK with empty list is often preferred by frontends
                return ResponseEntity.ok(flights);
            }
            log.info("Returning {} flights.", flights.size());
            return ResponseEntity.ok(flights); // Spring converts List<Flight> to JSON
        } catch (Exception e) {
            log.error("Error fetching all flights", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- GET SINGLE FLIGHT (Replaces /edit/{id} GET) ---
    @GetMapping("/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Flight> getFlightById(@PathVariable Long id) {
        log.info("Request received for flight with ID: {}", id);
        try {
            Flight flight = flightService.findById(id);
            if (flight == null) {
                log.warn("Flight with ID {} not found.", id);
                return ResponseEntity.notFound().build(); // Return 404 Not Found
            }
            log.info("Returning flight: {}", flight.getId());
            return ResponseEntity.ok(flight); // Return flight data as JSON
        } catch (Exception e) {
            log.error("Error fetching flight with ID {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- ADD NEW FLIGHT (Replaces /add POST) ---
    @PostMapping
    @Secured("ROLE_ADMIN")
    // Use @RequestBody to get Flight data from JSON payload
    // Add @Valid for validation (requires dependency and annotations on Flight model)
    public ResponseEntity<?> addFlight(@Valid @RequestBody Flight flight) {
        // Ensure ID is null for creation to avoid accidental updates if ID is passed
        if (flight.getId() != null) {
            log.warn("Attempted to add flight with existing ID: {}", flight.getId());
            return ResponseEntity.badRequest().body(Map.of("error", "ID must be null for new flight creation."));
        }
        log.info("Request received to add new flight: {}", flight.getName());
        try {
            // Assuming save method returns the saved entity with generated ID
            Flight savedFlight = flightService.save(flight);
            log.info("Flight added successfully with ID: {}", savedFlight.getId());
            // Return 201 Created status with the created flight object in the body
            return ResponseEntity.status(HttpStatus.CREATED).body(savedFlight);
        } catch (/* DataIntegrityViolationException | ConstraintViolationException e */ Exception e) { // Catch specific exceptions
            log.error("Error adding flight: {}", flight.getName(), e);
            // Provide a more informative error response if possible
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to add flight. Check constraints or data.", "details", e.getMessage()));
        }
    }

    // --- UPDATE FLIGHT (Replaces /edit POST) ---
    @PutMapping("/{id}") // Use PUT for updates, include ID in path
    @Secured("ROLE_ADMIN")
    public ResponseEntity<?> updateFlight(@PathVariable Long id, @Valid @RequestBody Flight flightDetails) {
        log.info("Request received to update flight ID: {}", id);
        try {
            // --- Option: Let service handle fetching and updating ---
            // Requires a service method like updateFlightById(Long id, Flight details)
            Flight updatedFlight = flightService.updateFlightById(id, flightDetails); // Adapt your service method
            if (updatedFlight == null) {
                log.warn("Attempted to update non-existent flight ID: {}", id);
                return ResponseEntity.notFound().build(); // Return 404 if not found
            }
            log.info("Flight updated successfully: {}", updatedFlight.getId());
            return ResponseEntity.ok(updatedFlight); // Return updated flight

            // --- Alternative: Fetch, update, save in controller (less ideal) ---
             /*
             Flight existingFlight = flightService.findById(id);
             if (existingFlight == null) {
                 return ResponseEntity.notFound().build();
             }
             // Manually update fields (consider using MapStruct or similar)
             existingFlight.setFlightName(flightDetails.getFlightName());
             existingFlight.setOrigin(flightDetails.getOrigin());
             existingFlight.setDestination(flightDetails.getDestination());
             // ... copy all other updatable fields ...
             Flight savedFlight = flightService.save(existingFlight); // save() often handles update
             return ResponseEntity.ok(savedFlight);
             */

        } catch (ResponseStatusException rse) { // Catch specific exceptions if service throws them
            log.warn("Update failed for flight ID {}: {}", id, rse.getReason());
            return ResponseEntity.status(rse.getStatusCode()).body(Map.of("error", rse.getReason()));
        } catch (Exception e) {
            log.error("Error updating flight ID {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update flight due to an internal error."));
        }
    }

    // --- DELETE FLIGHT (Replaces /delete/{id} POST) ---
    @DeleteMapping("/{id}") // Use DELETE method for deletion
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Void> deleteFlight(@PathVariable Long id) {
        log.info("Request received to delete flight ID: {}", id);
        try {
            // Optional: Check existence first for a clearer 404
            // Flight flight = flightService.findById(id);
            // if (flight == null) {
            //     log.warn("Attempted to delete non-existent flight ID: {}", id);
            //     return ResponseEntity.notFound().build();
            // }
            flightService.deleteFlightById(id); // Assuming this handles non-existence gracefully or throws exception
            log.info("Flight deleted successfully: {}", id);
            return ResponseEntity.noContent().build(); // Return 204 No Content (standard for DELETE)
        } catch (/* EmptyResultDataAccessException e */ Exception e) { // Catch specific errors like trying to delete non-existent
            log.error("Error deleting flight ID {}", id, e);
            // Depending on exception, could be notFound or internalServerError
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // Or ResponseEntity.notFound().build();
        }
    }
}