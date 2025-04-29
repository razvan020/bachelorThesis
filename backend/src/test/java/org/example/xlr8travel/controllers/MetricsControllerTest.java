package org.example.xlr8travel.controllers;

import org.example.xlr8travel.services.MetricsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

public class MetricsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MetricsService metricsService;

    @InjectMocks
    private MetricsController metricsController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(metricsController).build();
    }

    @Test
    public void testGetAllMetrics() throws Exception {
        // Prepare test data
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalUsers", 100L);
        metrics.put("activeUsers24Hours", 50L);

        // Mock service response
        when(metricsService.getAllMetrics()).thenReturn(metrics);

        // Perform request and verify response
        mockMvc.perform(get("/api/metrics")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testGetUserMetrics() throws Exception {
        // Prepare test data
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalUsers", 100L);
        metrics.put("activeUsers24Hours", 50L);

        // Mock service response
        when(metricsService.getUserMetrics()).thenReturn(metrics);

        // Perform request and verify response
        mockMvc.perform(get("/api/metrics/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testGetFlightInventoryMetrics() throws Exception {
        // Prepare test data
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalFlights", 50L);
        metrics.put("availableFlights", 30L);

        // Mock service response
        when(metricsService.getFlightInventoryMetrics()).thenReturn(metrics);

        // Perform request and verify response
        mockMvc.perform(get("/api/metrics/flights")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testGetBookingRevenueMetrics() throws Exception {
        // Prepare test data
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalBookings", 200L);
        metrics.put("totalRevenue", 15000.0f);

        // Mock service response
        when(metricsService.getBookingRevenueMetrics()).thenReturn(metrics);

        // Perform request and verify response
        mockMvc.perform(get("/api/metrics/bookings")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}