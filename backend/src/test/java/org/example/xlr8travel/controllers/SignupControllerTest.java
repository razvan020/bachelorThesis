package org.example.xlr8travel.controllers;

import org.example.xlr8travel.dto.LoginResponse;
import org.example.xlr8travel.dto.UserSignupDTO;
import org.example.xlr8travel.models.Role;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.security.JwtUtils;
import org.example.xlr8travel.services.RecaptchaService;
import org.example.xlr8travel.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
public class SignupControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RecaptchaService recaptchaService;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private SignupController signupController;

    private UserSignupDTO validSignupDTO;
    private User existingUser;
    private final String TEST_EMAIL = "test@example.com";
    private final String TEST_PASSWORD = "password";
    private final String TEST_FULLNAME = "Test User";
    private final String ENCODED_PASSWORD = "encodedPassword";
    private final String TEST_RECAPTCHA_TOKEN = "test-recaptcha-token";
    private final String TEST_JWT_TOKEN = "test-jwt-token";
    private final String TEST_REFRESH_TOKEN = "test-refresh-token";

    @BeforeEach
    void setUp() {
        // Create valid signup DTO
        validSignupDTO = new UserSignupDTO();
        validSignupDTO.setEmail(TEST_EMAIL);
        validSignupDTO.setPassword(TEST_PASSWORD);
        validSignupDTO.setFullname(TEST_FULLNAME);
        validSignupDTO.setRecaptchaToken(TEST_RECAPTCHA_TOKEN);

        // Create existing user
        existingUser = new User();
        existingUser.setId(1L);
        existingUser.setEmail(TEST_EMAIL);

        // Mock password encoder with lenient stubbing
        lenient().when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn(ENCODED_PASSWORD);

        // Mock recaptcha service
        lenient().when(recaptchaService.verifyToken(TEST_RECAPTCHA_TOKEN)).thenReturn(true);

        // Mock authentication manager
        Authentication authentication = mock(Authentication.class);
        lenient().when(authentication.getName()).thenReturn(TEST_EMAIL);
        lenient().when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);

        // Mock JWT utils
        lenient().when(jwtUtils.generateJwtToken(any(Authentication.class))).thenReturn(TEST_JWT_TOKEN);
        lenient().when(jwtUtils.generateRefreshToken(TEST_EMAIL)).thenReturn(TEST_REFRESH_TOKEN);
    }

    @Test
    void registerUser_WithValidData_ReturnsCreated() {
        // Arrange
        when(userService.findByEmail(TEST_EMAIL)).thenReturn(null);
        when(userService.save(any(User.class))).thenReturn(new User());

        // Act
        ResponseEntity<?> response = signupController.registerUser(validSignupDTO);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof LoginResponse);
        LoginResponse responseBody = (LoginResponse) response.getBody();
        assertEquals("User registered successfully!", responseBody.getMessage());
        assertEquals(TEST_JWT_TOKEN, responseBody.getToken());
        assertEquals(TEST_REFRESH_TOKEN, responseBody.getRefreshToken());
        assertEquals(TEST_EMAIL, responseBody.getUsername());

        // Verify service calls
        verify(userService).findByEmail(TEST_EMAIL);
        verify(passwordEncoder).encode(TEST_PASSWORD);
        verify(recaptchaService).verifyToken(TEST_RECAPTCHA_TOKEN);
        verify(userService).save(argThat(user -> 
            user.getEmail().equals(TEST_EMAIL) &&
            user.getPassword().equals(ENCODED_PASSWORD) &&
            user.getFirstname().equals(TEST_FULLNAME) &&
            user.getRoles().contains(Role.ROLE_USER)
        ));
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils).generateJwtToken(any(Authentication.class));
        verify(jwtUtils).generateRefreshToken(TEST_EMAIL);
    }

    @Test
    void registerUser_WithExistingEmail_ReturnsBadRequest() {
        // Arrange
        when(userService.findByEmail(TEST_EMAIL)).thenReturn(existingUser);

        // Act
        ResponseEntity<?> response = signupController.registerUser(validSignupDTO);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals("An account with this email already exists.", responseBody.get("error"));

        // Verify service calls
        verify(userService).findByEmail(TEST_EMAIL);
        verify(userService, never()).save(any(User.class));
    }

    @Test
    void registerUser_WhenServiceThrowsException_ReturnsInternalServerError() {
        // Arrange
        when(userService.findByEmail(TEST_EMAIL)).thenReturn(null);
        when(userService.save(any(User.class))).thenThrow(new RuntimeException("Database error"));

        // Act
        ResponseEntity<?> response = signupController.registerUser(validSignupDTO);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals("Registration failed due to an internal error.", responseBody.get("error"));

        // Verify service calls
        verify(userService).findByEmail(TEST_EMAIL);
        verify(userService).save(any(User.class));
    }
}
