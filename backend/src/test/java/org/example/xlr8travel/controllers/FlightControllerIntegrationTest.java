package org.example.xlr8travel.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.xlr8travel.dto.FlightDTO;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.services.FlightService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class FlightControllerIntegrationTest {

    private MockMvc mockMvc;

    @Mock
    private FlightService flightService;

    @InjectMocks
    private FlightController flightController;

    private ObjectMapper objectMapper = new ObjectMapper();

    private Flight testFlight;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @BeforeEach
    void setUp() {
        // Set up MockMvc
        mockMvc = MockMvcBuilders.standaloneSetup(flightController).build();

        // Configure ObjectMapper for Java 8 date/time
        objectMapper.findAndRegisterModules();

        // Create test flight
        testFlight = new Flight();
        testFlight.setId(1L);
        testFlight.setName("Integration Test Flight");
        testFlight.setOrigin("TestOrigin");
        testFlight.setDestination("TestDestination");
        testFlight.setDepartureDate(LocalDate.now());
        testFlight.setArrivalDate(LocalDate.now().plusDays(1));
        testFlight.setDepartureTime(LocalTime.of(10, 0));
        testFlight.setArrivalTime(LocalTime.of(12, 0));
        testFlight.setTerminal("A");
        testFlight.setGate("1");
        testFlight.setPrice(BigDecimal.valueOf(100.0));
        testFlight.setLastUpdated(LocalDateTime.now());
        testFlight.setAvailableSeats(100);
        testFlight.setTotalSeats(180);
    }

    @Test
    void getAllFlights_ShouldReturnAllFlights() throws Exception {
        // Mock the service to return a list with our test flight
        List<Flight> flights = new ArrayList<>();
        flights.add(testFlight);
        when(flightService.findAll()).thenReturn(flights);

        mockMvc.perform(get("/api/flights"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Integration Test Flight")));
    }

    @Test
    void getFlightById_WhenFlightExists_ShouldReturnFlight() throws Exception {
        // Mock the service to return our test flight
        when(flightService.findById(testFlight.getId())).thenReturn(testFlight);

        mockMvc.perform(get("/api/flights/{id}", testFlight.getId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(testFlight.getId().intValue())))
                .andExpect(jsonPath("$.name", is("Integration Test Flight")));
    }

    @Test
    void getFlightById_WhenFlightDoesNotExist_ShouldReturnNotFound() throws Exception {
        // Mock the service to return null for a non-existent ID
        when(flightService.findById(999L)).thenReturn(null);

        mockMvc.perform(get("/api/flights/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    void addFlight_WithValidFlight_ShouldReturnCreatedFlight() throws Exception {
        // Create a new flight to be saved
        Flight newFlight = new Flight();
        newFlight.setName("New Integration Flight");
        newFlight.setOrigin("NewOrigin");
        newFlight.setDestination("NewDestination");
        newFlight.setDepartureDate(LocalDate.now().plusDays(2));
        newFlight.setArrivalDate(LocalDate.now().plusDays(3));
        newFlight.setDepartureTime(LocalTime.of(14, 0));
        newFlight.setArrivalTime(LocalTime.of(16, 0));
        newFlight.setTerminal("B");
        newFlight.setGate("2");
        newFlight.setPrice(BigDecimal.valueOf(150.0));

        // Create a saved flight with ID to be returned by the service
        Flight savedFlight = new Flight();
        savedFlight.setId(2L);
        savedFlight.setName("New Integration Flight");
        savedFlight.setOrigin("NewOrigin");
        savedFlight.setDestination("NewDestination");
        savedFlight.setDepartureDate(LocalDate.now().plusDays(2));
        savedFlight.setArrivalDate(LocalDate.now().plusDays(3));
        savedFlight.setDepartureTime(LocalTime.of(14, 0));
        savedFlight.setArrivalTime(LocalTime.of(16, 0));
        savedFlight.setTerminal("B");
        savedFlight.setGate("2");
        savedFlight.setPrice(BigDecimal.valueOf(150.0));

        // Mock the service to return the saved flight
        when(flightService.save(any(Flight.class))).thenReturn(savedFlight);

        MvcResult result = mockMvc.perform(post("/api/flights")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newFlight)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name", is("New Integration Flight")))
                .andReturn();

        // Verify the response contains the saved flight
        String responseContent = result.getResponse().getContentAsString();
        Flight responseFlight = objectMapper.readValue(responseContent, Flight.class);
        assertNotNull(responseFlight.getId());
        assertEquals("New Integration Flight", responseFlight.getName());
    }

    @Test
    void updateFlight_WhenFlightExists_ShouldReturnUpdatedFlight() throws Exception {
        // Create a flight to update
        Flight flightToUpdate = new Flight();
        flightToUpdate.setName("Updated Integration Flight");
        flightToUpdate.setOrigin("UpdatedOrigin");
        flightToUpdate.setDestination("UpdatedDestination");
        flightToUpdate.setDepartureDate(LocalDate.now().plusDays(4));
        flightToUpdate.setArrivalDate(LocalDate.now().plusDays(5));
        flightToUpdate.setDepartureTime(LocalTime.of(18, 0));
        flightToUpdate.setArrivalTime(LocalTime.of(20, 0));
        flightToUpdate.setTerminal("C");
        flightToUpdate.setGate("3");
        flightToUpdate.setPrice(BigDecimal.valueOf(200.0));

        // Create an updated flight to be returned by the service
        Flight updatedFlight = new Flight();
        updatedFlight.setId(testFlight.getId());
        updatedFlight.setName("Updated Integration Flight");
        updatedFlight.setOrigin("UpdatedOrigin");
        updatedFlight.setDestination("UpdatedDestination");
        updatedFlight.setDepartureDate(LocalDate.now().plusDays(4));
        updatedFlight.setArrivalDate(LocalDate.now().plusDays(5));
        updatedFlight.setDepartureTime(LocalTime.of(18, 0));
        updatedFlight.setArrivalTime(LocalTime.of(20, 0));
        updatedFlight.setTerminal("C");
        updatedFlight.setGate("3");
        updatedFlight.setPrice(BigDecimal.valueOf(200.0));

        // Mock the service to return the updated flight
        when(flightService.updateFlightById(eq(testFlight.getId()), any(Flight.class))).thenReturn(updatedFlight);

        mockMvc.perform(put("/api/flights/{id}", testFlight.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(flightToUpdate)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(testFlight.getId().intValue())))
                .andExpect(jsonPath("$.name", is("Updated Integration Flight")));
    }

    @Test
    void deleteFlight_WhenFlightExists_ShouldDeleteFlight() throws Exception {
        // Mock the service's deleteFlightById method (void return type)
        doNothing().when(flightService).deleteFlightById(testFlight.getId());

        mockMvc.perform(delete("/api/flights/{id}", testFlight.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void searchFlights_ShouldReturnMatchingFlights() throws Exception {
        String origin = "TestOrigin";
        String destination = "TestDestination";
        LocalDate departureDate = testFlight.getDepartureDate();
        String departureDateStr = departureDate.format(dateFormatter);

        // Create a list of flights to be returned by the service
        List<Flight> flights = new ArrayList<>();
        flights.add(testFlight);

        // Mock the service to return our test flights for one-way search
        when(flightService.findByOriginAndDestinationAndDepartureDate(origin, destination, departureDate))
            .thenReturn(flights);

        // Create a FlightDTO that would be returned in the response
        List<FlightDTO> flightDTOs = new ArrayList<>();
        FlightDTO flightDTO = new FlightDTO();
        flightDTO.setId(testFlight.getId());
        flightDTO.setName(testFlight.getName());
        flightDTO.setOrigin(testFlight.getOrigin());
        flightDTO.setDestination(testFlight.getDestination());
        flightDTO.setDepartureDate(testFlight.getDepartureDate());
        flightDTO.setArrivalDate(testFlight.getArrivalDate());
        flightDTO.setDepartureTime(testFlight.getDepartureTime());
        flightDTO.setArrivalTime(testFlight.getArrivalTime());
        flightDTO.setPrice(testFlight.getPrice());
        flightDTOs.add(flightDTO);

        mockMvc.perform(get("/api/flights/search")
                .param("origin", origin)
                .param("destination", destination)
                .param("departureDate", departureDateStr)
                .param("tripType", "oneWay"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Integration Test Flight")));
    }

    @Test
    void nearbyFlights_ShouldReturnMatchingFlights() throws Exception {
        String origin = "TestOrigin";
        LocalDate departureDate = testFlight.getDepartureDate();
        String departureDateStr = departureDate.format(dateFormatter);

        // Create a list of flights to be returned by the service
        List<Flight> flights = new ArrayList<>();
        flights.add(testFlight);

        // Mock the service to return our test flights for nearby flights search
        when(flightService.findByOriginAndDepartureDateAfter(origin, departureDate))
            .thenReturn(flights);

        // Create a FlightDTO that would be returned in the response
        List<FlightDTO> flightDTOs = new ArrayList<>();
        FlightDTO flightDTO = new FlightDTO();
        flightDTO.setId(testFlight.getId());
        flightDTO.setName(testFlight.getName());
        flightDTO.setOrigin(testFlight.getOrigin());
        flightDTO.setDestination(testFlight.getDestination());
        flightDTO.setDepartureDate(testFlight.getDepartureDate());
        flightDTO.setArrivalDate(testFlight.getArrivalDate());
        flightDTO.setDepartureTime(testFlight.getDepartureTime());
        flightDTO.setArrivalTime(testFlight.getArrivalTime());
        flightDTO.setPrice(testFlight.getPrice());
        flightDTOs.add(flightDTO);

        mockMvc.perform(get("/api/flights/nearby")
                .param("origin", origin)
                .param("departureDate", departureDateStr))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Integration Test Flight")));
    }
}
