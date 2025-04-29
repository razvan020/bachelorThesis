package org.example.xlr8travel.services;

import java.util.Map;

/**
 * Service interface for retrieving application metrics
 */
public interface MetricsService {

    /**
     * Get user-related metrics
     * @return Map containing user metrics
     */
    Map<String, Object> getUserMetrics();

    /**
     * Get flight inventory metrics
     * @return Map containing flight inventory metrics
     */
    Map<String, Object> getFlightInventoryMetrics();

    /**
     * Get booking and revenue metrics
     * @return Map containing booking and revenue metrics
     */
    Map<String, Object> getBookingRevenueMetrics();

    /**
     * Get ticket-specific metrics
     * @return Map containing ticket metrics
     */
    Map<String, Object> getTicketMetrics();

    /**
     * Get all metrics in a single map
     * @return Map containing all metrics
     */
    Map<String, Object> getAllMetrics();

    /**
     * Update the last login time for a user
     * @param username the username of the user
     */
    void updateLastLogin(String username);
}
