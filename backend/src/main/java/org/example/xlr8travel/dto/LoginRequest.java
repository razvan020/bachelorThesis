package org.example.xlr8travel.dto;

public class LoginRequest {
    private String username;
    private String password;
    private String recaptchaToken;

    // Default constructor for JSON deserialization
    public LoginRequest() {
    }

    public LoginRequest(String username, String password, String recaptchaToken) {
        this.username = username;
        this.password = password;
        this.recaptchaToken = recaptchaToken;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRecaptchaToken() {
        return recaptchaToken;
    }

    public void setRecaptchaToken(String recaptchaToken) {
        this.recaptchaToken = recaptchaToken;
    }
}