package org.example.xlr8travel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for payment intent creation requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntentRequest {
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Long amount;
    
    @NotNull(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    private String description;
    
    private String currency = "usd";
}