package org.example.xlr8travel.controllers;

import org.example.xlr8travel.dto.FlightDTO;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.services.FlightService;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.server.ResponseStatusException; // For cleaner error handling

import jakarta.validation.Valid; // For input validation (add dependency if needed)

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController // Changed from @Controller
@RequestMapping("/api/flights") // Changed base path for API clarity
public class FlightController {

    private static final Logger log = LoggerFactory.getLogger(FlightController.class);
    private final FlightService flightService;

    // Simple in-memory cache for nearby flights to reduce database load
    private final Map<String, CachedFlights> nearbyFlightsCache = new ConcurrentHashMap<>();

    // Cache expiration time in milliseconds (5 minutes)
    private static final long CACHE_EXPIRATION_MS = 5 * 60 * 1000;

    // Class to hold cached flights with timestamp
    private static class CachedFlights {
        final List<FlightDTO> flights;
        final long timestamp;

        CachedFlights(List<FlightDTO> flights) {
            this.flights = flights;
            this.timestamp = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_EXPIRATION_MS;
        }
    }

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

    @GetMapping("/search")
    public ResponseEntity<List<FlightDTO>> searchFlights(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam LocalDate departureDate,
            @RequestParam(required = false) LocalDate arrivalDate,
            @RequestParam(defaultValue = "roundTrip") String tripType,
            @RequestParam(defaultValue = "1") int adults,
            @RequestParam(defaultValue = "0") int children,
            @RequestParam(defaultValue = "0") int infants
    ) {
        log.info("Searching flights: Type={}, Origin={}, Dest={}, Depart={}, Return={}, Pax={}/{}/{}",
                tripType, origin, destination, departureDate, arrivalDate, adults, children, infants);

        try {
            // Validate that arrivalDate is provided when tripType is "roundTrip"
            if ("roundTrip".equals(tripType) && arrivalDate == null) {
                log.warn("Round trip search requested without arrival date");
                return ResponseEntity.badRequest().body(List.of());
            }

            List<Flight> foundFlights;

            // Use the appropriate service method based on the tripType
            if ("roundTrip".equals(tripType)) {
                log.info("Performing round trip flight search from {} to {} on {} returning {}", 
                        origin, destination, departureDate, arrivalDate);
                foundFlights = flightService.findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                        origin, destination, arrivalDate, departureDate);
            } else {
                // For one-way trips
                log.info("Performing one-way flight search from {} to {} on {}", origin, destination, departureDate);
                foundFlights = flightService.findByOriginAndDestinationAndDepartureDate(origin, destination, departureDate);
            }

            // If no flights found, log detailed information for debugging
            if (foundFlights.isEmpty()) {
                log.warn("No flights found for search: {} to {} on {}", origin, destination, departureDate);
            }

            // Convert found Flight entities to FlightDTOs before returning
            List<FlightDTO> flightDTOs = foundFlights.stream()
                    .map(FlightDTO::fromFlight)
                    .collect(Collectors.toList());

            log.info("Found {} available flights for search criteria.", flightDTOs.size());
            return ResponseEntity.ok(flightDTOs);

        } catch (Exception e) {
            log.error("Error during flight search: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<FlightDTO>> getNearbyFlights(
            @RequestParam String origin,
            @RequestParam(required = false) LocalDate departureDate
    ) {
        log.info("Received request for nearby flights from origin: {}, departureDate: {}", origin, departureDate);
        try {
            // If no departure date is provided, use today's date
            LocalDate searchDate = departureDate != null ? departureDate : LocalDate.now();
            log.info("Using search date: {}", searchDate);

            // Create a cache key based on origin and date
            String cacheKey = origin + "-" + searchDate.toString();
            log.info("Cache key: {}", cacheKey);

            // Check if we have a valid cached result
            CachedFlights cachedResult = nearbyFlightsCache.get(cacheKey);
            if (cachedResult != null && !cachedResult.isExpired()) {
                log.info("Returning cached nearby flights for origin: {}, found {} flights", 
                         origin, cachedResult.flights.size());
                return ResponseEntity.ok(cachedResult.flights);
            }

            log.info("No valid cache found. Searching nearby flights from origin: {}, after date: {}", origin, searchDate);

            try {
                log.info("Calling flightService.findByOriginAndDepartureDateAfter for origin: {}, date: {}", origin, searchDate);
                List<Flight> foundFlights = flightService.findByOriginAndDepartureDateAfter(origin, searchDate);
                log.info("Database query completed, found {} flights", foundFlights.size());

                // If no flights found, log detailed information for debugging
                if (foundFlights.isEmpty()) {
                    log.warn("No nearby flights found from: {} after date: {}. This may cause the frontend to show a loading spinner indefinitely.", origin, searchDate);
                    // Return an empty list instead of null to avoid NPE
                    return ResponseEntity.ok(Collections.emptyList());
                }

                // Convert found Flight entities to FlightDTOs
                log.info("Converting {} Flight entities to FlightDTOs", foundFlights.size());
                List<FlightDTO> allFlightDTOs = foundFlights.stream()
                        .map(FlightDTO::fromFlight)
                        .collect(Collectors.toList());
                log.info("Converted to {} FlightDTOs", allFlightDTOs.size());

                // Group flights by destination country to ensure diversity
                log.info("Grouping flights by destination country");
                Map<String, List<FlightDTO>> flightsByCountry = allFlightDTOs.stream()
                        .collect(Collectors.groupingBy(flight -> {
                            // Extract country from destination code
                            // This is a simplified approach - in a real app, you'd have a proper mapping
                            String destination = flight.getDestination();
                            // Map destination codes to countries (simplified)
                            if (destination.equals("BCN") || destination.equals("MAD")) return "Spain";
                            if (destination.equals("LHR")) return "United Kingdom";
                            if (destination.equals("CDG")) return "France";
                            if (destination.equals("FCO") || destination.equals("MXP")) return "Italy";
                            if (destination.equals("MUC") || destination.equals("BER")) return "Germany";
                            if (destination.equals("AMS")) return "Netherlands";
                            if (destination.equals("ATH")) return "Greece";
                            if (destination.equals("ZRH")) return "Switzerland";
                            if (destination.equals("CLJ")) return "Romania"; // Same country as origin, but different city
                            return "Other"; // Default category
                        }));
                log.info("Grouped flights into {} countries", flightsByCountry.size());

                // Select diverse flights - one from each country first, then add more if needed
                List<FlightDTO> diverseFlights = new java.util.ArrayList<>();
                log.info("Selecting diverse flights - one from each country first");

                // First pass: take one flight from each country
                for (Map.Entry<String, List<FlightDTO>> entry : flightsByCountry.entrySet()) {
                    String country = entry.getKey();
                    List<FlightDTO> countryFlights = entry.getValue();

                    if (!countryFlights.isEmpty()) {
                        log.info("Adding first flight from {} (has {} flights)", country, countryFlights.size());
                        diverseFlights.add(countryFlights.get(0));
                    }

                    // Stop if we have 6 flights already
                    if (diverseFlights.size() >= 6) {
                        log.info("Reached 6 flights after first pass, stopping");
                        break;
                    }
                }

                // Second pass: if we still need more flights, add additional ones from countries with multiple flights
                if (diverseFlights.size() < 6) {
                    log.info("First pass only yielded {} flights, adding more in second pass", diverseFlights.size());
                    for (Map.Entry<String, List<FlightDTO>> entry : flightsByCountry.entrySet()) {
                        String country = entry.getKey();
                        List<FlightDTO> countryFlights = entry.getValue();

                        if (countryFlights.size() > 1) {
                            log.info("Country {} has {} additional flights to consider", country, countryFlights.size() - 1);
                            // Start from the second flight (index 1) since we already added the first one
                            for (int i = 1; i < countryFlights.size() && diverseFlights.size() < 6; i++) {
                                log.info("Adding additional flight from {}", country);
                                diverseFlights.add(countryFlights.get(i));
                            }
                        }

                        // Stop if we have 6 flights
                        if (diverseFlights.size() >= 6) {
                            log.info("Reached 6 flights after second pass, stopping");
                            break;
                        }
                    }
                }

                // Cache the result
                log.info("Caching {} diverse flights with key: {}", diverseFlights.size(), cacheKey);
                nearbyFlightsCache.put(cacheKey, new CachedFlights(diverseFlights));

                // If we still don't have enough flights, just use what we have
                log.info("Returning {} diverse nearby flights from: {}", diverseFlights.size(), origin);
                return ResponseEntity.ok(diverseFlights);

            } catch (Exception e) {
                log.error("Error during nearby flights search: {}", e.getMessage(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        } catch (Exception e) {
            log.error("Unexpected error in nearby flights endpoint: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
