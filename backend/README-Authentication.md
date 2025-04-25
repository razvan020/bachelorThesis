# JWT and OAuth2 Authentication Implementation

This document describes the implementation of JWT and OAuth2 authentication in the XLR8 Travel application.

## Overview

The authentication system has been updated to support both JWT (JSON Web Token) and OAuth2 authentication. This provides a more secure and flexible authentication mechanism for the application.

## Features

- JWT-based authentication
- OAuth2 authentication with Google and Facebook
- Token refresh mechanism
- Stateless authentication
- Secure password hashing

## Implementation Details

### JWT Authentication

JWT authentication is implemented using the following components:

1. **JwtUtils**: A utility class for generating, validating, and parsing JWT tokens.
2. **JwtAuthenticationFilter**: A filter that intercepts requests and validates JWT tokens.
3. **LoginController**: Updated to return JWT tokens upon successful authentication.
4. **SignupController**: Updated to return JWT tokens upon successful registration.
5. **TokenController**: A new controller for handling token refresh requests.

### OAuth2 Authentication

OAuth2 authentication is implemented using the following components:

1. **SecurityConfig**: Updated to configure OAuth2 authentication with Google and Facebook.
2. **OAuth2AuthenticationSuccessHandler**: A handler that generates JWT tokens after successful OAuth2 authentication.

### Configuration

The authentication system is configured in the `application.properties` file:

```properties
# JWT Configuration
jwt.secret=${JWT_SECRET:defaultSecretKeyWhichShouldBeAtLeast32CharactersLong}
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# OAuth2 Configuration
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID:your-google-client-id}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET:your-google-client-secret}
spring.security.oauth2.client.registration.google.scope=email,profile

spring.security.oauth2.client.registration.facebook.client-id=${FACEBOOK_CLIENT_ID:your-facebook-client-id}
spring.security.oauth2.client.registration.facebook.client-secret=${FACEBOOK_CLIENT_SECRET:your-facebook-client-secret}
spring.security.oauth2.client.registration.facebook.scope=email,public_profile
```

## API Endpoints

### Authentication Endpoints

- **POST /api/login**: Authenticate a user and return JWT tokens.
- **POST /api/signup**: Register a new user and return JWT tokens.
- **POST /api/token/refresh**: Refresh an expired JWT token.

### OAuth2 Endpoints

- **/oauth2/authorization/google**: Redirect to Google login.
- **/oauth2/authorization/facebook**: Redirect to Facebook login.
- **/login/oauth2/code/google**: Google callback URL.
- **/login/oauth2/code/facebook**: Facebook callback URL.

## Frontend Integration

A guide for frontend developers on how to integrate with the authentication system is provided in the `auth-guide.js` file.

## Security Considerations

- JWT tokens are signed with a secret key to prevent tampering.
- Passwords are hashed using BCrypt before being stored in the database.
- OAuth2 authentication uses HTTPS to protect sensitive information.
- Refresh tokens have a longer expiration time than access tokens.
- Access tokens are short-lived to minimize the impact of token theft.

## Future Improvements

- Implement token blacklisting for revoked tokens.
- Add support for more OAuth2 providers.
- Implement role-based access control.
- Add support for multi-factor authentication.