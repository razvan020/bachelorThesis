package org.example.xlr8travel.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.repositories.FlightRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService {

    private final FlightRepository flightRepository;

    @Override
    @Transactional
    public Flight save(Flight flight) {
        return flightRepository.save(flight);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Flight> findAll() {
        return flightRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Flight findById(Long id) {
        Optional<Flight> flightOptional = flightRepository.findById(id);
        // Return null if not found, matching controller expectation (though Optional return is better)
        return flightOptional.orElse(null);
    }

    @Override
    @Transactional
    public Flight updateFlightById(Long id, Flight flightDetails) {
        Flight existingFlight = flightRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flight not found with ID: " + id + " - cannot update"));

        // Update fields (ensure these match your Flight entity setters)
        existingFlight.setName(flightDetails.getName());
        existingFlight.setOrigin(flightDetails.getOrigin());
        existingFlight.setDestination(flightDetails.getDestination());
        existingFlight.setDepartureDate(flightDetails.getDepartureDate());
        existingFlight.setArrivalDate(flightDetails.getArrivalDate());
        existingFlight.setDepartureTime(flightDetails.getDepartureTime());
        existingFlight.setArrivalTime(flightDetails.getArrivalTime());
        existingFlight.setTerminal(flightDetails.getTerminal());
        existingFlight.setGate(flightDetails.getGate());
        existingFlight.setPrice(flightDetails.getPrice());
        // Don't usually update lastUpdated manually here if it's handled by JPA/DB

        return flightRepository.save(existingFlight);
    }


    @Override
    @Transactional
    public void deleteFlightById(Long flightId) {
        if (!flightRepository.existsById(flightId)) { // Use existsById check
            throw new EntityNotFoundException("Flight not found with ID: " + flightId + " - cannot delete");
        }
        flightRepository.deleteById(flightId);
    }

    // Implementation for existing round-trip search
    @Override
    @Transactional(readOnly = true)
    public List<Flight> findByOriginAndDestinationAndArrivalDateAndDepartureDate(String origin, String destination, LocalDate arrivalDate, LocalDate departureDate) {
        // Optional: Add checks for null parameters if needed
        return flightRepository.findByOriginAndDestinationAndArrivalDateAndDepartureDate(origin, destination, arrivalDate, departureDate);
    }

    // --- NEW: Implementation for one-way/departure-date search ---
    @Override
    @Transactional(readOnly = true)
    public List<Flight> findByOriginAndDestinationAndDepartureDate(String origin, String destination, LocalDate departureDate) {
        // Optional: Add checks for null parameters if needed
        return flightRepository.findByOriginAndDestinationAndDepartureDate(origin, destination, departureDate);
    }

    // Optional: existsById implementation if needed by controller/other services
    // public boolean existsById(Long id) {
    //    return flightRepository.existsById(id);
    // }
}