package org.example.xlr8travel.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;

import java.util.Arrays;

/**
 * Configuration for handling sensitive data
 * Validates that required sensitive environment variables are set
 */
@Configuration
@PropertySource("classpath:application.properties")
public class SensitiveDataConfig {

    private static final Logger log = LoggerFactory.getLogger(SensitiveDataConfig.class);

    private final Environment environment;

    @Value("${spring.profiles.active}")
    private String activeProfile;

    public SensitiveDataConfig(Environment environment) {
        this.environment = environment;
    }

    /**
     * Validates that required sensitive environment variables are set
     * Logs warnings if they are not set in production
     * 
     * @return Boolean indicating whether all required environment variables are set
     */
    @Bean
    public Boolean validateSensitiveData() {
        log.info("Validating sensitive data configuration for profile: {}", activeProfile);

        // Skip validation for dev profile
        if (Arrays.asList(environment.getActiveProfiles()).contains("dev")) {
            log.info("Development profile detected, skipping sensitive data validation");
            return true;
        }

        boolean allValid = true;

        // Check database credentials
        allValid &= validateEnvironmentVariable("SPRING_DATASOURCE_URL");
        allValid &= validateEnvironmentVariable("SPRING_DATASOURCE_USERNAME");
        allValid &= validateEnvironmentVariable("SPRING_DATASOURCE_PASSWORD");

        // Check Stripe API key
        allValid &= validateEnvironmentVariable("STRIPE_SECRET_KEY");

        return allValid;
    }

    /**
     * Validates that an environment variable is set
     * Logs a warning if it is not set
     * 
     * @param name The name of the environment variable
     * @return true if the environment variable is set, false otherwise
     */
    private boolean validateEnvironmentVariable(String name) {
        String value = environment.getProperty(name);

        if (value == null || value.isEmpty()) {
            log.warn("Environment variable {} is not set", name);
            return false;
        } else {
            // Log that the variable is set, but don't log the value
            log.info("Environment variable {} is set", name);
            return true;
        }
    }
}
