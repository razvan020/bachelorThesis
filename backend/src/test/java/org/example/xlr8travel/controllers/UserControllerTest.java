package org.example.xlr8travel.controllers;

import org.example.xlr8travel.dto.UserDTO;
import org.example.xlr8travel.dto.PasswordChangeDTO;
import org.example.xlr8travel.models.User;
import org.example.xlr8travel.models.Role;
import org.example.xlr8travel.services.UserAvatar;
import org.example.xlr8travel.services.UserService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private UserController userController;

    private User testUser;
    private final String TEST_USERNAME = "testuser";
    private final String TEST_EMAIL = "test@example.com";

    @BeforeEach
    void setUp() {
        // Create a test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername(TEST_USERNAME);
        testUser.setEmail(TEST_EMAIL);
        testUser.setFirstname("Test");
        testUser.setLastname("User");

        List<Role> roles = new ArrayList<>();
        roles.add(Role.ROLE_USER);
        testUser.setRoles(roles);

        // Mock UserDetails behavior with lenient stubbing to avoid "unnecessary stubbing" errors
        // when userDetails is null in some tests
        lenient().when(userDetails.getUsername()).thenReturn(TEST_USERNAME);
    }

    @Test
    void getCurrentUser_WhenAuthenticated_ReturnsUserDTO() {
        // Arrange
        when(userService.findByUsername(TEST_USERNAME)).thenReturn(testUser);

        // Act
        ResponseEntity<UserDTO> response = userController.getCurrentUser(userDetails);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(TEST_USERNAME, response.getBody().getUsername());
        assertEquals(TEST_EMAIL, response.getBody().getEmail());
        assertTrue(response.getBody().getRoles().contains("ROLE_USER"));

        // Verify service was called
        verify(userService).findByUsername(TEST_USERNAME);
    }

    @Test
    void getCurrentUser_WhenNotAuthenticated_ReturnsUnauthorized() {
        // Act
        ResponseEntity<UserDTO> response = userController.getCurrentUser(null);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNull(response.getBody());

        // Verify service was not called
        verify(userService, never()).findByUsername(anyString());
    }

    @Test
    void getCurrentUser_WhenServiceThrowsException_ReturnsInternalServerError() {
        // Arrange
        when(userService.findByUsername(TEST_USERNAME)).thenThrow(new RuntimeException("Database error"));

        // Act
        ResponseEntity<UserDTO> response = userController.getCurrentUser(userDetails);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNull(response.getBody());

        // Verify service was called
        verify(userService).findByUsername(TEST_USERNAME);
    }

    @Test
    void getCurrentUser_WhenServiceThrowsResponseStatusException_PropagatesException() {
        // Arrange
        ResponseStatusException exception = new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        when(userService.findByUsername(TEST_USERNAME)).thenThrow(exception);

        // Act & Assert
        ResponseStatusException thrown = assertThrows(
            ResponseStatusException.class,
            () -> userController.getCurrentUser(userDetails)
        );

        assertEquals(HttpStatus.NOT_FOUND, thrown.getStatusCode());
        assertEquals("User not found", thrown.getReason());

        // Verify service was called
        verify(userService).findByUsername(TEST_USERNAME);
    }

    @Test
    void uploadAvatar_WhenAuthenticated_ReturnsOk() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "avatar.jpg", 
            MediaType.IMAGE_JPEG_VALUE, 
            "test image content".getBytes()
        );

        doNothing().when(userService).updateProfilePicture(TEST_USERNAME, file);

        // Act
        ResponseEntity<Void> response = userController.uploadAvatar(userDetails, file);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());

        // Verify service was called
        verify(userService).updateProfilePicture(TEST_USERNAME, file);
    }

    @Test
    void uploadAvatar_WhenNotAuthenticated_ReturnsUnauthorized() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "avatar.jpg", 
            MediaType.IMAGE_JPEG_VALUE, 
            "test image content".getBytes()
        );

        // Act
        ResponseEntity<Void> response = userController.uploadAvatar(null, file);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());

        // Verify service was not called
        verify(userService, never()).updateProfilePicture(anyString(), any());
    }

    @Test
    void downloadAvatar_WhenAuthenticated_ReturnsAvatar() {
        // Arrange
        byte[] imageData = "test image data".getBytes();
        String contentType = MediaType.IMAGE_JPEG_VALUE;
        UserAvatar avatar = new UserAvatar(imageData, contentType);

        when(userService.getProfilePicture(TEST_USERNAME)).thenReturn(avatar);

        // Act
        ResponseEntity<byte[]> response = userController.downloadAvatar(userDetails);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(MediaType.IMAGE_JPEG, response.getHeaders().getContentType());
        assertArrayEquals(imageData, response.getBody());

        // Verify service was called
        verify(userService).getProfilePicture(TEST_USERNAME);
    }

    @Test
    void downloadAvatar_WhenNotAuthenticated_ReturnsUnauthorized() {
        // Act
        ResponseEntity<byte[]> response = userController.downloadAvatar(null);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());

        // Verify service was not called
        verify(userService, never()).getProfilePicture(anyString());
    }

    @Test
    void changePassword_WhenAuthenticated_ReturnsOk() {
        // Arrange
        PasswordChangeDTO dto = new PasswordChangeDTO("oldPassword", "newPassword");

        doNothing().when(userService).changePassword(TEST_USERNAME, "oldPassword", "newPassword");

        // Act
        ResponseEntity<Void> response = userController.changePassword(userDetails, dto);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());

        // Verify service was called
        verify(userService).changePassword(TEST_USERNAME, "oldPassword", "newPassword");
    }

    @Test
    void changePassword_WhenNotAuthenticated_ReturnsUnauthorized() {
        // Arrange
        PasswordChangeDTO dto = new PasswordChangeDTO("oldPassword", "newPassword");

        // Act
        ResponseEntity<Void> response = userController.changePassword(null, dto);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());

        // Verify service was not called
        verify(userService, never()).changePassword(anyString(), anyString(), anyString());
    }
}
