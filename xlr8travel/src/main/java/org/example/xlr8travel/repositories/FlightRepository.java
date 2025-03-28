package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Flight;
import org.springframework.data.repository.CrudRepository;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface FlightRepository  extends CrudRepository<Flight, Long> {

    // Flight findByFlightNumber(String flightNumber);

    List<Flight> findAll();

    List<Flight> findByOriginAndDestinationAndArrivalDateAndDepartureDate(String origin, String destination, LocalDate arrivalDate, LocalDate departureDate);

}
