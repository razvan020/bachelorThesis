package org.example.xlr8travel.utils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Utility class providing helper methods for travel-related calculations and formatting.
 */
public class TravelUtils {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm", Locale.ENGLISH);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm", Locale.ENGLISH);

    /**
     * Private constructor to prevent instantiation of utility class.
     */
    private TravelUtils() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Calculates the duration between two LocalDateTime objects and formats it as a human-readable string.
     * 
     * @param start The start time
     * @param end The end time
     * @return A formatted string representing the duration (e.g., "2h 15m")
     */
    public static String formatDuration(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return "N/A";
        }
        
        Duration duration = Duration.between(start, end);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        
        if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else {
            return String.format("%dm", minutes);
        }
    }

    /**
     * Formats a LocalDateTime object as a date string.
     * 
     * @param dateTime The LocalDateTime to format
     * @return A formatted date string (e.g., "Jan 15, 2023")
     */
    public static String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "N/A";
        }
        return dateTime.format(DATE_FORMATTER);
    }

    /**
     * Formats a LocalDateTime object as a time string.
     * 
     * @param dateTime The LocalDateTime to format
     * @return A formatted time string (e.g., "14:30")
     */
    public static String formatTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "N/A";
        }
        return dateTime.format(TIME_FORMATTER);
    }

    /**
     * Formats a LocalDateTime object as a date and time string.
     * 
     * @param dateTime The LocalDateTime to format
     * @return A formatted date and time string (e.g., "Jan 15, 2023 14:30")
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "N/A";
        }
        return dateTime.format(DATE_TIME_FORMATTER);
    }

    /**
     * Calculates the price with applied discount.
     * 
     * @param originalPrice The original price
     * @param discountPercentage The discount percentage (0-100)
     * @return The price after discount
     */
    public static double calculateDiscountedPrice(double originalPrice, double discountPercentage) {
        if (discountPercentage < 0 || discountPercentage > 100) {
            throw new IllegalArgumentException("Discount percentage must be between 0 and 100");
        }
        
        return originalPrice * (1 - (discountPercentage / 100.0));
    }

    /**
     * Checks if a flight is considered delayed based on the scheduled and actual departure times.
     * 
     * @param scheduledDeparture The scheduled departure time
     * @param actualDeparture The actual departure time
     * @param delayThresholdMinutes The threshold in minutes to consider a flight delayed (default: 15)
     * @return true if the flight is delayed, false otherwise
     */
    public static boolean isFlightDelayed(LocalDateTime scheduledDeparture, LocalDateTime actualDeparture, int delayThresholdMinutes) {
        if (scheduledDeparture == null || actualDeparture == null) {
            return false;
        }
        
        Duration delay = Duration.between(scheduledDeparture, actualDeparture);
        return delay.toMinutes() > delayThresholdMinutes;
    }

    /**
     * Overloaded method that uses the default delay threshold of 15 minutes.
     */
    public static boolean isFlightDelayed(LocalDateTime scheduledDeparture, LocalDateTime actualDeparture) {
        return isFlightDelayed(scheduledDeparture, actualDeparture, 15);
    }

    /**
     * Calculates the carbon footprint estimate for a flight based on distance.
     * 
     * @param distanceKm The distance in kilometers
     * @return The estimated carbon footprint in kg of CO2
     */
    public static double calculateCarbonFootprint(double distanceKm) {
        // Average emission factor for air travel (kg CO2 per passenger per km)
        final double emissionFactor = 0.115;
        return distanceKm * emissionFactor;
    }
}