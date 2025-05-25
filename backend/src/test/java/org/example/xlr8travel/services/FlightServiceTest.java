package org.example.xlr8travel.services;

import jakarta.persistence.EntityNotFoundException;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.repositories.FlightRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FlightServiceTest {

    @Mock
    private FlightRepository flightRepository;
    
    @InjectMocks
    private FlightServiceImpl flightService;
    
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
    void save_ShouldReturnSavedFlight() {
        // Arrange
        when(flightRepository.save(any(Flight.class))).thenReturn(testFlight);
        
        // Act
        Flight savedFlight = flightService.save(testFlight);
        
        // Assert
        assertNotNull(savedFlight);
        assertEquals(TEST_FLIGHT_ID, savedFlight.getId());
        assertEquals("Test Flight", savedFlight.getName());
        
        // Verify repository was called
        verify(flightRepository).save(testFlight);
    }
    
    @Test
    void findAll_ShouldReturnAllFlights() {
        // Arrange
        when(flightRepository.findAll()).thenReturn(testFlights);
        
        // Act
        List<Flight> foundFlights = flightService.findAll();
        
        // Assert
        assertNotNull(foundFlights);
        assertEquals(1, foundFlights.size());
        assertEquals(TEST_FLIGHT_ID, foundFlights.get(0).getId());
        
        // Verify repository was called
        verify(flightRepository).findAll();
    }
    
    @Test
    void findById_WhenFlightExists_ShouldReturnFlight() {
        // Arrange
        when(flightRepository.findById(TEST_FLIGHT_ID)).thenReturn(Optional.of(testFlight));
        
        // Act
        Flight foundFlight = flightService.findById(TEST_FLIGHT_ID);
        
        // Assert
        assertNotNull(foundFlight);
        assertEquals(TEST_FLIGHT_ID, foundFlight.getId());
        assertEquals("Test Flight", foundFlight.getName());
        
        // Verify repository was called
        verify(flightRepository).findById(TEST_FLIGHT_ID);
    }
    
    @Test
    void findById_WhenFlightDoesNotExist_ShouldReturnNull() {
        // Arrange
        when(flightRepository.findById(TEST_FLIGHT_ID)).thenReturn(Optional.empty());
        
        // Act
        Flight foundFlight = flightService.findById(TEST_FLIGHT_ID);
        
        // Assert
        assertNull(foundFlight);
        
        // Verify repository was called
        verify(flightRepository).findById(TEST_FLIGHT_ID);
    }
    
    @Test
    void updateFlightById_WhenFlightExists_ShouldReturnUpdatedFlight() {
        // Arrange
        Flight flightToUpdate = new Flight();
        flightToUpdate.setName("Updated Flight");
        flightToUpdate.setOrigin("New Origin");
        flightToUpdate.setDestination("New Destination");
        flightToUpdate.setDepartureDate(LocalDate.now().plusDays(2));
        flightToUpdate.setArrivalDate(LocalDate.now().plusDays(3));
        flightToUpdate.setDepartureTime(LocalTime.of(14, 0));
        flightToUpdate.setArrivalTime(LocalTime.of(16, 0));
        flightToUpdate.setTerminal("B");
        flightToUpdate.setGate("10");
        flightToUpdate.setPrice(BigDecimal.valueOf(150.0));
        
        when(flightRepository.findById(TEST_FLIGHT_ID)).thenReturn(Optional.of(testFlight));
        when(flightRepository.save(any(Flight.class))).thenReturn(testFlight);
        
        // Act
        Flight updatedFlight = flightService.updateFlightById(TEST_FLIGHT_ID, flightToUpdate);
        
        // Assert
        assertNotNull(updatedFlight);
        assertEquals(TEST_FLIGHT_ID, updatedFlight.getId());
        assertEquals("Updated Flight", testFlight.getName());
        assertEquals("New Origin", testFlight.getOrigin());
        assertEquals("New Destination", testFlight.getDestination());
        
        // Verify repository was called
        verify(flightRepository).findById(TEST_FLIGHT_ID);
        verify(flightRepository).save(testFlight);
    }
    
    @Test
    void updateFlightById_WhenFlightDoesNotExist_ShouldThrowEntityNotFoundException() {
        // Arrange
        Flight flightToUpdate = new Flight();
        flightToUpdate.setName("Updated Flight");
        
        when(flightRepository.findById(TEST_FLIGHT_ID)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> {
            flightService.updateFlightById(TEST_FLIGHT_ID, flightToUpdate);
        });
        
        // Verify repository was called
        verify(flightRepository).findById(TEST_FLIGHT_ID);
        verify(flightRepository, never()).save(any(Flight.class));
    }
    
    @Test
    void deleteFlightById_WhenFlightExists_ShouldDeleteFlight() {
        // Arrange
        when(flightRepository.existsById(TEST_FLIGHT_ID)).thenReturn(true);
        doNothing().when(flightRepository).deleteById(TEST_FLIGHT_ID);
        
        // Act
        flightService.deleteFlightById(TEST_FLIGHT_ID);
        
        // Verify repository was called
        verify(flightRepository).existsById(TEST_FLIGHT_ID);
        verify(flightRepository).deleteById(TEST_FLIGHT_ID);
    }
    
    @Test
    void deleteFlightById_WhenFlightDoesNotExist_ShouldThrowEntityNotFoundException() {
        // Arrange
        when(flightRepository.existsById(TEST_FLIGHT_ID)).thenReturn(false);
        
        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> {
            flightService.deleteFlightById(TEST_FLIGHT_ID);
        });
        
        // Verify repository was called
        verify(flightRepository).existsById(TEST_FLIGHT_ID);
        verify(flightRepository, never()).deleteById(any());
    }
    
    @Test
    void findByOriginAndDestinationAndArrivalDateAndDepartureDate_ShouldReturnMatchingFlights() {
        // Arrange
        String origin = "Origin";
        String destination = "Destination";
        LocalDate departureDate = LocalDate.now();
        LocalDate arrivalDate = LocalDate.now().plusDays(1);
        
        when(flightRepository.findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                origin, destination, arrivalDate, departureDate)).thenReturn(testFlights);
        
        // Act
        List<Flight> foundFlights = flightService.findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                origin, destination, arrivalDate, departureDate);
        
        // Assert
        assertNotNull(foundFlights);
        assertEquals(1, foundFlights.size());
        assertEquals(TEST_FLIGHT_ID, foundFlights.get(0).getId());
        
        // Verify repository was called
        verify(flightRepository).findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                origin, destination, arrivalDate, departureDate);
    }
    
    @Test
    void findByOriginAndDestinationAndDepartureDate_ShouldReturnMatchingFlights() {
        // Arrange
        String origin = "Origin";
        String destination = "Destination";
        LocalDate departureDate = LocalDate.now();
        
        when(flightRepository.findByOriginAndDestinationAndDepartureDate(
                origin, destination, departureDate)).thenReturn(testFlights);
        
        // Act
        List<Flight> foundFlights = flightService.findByOriginAndDestinationAndDepartureDate(
                origin, destination, departureDate);
        
        // Assert
        assertNotNull(foundFlights);
        assertEquals(1, foundFlights.size());
        assertEquals(TEST_FLIGHT_ID, foundFlights.get(0).getId());
        
        // Verify repository was called
        verify(flightRepository).findByOriginAndDestinationAndDepartureDate(
                origin, destination, departureDate);
    }
    
    @Test
    void findByOriginAndDepartureDateAfter_ShouldReturnMatchingFlights() {
        // Arrange
        String origin = "Origin";
        LocalDate departureDate = LocalDate.now();
        
        when(flightRepository.findByOriginAndDepartureDateAfter(
                origin, departureDate)).thenReturn(testFlights);
        
        // Act
        List<Flight> foundFlights = flightService.findByOriginAndDepartureDateAfter(
                origin, departureDate);
        
        // Assert
        assertNotNull(foundFlights);
        assertEquals(1, foundFlights.size());
        assertEquals(TEST_FLIGHT_ID, foundFlights.get(0).getId());
        
        // Verify repository was called
        verify(flightRepository).findByOriginAndDepartureDateAfter(
                origin, departureDate);
    }
}