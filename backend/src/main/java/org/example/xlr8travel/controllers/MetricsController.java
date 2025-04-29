package org.example.xlr8travel.controllers;

import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.services.MetricsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private static final Logger log = LoggerFactory.getLogger(MetricsController.class);
    private final MetricsService metricsService;

    /**
     * Get all metrics for the dashboard
     * @return Map containing all metrics
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllMetrics() {
        log.info("Request received for all metrics");
        Map<String, Object> metrics = metricsService.getAllMetrics();
        log.info("Returning {} metrics categories", metrics.size());
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get user metrics
     * @return Map containing user metrics
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserMetrics() {
        log.info("Request received for user metrics");
        Map<String, Object> metrics = metricsService.getUserMetrics();
        log.info("Returning user metrics with {} data points", metrics.size());
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get flight inventory metrics
     * @return Map containing flight inventory metrics
     */
    @GetMapping("/flights")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getFlightInventoryMetrics() {
        log.info("Request received for flight inventory metrics");
        Map<String, Object> metrics = metricsService.getFlightInventoryMetrics();
        log.info("Returning flight inventory metrics with {} data points", metrics.size());
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get booking and revenue metrics
     * @return Map containing booking and revenue metrics
     */
    @GetMapping("/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getBookingRevenueMetrics() {
        log.info("Request received for booking and revenue metrics");
        Map<String, Object> metrics = metricsService.getBookingRevenueMetrics();
        log.info("Returning booking and revenue metrics with {} data points", metrics.size());
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get ticket-specific metrics
     * @return Map containing ticket metrics
     */
    @GetMapping("/tickets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getTicketMetrics() {
        log.info("Request received for ticket metrics");
        Map<String, Object> metrics = metricsService.getTicketMetrics();
        log.info("Returning ticket metrics with {} data points", metrics.size());
        return ResponseEntity.ok(metrics);
    }
}
