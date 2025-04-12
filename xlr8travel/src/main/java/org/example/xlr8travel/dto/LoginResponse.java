package org.example.xlr8travel.dto;

import lombok.Getter;

@Getter
public class LoginResponse {
    private String message;
    private String username;

    // Constructor, Getters & Setters...
    public LoginResponse(String message, String token, String username) {
        this.message = message;
        this.username = username;
    }
}
