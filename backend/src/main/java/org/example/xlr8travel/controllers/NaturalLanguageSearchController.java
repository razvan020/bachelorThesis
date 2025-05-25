package org.example.xlr8travel.controllers;

import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.dto.NaturalLanguageSearchRequestDTO;
import org.example.xlr8travel.dto.NaturalLanguageSearchResponseDTO;
import org.example.xlr8travel.services.GeminiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/flights/natural-language")
@RequiredArgsConstructor
public class NaturalLanguageSearchController {

    private static final Logger log = LoggerFactory.getLogger(NaturalLanguageSearchController.class);
    private final GeminiService geminiService;

    @PostMapping("/search")
    public ResponseEntity<NaturalLanguageSearchResponseDTO> processNaturalLanguageSearch(
            @RequestBody NaturalLanguageSearchRequestDTO request) {

        // Validate request
        if (request == null) {
            log.warn("Received null request");
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
            response.setError("Request cannot be null");
            return ResponseEntity.badRequest().body(response);
        }

        if (request.getQuery() == null || request.getQuery().trim().isEmpty()) {
            log.warn("Received empty query");
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
            response.setError("Query cannot be empty");
            return ResponseEntity.badRequest().body(response);
        }

        log.info("Received natural language search request: {}", request.getQuery());

        try {
            NaturalLanguageSearchResponseDTO response = geminiService.processNaturalLanguageQuery(request);

            if (response.getSuccess()) {
                log.info("Successfully processed natural language query. Origin: {}, Destination: {}", 
                        response.getOrigin(), response.getDestination());
                return ResponseEntity.ok(response);
            } else {
                log.warn("Failed to process natural language query: {}", response.getError());
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            log.error("Unexpected error processing natural language query", e);
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
            response.setError("An unexpected error occurred: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
