package org.example.xlr8travel.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter to add a unique request ID to each request
 * This helps with traceability in logs
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter implements Filter {

    private static final String REQUEST_ID_HEADER_NAME = "X-Request-ID";
    private static final String REQUEST_ID_MDC_KEY = "requestId";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        try {
            // Get request ID from header or generate a new one
            String requestId = httpRequest.getHeader(REQUEST_ID_HEADER_NAME);
            if (requestId == null || requestId.isEmpty()) {
                requestId = generateRequestId();
            }
            
            // Add request ID to MDC for logging
            MDC.put(REQUEST_ID_MDC_KEY, requestId);
            
            // Add request ID to response header
            httpResponse.setHeader(REQUEST_ID_HEADER_NAME, requestId);
            
            // Continue with the request
            chain.doFilter(request, response);
        } finally {
            // Clear MDC to prevent memory leaks
            MDC.remove(REQUEST_ID_MDC_KEY);
        }
    }
    
    /**
     * Generates a unique request ID
     * 
     * @return A unique request ID
     */
    private String generateRequestId() {
        return UUID.randomUUID().toString();
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialization code if needed
    }

    @Override
    public void destroy() {
        // Cleanup code if needed
    }
}