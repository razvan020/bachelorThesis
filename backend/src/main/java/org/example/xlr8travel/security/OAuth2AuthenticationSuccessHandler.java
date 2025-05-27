package org.example.xlr8travel.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);
    private final JwtUtils jwtUtils;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // Generate tokens
        String token = jwtUtils.generateJwtToken(authentication);
        String refreshToken = jwtUtils.generateRefreshToken(extractUsername(authentication));
        String username = extractUsername(authentication);

        // Store tokens in session
        HttpSession session = request.getSession(true);
        session.setAttribute("oauth_access_token", token);
        session.setAttribute("oauth_refresh_token", refreshToken);
        session.setAttribute("oauth_username", username);
        session.setAttribute("oauth_authenticated", true);

        logger.info("OAuth tokens stored in session for user: {}", username);

        // Redirect to frontend without tokens in URL
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .queryParam("oauth", "success")
                .build().toUriString();

        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    /**
     * Extracts the username from the authentication object.
     * For OAuth2 users, use the email attribute if available.
     * This method should match the logic in JwtUtils.generateJwtToken to ensure consistent user identification.
     */
    private String extractUsername(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        logger.info("Extracting username from authentication: {}", authentication.getName());
        logger.info("Principal class: {}", principal.getClass().getName());

        if (principal instanceof UserDetails) {
            logger.info("Principal is UserDetails");
            return ((UserDetails) principal).getUsername();
        } else if (principal instanceof DefaultOAuth2User) {
            logger.info("Principal is DefaultOAuth2User");
            DefaultOAuth2User oauth2User = (DefaultOAuth2User) principal;
            logger.info("OAuth2User attributes: {}", oauth2User.getAttributes());
            // For OAuth2 users, use the "email" attribute as username if available, otherwise use "name"
            if (oauth2User.getAttributes().containsKey("email")) {
                String email = oauth2User.getAttributes().get("email").toString();
                logger.info("Using email as username: {}", email);
                return email;
            } else {
                logger.info("Email attribute not found, using name: {}", oauth2User.getName());
                return oauth2User.getName();
            }
        }

        // Fallback to using the name from the authentication object
        logger.info("Using authentication name as fallback: {}", authentication.getName());
        return authentication.getName();
    }
}
