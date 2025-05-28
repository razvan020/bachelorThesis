package org.example.xlr8travel.services;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.protobuf.Value;
import com.google.protobuf.util.JsonFormat;
import javax.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.example.xlr8travel.dto.GeminiRequestDTO;
import org.example.xlr8travel.dto.NaturalLanguageSearchRequestDTO;
import org.example.xlr8travel.dto.NaturalLanguageSearchResponseDTO;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.Candidate;
import com.google.cloud.vertexai.api.Content;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.api.Part;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.auth.oauth2.GoogleCredentials;

import java.nio.file.Files;
import java.util.Base64;

@Service
@Slf4j
public class GeminiServiceImpl implements GeminiService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GeminiServiceImpl.class);

    private final AirportLocationService airportLocationService;

    public GeminiServiceImpl(AirportLocationService airportLocationService) {
        this.airportLocationService = airportLocationService;
    }

    @org.springframework.beans.factory.annotation.Value("${gemini.api.key}")
    private String apiKey;

    @org.springframework.beans.factory.annotation.Value("${gemini.project.id}")
    private String projectId;

    @org.springframework.beans.factory.annotation.Value("${gemini.location.id}")
    private String locationId;

    @org.springframework.beans.factory.annotation.Value("${gemini.model}")
    private String model;

    @org.springframework.beans.factory.annotation.Value("${google.application.credentials}")
    private String credentialsPath;

    private static final Gson gson = new Gson();

    @PostConstruct
    public void validateConfiguration() {
        log.info("=== GEMINI SERVICE CONFIGURATION ===");
        log.info("Project ID: {}", projectId);
        log.info("Location ID: {}", locationId);
        log.info("Model: {}", model);
        log.info("Credentials Path: {}", credentialsPath);
        log.info("API Key: {}", apiKey != null ? "***SET***" : "***NOT SET***");

        // Validate credentials file exists and is readable
        if (credentialsPath != null && !credentialsPath.trim().isEmpty()) {
            String cleanPath = credentialsPath.replaceAll("^\"|\"$", "").trim();
            Path path = Paths.get(cleanPath);

            if (Files.exists(path)) {
                log.info("✅ Credentials file exists: {}", cleanPath);
                try {
                    long fileSize = Files.size(path);
                    log.info("✅ Credentials file size: {} bytes", fileSize);

                    if (fileSize == 0) {
                        log.error("❌ Credentials file is empty!");
                    }
                } catch (IOException e) {
                    log.error("❌ Cannot read credentials file: {}", e.getMessage());
                }
            } else {
                log.error("❌ Credentials file does not exist: {}", cleanPath);
            }
        } else {
            log.error("❌ Credentials path is not set!");
        }

        // Check GOOGLE_APPLICATION_CREDENTIALS environment variable
        String envCredentials = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (envCredentials != null) {
            log.info("✅ GOOGLE_APPLICATION_CREDENTIALS env var is set: {}", envCredentials);
        } else {
            log.warn("⚠️ GOOGLE_APPLICATION_CREDENTIALS env var is not set");
        }

        log.info("=====================================");
    }

    @Override
    public NaturalLanguageSearchResponseDTO processNaturalLanguageQuery(NaturalLanguageSearchRequestDTO request) {
        try {
            // Determine the closest airport if not already provided
            String closestAirport = request.getClosestAirport();

            // If closest airport is not provided but coordinates are, find the closest airport
            if ((closestAirport == null || closestAirport.isEmpty()) &&
                    request.getUserLatitude() != null && request.getUserLongitude() != null) {

                AirportLocationService.Airport airport =
                        airportLocationService.findClosestAirport(
                                request.getUserLatitude(),
                                request.getUserLongitude()
                        );

                closestAirport = airport.getCode();
                log.info("Determined closest airport from coordinates: {}", closestAirport);
            }

            // If we still don't have a closest airport, default to OTP
            if (closestAirport == null || closestAirport.isEmpty()) {
                closestAirport = "OTP"; // Default to Bucharest Otopeni
                log.info("No closest airport provided or determined, defaulting to OTP");
            }

            // Update the request with the determined airport
            request.setClosestAirport(closestAirport);

            // Log the closest airport from the request
            log.info("Processing natural language query with closest airport: {}", request.getClosestAirport());

            // Configure the prompt for flight search
            String prompt = buildFlightSearchPrompt(request.getQuery(), request.getClosestAirport());

            // Log the generated prompt
            log.debug("Generated prompt for Gemini API: {}", prompt);

            // Call Gemini API
            String geminiResponse = callGeminiAPI(prompt);

            // Log the Gemini API response
            log.debug("Gemini API response: {}", geminiResponse);

            // Parse the response
            log.debug("Passing closest airport to parseGeminiResponse: '{}'", request.getClosestAirport());
            return parseGeminiResponse(geminiResponse, request.getClosestAirport());
        } catch (Exception e) {
            log.error("Error processing natural language query", e);
            NaturalLanguageSearchResponseDTO response = new NaturalLanguageSearchResponseDTO();
            response.setOrigin(null);
            response.setDestination(null);
            response.setDepartureDate(null);
            response.setReturnDate(null);
            response.setTripType("roundTrip");
            response.setAdults(1);
            response.setChildren(0);
            response.setInfants(0);
            response.setSuccess(false);
            response.setError("Failed to process query: " + e.getMessage());
            return response;
        }
    }

    private String buildFlightSearchPrompt(String userQuery, String userClosestAirport) {
        int currentYear = LocalDate.now().getYear();
        LocalDate today = LocalDate.now();

        String locationInfo = "";
        String originRule = "3. IMPORTANT: If the user specifies an origin in the query (e.g., 'from Paris', 'departing London'), " +
                "   you MUST use that origin. Only if no origin is provided in the query, " +
                "   assume the origin is the closest airport to the user's location. " +
                "   Use 'CLOSEST_AIRPORT' as the origin code in this case, and the backend will resolve it. ";

        if (userClosestAirport != null && !userClosestAirport.trim().isEmpty()) {
            locationInfo = "The user's closest airport is " + userClosestAirport + ". ";
            originRule = "3. IMPORTANT: If the user specifies an origin in the query (e.g., 'from Paris', 'departing London'), " +
                    "   you MUST use that origin. Only if no origin is provided in the query, " +
                    "   use '" + userClosestAirport + "' as the origin. " +
                    "   This is the closest airport to the user's current location. ";
        }

        String airportCodeRule = "4. CRITICAL: You MUST use the correct IATA airport codes for cities. DO NOT use generic city codes. " +
                "   For example, use 'FCO' for Rome (not 'ROM'), 'LHR' for London (not 'LON'), 'CDG' for Paris, etc. " +
                "   Here are the correct airport codes for common cities: " +
                "   - Rome: FCO (Leonardo da Vinci Fiumicino) " +
                "   - London: LHR (Heathrow Airport) " +
                "   - Paris: CDG (Charles de Gaulle) " +
                "   - New York: JFK (John F. Kennedy) " +
                "   - Los Angeles: LAX (Los Angeles Intl) " +
                "   - Barcelona: BCN (El Prat Airport) " +
                "   - Madrid: MAD (Adolfo Suárez Madrid–Barajas) " +
                "   - Berlin: BER (Berlin Brandenburg) " +
                "   - Munich: MUC (Franz Josef Strauss) " +
                "   - Milan: MXP (Milano Malpensa) " +
                "   - Amsterdam: AMS (Amsterdam Schiphol) " +
                "   - Vienna: VIE (Vienna Intl) " +
                "   - Zurich: ZRH (Zurich Airport) " +
                "   - Athens: ATH (Athens International) " +
                "   - Bucharest: OTP (Henri Coandă Intl) " +
                "   - Cluj: CLJ (Avram Iancu) " +
                "   - Brussels: CRL (Brussels South Charleroi) " +
                "   - Baku: GYD (Heydar Aliyev Intl) " +
                "   - Yerevan: EVN (Zvartnots Intl) " +
                "   - Tirana: TIA (Rinas Mother Teresa) ";

        return "You are a flight search assistant. Extract the following information from this query: " +
                "origin city, destination city, departure date, return date (if applicable), trip type (one-way or round-trip), " +
                "and number of passengers (adults, children, infants). " +
                "If any information is missing, use reasonable defaults. " +
                locationInfo +
                "IMPORTANT RULES: " +
                "1. When extracting dates, use the current year (" + currentYear + ") for any dates where the year is not explicitly specified. " +
                "2. If the query mentions a 'weekend trip' or similar weekend travel, and specific dates aren't provided, " +
                "   set the departure and return dates to be within 1-2 weeks from today (" + today + "). " +
                "   For example, if today is " + today + ", a good departure date would be between " +
                today.plusDays(7) + " and " + today.plusDays(14) + ", with the return date 2-3 days after departure. " +
                originRule +
                airportCodeRule +
                "Format your response as a JSON object with the following fields: " +
                "origin (airport code), destination (airport code), departureDate (YYYY-MM-DD), " +
                "returnDate (YYYY-MM-DD or null for one-way), tripType (oneWay or roundTrip), " +
                "adults (number), children (number), infants (number). " +
                "Here's the user query: \"" + userQuery + "\";";
    }

    private String callGeminiAPI(String prompt) throws IOException {
        log.info("=== CALLING GEMINI API ===");

        // Validate configuration
        if (projectId == null || projectId.trim().isEmpty()) {
            throw new IOException("Gemini project ID is not set. Please set the GEMINI_PROJECT_ID environment variable.");
        }

        if (credentialsPath == null || credentialsPath.trim().isEmpty()) {
            throw new IOException("Google application credentials path is not set. Please set the google.application.credentials property.");
        }

        String cleanedCredentialsPath = credentialsPath.replaceAll("^\"|\"$", "").trim();
        log.info("Using project ID: {}", projectId);
        log.info("Using location ID: {}", locationId);
        log.info("Using credentials path: {}", cleanedCredentialsPath);

        // Check if file exists
        Path credentialsFile = Paths.get(cleanedCredentialsPath);
        if (!Files.exists(credentialsFile)) {
            throw new IOException("Credentials file does not exist: " + cleanedCredentialsPath);
        }

        long fileSize = Files.size(credentialsFile);
        if (fileSize == 0) {
            throw new IOException("Credentials file is empty: " + cleanedCredentialsPath);
        }

        log.info("Credentials file size: {} bytes", fileSize);

        // Load and validate credentials
        GoogleCredentials credentials;
        try (FileInputStream serviceAccountStream = new FileInputStream(cleanedCredentialsPath)) {
            credentials = GoogleCredentials.fromStream(serviceAccountStream);
            log.info("✅ Successfully loaded Google credentials");
        } catch (Exception e) {
            log.error("❌ Failed to load Google credentials from {}: {}", cleanedCredentialsPath, e.getMessage());
            throw new IOException("Failed to load Google credentials: " + e.getMessage(), e);
        }

        // Initialize Vertex AI client
        try (VertexAI vertexAI = new VertexAI(projectId, locationId, credentials)) {
            log.info("✅ Successfully initialized Vertex AI client");

            GenerativeModel generativeModel = new GenerativeModel(this.model, vertexAI);
            log.info("✅ Successfully created generative model: {}", this.model);

            // Create content
            Content content = Content.newBuilder()
                    .addParts(Part.newBuilder()
                            .setText(prompt)
                            .build())
                    .setRole("user")
                    .build();

            log.info("Making API call to Gemini...");

            // Generate content
            GenerateContentResponse response = model.generateContent(content);
            log.info("✅ Successfully received response from Gemini API");

            // Extract response text
            StringBuilder responseText = new StringBuilder();
            for (Candidate candidate : response.getCandidatesList()) {
                Content candidateContent = candidate.getContent();
                for (Part part : candidateContent.getPartsList()) {
                    if (part.hasText()) {
                        responseText.append(part.getText());
                    }
                }
            }

            String result = responseText.toString();
            log.info("Response length: {} characters", result.length());

            return result;

        } catch (Exception e) {
            log.error("❌ Error calling Gemini API: {}", e.getMessage(), e);

            // Check for common authentication errors
            if (e.getMessage().contains("UNAUTHENTICATED")) {
                log.error("❌ Authentication failed. This usually means:");
                log.error("   1. The credentials file is invalid or corrupted");
                log.error("   2. The service account doesn't have proper permissions");
                log.error("   3. The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set");
                log.error("   4. The project ID is incorrect");

                // Log environment variable status
                String envCreds = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
                log.error("   GOOGLE_APPLICATION_CREDENTIALS env var: {}", envCreds != null ? envCreds : "NOT SET");
            }

            throw new IOException("Failed to call Gemini API: " + e.getMessage(), e);
        }
    }

    // ... rest of the methods remain the same as in your original code ...
    // (parseGeminiResponse, parseDate, extractJsonFromResponse methods)

    private NaturalLanguageSearchResponseDTO parseGeminiResponse(String geminiResponse, String userClosestAirport) {
        try {
            if (geminiResponse == null || geminiResponse.trim().isEmpty()) {
                log.warn("Empty response received from Gemini API");
                NaturalLanguageSearchResponseDTO response = new NaturalLanguageSearchResponseDTO();
                response.setOrigin(null);
                response.setDestination(null);
                response.setDepartureDate(null);
                response.setReturnDate(null);
                response.setTripType("roundTrip");
                response.setAdults(1);
                response.setChildren(0);
                response.setInfants(0);
                response.setSuccess(false);
                response.setError("Empty response received from Gemini API");
                return response;
            }

            // Extract JSON from the response (in case there's additional text)
            String jsonStr = extractJsonFromResponse(geminiResponse);

            if (jsonStr == null || jsonStr.trim().isEmpty()) {
                log.warn("No valid JSON found in response: {}", geminiResponse);
                NaturalLanguageSearchResponseDTO response = new NaturalLanguageSearchResponseDTO();
                response.setOrigin(null);
                response.setDestination(null);
                response.setDepartureDate(null);
                response.setReturnDate(null);
                response.setTripType("roundTrip");
                response.setAdults(1);
                response.setChildren(0);
                response.setInfants(0);
                response.setSuccess(false);
                response.setError("No valid JSON found in response");
                return response;
            }

            // Parse JSON
            JsonObject json;
            try {
                json = gson.fromJson(jsonStr, JsonObject.class);
                if (json == null) {
                    throw new Exception("JSON parsing resulted in null object");
                }
            } catch (Exception e) {
                log.warn("Failed to parse JSON: {}", jsonStr, e);
                NaturalLanguageSearchResponseDTO response = new NaturalLanguageSearchResponseDTO();
                response.setOrigin(null);
                response.setDestination(null);
                response.setDepartureDate(null);
                response.setReturnDate(null);
                response.setTripType("roundTrip");
                response.setAdults(1);
                response.setChildren(0);
                response.setInfants(0);
                response.setSuccess(false);
                response.setError("Invalid JSON format: " + e.getMessage());
                return response;
            }

            // Create response DTO
            NaturalLanguageSearchResponseDTO response = new NaturalLanguageSearchResponseDTO();

            // Set fields from JSON with safe access
            try {
                if (json.has("origin") && !json.get("origin").isJsonNull()) {
                    String originCode = json.get("origin").getAsString();
                    log.debug("Origin code from Gemini API: '{}', userClosestAirport: '{}'", originCode, userClosestAirport);

                    // Handle the special CLOSEST_AIRPORT placeholder
                    String trimmedOriginCode = originCode.trim();
                    boolean isClosestAirportPlaceholder = "CLOSEST_AIRPORT".equalsIgnoreCase(trimmedOriginCode);
                    log.debug("Trimmed origin code: '{}', isClosestAirportPlaceholder: {}", trimmedOriginCode, isClosestAirportPlaceholder);

                    if (isClosestAirportPlaceholder) {
                        if (userClosestAirport != null && !userClosestAirport.trim().isEmpty()) {
                            log.info("Using user's closest airport as origin: {}", userClosestAirport);
                            response.setOrigin(userClosestAirport);
                        } else {
                            log.info("No closest airport provided, defaulting to OTP");
                            response.setOrigin("OTP");
                        }
                    } else {
                        response.setOrigin(originCode);
                    }
                }
            } catch (Exception e) {
                log.warn("Error parsing origin field: {}", e.getMessage());
            }

            try {
                if (json.has("destination") && !json.get("destination").isJsonNull()) {
                    response.setDestination(json.get("destination").getAsString());
                }
            } catch (Exception e) {
                log.warn("Error parsing destination field: {}", e.getMessage());
            }

            try {
                if (json.has("departureDate") && !json.get("departureDate").isJsonNull()) {
                    try {
                        String dateStr = json.get("departureDate").getAsString();
                        response.setDepartureDate(parseDate(dateStr));
                    } catch (DateTimeParseException e) {
                        log.warn("Invalid departure date format: {}", e.getMessage());
                    }
                }
            } catch (Exception e) {
                log.warn("Error parsing departureDate field: {}", e.getMessage());
            }

            try {
                if (json.has("returnDate") && !json.get("returnDate").isJsonNull()) {
                    try {
                        String dateStr = json.get("returnDate").getAsString();
                        response.setReturnDate(parseDate(dateStr));
                    } catch (DateTimeParseException e) {
                        log.warn("Invalid return date format: {}", e.getMessage());
                    }
                }
            } catch (Exception e) {
                log.warn("Error parsing returnDate field: {}", e.getMessage());
            }

            try {
                if (json.has("tripType") && !json.get("tripType").isJsonNull()) {
                    String tripType = json.get("tripType").getAsString();
                    if ("oneWay".equalsIgnoreCase(tripType) || "one-way".equalsIgnoreCase(tripType) || "oneway".equalsIgnoreCase(tripType)) {
                        response.setTripType("oneWay");
                    } else {
                        response.setTripType("roundTrip");
                    }
                } else {
                    response.setTripType("roundTrip");
                }
            } catch (Exception e) {
                log.warn("Error parsing tripType field: {}", e.getMessage());
                response.setTripType("roundTrip");
            }

            try {
                if (json.has("adults") && !json.get("adults").isJsonNull()) {
                    try {
                        int adults = json.get("adults").getAsInt();
                        response.setAdults(Math.max(1, adults));
                    } catch (NumberFormatException e) {
                        log.warn("Invalid adults value: {}", e.getMessage());
                        response.setAdults(1);
                    }
                } else {
                    response.setAdults(1);
                }
            } catch (Exception e) {
                log.warn("Error parsing adults field: {}", e.getMessage());
                response.setAdults(1);
            }

            try {
                if (json.has("children") && !json.get("children").isJsonNull()) {
                    try {
                        int children = json.get("children").getAsInt();
                        response.setChildren(Math.max(0, children));
                    } catch (NumberFormatException e) {
                        log.warn("Invalid children value: {}", e.getMessage());
                        response.setChildren(0);
                    }
                } else {
                    response.setChildren(0);
                }
            } catch (Exception e) {
                log.warn("Error parsing children field: {}", e.getMessage());
                response.setChildren(0);
            }

            try {
                if (json.has("infants") && !json.get("infants").isJsonNull()) {
                    try {
                        int infants = json.get("infants").getAsInt();
                        response.setInfants(Math.max(0, infants));
                    } catch (NumberFormatException e) {
                        log.warn("Invalid infants value: {}", e.getMessage());
                        response.setInfants(0);
                    }
                } else {
                    response.setInfants(0);
                }
            } catch (Exception e) {
                log.warn("Error parsing infants field: {}", e.getMessage());
                response.setInfants(0);
            }

            response.setSuccess(true);

            log.debug("Final origin after processing: '{}'", response.getOrigin());

            if (response.getOrigin() != null) {
                log.info("Final origin after processing: '{}'", response.getOrigin());
            }

            log.info("Parsed response: origin={}, destination={}, departureDate={}, returnDate={}, tripType={}, adults={}, children={}, infants={}",
                    response.getOrigin(), response.getDestination(), response.getDepartureDate(),
                    response.getReturnDate(), response.getTripType(), response.getAdults(),
                    response.getChildren(), response.getInfants());

            return response;

        } catch (Exception e) {
            log.error("Error parsing Gemini response", e);
            NaturalLanguageSearchResponseDTO response = new NaturalLanguageSearchResponseDTO();
            response.setOrigin(null);
            response.setDestination(null);
            response.setDepartureDate(null);
            response.setReturnDate(null);
            response.setTripType("roundTrip");
            response.setAdults(1);
            response.setChildren(0);
            response.setInfants(0);
            response.setSuccess(false);
            response.setError("Failed to parse response: " + e.getMessage());
            return response;
        }
    }

    private LocalDate parseDate(String dateStr) {
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE);
        } catch (DateTimeParseException e) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("MM/dd/yyyy"));
            } catch (DateTimeParseException e2) {
                try {
                    return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                } catch (DateTimeParseException e3) {
                    try {
                        return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy/MM/dd"));
                    } catch (DateTimeParseException e4) {
                        throw e;
                    }
                }
            }
        }
    }

    private String extractJsonFromResponse(String response) {
        if (response == null || response.isEmpty()) {
            return null;
        }

        int startIdx = response.indexOf('{');
        int endIdx = response.lastIndexOf('}');

        if (startIdx >= 0 && endIdx >= 0 && endIdx > startIdx) {
            String jsonCandidate = response.substring(startIdx, endIdx + 1);

            try {
                gson.fromJson(jsonCandidate, JsonObject.class);
                return jsonCandidate;
            } catch (Exception e) {
                log.warn("Found JSON-like structure but it's not valid JSON: {}", jsonCandidate);
            }
        }

        int codeBlockStart = response.indexOf("```json");
        if (codeBlockStart >= 0) {
            int contentStart = response.indexOf('{', codeBlockStart);
            int codeBlockEnd = response.indexOf("```", codeBlockStart + 6);

            if (contentStart >= 0 && codeBlockEnd >= 0 && contentStart < codeBlockEnd) {
                String jsonCandidate = response.substring(contentStart, codeBlockEnd).trim();
                try {
                    gson.fromJson(jsonCandidate, JsonObject.class);
                    return jsonCandidate;
                } catch (Exception e) {
                    log.warn("Found JSON in code block but it's not valid: {}", jsonCandidate);
                }
            }
        }

        StringBuilder currentJson = new StringBuilder();
        boolean inJson = false;
        int bracketCount = 0;

        for (int i = 0; i < response.length(); i++) {
            char c = response.charAt(i);

            if (c == '{' && !inJson) {
                inJson = true;
                bracketCount = 1;
                currentJson = new StringBuilder();
                currentJson.append(c);
            } else if (inJson) {
                currentJson.append(c);

                if (c == '{') {
                    bracketCount++;
                } else if (c == '}') {
                    bracketCount--;

                    if (bracketCount == 0) {
                        String jsonCandidate = currentJson.toString();
                        try {
                            gson.fromJson(jsonCandidate, JsonObject.class);
                            return jsonCandidate;
                        } catch (Exception e) {
                            inJson = false;
                        }
                    }
                }
            }
        }

        log.warn("Could not extract valid JSON from response: {}", response);
        return null;
    }
}