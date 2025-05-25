package org.example.xlr8travel.config;

import com.stripe.exception.CardException;
import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.example.xlr8travel.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the application
 * Provides consistent error responses across all controllers
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle general exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception occurred", ex);
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again later.",
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle validation exceptions
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation error: {}", errors);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Validation failed: " + errors,
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle entity not found exceptions
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFoundException(
            EntityNotFoundException ex, HttpServletRequest request) {
        log.warn("Entity not found: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle response status exceptions
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(
            ResponseStatusException ex, HttpServletRequest request) {
        log.warn("Response status exception: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.valueOf(ex.getStatusCode().value()),
                ex.getReason(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorResponse, ex.getStatusCode());
    }

    /**
     * Handle Stripe card exceptions
     */
    @ExceptionHandler(CardException.class)
    public ResponseEntity<ErrorResponse> handleCardException(
            CardException ex, HttpServletRequest request) {
        log.error("Stripe card error: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Payment error: " + ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle Stripe invalid request exceptions
     */
    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRequestException(
            InvalidRequestException ex, HttpServletRequest request) {
        log.error("Stripe invalid request: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Invalid payment request: " + ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle Stripe signature verification exceptions
     */
    @ExceptionHandler(SignatureVerificationException.class)
    public ResponseEntity<ErrorResponse> handleSignatureVerificationException(
            SignatureVerificationException ex, HttpServletRequest request) {
        log.error("Stripe signature verification failed: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Webhook signature verification failed",
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle other Stripe exceptions
     */
    @ExceptionHandler(StripeException.class)
    public ResponseEntity<ErrorResponse> handleStripeException(
            StripeException ex, HttpServletRequest request) {
        log.error("Stripe error: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Payment processing error. Please try again later.",
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle NoResourceFoundException - occurs when a static resource is not found
     * but the request might be intended for a controller endpoint
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException(
            NoResourceFoundException ex, HttpServletRequest request) {
        log.warn("No resource found: {}", ex.getMessage());

        String requestURI = request.getRequestURI();

        // Check if this is an API request that should be handled by a controller
        // Handle both with and without leading slash
        if (requestURI.startsWith("/api/") || requestURI.startsWith("api/")) {
            // For requests without leading slash, add it
            if (requestURI.startsWith("api/")) {
                requestURI = "/" + requestURI;
            }

            log.info("Redirecting API request to: {}", requestURI);

            // Forward to the appropriate controller by redirecting
            return ResponseEntity.status(HttpStatus.TEMPORARY_REDIRECT)
                    .header("Location", requestURI)
                    .build();
        }

        // For non-API requests, return a 404 Not Found
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.NOT_FOUND,
                "Resource not found: " + requestURI,
                requestURI
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle HttpRequestMethodNotSupportedException - occurs when the request method is not supported
     * for the requested endpoint
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleHttpRequestMethodNotSupportedException(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        log.warn("Method not supported: {} for URI: {}", ex.getMethod(), request.getRequestURI());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.METHOD_NOT_ALLOWED,
                "Method " + ex.getMethod() + " not supported for this endpoint. Supported methods: " + 
                        String.join(", ", ex.getSupportedMethods()),
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.METHOD_NOT_ALLOWED);
    }
}
