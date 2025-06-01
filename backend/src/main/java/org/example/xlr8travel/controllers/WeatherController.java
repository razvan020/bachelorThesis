package org.example.xlr8travel.controllers;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private static final Logger log = LoggerFactory.getLogger(WeatherController.class);

    @Value("${openweather.api.key}")
    private String openWeatherApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";

    /**
     * Get current weather for a city and country
     */
    @GetMapping
    public ResponseEntity<?> getCurrentWeather(
            @RequestParam String city,
            @RequestParam String country) {

        try {
            log.info("Fetching weather for city: {}, country: {}", city, country);

            // Build the OpenWeather API URL
            String url = String.format("%s/weather?q=%s,%s&appid=%s&units=metric",
                    WEATHER_API_BASE_URL,
                    city,
                    country,
                    openWeatherApiKey);

            // Make the API call
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                // Parse and transform the response
                JsonNode weatherData = objectMapper.readTree(response.getBody());
                Map<String, Object> formattedResponse = formatWeatherResponse(weatherData, city, country);

                log.info("Weather data successfully retrieved for {}, {}", city, country);
                return ResponseEntity.ok(formattedResponse);
            } else {
                log.error("OpenWeather API returned non-success status: {}", response.getStatusCode());
                return ResponseEntity.status(response.getStatusCode()).build();
            }

        } catch (HttpClientErrorException e) {
            log.error("HTTP error calling OpenWeather API for {}, {}: {}", city, country, e.getMessage());
            if (e.getStatusCode().value() == 401) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            } else if (e.getStatusCode().value() == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("Unexpected error fetching weather data for {}, {}", city, country, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weather forecast for a city and country
     */
    @GetMapping("/forecast")
    public ResponseEntity<?> getWeatherForecast(
            @RequestParam String city,
            @RequestParam String country) {

        try {
            log.info("Fetching forecast for city: {}, country: {}", city, country);

            String url = String.format("%s/forecast?q=%s,%s&appid=%s&units=metric",
                    WEATHER_API_BASE_URL,
                    city,
                    country,
                    openWeatherApiKey);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode forecastData = objectMapper.readTree(response.getBody());
                List<Map<String, Object>> formattedForecast = formatForecastResponse(forecastData, city, country);

                log.info("Forecast data successfully retrieved for {}, {}", city, country);
                return ResponseEntity.ok(formattedForecast);
            } else {
                log.error("OpenWeather forecast API returned non-success status: {}", response.getStatusCode());
                return ResponseEntity.status(response.getStatusCode()).build();
            }

        } catch (HttpClientErrorException e) {
            log.error("HTTP error calling OpenWeather forecast API for {}, {}: {}", city, country, e.getMessage());
            if (e.getStatusCode().value() == 401) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            } else if (e.getStatusCode().value() == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("Unexpected error fetching forecast data for {}, {}", city, country, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Format weather response to match frontend expectations
     */
    private Map<String, Object> formatWeatherResponse(JsonNode data, String requestedCity, String requestedCountry) {
        Map<String, Object> response = new HashMap<>();

        response.put("temperature", Math.round(data.path("main").path("temp").asDouble()));
        response.put("description", data.path("weather").get(0).path("description").asText());
        response.put("icon", data.path("weather").get(0).path("icon").asText());
        response.put("humidity", data.path("main").path("humidity").asInt());
        response.put("windSpeed", Math.round(data.path("wind").path("speed").asDouble() * 10.0) / 10.0);
        response.put("pressure", data.path("main").path("pressure").asInt());
        response.put("feelsLike", Math.round(data.path("main").path("feels_like").asDouble()));
        response.put("visibility", data.has("visibility") ?
                Math.round(data.path("visibility").asDouble() / 1000.0) : null);

        // Use the requested city and country instead of the API response
        response.put("location", requestedCity);
        response.put("country", requestedCountry);

        response.put("sunrise", data.path("sys").path("sunrise").asLong() * 1000);
        response.put("sunset", data.path("sys").path("sunset").asLong() * 1000);
        response.put("cloudiness", data.path("clouds").path("all").asInt());

        return response;
    }

    /**
     * Format forecast response to match frontend expectations
     */
    private List<Map<String, Object>> formatForecastResponse(JsonNode data, String requestedCity, String requestedCountry) {
        List<Map<String, Object>> dailyForecasts = new ArrayList<>();
        Map<String, List<JsonNode>> dailyData = new HashMap<>();

        // Group forecasts by date
        for (JsonNode forecast : data.path("list")) {
            Date date = new Date(forecast.path("dt").asLong() * 1000);
            String dateKey = date.toString().substring(0, 10); // Simple date grouping

            dailyData.computeIfAbsent(dateKey, k -> new ArrayList<>()).add(forecast);
        }

        // Process first 5 days
        dailyData.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .limit(5)
                .forEach(entry -> {
                    List<JsonNode> dayForecasts = entry.getValue();
                    Map<String, Object> dailyForecast = processDailyForecast(dayForecasts, requestedCity, requestedCountry);
                    dailyForecasts.add(dailyForecast);
                });

        return dailyForecasts;
    }

    /**
     * Process daily forecast data
     */
    private Map<String, Object> processDailyForecast(List<JsonNode> forecasts, String requestedCity, String requestedCountry) {
        Map<String, Object> daily = new HashMap<>();

        // Get temperatures for min/max calculation
        List<Double> temps = forecasts.stream()
                .mapToDouble(f -> f.path("main").path("temp").asDouble())
                .boxed()
                .toList();

        // Calculate daily values
        double avgTemp = temps.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double minTemp = temps.stream().mapToDouble(Double::doubleValue).min().orElse(0);
        double maxTemp = temps.stream().mapToDouble(Double::doubleValue).max().orElse(0);

        // Get first forecast for date and representative weather
        JsonNode firstForecast = forecasts.get(0);

        daily.put("date", firstForecast.path("dt").asLong() * 1000);
        daily.put("temperature", Math.round(avgTemp));
        daily.put("tempMin", Math.round(minTemp));
        daily.put("tempMax", Math.round(maxTemp));
        daily.put("description", firstForecast.path("weather").get(0).path("description").asText());
        daily.put("icon", firstForecast.path("weather").get(0).path("icon").asText());
        daily.put("humidity", firstForecast.path("main").path("humidity").asInt());
        daily.put("windSpeed", Math.round(firstForecast.path("wind").path("speed").asDouble() * 10.0) / 10.0);
        daily.put("cloudiness", firstForecast.path("clouds").path("all").asInt());
        daily.put("dataPoints", forecasts.size());

        // Add location information
        daily.put("location", requestedCity);
        daily.put("country", requestedCountry);

        return daily;
    }
}
