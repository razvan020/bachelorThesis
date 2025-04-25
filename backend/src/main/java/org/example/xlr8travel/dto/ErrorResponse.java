package org.example.xlr8travel.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

/**
 * Standardized error response for API endpoints
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private HttpStatus status;
    private int statusCode;
    private String message;
    private String path;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    public ErrorResponse(HttpStatus status, String message, String path) {
        this.status = status;
        this.statusCode = status.value();
        this.message = message;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }
}