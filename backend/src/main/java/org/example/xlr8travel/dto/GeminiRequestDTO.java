package org.example.xlr8travel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeminiRequestDTO {
    private String prompt;
    private Double temperature;
    private Integer maxOutputTokens;
}