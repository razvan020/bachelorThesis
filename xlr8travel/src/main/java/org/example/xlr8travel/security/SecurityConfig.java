package org.example.xlr8travel.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
// Import CORS classes
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService; // Your DB-backed UserDetailsService

    public SecurityConfig(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Apply CORS config from bean
                .csrf(csrf -> csrf.disable()) // Disable CSRF (common for APIs using cookies/sessions with careful CORS)

                // *** Configure Security Context to auto-save if changed ***
                .securityContext((context) -> context
                        .requireExplicitSave(false) // Ensure context is saved automatically after login sets it
                )
                // *** End Security Context config ***

                .authorizeHttpRequests(auth -> auth
                        // API Endpoints Security
                        .requestMatchers("/api/login","/api/signup", "/api/register").permitAll() // Public API endpoints
                        .requestMatchers(HttpMethod.GET, "/api/flights/**").permitAll() // Flight search is public
                        .requestMatchers("/api/cart/**").authenticated() // Requires login
                        .requestMatchers("/api/checkout/**").authenticated() // Requires login
                        .requestMatchers("/api/orders/**").authenticated() // Requires login
                        .requestMatchers("/api/user/me").authenticated() // Requires login (for session check)
                        .requestMatchers(HttpMethod.POST, "/api/admin/**").hasRole("ADMIN") // Example admin restriction

                        // Web Page Security (adjust if mixing web pages and API)
                        .requestMatchers("/", "/index", "/login", "/signup", "/css/**", "/js/**", "/images/**").permitAll() // Public web resources

                        // Secure any other request
                        .anyRequest().authenticated()
                )
                // Configure how authentication failures are handled for API requests
                .exceptionHandling(exceptions -> exceptions
                                .defaultAuthenticationEntryPointFor(
                                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), // Return 401 for /api/**
                                        new AntPathRequestMatcher("/api/**")
                                )
                        // You could configure different entry points for non-API paths if needed
                )
                // Configure Form Login (if used for web pages)
                .formLogin(form -> form
                        .loginPage("/login") // Your web login page path
                        .loginProcessingUrl("/perform_login") // Spring handles POST to this URL
                        .defaultSuccessUrl("/?loginsuccess=true", true) // Redirect on web login success
                        .failureUrl("/login?error=true") // Redirect on web login failure
                        .permitAll() // Allow access to login page and processing URL
                )
                // Configure Logout
                .logout(logout -> logout
                        .logoutUrl("/api/logout") // API endpoint for logout
                        .logoutSuccessHandler((request, response, authentication) -> {
                            // Send simple OK status for API logout
                            response.setStatus(HttpServletResponse.SC_OK);
                        })
                        .invalidateHttpSession(true) // Invalidate the backend session
                        .deleteCookies("JSESSIONID") // Tell browser to delete the cookie
                        .permitAll() // Allow access to logout URL
                );

        return http.build();
    }

    // CORS Configuration Bean
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // Frontend origin
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Allowed methods
        configuration.setAllowedHeaders(List.of("*")); // Allow all headers
        configuration.setAllowCredentials(true); // Allow cookies
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration); // Apply to API paths
        return source;
    }

    // Password Encoder Bean
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Authentication Provider Bean (uses your UserDetailsService)
    @Bean
    public DaoAuthenticationProvider authProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // Authentication Manager Bean (needed for LoginController)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}