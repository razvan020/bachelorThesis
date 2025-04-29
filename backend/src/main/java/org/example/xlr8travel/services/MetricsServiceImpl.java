package org.example.xlr8travel.services;

import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.models.TicketStatus;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.repositories.FlightRepository;
import org.example.xlr8travel.repositories.TicketRepository;
import org.example.xlr8travel.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MetricsServiceImpl implements MetricsService {

    private final UserRepository userRepository;
    private final FlightRepository flightRepository;
    private final TicketRepository ticketRepository;
    private final UserService userService;

    @Override
    public Map<String, Object> getUserMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // Calculate dates for metrics
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterday = now.minus(24, ChronoUnit.HOURS);
        LocalDateTime sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);
        LocalDateTime thirtyDaysAgo = now.minus(30, ChronoUnit.DAYS);

        // Get user counts
        long totalUsers = userRepository.count();
        long activeUsers24Hours = userRepository.countActiveUsersAfter(yesterday);
        long newSignups7Days = userRepository.countUsersCreatedAfter(sevenDaysAgo);
        long newSignups30Days = userRepository.countUsersCreatedAfter(thirtyDaysAgo);

        // Calculate growth rates
        LocalDateTime twoDaysAgo = now.minus(48, ChronoUnit.HOURS);
        LocalDateTime fourteenDaysAgo = now.minus(14, ChronoUnit.DAYS);
        LocalDateTime sixtyDaysAgo = now.minus(60, ChronoUnit.DAYS);

        long prevActiveUsers = userRepository.countActiveUsersAfter(twoDaysAgo) - activeUsers24Hours;
        long prevNewSignups7Days = userRepository.countUsersCreatedAfter(fourteenDaysAgo) - newSignups7Days;
        long prevNewSignups30Days = userRepository.countUsersCreatedAfter(sixtyDaysAgo) - newSignups30Days;

        double activeUsersGrowthRate = calculateGrowthRate(activeUsers24Hours, prevActiveUsers);
        double newSignups7DaysGrowthRate = calculateGrowthRate(newSignups7Days, prevNewSignups7Days);
        double newSignups30DaysGrowthRate = calculateGrowthRate(newSignups30Days, prevNewSignups30Days);

        // Add metrics to map
        metrics.put("totalUsers", totalUsers);
        metrics.put("activeUsers24Hours", activeUsers24Hours);
        metrics.put("newSignups7Days", newSignups7Days);
        metrics.put("newSignups30Days", newSignups30Days);
        metrics.put("activeUsersGrowthRate", activeUsersGrowthRate);
        metrics.put("newSignups7DaysGrowthRate", newSignups7DaysGrowthRate);
        metrics.put("newSignups30DaysGrowthRate", newSignups30DaysGrowthRate);

        return metrics;
    }

    @Override
    public Map<String, Object> getFlightInventoryMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // Calculate dates for metrics
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAhead = today.plus(7, ChronoUnit.DAYS);
        LocalDate sevenDaysAgo = today.minus(7, ChronoUnit.DAYS);

        // Get flight counts
        long totalFlights = flightRepository.count();
        long availableFlights = flightRepository.countAvailableFlights();
        long fullyBookedFlights = flightRepository.countFullyBookedFlights();
        long upcomingFlights7Days = flightRepository.findByDepartureDateBetween(today, sevenDaysAhead).size();
        long flightsAdded7Days = flightRepository.countFlightsAddedAfter(LocalDateTime.of(sevenDaysAgo, LocalDateTime.now().toLocalTime()));

        // Add metrics to map
        metrics.put("totalFlights", totalFlights);
        metrics.put("availableFlights", availableFlights);
        metrics.put("fullyBookedFlights", fullyBookedFlights);
        metrics.put("upcomingFlights7Days", upcomingFlights7Days);
        metrics.put("flightsAdded7Days", flightsAdded7Days);

        return metrics;
    }

    @Override
    public Map<String, Object> getBookingRevenueMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // Calculate dates for metrics
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);
        LocalDateTime thirtyDaysAgo = now.minus(30, ChronoUnit.DAYS);

        // Get booking counts
        long totalBookings = ticketRepository.count();
        long bookingsLast7Days = ticketRepository.countTicketsCreatedAfter(sevenDaysAgo);
        long bookingsLast30Days = ticketRepository.countTicketsCreatedAfter(thirtyDaysAgo);

        // Get revenue metrics
        float totalRevenue = ticketRepository.sumTicketPrices();
        float averageTicketPrice = ticketRepository.averageTicketPrice();

        // Get bookings per day and week
        Map<String, Long> bookingsCreatedDaily = new HashMap<>();
        ticketRepository.countTicketsPerDay().forEach(row -> {
            bookingsCreatedDaily.put(row[0].toString(), (Long) row[1]);
        });

        Map<String, Long> bookingsCreatedWeekly = new HashMap<>();
        ticketRepository.countTicketsPerWeek().forEach(row -> {
            bookingsCreatedWeekly.put(row[0].toString(), (Long) row[1]);
        });

        // Calculate conversion and abandonment rates (placeholder values)
        double conversionRate = 0.15; // 15% conversion rate
        double cartAbandonmentRate = 0.25; // 25% abandonment rate

        // Add metrics to map
        metrics.put("totalBookings", totalBookings);
        metrics.put("bookingsLast7Days", bookingsLast7Days);
        metrics.put("bookingsLast30Days", bookingsLast30Days);
        metrics.put("totalRevenue", totalRevenue);
        metrics.put("averageTicketPrice", averageTicketPrice);
        metrics.put("bookingsCreatedDaily", bookingsCreatedDaily);
        metrics.put("bookingsCreatedWeekly", bookingsCreatedWeekly);
        metrics.put("conversionRate", conversionRate);
        metrics.put("cartAbandonmentRate", cartAbandonmentRate);

        return metrics;
    }

    @Override
    public Map<String, Object> getTicketMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // Calculate dates for metrics
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);
        LocalDateTime thirtyDaysAgo = now.minus(30, ChronoUnit.DAYS);

        // Get ticket counts by status
        Map<String, Long> ticketsByStatus = new HashMap<>();
        for (TicketStatus status : TicketStatus.values()) {
            long count = ticketRepository.countByTicketStatus(status);
            ticketsByStatus.put(status.name(), count);
        }

        // Calculate percentages
        long totalTickets = ticketRepository.count();
        Map<String, Double> ticketStatusPercentages = new HashMap<>();
        for (TicketStatus status : TicketStatus.values()) {
            long count = ticketRepository.countByTicketStatus(status);
            double percentage = totalTickets > 0 ? ((double) count / totalTickets) * 100 : 0;
            ticketStatusPercentages.put(status.name(), Math.round(percentage * 100.0) / 100.0); // Round to 2 decimal places
        }

        // Get recent ticket activity
        long ticketsCreatedLast7Days = ticketRepository.countTicketsCreatedAfter(sevenDaysAgo);
        long ticketsCreatedLast30Days = ticketRepository.countTicketsCreatedAfter(thirtyDaysAgo);

        // Calculate growth rates
        LocalDateTime fourteenDaysAgo = now.minus(14, ChronoUnit.DAYS);
        LocalDateTime sixtyDaysAgo = now.minus(60, ChronoUnit.DAYS);

        long prevTicketsCreated7Days = ticketRepository.countTicketsCreatedAfter(fourteenDaysAgo) - ticketsCreatedLast7Days;
        long prevTicketsCreated30Days = ticketRepository.countTicketsCreatedAfter(sixtyDaysAgo) - ticketsCreatedLast30Days;

        double ticketsCreated7DaysGrowthRate = calculateGrowthRate(ticketsCreatedLast7Days, prevTicketsCreated7Days);
        double ticketsCreated30DaysGrowthRate = calculateGrowthRate(ticketsCreatedLast30Days, prevTicketsCreated30Days);

        // Get specific metrics for checked-in tickets and boarding passes
        long checkedInTickets = ticketRepository.countByTicketStatus(TicketStatus.TICKET_STATUS_CHECKED_IN);
        double checkedInPercentage = totalTickets > 0 ? ((double) checkedInTickets / totalTickets) * 100 : 0;
        checkedInPercentage = Math.round(checkedInPercentage * 100.0) / 100.0; // Round to 2 decimal places

        // Calculate growth rate for checked-in tickets
        long prevCheckedInTickets = 0; // We don't have historical data, so we'll assume 0 for now
        double checkedInGrowthRate = calculateGrowthRate(checkedInTickets, prevCheckedInTickets);

        // Add metrics to map
        metrics.put("totalTickets", totalTickets);
        metrics.put("ticketsByStatus", ticketsByStatus);
        metrics.put("ticketStatusPercentages", ticketStatusPercentages);
        metrics.put("ticketsCreatedLast7Days", ticketsCreatedLast7Days);
        metrics.put("ticketsCreatedLast30Days", ticketsCreatedLast30Days);
        metrics.put("ticketsCreated7DaysGrowthRate", ticketsCreated7DaysGrowthRate);
        metrics.put("ticketsCreated30DaysGrowthRate", ticketsCreated30DaysGrowthRate);

        // Add specific metrics for checked-in tickets and boarding passes
        metrics.put("checkedInTickets", checkedInTickets);
        metrics.put("checkedInPercentage", checkedInPercentage);
        metrics.put("checkedInGrowthRate", checkedInGrowthRate);
        metrics.put("boardingPasses", checkedInTickets); // In this application, a boarding pass is a checked-in ticket

        return metrics;
    }

    @Override
    public Map<String, Object> getAllMetrics() {
        Map<String, Object> allMetrics = new HashMap<>();

        allMetrics.put("userMetrics", getUserMetrics());
        allMetrics.put("flightInventoryMetrics", getFlightInventoryMetrics());
        allMetrics.put("bookingRevenueMetrics", getBookingRevenueMetrics());
        allMetrics.put("ticketMetrics", getTicketMetrics());

        return allMetrics;
    }

    @Override
    public void updateLastLogin(String username) {
        User user = userService.findByUsername(username);
        if (user != null) {
            user.setLastLogin(LocalDateTime.now());
            userService.save(user);
        }
    }

    private double calculateGrowthRate(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((double) (current - previous) / previous) * 100.0;
    }
}
