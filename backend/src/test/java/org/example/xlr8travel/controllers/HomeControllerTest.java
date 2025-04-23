package org.example.xlr8travel.controllers;

import org.example.xlr8travel.models.Country;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.repositories.CountryRepository;
import org.example.xlr8travel.services.CountryService;
import org.example.xlr8travel.services.FlightService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ui.Model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class HomeControllerTest {

    @Mock
    private CountryRepository countryRepository;

    @Mock
    private CountryService countryService;

    @Mock
    private FlightService flightService;

    @Mock
    private Model model;

    @InjectMocks
    private HomeController homeController;

    private List<String> countryNames;
    private List<Country> countries;
    private List<Flight> flights;
    private Country testCountry;
    private Flight testFlight;
    private final String TEST_ORIGIN = "Origin";
    private final String TEST_DESTINATION = "Destination";
    private final LocalDate TEST_DEPARTURE_DATE = LocalDate.now();
    private final LocalDate TEST_ARRIVAL_DATE = LocalDate.now().plusDays(1);

    @BeforeEach
    void setUp() {
        // Create test country names
        countryNames = new ArrayList<>();
        countryNames.add("Romania");
        countryNames.add("Italy");
        countryNames.add("France");

        // Create test countries
        countries = new ArrayList<>();
        testCountry = new Country();
        testCountry.setId(1L);
        testCountry.setName("Romania");
        countries.add(testCountry);

        // Create test flight
        testFlight = new Flight();
        testFlight.setId(1L);
        testFlight.setName("Test Flight");
        testFlight.setOrigin(TEST_ORIGIN);
        testFlight.setDestination(TEST_DESTINATION);
        testFlight.setDepartureDate(TEST_DEPARTURE_DATE);
        testFlight.setArrivalDate(TEST_ARRIVAL_DATE);
        testFlight.setDepartureTime(LocalTime.of(10, 0));
        testFlight.setArrivalTime(LocalTime.of(12, 0));
        testFlight.setPrice(BigDecimal.valueOf(100.0));

        // Create test flights list
        flights = new ArrayList<>();
        flights.add(testFlight);
    }

    @Test
    void getSelectCountry_WithTerm_ReturnsMatchingCountries() {
        // Arrange
        String term = "Rom";
        when(countryService.search(term)).thenReturn(countryNames);

        // Act
        List<String> result = homeController.getSelectCountry(term);

        // Assert
        assertEquals(countryNames, result);
        verify(countryService).search(term);
    }

    @Test
    void getFlights_WithValidParameters_ReturnsFlights() {
        // Arrange
        when(flightService.findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                TEST_ORIGIN, TEST_DESTINATION, TEST_ARRIVAL_DATE, TEST_DEPARTURE_DATE))
                .thenReturn(flights);

        // Act
        List<Flight> result = homeController.getFlights(
                TEST_ORIGIN, TEST_DESTINATION, TEST_ARRIVAL_DATE, TEST_DEPARTURE_DATE);

        // Assert
        assertEquals(flights, result);
        verify(flightService).findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                TEST_ORIGIN, TEST_DESTINATION, TEST_ARRIVAL_DATE, TEST_DEPARTURE_DATE);
    }

    @Test
    void getAvailableFlights_Post_WithValidParameters_ReturnsFlightsView() {
        // Arrange
        when(flightService.findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                TEST_ORIGIN, TEST_DESTINATION, TEST_ARRIVAL_DATE, TEST_DEPARTURE_DATE))
                .thenReturn(flights);

        // Act
        String viewName = homeController.getAvailableFlights(
                TEST_ORIGIN, TEST_DESTINATION, TEST_ARRIVAL_DATE, TEST_DEPARTURE_DATE, model);

        // Assert
        assertEquals("flights", viewName);
        verify(model).addAttribute("availableFlights", flights);
        verify(flightService).findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                TEST_ORIGIN, TEST_DESTINATION, TEST_ARRIVAL_DATE, TEST_DEPARTURE_DATE);
    }

    @Test
    void getAvailableFlights_Get_WithValidParameters_ReturnsFlightsView() {
        // Arrange
        when(flightService.findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                TEST_ORIGIN, TEST_DESTINATION, TEST_ARRIVAL_DATE, TEST_DEPARTURE_DATE))
                .thenReturn(flights);

        // Act
        String viewName = homeController.getAvailableFlights2(
                TEST_ORIGIN, TEST_DESTINATION, TEST_ARRIVAL_DATE, TEST_DEPARTURE_DATE, model);

        // Assert
        assertEquals("flights", viewName);
        verify(model).addAttribute("availableFlights", flights);
        verify(flightService).findByOriginAndDestinationAndArrivalDateAndDepartureDate(
                TEST_ORIGIN, TEST_DESTINATION, TEST_ARRIVAL_DATE, TEST_DEPARTURE_DATE);
    }

    @Test
    void selectCountry_WithValidCountry_RedirectsToIndex() {
        // Arrange
        Country country = new Country();
        country.setName("Romania");

        // Act
        String viewName = homeController.selectCountry(country, model);

        // Assert
        assertEquals("redirect:index", viewName);
        verify(model).addAttribute("selectedCountryName", country.getName());
        verify(model).addAttribute("country", country);
        verify(countryRepository).findAll();
    }

    @Test
    void list2_ReturnsIndexView() {
        // Act
        String viewName = homeController.list2(model);

        // Assert
        assertEquals("index", viewName);
    }
}