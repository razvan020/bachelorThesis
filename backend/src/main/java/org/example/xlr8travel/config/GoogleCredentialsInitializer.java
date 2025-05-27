package org.example.xlr8travel.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

@Component
public class GoogleCredentialsInitializer {

    private static final Logger log = LoggerFactory.getLogger(GoogleCredentialsInitializer.class);

    @PostConstruct
    public void initializeCredentials() {
        String credentialsPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        String base64Creds = System.getenv("GOOGLE_CREDENTIALS_BASE64");

        log.info("Initializing Google credentials...");
        log.info("Credentials path: {}", credentialsPath);
        log.info("Base64 credentials available: {}", base64Creds != null);

        // If we have base64 credentials but no file exists, create the file
        if (credentialsPath != null && base64Creds != null) {
            Path path = Paths.get(credentialsPath);

            if (!Files.exists(path)) {
                try {
                    // Create parent directories if they don't exist
                    if (path.getParent() != null) {
                        Files.createDirectories(path.getParent());
                    }

                    // Decode and write the credentials file
                    byte[] decodedBytes = Base64.getDecoder().decode(base64Creds);
                    Files.write(path, decodedBytes);

                    log.info("Google credentials file created at: {}", credentialsPath);
                } catch (IOException e) {
                    log.error("Failed to create Google credentials file", e);
                    throw new RuntimeException("Failed to create Google credentials file", e);
                }
            } else {
                log.info("Google credentials file already exists at: {}", credentialsPath);
            }
        } else if (credentialsPath != null) {
            // Check if the file exists (Jenkins case)
            Path path = Paths.get(credentialsPath);
            if (Files.exists(path)) {
                log.info("Using existing Google credentials file at: {}", credentialsPath);
            } else {
                log.warn("Google credentials file not found at: {}", credentialsPath);
            }
        } else {
            log.warn("GOOGLE_APPLICATION_CREDENTIALS environment variable not set");
        }
    }
}