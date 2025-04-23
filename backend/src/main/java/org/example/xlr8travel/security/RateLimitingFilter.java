package org.example.xlr8travel.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Filter to implement rate limiting for sensitive endpoints
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);
    
    // Maximum number of requests allowed in the time window
    private static final int MAX_REQUESTS = 30;
    
    // Time window in milliseconds (1 minute)
    private static final long WINDOW_MS = 60 * 1000;
    
    // List of sensitive endpoints to rate limit
    private static final List<String> RATE_LIMITED_ENDPOINTS = Arrays.asList(
            "/api/login",
            "/api/signup",
            "/api/register",
            "/api/checkout/create-payment-intent",
            "/api/user/me"
    );
    
    // Map to store request counts per IP
    private final Map<String, RequestCount> requestCounts = new ConcurrentHashMap<>();
    
    // Scheduled executor for cleanup
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    public RateLimitingFilter() {
        // Schedule cleanup task to run every minute
        scheduler.scheduleAtFixedRate(this::cleanupOldRequests, 1, 1, TimeUnit.MINUTES);
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Get the request path
        String path = request.getRequestURI();
        
        // Check if the path is rate limited
        if (isRateLimitedEndpoint(path)) {
            // Get the client IP
            String clientIp = getClientIP(request);
            
            // Check if the client has exceeded the rate limit
            if (isRateLimitExceeded(clientIp)) {
                log.warn("Rate limit exceeded for IP: {} on path: {}", clientIp, path);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests. Please try again later.");
                return;
            }
        }
        
        // Continue with the request
        filterChain.doFilter(request, response);
    }
    
    /**
     * Checks if the path is rate limited
     * 
     * @param path The request path
     * @return True if the path is rate limited, false otherwise
     */
    private boolean isRateLimitedEndpoint(String path) {
        return RATE_LIMITED_ENDPOINTS.stream().anyMatch(path::startsWith);
    }
    
    /**
     * Checks if the client has exceeded the rate limit
     * 
     * @param clientIp The client IP
     * @return True if the client has exceeded the rate limit, false otherwise
     */
    private boolean isRateLimitExceeded(String clientIp) {
        long now = System.currentTimeMillis();
        
        // Get or create request count for the client IP
        RequestCount count = requestCounts.computeIfAbsent(clientIp, k -> new RequestCount());
        
        // Check if the time window has expired
        if (now - count.getLastRequestTime() > WINDOW_MS) {
            // Reset the count if the window has expired
            count.setCount(1);
            count.setLastRequestTime(now);
            return false;
        }
        
        // Increment the count
        count.incrementCount();
        count.setLastRequestTime(now);
        
        // Check if the count exceeds the limit
        return count.getCount() > MAX_REQUESTS;
    }
    
    /**
     * Gets the client IP from the request
     * 
     * @param request The HTTP request
     * @return The client IP
     */
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Get the first IP in the list (client IP)
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
    
    /**
     * Cleans up old request counts
     */
    private void cleanupOldRequests() {
        long now = System.currentTimeMillis();
        
        // Remove entries older than the time window
        requestCounts.entrySet().removeIf(entry -> 
            now - entry.getValue().getLastRequestTime() > WINDOW_MS);
    }
    
    /**
     * Class to store request count and last request time
     */
    private static class RequestCount {
        private int count;
        private long lastRequestTime;
        
        public RequestCount() {
            this.count = 0;
            this.lastRequestTime = System.currentTimeMillis();
        }
        
        public int getCount() {
            return count;
        }
        
        public void setCount(int count) {
            this.count = count;
        }
        
        public void incrementCount() {
            this.count++;
        }
        
        public long getLastRequestTime() {
            return lastRequestTime;
        }
        
        public void setLastRequestTime(long lastRequestTime) {
            this.lastRequestTime = lastRequestTime;
        }
    }
    
    @Override
    public void destroy() {
        // Shutdown the scheduler when the filter is destroyed
        scheduler.shutdown();
    }
}