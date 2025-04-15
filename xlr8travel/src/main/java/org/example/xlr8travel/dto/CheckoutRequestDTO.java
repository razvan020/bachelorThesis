package org.example.xlr8travel.dto; // Or your appropriate DTO package

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutRequestDTO {

    @NotEmpty(message = "Customer name cannot be empty")
    private String customerName;

    @NotEmpty(message = "Customer email cannot be empty")
    @Email(message = "Please provide a valid email address")
    private String customerEmail;

    // --- IMPORTANT ---
    // In a REAL application, you would receive a token or payment method ID
    // from your frontend payment gateway integration (e.g., Stripe, Braintree) here.
    // DO NOT accept raw card number, expiry, or CVV in your backend API directly
    // unless you are fully PCI DSS compliant and understand the security risks.
    @NotEmpty(message = "Payment method information is required")
    private String paymentMethodToken; // Example: "tok_visa", "pm_123abc"

    // Optional: You might include cart summary for server-side validation
    // private List<CartItemSummaryDTO> items;
    // private Double expectedTotal;
}