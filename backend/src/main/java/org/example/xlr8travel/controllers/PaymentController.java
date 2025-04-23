package org.example.xlr8travel.controllers;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.example.xlr8travel.dto.ErrorResponse;
import org.example.xlr8travel.dto.PaymentIntentRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/checkout")
@Validated
public class PaymentController {
    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    @Value("${stripe.secret-key}")
    private String webhookSecret;

    /**
     * Creates a payment intent with Stripe
     * 
     * @param request The payment intent request
     * @return The client secret for the payment intent
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String,Object>> createPaymentIntent(@Valid @RequestBody PaymentIntentRequest request) {
        log.info("Creating payment intent for amount: {} {}", request.getAmount(), request.getCurrency());

        try {
            // Build payment intent parameters
            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(request.getAmount())
                    .setCurrency(request.getCurrency())
                    .setReceiptEmail(request.getEmail());

            // Add description if provided
            if (request.getDescription() != null && !request.getDescription().isEmpty()) {
                paramsBuilder.setDescription(request.getDescription());
            } else {
                paramsBuilder.setDescription("Order from XLR8 Travel");
            }

            // Create the payment intent
            PaymentIntent intent = PaymentIntent.create(paramsBuilder.build());

            log.info("Payment intent created successfully: {}", intent.getId());

            // Return the client secret
            Map<String, Object> response = new HashMap<>();
            response.put("clientSecret", intent.getClientSecret());
            response.put("paymentIntentId", intent.getId());
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            // Log the error (the global exception handler will handle the response)
            log.error("Error creating payment intent: {}", e.getMessage(), e);
            throw new RuntimeException("Error processing payment: " + e.getMessage(), e);
        }
    }

    /**
     * Handles Stripe webhook events
     * 
     * @param request The HTTP request containing the webhook event
     * @return A response indicating the result of processing the webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(HttpServletRequest request) {
        log.info("Received Stripe webhook");

        // Read raw body
        String payload;
        try {
            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = request.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }
            payload = sb.toString();
        } catch (IOException e) {
            log.error("Error reading webhook payload", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error reading request body");
        }

        // Get signature header
        String sigHeader = request.getHeader("Stripe-Signature");
        if (sigHeader == null || sigHeader.isEmpty()) {
            log.warn("Missing Stripe signature header");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Missing Stripe signature header");
        }

        // Verify webhook signature
        Event event;
        try {
            // Verify webhook signature
            if (webhookSecret == null || webhookSecret.isEmpty()) {
                log.error("Webhook secret is not configured");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Webhook secret is not configured");
            }

            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            log.info("Webhook signature verified successfully");
        } catch (SignatureVerificationException e) {
            log.warn("Invalid webhook signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid webhook signature");
        } catch (Exception e) {
            log.error("Error verifying webhook signature", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error processing webhook");
        }

        // Process the event based on its type
        try {
            log.info("Processing webhook event type: {}", event.getType());

            if ("payment_intent.succeeded".equals(event.getType())) {
                handlePaymentIntentSucceeded(event);
            } else if ("payment_intent.payment_failed".equals(event.getType())) {
                handlePaymentIntentFailed(event);
            } else {
                log.info("Unhandled event type: {}", event.getType());
            }

            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            log.error("Error processing webhook event", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing webhook event");
        }
    }

    /**
     * Handles a successful payment intent
     * 
     * @param event The Stripe event
     */
    private void handlePaymentIntentSucceeded(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();

        if (dataObjectDeserializer.getObject().isPresent()) {
            PaymentIntent paymentIntent = (PaymentIntent) dataObjectDeserializer.getObject().get();
            log.info("Payment succeeded for payment intent: {}", paymentIntent.getId());

            // TODO: Update order status, send confirmation email, etc.
        } else {
            log.warn("Could not deserialize payment intent from event");
        }
    }

    /**
     * Handles a failed payment intent
     * 
     * @param event The Stripe event
     */
    private void handlePaymentIntentFailed(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();

        if (dataObjectDeserializer.getObject().isPresent()) {
            PaymentIntent paymentIntent = (PaymentIntent) dataObjectDeserializer.getObject().get();
            log.warn("Payment failed for payment intent: {}", paymentIntent.getId());

            // TODO: Update order status, notify customer, etc.
        } else {
            log.warn("Could not deserialize payment intent from event");
        }
    }

}
