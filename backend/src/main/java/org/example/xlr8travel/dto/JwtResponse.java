package org.example.xlr8travel.dto;

public class JwtResponse {
    private String token;
    private String refreshToken;
    private String username;
    
    public JwtResponse(String token, String refreshToken, String username) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
    }
    
    // Getters and setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}