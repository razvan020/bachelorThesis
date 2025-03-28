package org.example.xlr8travel.services;

import org.example.xlr8travel.models.Flight;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface FlightService {

    public void save(Flight flight);

    List<Flight> findAll();

    Flight findById(Long id);

    Flight updateFlight(Flight updatedFlight);

    void deleteFlightById(Long flightId);

    List<Flight> findByOriginAndDestinationAndArrivalDateAndDepartureDate(String origin, String destination, LocalDate arrivalDate, LocalDate departureDate);
}
