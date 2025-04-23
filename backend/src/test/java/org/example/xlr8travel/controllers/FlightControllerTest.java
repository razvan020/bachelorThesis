package org.example.xlr8travel.controllers;

import org.example.xlr8travel.dto.FlightDTO;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.services.FlightService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FlightControllerTest {

    @Mock
    private FlightService flightService;

    @InjectMocks
    private FlightController flightController;

    private Flight testFlight;
    private List<Flight> testFlights;
    private final Long TEST_FLIGHT_ID = 1L;

    @BeforeEach
    void setUp() {
        // Create test flight
        testFlight = new Flight();
        testFlight.setId(TEST_FLIGHT_ID);
        testFlight.setName("Test Flight");
        testFlight.setOrigin("Origin");
        testFlight.setDestination("Destination");
        testFlight.setDepartureDate(LocalDate.now());
        testFlight.setArrivalDate(LocalDate.now().plusDays(1));
        testFlight.setDepartureTime(LocalTime.of(10, 0));
        testFlight.setArrivalTime(LocalTime.of(12, 0));
        testFlight.setPrice(BigDecimal.valueOf(100.0));
        testFlight.setLastUpdated(LocalDateTime.now());

        // Create test flights list
        testFlights = new ArrayList<>();
        testFlights.add(testFlight);
    }

    @Test
    void getAllFlights_WhenFlightsExist_ReturnsFlights() {
        // Arrange
        when(flightService.findAll()).thenReturn(testFlights);

        // Act
        ResponseEntity<List<Flight>> response = flightController.getAllFlights();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(TEST_FLIGHT_ID, response.getBody().get(0).getId());

        // Verify service was called
        verify(flightService).findAll();
    }

    @Test
    void getAllFlights_WhenNoFlights_ReturnsEmptyList() {
        // Arrange
        when(flightService.findAll()).thenReturn(new ArrayList<>());

        // Act
        ResponseEntity<List<Flight>> response = flightController.getAllFlights();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());

        // Verify service was called
        verify(flightService).findAll();
    }

    @Test
    void getAllFlights_WhenServiceThrowsException_ReturnsInternalServerError() {
        // Arrange
        when(flightService.findAll()).thenThrow(new RuntimeException("Database error"));

        // Act
        ResponseEntity<List<Flight>> response = flightController.getAllFlights();

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNull(response.getBody());

        // Verify service was called
        verify(flightService).findAll();
    }

    @Test
    void getFlightById_WhenFlightExists_ReturnsFlight() {
        // Arrange
        when(flightService.findById(TEST_FLIGHT_ID)).thenReturn(testFlight);

        // Act
        ResponseEntity<Flight> response = flightController.getFlightById(TEST_FLIGHT_ID);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(TEST_FLIGHT_ID, response.getBody().getId());

        // Verify service was called
        verify(flightService).findById(TEST_FLIGHT_ID);
    }

    @Test
    void getFlightById_WhenFlightDoesNotExist_ReturnsNotFound() {
        // Arrange
        when(flightService.findById(TEST_FLIGHT_ID)).thenReturn(null);

        // Act
        ResponseEntity<Flight> response = flightController.getFlightById(TEST_FLIGHT_ID);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        // Verify service was called
        verify(flightService).findById(TEST_FLIGHT_ID);
    }

    @Test
    void addFlight_WithValidFlight_ReturnsCreatedFlight() {
        // Arrange
        Flight newFlight = new Flight();
        newFlight.setName("New Flight");
        newFlight.setOrigin("Origin");
        newFlight.setDestination("Destination");
        newFlight.setPrice(BigDecimal.valueOf(100.0));

        when(flightService.save(newFlight)).thenReturn(testFlight);

        // Act
        ResponseEntity<?> response = flightController.addFlight(newFlight);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Flight);
        assertEquals(TEST_FLIGHT_ID, ((Flight) response.getBody()).getId());

        // Verify service was called
        verify(flightService).save(newFlight);
    }

    @Test
    void addFlight_WithExistingId_ReturnsBadRequest() {
        // Arrange
        Flight flightWithId = new Flight();
        flightWithId.setId(TEST_FLIGHT_ID);
        flightWithId.setName("Flight With ID");

        // Act
        ResponseEntity<?> response = flightController.addFlight(flightWithId);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals("ID must be null for new flight creation.", responseBody.get("error"));

        // Verify service was not called
        verify(flightService, never()).save(any());
    }

    @Test
    void updateFlight_WhenFlightExists_ReturnsUpdatedFlight() {
        // Arrange
        Flight updatedFlight = new Flight();
        updatedFlight.setName("Updated Flight");
        updatedFlight.setOrigin("New Origin");
        updatedFlight.setDestination("New Destination");

        when(flightService.updateFlightById(eq(TEST_FLIGHT_ID), any(Flight.class))).thenReturn(testFlight);

        // Act
        ResponseEntity<?> response = flightController.updateFlight(TEST_FLIGHT_ID, updatedFlight);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Flight);
        assertEquals(TEST_FLIGHT_ID, ((Flight) response.getBody()).getId());

        // Verify service was called
        verify(flightService).updateFlightById(eq(TEST_FLIGHT_ID), any(Flight.class));
    }

    @Test
    void updateFlight_WhenFlightDoesNotExist_ReturnsNotFound() {
        // Arrange
        Flight updatedFlight = new Flight();
        updatedFlight.setName("Updated Flight");

        when(flightService.updateFlightById(eq(TEST_FLIGHT_ID), any(Flight.class))).thenReturn(null);

        // Act
        ResponseEntity<?> response = flightController.updateFlight(TEST_FLIGHT_ID, updatedFlight);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        // Verify service was called
        verify(flightService).updateFlightById(eq(TEST_FLIGHT_ID), any(Flight.class));
    }

    @Test
    void deleteFlight_ReturnsNoContent() {
        // Arrange
        doNothing().when(flightService).deleteFlightById(TEST_FLIGHT_ID);

        // Act
        ResponseEntity<Void> response = flightController.deleteFlight(TEST_FLIGHT_ID);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());

        // Verify service was called
        verify(flightService).deleteFlightById(TEST_FLIGHT_ID);
    }

    @Test
    void searchFlights_WithValidParameters_ReturnsFlights() {
        // Arrange
        String origin = "Origin";
        String destination = "Destination";
        LocalDate departureDate = LocalDate.now();
        LocalDate arrivalDate = LocalDate.now().plusDays(1);
        String tripType = "roundTrip";
        int adults = 2;
        int children = 1;
        int infants = 0;

        List<Flight> foundFlights = new ArrayList<>();
        foundFlights.add(testFlight);

        when(flightService.findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                origin, destination, arrivalDate, departureDate)).thenReturn(foundFlights);

        // Act
        ResponseEntity<List<FlightDTO>> response = flightController.searchFlights(
                origin, destination, departureDate, arrivalDate, tripType, adults, children, infants);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());

        // Verify service was called
        verify(flightService).findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                origin, destination, arrivalDate, departureDate);
    }

    @Test
    void searchFlights_WithOneWayTrip_ReturnsFlights() {
        // Arrange
        String origin = "Origin";
        String destination = "Destination";
        LocalDate departureDate = LocalDate.now();
        String tripType = "oneWay";
        int adults = 1;
        int children = 0;
        int infants = 0;

        List<Flight> foundFlights = new ArrayList<>();
        foundFlights.add(testFlight);

        when(flightService.findByOriginAndDestinationAndDepartureDate(
                origin, destination, departureDate)).thenReturn(foundFlights);

        // Act
        ResponseEntity<List<FlightDTO>> response = flightController.searchFlights(
                origin, destination, departureDate, null, tripType, adults, children, infants);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());

        // Verify service was called
        verify(flightService).findByOriginAndDestinationAndDepartureDate(
                origin, destination, departureDate);
    }

    @Test
    void searchFlights_WithRoundTripButNoArrivalDate_ReturnsBadRequest() {
        // Arrange
        String origin = "Origin";
        String destination = "Destination";
        LocalDate departureDate = LocalDate.now();
        String tripType = "roundTrip";
        int adults = 1;
        int children = 0;
        int infants = 0;

        // Act
        ResponseEntity<List<FlightDTO>> response = flightController.searchFlights(
                origin, destination, departureDate, null, tripType, adults, children, infants);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());

        // Verify service was not called
        verify(flightService, never()).findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                anyString(), anyString(), any(), any());
    }
}