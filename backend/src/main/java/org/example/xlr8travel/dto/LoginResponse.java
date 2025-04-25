package org.example.xlr8travel.dto;

import lombok.Getter;

@Getter
public class LoginResponse {
    private String message;
    private String token;
    private String refreshToken;
    private String username;

    // Constructor with token and refresh token
    public LoginResponse(String message, String token, String refreshToken, String username) {
        this.message = message;
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
    }

    // Constructor with only token for backward compatibility
    public LoginResponse(String message, String token, String username) {
        this.message = message;
        this.token = token;
        this.username = username;
    }
}
