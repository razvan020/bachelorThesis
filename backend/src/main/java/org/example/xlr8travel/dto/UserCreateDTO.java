package org.example.xlr8travel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateDTO {

    // Reuse constraints from UserSignupDTO or define separately

    @NotEmpty(message = "Username cannot be empty")
    private String username; // Added username field

    @NotEmpty(message = "Email cannot be empty")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotEmpty(message = "Password cannot be empty")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotEmpty(message = "First name cannot be empty")
    private String firstname; // Use separate first/last name

    @NotEmpty(message = "Last name cannot be empty")
    private String lastname;

    // Optional: Add fields for roles if admin should set them on creation
    // private Set<String> roles;
}