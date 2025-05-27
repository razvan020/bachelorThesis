package org.example.xlr8travel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NaturalLanguageSearchRequestDTO {
    private String query;
    private String closestAirport; // The code of the closest airport to the user's location
    private Double userLatitude;   // User's latitude (optional)
    private Double userLongitude;  // User's longitude (optional)
}
