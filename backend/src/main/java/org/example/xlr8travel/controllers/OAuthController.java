package org.example.xlr8travel.controllers;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.example.xlr8travel.dto.JwtResponse;
import org.example.xlr8travel.dto.MessageResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oauth")
public class OAuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(OAuthController.class);
    
    @PostMapping("/complete")
    public ResponseEntity<?> completeOAuth(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("No active session"));
        }
        
        Boolean isAuthenticated = (Boolean) session.getAttribute("oauth_authenticated");
        String token = (String) session.getAttribute("oauth_access_token");
        String refreshToken = (String) session.getAttribute("oauth_refresh_token");
        String username = (String) session.getAttribute("oauth_username");
        
        if (isAuthenticated != null && isAuthenticated && token != null && refreshToken != null) {
            // Clear OAuth data from session after use
            session.removeAttribute("oauth_access_token");
            session.removeAttribute("oauth_refresh_token");
            session.removeAttribute("oauth_username");
            session.removeAttribute("oauth_authenticated");
            
            logger.info("OAuth tokens retrieved and cleared from session for user: {}", username);
            
            return ResponseEntity.ok(new JwtResponse(token, refreshToken, username));
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new MessageResponse("No OAuth authentication found"));
    }
}