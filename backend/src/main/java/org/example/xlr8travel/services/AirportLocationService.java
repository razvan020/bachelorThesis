package org.example.xlr8travel.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class AirportLocationService {

    // Airport data structure with coordinates (copied from frontend)
    private final List<Airport> airports = new ArrayList<>();
    
    // Constructor to initialize the airport data
    public AirportLocationService() {
        initializeAirports();
    }
    
    // Initialize the list of airports with their coordinates
    private void initializeAirports() {
        // Copy the airport data from NearbyFlightsSection.js
        airports.add(new Airport("OTP", "Henri Coandă Intl.", "Bucharest", "Romania", 44.5711, 26.0858));
        airports.add(new Airport("BCN", "El Prat Airport", "Barcelona", "Spain", 41.2974, 2.0833));
        airports.add(new Airport("LHR", "Heathrow Airport", "London", "United Kingdom", 51.47, -0.4543));
        airports.add(new Airport("JFK", "John F. Kennedy Intl.", "New York", "USA", 40.6413, -73.7781));
        airports.add(new Airport("LAX", "Los Angeles Intl.", "Los Angeles", "USA", 33.9416, -118.4085));
        airports.add(new Airport("TIA", "Rinas Mother Teresa", "Tirana", "Albania", 41.4147, 19.7206));
        airports.add(new Airport("EVN", "Zvartnots Intl", "Yerevan", "Armenia", 40.1473, 44.3959));
        airports.add(new Airport("VIE", "Vienna Intl", "Vienna", "Austria", 48.1102, 16.5697));
        airports.add(new Airport("GYD", "Heydar Aliyev Intl", "Baku", "Azerbaijan", 40.4675, 50.0467));
        airports.add(new Airport("CRL", "Brussels South Charleroi", "Brussels Charleroi", "Belgium", 50.4592, 4.4525));
        airports.add(new Airport("AMS", "Amsterdam Schiphol", "Amsterdam", "Netherlands", 52.3105, 4.7683));
        airports.add(new Airport("CDG", "Charles de Gaulle Airport", "Paris", "France", 49.0097, 2.5479));
        airports.add(new Airport("FCO", "Leonardo da Vinci Fiumicino", "Rome", "Italy", 41.8002, 12.2388));
        airports.add(new Airport("MXP", "Milano Malpensa", "Milan", "Italy", 45.63, 8.7255));
        airports.add(new Airport("MUC", "Franz Josef Strauss", "Munich", "Germany", 48.3537, 11.775));
        airports.add(new Airport("BER", "Berlin Brandenburg", "Berlin", "Germany", 52.3667, 13.5033));
        airports.add(new Airport("CLJ", "Avram Iancu", "Cluj", "Romania", 46.7852, 23.6862));
        airports.add(new Airport("MAD", "Adolfo Suárez Madrid–Barajas", "Madrid", "Spain", 40.4983, -3.5676));
        airports.add(new Airport("ATH", "Athens International", "Athens", "Greece", 37.9364, 23.9445));
        airports.add(new Airport("ZRH", "Zurich Airport", "Zurich", "Switzerland", 47.4647, 8.5492));
    }
    
    // Find the closest airport to the given coordinates
    public Airport findClosestAirport(double userLat, double userLng) {
        if (Double.isNaN(userLat) || Double.isNaN(userLng)) {
            return airports.get(0); // Default to first airport if coordinates are invalid
        }
        
        Airport closestAirport = null;
        double minDistance = Double.MAX_VALUE;
        
        for (Airport airport : airports) {
            double distance = calculateDistance(userLat, userLng, airport.getLat(), airport.getLng());
            if (distance < minDistance) {
                minDistance = distance;
                closestAirport = airport;
            }
        }
        
        return closestAirport;
    }
    
    // Calculate distance between two coordinates using Haversine formula
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371; // Radius of the earth in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }
    
    // Inner class to represent airport data
    public static class Airport {
        private final String code;
        private final String name;
        private final String city;
        private final String country;
        private final double lat;
        private final double lng;
        
        public Airport(String code, String name, String city, String country, double lat, double lng) {
            this.code = code;
            this.name = name;
            this.city = city;
            this.country = country;
            this.lat = lat;
            this.lng = lng;
        }
        
        public String getCode() { return code; }
        public String getName() { return name; }
        public String getCity() { return city; }
        public String getCountry() { return country; }
        public double getLat() { return lat; }
        public double getLng() { return lng; }
    }
}