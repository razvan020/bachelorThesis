package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Flight;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(
    properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
    }
)
public class FlightRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private FlightRepository flightRepository;

    private Flight flight1;
    private Flight flight2;
    private Flight flight3;

    @BeforeEach
    void setUp() {
        // Create test flights
        flight1 = new Flight();
        flight1.setName("Flight 101");
        flight1.setOrigin("Origin1");
        flight1.setDestination("Destination1");
        flight1.setDepartureDate(LocalDate.now());
        flight1.setArrivalDate(LocalDate.now().plusDays(1));
        flight1.setDepartureTime(LocalTime.of(10, 0));
        flight1.setArrivalTime(LocalTime.of(12, 0));
        flight1.setTerminal("A");
        flight1.setGate("1");
        flight1.setPrice(BigDecimal.valueOf(100.0));
        flight1.setLastUpdated(LocalDateTime.now());
        flight1.setCreatedAt(LocalDateTime.now().minusDays(10));
        flight1.setAvailableSeats(10);
        flight1.setTotalSeats(180);

        flight2 = new Flight();
        flight2.setName("Flight 102");
        flight2.setOrigin("Origin1");
        flight2.setDestination("Destination2");
        flight2.setDepartureDate(LocalDate.now().plusDays(1));
        flight2.setArrivalDate(LocalDate.now().plusDays(2));
        flight2.setDepartureTime(LocalTime.of(14, 0));
        flight2.setArrivalTime(LocalTime.of(16, 0));
        flight2.setTerminal("B");
        flight2.setGate("2");
        flight2.setPrice(BigDecimal.valueOf(150.0));
        flight2.setLastUpdated(LocalDateTime.now());
        flight2.setCreatedAt(LocalDateTime.now().minusDays(5));
        flight2.setAvailableSeats(0);
        flight2.setTotalSeats(180);

        flight3 = new Flight();
        flight3.setName("Flight 103");
        flight3.setOrigin("Origin2");
        flight3.setDestination("Destination1");
        flight3.setDepartureDate(LocalDate.now().plusDays(2));
        flight3.setArrivalDate(LocalDate.now().plusDays(3));
        flight3.setDepartureTime(LocalTime.of(9, 0));
        flight3.setArrivalTime(LocalTime.of(11, 0));
        flight3.setTerminal("C");
        flight3.setGate("3");
        flight3.setPrice(BigDecimal.valueOf(200.0));
        flight3.setLastUpdated(LocalDateTime.now());
        flight3.setCreatedAt(LocalDateTime.now().minusDays(2));
        flight3.setAvailableSeats(50);
        flight3.setTotalSeats(180);

        // Save test flights to the database
        entityManager.persist(flight1);
        entityManager.persist(flight2);
        entityManager.persist(flight3);
        entityManager.flush();
    }

    @Test
    void findAll_ShouldReturnAllFlights() {
        // Act
        List<Flight> flights = flightRepository.findAll();

        // Assert
        assertEquals(3, flights.size());
    }

    @Test
    void findByOriginAndDestinationAndArrivalDateAndDepartureDate_ShouldReturnMatchingFlights() {
        // Arrange
        String origin = "Origin1";
        String destination = "Destination1";
        LocalDate departureDate = LocalDate.now();
        LocalDate arrivalDate = LocalDate.now().plusDays(1);

        // Act
        List<Flight> flights = flightRepository.findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                origin, destination, arrivalDate, departureDate);

        // Assert
        assertEquals(1, flights.size());
        assertEquals("Flight 101", flights.get(0).getName());
    }

    @Test
    void findByOriginAndDestinationAndDepartureDate_ShouldReturnMatchingFlights() {
        // Arrange
        String origin = "Origin1";
        String destination = "Destination1";
        LocalDate departureDate = LocalDate.now();

        // Act
        List<Flight> flights = flightRepository.findByOriginAndDestinationAndDepartureDate(
                origin, destination, departureDate);

        // Assert
        assertEquals(1, flights.size());
        assertEquals("Flight 101", flights.get(0).getName());
    }

    @Test
    void findByOriginAndDepartureDateAfter_ShouldReturnMatchingFlights() {
        // Arrange
        String origin = "Origin1";
        // Use a date that's definitely before all flight departure dates
        LocalDate departureDate = LocalDate.now().minusDays(1);

        // Act
        List<Flight> flights = flightRepository.findByOriginAndDepartureDateAfter(
                origin, departureDate);

        // Assert
        assertEquals(2, flights.size());
        assertTrue(flights.stream().anyMatch(f -> f.getName().equals("Flight 101")));
        assertTrue(flights.stream().anyMatch(f -> f.getName().equals("Flight 102")));
    }

    @Test
    void findByDepartureDateAfter_ShouldReturnMatchingFlights() {
        // Arrange
        // Use a date that's exactly equal to flight2's departure date
        // This way, only flight3 will be after this date
        LocalDate departureDate = LocalDate.now().plusDays(1);

        // Act
        List<Flight> flights = flightRepository.findByDepartureDateAfter(departureDate);

        // Assert
        // Only flight3 should be returned (departure date is now+2 days)
        assertEquals(1, flights.size());
        assertTrue(flights.stream().anyMatch(f -> f.getName().equals("Flight 103")));
    }

    @Test
    void findByDepartureDateBetween_ShouldReturnMatchingFlights() {
        // Arrange
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(2);

        // Act
        List<Flight> flights = flightRepository.findByDepartureDateBetween(startDate, endDate);

        // Assert
        assertEquals(3, flights.size());
    }

    @Test
    void countAvailableFlights_ShouldReturnCorrectCount() {
        // Act
        long count = flightRepository.countAvailableFlights();

        // Assert
        assertEquals(2, count);
    }

    @Test
    void countFullyBookedFlights_ShouldReturnCorrectCount() {
        // Act
        long count = flightRepository.countFullyBookedFlights();

        // Assert
        assertEquals(1, count);
    }

    @Test
    void countFlightsAddedAfter_ShouldReturnCorrectCount() {
        // Arrange
        LocalDateTime date = LocalDateTime.now().minusDays(7);

        // Act
        long count = flightRepository.countFlightsAddedAfter(date);

        // Assert
        assertEquals(2, count);
    }
}
