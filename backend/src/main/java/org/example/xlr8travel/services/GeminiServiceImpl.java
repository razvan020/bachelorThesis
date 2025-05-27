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

import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.Candidate;
import com.google.cloud.vertexai.api.Content;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.api.Part;
import com.google.cloud.vertexai.generativeai.GenerativeModel;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @org.springframework.beans.factory.annotation.Value("${gemini.publisher}")
    private String publisher;

    @org.springframework.beans.factory.annotation.Value("${gemini.model}")
    private String model;

    @org.springframework.beans.factory.annotation.Value("${google.application.credentials}")
    private String credentialsPath;

    private static final Gson gson = new Gson();

    @PostConstruct
    public void initializeCredentials() {
        if (credentialsPath != null && !credentialsPath.trim().isEmpty()) {
            String cleanPath = credentialsPath.replaceAll("^\"|\"$", "").trim();
            Path path = Paths.get(cleanPath);

            if (!Files.exists(path)) {
                String base64Creds = System.getenv("GOOGLE_CREDENTIALS_BASE64");
                if (base64Creds != null && !base64Creds.trim().isEmpty()) {
                    try {
                        if (path.getParent() != null) {
                            Files.createDirectories(path.getParent());
                        }
                        byte[] decodedBytes = Base64.getDecoder().decode(base64Creds);
                        Files.write(path, decodedBytes);
                        log.info("Google credentials file created at: {}", cleanPath);
                    } catch (IOException e) {
                        log.error("Failed to create Google credentials file", e);
                        throw new RuntimeException("Failed to create Google credentials file", e);
                    }
                }
            }
        }
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
            // Log the closest airport being passed to parseGeminiResponse
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
        int currentYear = LocalDate.now().getYear(); // Get the current year dynamically
        LocalDate today = LocalDate.now(); // Get today's date

        // Add information about the user's closest airport if available
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

        // Add a rule about using specific IATA airport codes
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
    // Check if project ID is set
    if (projectId == null || projectId.trim().isEmpty()) {
        log.error("Gemini project ID is not set. Please set the GEMINI_PROJECT_ID environment variable.");
        throw new IOException("Gemini project ID is not set. Please set the GEMINI_PROJECT_ID environment variable.");
    }

    // Check if credentials path is set
    if (credentialsPath == null || credentialsPath.trim().isEmpty()) {
        log.error("Google application credentials path is not set. Please set the google.application.credentials property.");
        throw new IOException("Google application credentials path is not set. Please set the google.application.credentials property.");
    }

    // Remove quotes if present
    credentialsPath = credentialsPath.replaceAll("^\"|\"$", "");

    // Set the credentials path as a system property
    System.setProperty("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);

    log.info("Using Gemini API with project ID: {}", projectId);

    // Use the Gemini API directly
    String endpoint = String.format("%s-aiplatform.googleapis.com:443", locationId);

    try (VertexAI vertexAI = new VertexAI(projectId, locationId)) {
        GenerativeModel model = new GenerativeModel(this.model, vertexAI);

            // Create content
Content content = Content.newBuilder()
    .addParts(Part.newBuilder()
        .setText(prompt)
        .build())
    .setRole("user")  // Set the role at the Content level
    .build();

            // Generate content
            GenerateContentResponse response = model.generateContent(content);

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

            return responseText.toString();
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            throw new IOException("Failed to call Gemini API: " + e.getMessage(), e);
        }
    }

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
                    // Use case-insensitive comparison and trim whitespace
                    String trimmedOriginCode = originCode.trim();
                    boolean isClosestAirportPlaceholder = "CLOSEST_AIRPORT".equalsIgnoreCase(trimmedOriginCode);
                    log.debug("Trimmed origin code: '{}', isClosestAirportPlaceholder: {}", trimmedOriginCode, isClosestAirportPlaceholder);

                    if (isClosestAirportPlaceholder) {
                        if (userClosestAirport != null && !userClosestAirport.trim().isEmpty()) {
                            // Use the closest airport provided by the frontend
                            log.info("Using user's closest airport as origin: {}", userClosestAirport);
                            response.setOrigin(userClosestAirport);
                        } else {
                            // Fallback to a default airport if no closest airport is provided
                            log.info("No closest airport provided, defaulting to OTP");
                            response.setOrigin("OTP"); // Default to Bucharest Otopeni
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
                        // Try different date formats
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
                        // Try different date formats
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
                    // Normalize trip type values
                    if ("oneWay".equalsIgnoreCase(tripType) || "one-way".equalsIgnoreCase(tripType) || "oneway".equalsIgnoreCase(tripType)) {
                        response.setTripType("oneWay");
                    } else {
                        response.setTripType("roundTrip"); // Default to roundTrip for any other value
                    }
                } else {
                    response.setTripType("roundTrip"); // Default
                }
            } catch (Exception e) {
                log.warn("Error parsing tripType field: {}", e.getMessage());
                response.setTripType("roundTrip"); // Default
            }

            try {
                if (json.has("adults") && !json.get("adults").isJsonNull()) {
                    try {
                        int adults = json.get("adults").getAsInt();
                        // Ensure adults is at least 1
                        response.setAdults(Math.max(1, adults));
                    } catch (NumberFormatException e) {
                        log.warn("Invalid adults value: {}", e.getMessage());
                        response.setAdults(1); // Default
                    }
                } else {
                    response.setAdults(1); // Default
                }
            } catch (Exception e) {
                log.warn("Error parsing adults field: {}", e.getMessage());
                response.setAdults(1); // Default
            }

            try {
                if (json.has("children") && !json.get("children").isJsonNull()) {
                    try {
                        int children = json.get("children").getAsInt();
                        // Ensure children is non-negative
                        response.setChildren(Math.max(0, children));
                    } catch (NumberFormatException e) {
                        log.warn("Invalid children value: {}", e.getMessage());
                        response.setChildren(0); // Default
                    }
                } else {
                    response.setChildren(0); // Default
                }
            } catch (Exception e) {
                log.warn("Error parsing children field: {}", e.getMessage());
                response.setChildren(0); // Default
            }

            try {
                if (json.has("infants") && !json.get("infants").isJsonNull()) {
                    try {
                        int infants = json.get("infants").getAsInt();
                        // Ensure infants is non-negative
                        response.setInfants(Math.max(0, infants));
                    } catch (NumberFormatException e) {
                        log.warn("Invalid infants value: {}", e.getMessage());
                        response.setInfants(0); // Default
                    }
                } else {
                    response.setInfants(0); // Default
                }
            } catch (Exception e) {
                log.warn("Error parsing infants field: {}", e.getMessage());
                response.setInfants(0); // Default
            }

            response.setSuccess(true);

            // Log the final origin after potential CLOSEST_AIRPORT replacement
            log.debug("Final origin after processing: '{}'", response.getOrigin());

            // Add an info log to make it more visible in the logs
            if (response.getOrigin() != null) {
                log.info("Final origin after processing: '{}'", response.getOrigin());
            }

            // Log the parsed response
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

    /**
     * Helper method to parse dates in various formats
     */
    private LocalDate parseDate(String dateStr) {
        // Try ISO format first (YYYY-MM-DD)
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE);
        } catch (DateTimeParseException e) {
            // Try other common formats
            try {
                // Try MM/DD/YYYY
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("MM/dd/yyyy"));
            } catch (DateTimeParseException e2) {
                try {
                    // Try DD/MM/YYYY
                    return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                } catch (DateTimeParseException e3) {
                    try {
                        // Try YYYY/MM/DD
                        return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy/MM/dd"));
                    } catch (DateTimeParseException e4) {
                        // If all else fails, rethrow the original exception
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

        // Look for JSON object in the response
        int startIdx = response.indexOf('{');
        int endIdx = response.lastIndexOf('}');

        if (startIdx >= 0 && endIdx >= 0 && endIdx > startIdx) {
            String jsonCandidate = response.substring(startIdx, endIdx + 1);

            // Validate that this is actually valid JSON
            try {
                gson.fromJson(jsonCandidate, JsonObject.class);
                return jsonCandidate;
            } catch (Exception e) {
                log.warn("Found JSON-like structure but it's not valid JSON: {}", jsonCandidate);
                // Continue with more sophisticated extraction
            }
        }

        // Try to find JSON with code block markers
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

        // Try to find any valid JSON object in the response
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
                        // We've found a complete JSON object
                        String jsonCandidate = currentJson.toString();
                        try {
                            gson.fromJson(jsonCandidate, JsonObject.class);
                            return jsonCandidate;
                        } catch (Exception e) {
                            // Not valid JSON, continue searching
                            inJson = false;
                        }
                    }
                }
            }
        }

        // If we couldn't find any valid JSON, return null
        log.warn("Could not extract valid JSON from response: {}", response);
        return null;
    }
}
