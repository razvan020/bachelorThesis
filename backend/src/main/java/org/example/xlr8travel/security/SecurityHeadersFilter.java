package org.example.xlr8travel.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Filter to add security headers to HTTP responses
 */
@Component
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Add security headers
        // X-Content-Type-Options: Prevents MIME type sniffing
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");
        
        // X-Frame-Options: Prevents clickjacking
        httpResponse.setHeader("X-Frame-Options", "DENY");
        
        // X-XSS-Protection: Enables XSS filtering in browsers
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
        
        // Content-Security-Policy: Restricts resources that can be loaded
        httpResponse.setHeader("Content-Security-Policy", 
                "default-src 'self'; " +
                "script-src 'self'; " +
                "img-src 'self' data:; " +
                "style-src 'self' 'unsafe-inline'; " +
                "connect-src 'self'");
        
        // Strict-Transport-Security: Forces HTTPS
        httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        
        // Referrer-Policy: Controls information in the Referer header
        httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        
        // Permissions-Policy: Controls browser features
        httpResponse.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
        
        chain.doFilter(request, response);
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