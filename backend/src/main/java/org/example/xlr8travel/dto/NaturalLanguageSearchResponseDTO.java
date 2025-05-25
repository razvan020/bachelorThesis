package org.example.xlr8travel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NaturalLanguageSearchResponseDTO {
    private String origin;
    private String destination;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private String tripType;
    private Integer adults;
    private Integer children;
    private Integer infants;
    private Boolean success;
    private String error;
}