package org.example.xlr8travel.controllers;

import org.example.xlr8travel.dto.LoginRequest;
import org.example.xlr8travel.dto.LoginResponse;
import org.example.xlr8travel.security.JwtUtils;
import org.example.xlr8travel.services.MetricsService;
import org.example.xlr8travel.services.RecaptchaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LoginControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private Authentication authentication;

    @Mock
    private RecaptchaService recaptchaService;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private MetricsService metricsService;

    @InjectMocks
    private LoginController loginController;

    private LoginRequest loginRequest;
    private final String TEST_USERNAME = "testuser";
    private final String TEST_PASSWORD = "password";
    private final String TEST_RECAPTCHA_TOKEN = "test-recaptcha-token";
    private final String TEST_JWT_TOKEN = "test-jwt-token";
    private final String TEST_REFRESH_TOKEN = "test-refresh-token";

    @BeforeEach
    void setUp() {
        // Create test login request
        loginRequest = new LoginRequest();
        loginRequest.setUsername(TEST_USERNAME);
        loginRequest.setPassword(TEST_PASSWORD);
        loginRequest.setRecaptchaToken(TEST_RECAPTCHA_TOKEN);

        // Mock Authentication behavior with lenient stubbing
        lenient().when(authentication.getName()).thenReturn(TEST_USERNAME);

        // Mock RecaptchaService
        lenient().when(recaptchaService.verifyToken(TEST_RECAPTCHA_TOKEN)).thenReturn(true);

        // Mock JwtUtils
        lenient().when(jwtUtils.generateJwtToken(any(Authentication.class))).thenReturn(TEST_JWT_TOKEN);
        lenient().when(jwtUtils.generateRefreshToken(TEST_USERNAME)).thenReturn(TEST_REFRESH_TOKEN);

        // Mock MetricsService
        lenient().doNothing().when(metricsService).updateLastLogin(TEST_USERNAME);
    }

    @Test
    void authenticateUser_WithValidCredentials_ReturnsSuccessResponse() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);

        // Act
        ResponseEntity<?> response = loginController.authenticateUser(loginRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof LoginResponse);
        LoginResponse loginResponse = (LoginResponse) response.getBody();
        assertEquals("Login successful", loginResponse.getMessage());
        assertEquals(TEST_USERNAME, loginResponse.getUsername());
        assertEquals(TEST_JWT_TOKEN, loginResponse.getToken());
        assertEquals(TEST_REFRESH_TOKEN, loginResponse.getRefreshToken());

        // Verify authentication manager was called
        verify(authenticationManager).authenticate(
                argThat(auth -> 
                    auth.getPrincipal().equals(TEST_USERNAME) && 
                    auth.getCredentials().equals(TEST_PASSWORD)
                )
        );

        // Verify other services were called
        verify(recaptchaService).verifyToken(TEST_RECAPTCHA_TOKEN);
        verify(jwtUtils).generateJwtToken(authentication);
        verify(jwtUtils).generateRefreshToken(TEST_USERNAME);
        verify(metricsService).updateLastLogin(TEST_USERNAME);
    }

    @Test
    void authenticateUser_WithInvalidCredentials_ReturnsUnauthorized() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act
        ResponseEntity<?> response = loginController.authenticateUser(loginRequest);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> errorResponse = (Map<String, String>) response.getBody();
        assertEquals("Invalid username or password.", errorResponse.get("error"));

        // Verify authentication manager was called
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void authenticateUser_WhenUnexpectedError_ReturnsInternalServerError() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new RuntimeException("Unexpected error"));

        // Act
        ResponseEntity<?> response = loginController.authenticateUser(loginRequest);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> errorResponse = (Map<String, String>) response.getBody();
        assertEquals("Login failed due to an internal error.", errorResponse.get("error"));

        // Verify authentication manager was called
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
