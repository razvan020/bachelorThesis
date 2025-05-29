package org.example.xlr8travel.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
// Import CORS classes
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public SecurityConfig(@Qualifier("userRepoUserDetailsService") UserDetailsService userDetailsService,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          OAuth2AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler,
                          @Lazy CustomOAuth2UserService customOAuth2UserService) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oauth2AuthenticationSuccessHandler = oauth2AuthenticationSuccessHandler;
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Define which requests should use sessions (OAuth2 related)
        RequestMatcher sessionRequiredMatcher = request ->
                request.getRequestURI().startsWith("/oauth2/") ||
                        request.getRequestURI().startsWith("/login/oauth2/") ||
                        request.getRequestURI().startsWith("/api/oauth/");

        http
                .httpBasic(Customizer.withDefaults())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                // CRITICAL: Use conditional session management
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                        // Ensure sessions work for OAuth2 endpoints
                        .maximumSessions(1000) // Allow many concurrent sessions
                        .maxSessionsPreventsLogin(false)
                )
                .authorizeHttpRequests(auth -> auth
                        // Actuator
                        .requestMatchers(EndpointRequest.to("prometheus"))
                        .hasRole("ACTUATOR")

                        // Public API endpoints
                        .requestMatchers("/api/login", "/api/signup", "/api/register", "/api/token/refresh").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/flights/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/flights/natural-language/**").permitAll()

                        // OAuth2 endpoints - MUST BE ACCESSIBLE AND ALLOW SESSIONS
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/api/oauth/**").permitAll()

                        // STRIPE: allow unauthenticated access to payment‐intent + webhook
                        .requestMatchers(HttpMethod.POST, "/api/checkout/create-payment-intent").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/checkout/webhook").permitAll()

                        // Everything else under /api/checkout requires auth (if you have more)
                        .requestMatchers("/api/checkout/**").authenticated()

                        // Cart, orders, user‐info remain protected
                        .requestMatchers("/api/cart/**").authenticated()
                        .requestMatchers("/api/orders/**").authenticated()
                        .requestMatchers("/api/user/me").authenticated()

                        // Admin
                        .requestMatchers(HttpMethod.POST, "/api/users", "/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")

                        // Static & public pages
                        .requestMatchers("/", "/index", "/login", "/signup", "/css/**", "/js/**", "/images/**").permitAll()
                        .requestMatchers("/api/user/**").authenticated()
                        // Fallback
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                new AntPathRequestMatcher("/api/**")
                        )
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oauth2AuthenticationSuccessHandler)
                        .failureHandler((request, response, exception) -> {
                            // Enhanced error logging
                            System.err.println("=== OAuth2 Authentication Failed ===");
                            System.err.println("Request URI: " + request.getRequestURI());
                            System.err.println("Session ID: " + (request.getSession(false) != null ? request.getSession(false).getId() : "No session"));
                            System.err.println("Exception: " + exception.getMessage());
                            exception.printStackTrace();

                            // Redirect to frontend with detailed error
                            String errorMessage = exception.getMessage() != null ?
                                    exception.getMessage() : "Unknown OAuth2 error";
                            String redirectUrl = frontendUrl + "/login?error=true&message=" +
                                    java.net.URLEncoder.encode(errorMessage, java.nio.charset.StandardCharsets.UTF_8);

                            response.sendRedirect(redirectUrl);
                        })
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/perform_login")
                        .defaultSuccessUrl("/?loginsuccess=true", true)
                        .failureUrl("/login?error=true")
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/api/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(HttpServletResponse.SC_OK))
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                )
                // IMPORTANT: Don't add JWT filter for OAuth2 endpoints
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS Configuration Bean
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(frontendUrl)); // Frontend origin
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control", "Content-Language", "Accept", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        // Add these lines to include OAuth2 endpoints
        source.registerCorsConfiguration("/oauth2/**", configuration);
        source.registerCorsConfiguration("/login/oauth2/**", configuration);

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

    @Bean("actuatorUserDetailsService")
    public UserDetailsService userDetailsServiceForActuator() {
        UserDetails actuatorUser = User.builder()
                .username("monitor")
                .password(passwordEncoder().encode("monpass"))
                .roles("ACTUATOR")
                .build();

        return new InMemoryUserDetailsManager(actuatorUser);
    }
}