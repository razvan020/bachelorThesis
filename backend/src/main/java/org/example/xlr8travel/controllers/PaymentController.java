package org.example.xlr8travel.controllers;

import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
public class PaymentController {
    @Value("${stripe.secret-key}")
    private String webhookSecret;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String,Object>> createPaymentIntent(@RequestBody Map<String,Object> data) throws StripeException {
        // parse total, currency, etc
        Long amount = ((Number)data.get("amount")).longValue(); // e.g. in cents
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency("usd")
                .setReceiptEmail((String)data.get("email"))
                .setDescription("Your order description")
                .build();
        PaymentIntent intent = PaymentIntent.create(params);
        return ResponseEntity.ok(Map.of("clientSecret", intent.getClientSecret()));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(HttpServletRequest request) throws IOException {
        // Read raw body via BufferedReader
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        String payload   = sb.toString();
        String sigHeader = request.getHeader("Stripe-Signature");

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("");
        }

        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent pi = (PaymentIntent) event
                    .getDataObjectDeserializer()
                    .getObject()
                    .orElse(null);
            // fulfill order…
        }

        return ResponseEntity.ok("");
    }

}
