package org.example.xlr8travel.services;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Service
public class RecaptchaService {

    private static final Logger log = LoggerFactory.getLogger(RecaptchaService.class);
    private static final String RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    @Value("${recaptcha.secret}")
    private String recaptchaSecret;

    private final RestTemplate restTemplate;

    public RecaptchaService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Verifies a reCAPTCHA token with Google's reCAPTCHA API.
     *
     * @param token The reCAPTCHA token to verify
     * @return true if the token is valid, false otherwise
     */
    public boolean verifyToken(String token) {
        if (token == null || token.isEmpty()) {
            log.warn("Empty reCAPTCHA token");
            return false;
        }

        try {
            // For testing purposes, accept the test key
//             if (token.equals("6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI")) {
//                 log.info("Using test reCAPTCHA key - validation bypassed");
//                 return true;
//             }

            Map<String, String> body = new HashMap<>();
            body.put("secret", recaptchaSecret);
            body.put("response", token);

            URI verifyUri = URI.create(RECAPTCHA_VERIFY_URL + "?secret=" + recaptchaSecret + "&response=" + token);
            String response = restTemplate.getForObject(verifyUri, String.class);

            JsonObject jsonObject = JsonParser.parseString(response).getAsJsonObject();
            boolean success = jsonObject.get("success").getAsBoolean();

            if (!success) {
                log.warn("reCAPTCHA validation failed: {}", response);
            } else {
                log.info("reCAPTCHA validation successful");
            }

            return success;
        } catch (Exception e) {
            log.error("Error validating reCAPTCHA token", e);
            return false;
        }
    }
}