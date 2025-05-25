package org.example.xlr8travel.services;

import org.example.xlr8travel.dto.NaturalLanguageSearchRequestDTO;
import org.example.xlr8travel.dto.NaturalLanguageSearchResponseDTO;

public interface GeminiService {
    NaturalLanguageSearchResponseDTO processNaturalLanguageQuery(NaturalLanguageSearchRequestDTO request);
}