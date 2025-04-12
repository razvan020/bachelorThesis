package org.example.xlr8travel.services;

import jakarta.persistence.EntityNotFoundException; // More specific exception
import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.repositories.FlightRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // For transactional updates

import java.time.LocalDate;
// import java.util.Date; // Removed unused import
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor // Generates constructor for final fields
public class FlightServiceImpl implements FlightService {

    private final FlightRepository flightRepository;

    @Override
    @Transactional // Good practice for save/update/delete operations
    public Flight save(Flight flight) {
        // The save method from CrudRepository handles both create and update,
        // and returns the saved entity.
        return flightRepository.save(flight);
    }

    @Override
    @Transactional(readOnly = true) // Use readOnly for find operations
    public List<Flight> findAll() {
        return flightRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Flight findById(Long id) {
        // Use Optional properly
        Optional<Flight> flightOptional = flightRepository.findById(id);
        return flightOptional.orElse(null); // Return null if not found (as controller expects)
        // Or throw an exception:
        // return flightOptional.orElseThrow(() -> new EntityNotFoundException("Flight not found with ID: " + id));
    }

    @Override
    @Transactional // Ensure update happens within a transaction
    public Flight updateFlightById(Long id, Flight flightDetails) {
        // 1. Find the existing flight
        Flight existingFlight = flightRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flight not found with ID: " + id + " - cannot update"));

        // 2. Update the fields of the existing flight with details from the request
        // Be specific about which fields are allowed to be updated
        existingFlight.setName(flightDetails.getName()); // Assuming getName() was a typo in controller
        existingFlight.setOrigin(flightDetails.getOrigin());
        existingFlight.setDestination(flightDetails.getDestination());
        existingFlight.setDepartureDate(flightDetails.getDepartureDate());
        existingFlight.setArrivalDate(flightDetails.getArrivalDate());
        existingFlight.setDepartureTime(flightDetails.getDepartureTime());
        existingFlight.setArrivalTime(flightDetails.getArrivalTime());
        existingFlight.setTerminal(flightDetails.getTerminal());
        existingFlight.setGate(flightDetails.getGate());
        existingFlight.setPrice(flightDetails.getPrice());
        // NOTE: Be careful about updating relationships or generated values like lastUpdated here

        // 3. Save the updated entity - CrudRepository's save performs an update if ID exists
        return flightRepository.save(existingFlight);
    }


    @Override
    @Transactional
    public void deleteFlightById(Long flightId) {
        // Optional: Check if exists before deleting to handle potential errors more gracefully
        if (!flightRepository.existsById(flightId)) {
            throw new EntityNotFoundException("Flight not found with ID: " + flightId + " - cannot delete");
        }
        flightRepository.deleteById(flightId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Flight> findByOriginAndDestinationAndArrivalDateAndDepartureDate(String origin, String destination, LocalDate arrivalDate, LocalDate departureDate) {
        return flightRepository.findByOriginAndDestinationAndArrivalDateAndDepartureDate(origin, destination, arrivalDate, departureDate);
    }
}