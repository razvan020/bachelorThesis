package org.example.xlr8travel.services;

import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.repositories.FlightRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
@Service
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService {

    private final FlightRepository flightRepository;

    @Override
    public List<Flight> findByOriginAndDestinationAndArrivalDateAndDepartureDate(String origin, String destination, LocalDate arrivalDate, LocalDate departureDate) {
        return flightRepository.findByOriginAndDestinationAndArrivalDateAndDepartureDate(origin, destination, arrivalDate, departureDate);
    }

    @Override
    public void save(Flight flight) {
        flightRepository.save(flight);
    }

    @Override
    public List<Flight> findAll() {
        return flightRepository.findAll();
    }

    @Override
    public Flight findById(Long id) {
        return flightRepository.findById(id).orElse(null);

    }

    public Flight updateFlight(Flight updatedFlight) {
        // Make sure the ID is present
        if (updatedFlight.getId() == null) {
            throw new IllegalArgumentException("Flight ID is required for update");
        }
        // Optionally, retrieve existing flight from DB, update fields explicitly
        // or simply save the updatedFlight if you're sure all fields are correct
        return flightRepository.save(updatedFlight);
    }

    public void deleteFlightById(Long flightId) {
        flightRepository.deleteById(flightId);
    }
}