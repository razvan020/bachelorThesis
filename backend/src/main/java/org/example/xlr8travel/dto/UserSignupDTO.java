package org.example.xlr8travel.dto; // Or your appropriate DTO package

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

// Lombok annotations optional, can write getters/setters manually
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSignupDTO {

    @NotEmpty(message = "Full name cannot be empty")
    @Size(min = 2, message = "Full name must be at least 2 characters")
    private String fullname;

    @NotEmpty(message = "Email cannot be empty")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotEmpty(message = "Password cannot be empty")
    @Size(min = 6, message = "Password must be at least 6 characters") // Example minimum length
    private String password;

    @NotEmpty(message = "reCAPTCHA verification is required")
    private String recaptchaToken;


}
