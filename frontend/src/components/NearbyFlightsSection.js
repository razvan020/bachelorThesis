// components/NearbyFlightsSection.js
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FaCalendarAlt, FaRegThumbsUp, FaRegThumbsDown } from 'react-icons/fa';
import { getCurrencyForCountry, convertFromEUR, formatPrice } from '../utils/currencyUtils';
import NaturalLanguageSearchButton from './NaturalLanguageSearchButton';

// Custom hook for persistent storage
const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = value => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// A reusable card component for flight tickets with feedback buttons
const FlightTicketCard = ({ 
  destination, 
  imageUrl, 
  price, 
  ticketType, 
  date, 
  link = "#", 
  destinationCode,
  isRecommended = false,
  onFeedback = () => {},
  recommendationScore = 0
}) => (
  <div className="col-md-4 col-sm-6 mb-4">
    <div className={`card h-100 border-0 shadow ${isRecommended ? 'border-primary' : ''}`}>
      {isRecommended && (
        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge bg-primary">Recommended</span>
        </div>
      )}
      <img
        src={imageUrl || `https://source.unsplash.com/featured/?${destination},airport`}
        className="card-img-top"
        alt={destination}
        style={{ aspectRatio: '4/3', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{destination}</h5>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-primary fw-bold">{price}</span>
          <span className="badge bg-light text-dark">{ticketType}</span>
        </div>
        <p className="card-text text-muted">
          <small><FaCalendarAlt className="me-1" style={{ verticalAlign: 'text-top' }} />{date}</small>
        </p>
        <div className="d-flex justify-content-between align-items-center mt-auto mb-2">
          <a href={link} className="btn btn-primary">
            Book Now
          </a>
          {isRecommended && (
            <div className="d-flex">
              <button 
                onClick={() => onFeedback(destinationCode, 'like')}
                className="btn btn-sm btn-outline-success me-1"
                aria-label="Like this recommendation"
              >
                <FaRegThumbsUp />
              </button>
              <button 
                onClick={() => onFeedback(destinationCode, 'dislike')}
                className="btn btn-sm btn-outline-danger"
                aria-label="Dislike this recommendation"
              >
                <FaRegThumbsDown />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function NearbyFlightsSection() {
  // Original state
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [closestAirport, setClosestAirport] = useState(null);

  // New state for recommendations
  const [recommendedFlights, setRecommendedFlights] = useState([]);
  const [showRecommended, setShowRecommended] = useState(false);
  const [userPreferences, setUserPreferences] = useLocalStorage('flightPreferences', {
    searchHistory: [],
    clickedDestinations: [],
    likedDestinations: [],
    dislikedDestinations: [],
    favoriteCountries: [],
    seasonalPreferences: {},
    priceRange: { min: 0, max: 1000 },
    lastUpdated: new Date().toISOString()
  });

  // Circuit breaker pattern state
  const [circuitBreakerState, setCircuitBreakerState] = useLocalStorage('circuitBreakerState', {
    status: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
    failureCount: 0,
    lastFailureTime: null,
    resetTimeout: 30000, // 30 seconds
    failureThreshold: 3
  });

  // Sample airport data with coordinates (in a real app, this would come from an API)
  const airports = [
    { code: "OTP", name: "Henri Coandă Intl.", city: "Bucharest", country: "Romania", lat: 44.5711, lng: 26.0858 },
    { code: "BCN", name: "El Prat Airport", city: "Barcelona", country: "Spain", lat: 41.2974, lng: 2.0833 },
    { code: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom", lat: 51.4700, lng: -0.4543 },
    { code: "JFK", name: "John F. Kennedy Intl.", city: "New York", country: "USA", lat: 40.6413, lng: -73.7781 },
    { code: "LAX", name: "Los Angeles Intl.", city: "Los Angeles", country: "USA", lat: 33.9416, lng: -118.4085 },
    { code: "TIA", name: "Rinas Mother Teresa", city: "Tirana", country: "Albania", lat: 41.4147, lng: 19.7206 },
    { code: "EVN", name: "Zvartnots Intl", city: "Yerevan", country: "Armenia", lat: 40.1473, lng: 44.3959 },
    { code: "VIE", name: "Vienna Intl", city: "Vienna", country: "Austria", lat: 48.1102, lng: 16.5697 },
    { code: "GYD", name: "Heydar Aliyev Intl", city: "Baku", country: "Azerbaijan", lat: 40.4675, lng: 50.0467 },
    { code: "CRL", name: "Brussels South Charleroi", city: "Brussels Charleroi", country: "Belgium", lat: 50.4592, lng: 4.4525 },
    { code: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam", country: "Netherlands", lat: 52.3105, lng: 4.7683 },
    { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", lat: 49.0097, lng: 2.5479 },
    { code: "FCO", name: "Leonardo da Vinci Fiumicino", city: "Rome", country: "Italy", lat: 41.8002, lng: 12.2388 },
    { code: "MXP", name: "Milano Malpensa", city: "Milan", country: "Italy", lat: 45.6300, lng: 8.7255 },
    { code: "MUC", name: "Franz Josef Strauss", city: "Munich", country: "Germany", lat: 48.3537, lng: 11.7750 },
    { code: "BER", name: "Berlin Brandenburg", city: "Berlin", country: "Germany", lat: 52.3667, lng: 13.5033 },
    { code: "CLJ", name: "Avram Iancu", city: "Cluj", country: "Romania", lat: 46.7852, lng: 23.6862 },
    { code: "MAD", name: "Adolfo Suárez Madrid–Barajas", city: "Madrid", country: "Spain", lat: 40.4983, lng: -3.5676 },
    { code: "ATH", name: "Athens International", city: "Athens", country: "Greece", lat: 37.9364, lng: 23.9445 },
    { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", lat: 47.4647, lng: 8.5492 },
  ];

  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
  };

  // Function to find the closest airport to the user's location
  const findClosestAirport = (userLat, userLng) => {
    if (!userLat || !userLng) return null;

    let closestAirport = null;
    let minDistance = Infinity;

    airports.forEach(airport => {
      const distance = calculateDistance(userLat, userLng, airport.lat, airport.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestAirport = airport;
      }
    });

    return closestAirport;
  };

  // Track user interactions with the search system
  const trackSearchInteraction = useCallback((searchData) => {
    if (!searchData) return;

    setUserPreferences(prev => {
      // Keep only the last 20 searches to avoid excessive storage
      const updatedSearchHistory = [
        ...prev.searchHistory, 
        { ...searchData, timestamp: new Date().toISOString() }
      ].slice(-20);

      return {
        ...prev,
        searchHistory: updatedSearchHistory,
        lastUpdated: new Date().toISOString()
      };
    });
  }, [setUserPreferences]);

  // Track when a user clicks on a destination
  const trackDestinationClick = useCallback((destinationCode) => {
    if (!destinationCode) return;

    setUserPreferences(prev => {
      // Keep only the last 20 clicked destinations
      const updatedClickedDestinations = [
        ...prev.clickedDestinations, 
        { code: destinationCode, timestamp: new Date().toISOString() }
      ].slice(-20);

      return {
        ...prev,
        clickedDestinations: updatedClickedDestinations,
        lastUpdated: new Date().toISOString()
      };
    });
  }, [setUserPreferences]);

  // Handle recommendation feedback
  const handleRecommendationFeedback = useCallback((destinationCode, feedbackType) => {
    if (!destinationCode) return;

    setUserPreferences(prev => {
      let updatedLiked = [...prev.likedDestinations];
      let updatedDisliked = [...prev.dislikedDestinations];

      if (feedbackType === 'like') {
        // Add to liked if not already there
        if (!updatedLiked.includes(destinationCode)) {
          updatedLiked.push(destinationCode);
        }
        // Remove from disliked if it was there
        updatedDisliked = updatedDisliked.filter(code => code !== destinationCode);
      } else if (feedbackType === 'dislike') {
        // Add to disliked if not already there
        if (!updatedDisliked.includes(destinationCode)) {
          updatedDisliked.push(destinationCode);
        }
        // Remove from liked if it was there
        updatedLiked = updatedLiked.filter(code => code !== destinationCode);
      }

      return {
        ...prev,
        likedDestinations: updatedLiked,
        dislikedDestinations: updatedDisliked,
        lastUpdated: new Date().toISOString()
      };
    });
  }, [setUserPreferences]);

  // Calculate current season once at component level, not inside a function
  const currentSeason = useMemo(() => {
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 2 && currentMonth <= 4) return 'spring';
    else if (currentMonth >= 5 && currentMonth <= 7) return 'summer';
    else if (currentMonth >= 8 && currentMonth <= 10) return 'autumn';
    else return 'winter';
  }, []);

  // Ref to track if we've already updated preferences to avoid infinite loops
  const preferencesUpdatedRef = useRef(false);

  // Analyze user preferences to extract patterns without updating state directly
  const analyzeUserPreferences = useCallback(() => {
    // Extract favorite countries from click history
    const clickedCodes = userPreferences.clickedDestinations.map(item => 
      typeof item === 'string' ? item : item.code
    );

    const countryCounts = clickedCodes.reduce((acc, code) => {
      const airport = airports.find(a => a.code === code);
      if (airport?.country) {
        acc[airport.country] = (acc[airport.country] || 0) + 1;
      }
      return acc;
    }, {});

    // Get top countries
    const favoriteCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    // Analyze price preferences from search history
    let minPrice = Infinity;
    let maxPrice = 0;

    userPreferences.searchHistory.forEach(search => {
      if (search.price) {
        const price = parseFloat(search.price);
        if (!isNaN(price)) {
          minPrice = Math.min(minPrice, price);
          maxPrice = Math.max(maxPrice, price);
        }
      }
    });

    // If we have valid price data, update the price range
    const priceRange = {
      min: minPrice !== Infinity ? minPrice : 0,
      max: maxPrice > 0 ? maxPrice : 1000
    };

    // Analyze seasonal preferences
    const seasonalPreferences = userPreferences.searchHistory.reduce((acc, search) => {
      if (search.departureDate) {
        try {
          const date = new Date(search.departureDate);
          const month = date.getMonth();
          // Group into seasons
          let season;
          if (month >= 2 && month <= 4) season = 'spring';
          else if (month >= 5 && month <= 7) season = 'summer';
          else if (month >= 8 && month <= 10) season = 'autumn';
          else season = 'winter';

          acc[season] = (acc[season] || 0) + 1;
        } catch (e) {
          console.error('Error parsing date:', e);
        }
      }
      return acc;
    }, {});

    // Return the analyzed preferences without updating state
    return {
      favoriteCountries,
      priceRange,
      seasonalPreferences
    };
  }, [userPreferences, airports]);

  // Separate effect to update preferences to avoid infinite loops
  useEffect(() => {
    console.log("Preferences update effect running");

    // Skip if component is not mounted
    if (!isMountedRef.current) {
      console.log("Component not mounted, skipping preferences update");
      return;
    }

    const analyzedPreferences = analyzeUserPreferences();
    console.log("Analyzed preferences:", analyzedPreferences);

    // Only update preferences if there are actual changes
    const hasChanges = 
      !userPreferences.favoriteCountries || 
      !userPreferences.priceRange || 
      !userPreferences.seasonalPreferences ||
      JSON.stringify(analyzedPreferences.favoriteCountries) !== JSON.stringify(userPreferences.favoriteCountries) ||
      JSON.stringify(analyzedPreferences.priceRange) !== JSON.stringify(userPreferences.priceRange) ||
      JSON.stringify(analyzedPreferences.seasonalPreferences) !== JSON.stringify(userPreferences.seasonalPreferences);

    console.log("Preferences have changes:", hasChanges);

    if (hasChanges) {
      // Use a timeout to debounce the update
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          console.log("Updating preferences");
          setUserPreferences(prev => ({
            ...prev,
            favoriteCountries: analyzedPreferences.favoriteCountries,
            priceRange: analyzedPreferences.priceRange,
            seasonalPreferences: analyzedPreferences.seasonalPreferences,
            lastUpdated: new Date().toISOString()
          }));
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [userPreferences, analyzeUserPreferences, setUserPreferences]);

  // Generate personalized recommendations based on user preferences
  const generateRecommendations = useCallback((allFlights) => {
    if (!allFlights || allFlights.length === 0) return [];

    // First, analyze current preferences
    const preferences = analyzeUserPreferences();

    // Score each flight based on user preferences
    const scoredFlights = allFlights.map(flight => {
      // Extract destination code
      const destinationCode = flight.destinationCode || flight.destination;
      const destinationAirport = airports.find(airport => airport.code === destinationCode);

      if (!destinationAirport) return { ...flight, recommendationScore: 0 };

      const country = destinationAirport.country || '';
      const city = destinationAirport.city || '';

      // Initialize score
      let score = 0;

      // 1. Country preference (highest weight)
      if (preferences.favoriteCountries.includes(country)) {
        score += 10;
      }

      // 2. Price preference
      const price = parseFloat(flight.price) || 300;
      const priceRange = preferences.priceRange;

      // Higher score for prices in the user's preferred range
      if (price >= priceRange.min && price <= priceRange.max) {
        // Normalize to 0-5 range, higher score for lower prices within range
        const priceScore = 5 * (1 - ((price - priceRange.min) / (priceRange.max - priceRange.min || 1)));
        score += priceScore;
      }

      // 3. Seasonal preference
      const seasonScore = preferences.seasonalPreferences[currentSeason] || 0;
      score += seasonScore;

      // 4. Explicit user feedback
      if (userPreferences.likedDestinations.includes(destinationCode)) {
        score += 15; // Strong positive signal
      }
      if (userPreferences.dislikedDestinations.includes(destinationCode)) {
        score -= 20; // Strong negative signal
      }

      // 5. Click history (moderate weight)
      const clickedCodes = userPreferences.clickedDestinations.map(item => 
        typeof item === 'string' ? item : item.code
      );
      if (clickedCodes.includes(destinationCode)) {
        // User has clicked this destination before
        score += 5;
      }

      // 6. Diversity bonus - slightly boost destinations from countries 
      // that aren't the user's top favorites to encourage exploration
      if (!preferences.favoriteCountries.includes(country)) {
        score += 2;
      }

      return { 
        ...flight, 
        recommendationScore: score,
        destinationCode,
        country,
        city
      };
    });

    // Sort by score (highest first) and take top results
    const sortedRecommendations = scoredFlights
      .sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Ensure diversity in top recommendations
    const diverseRecommendations = [];
    const includedCountries = new Set();

    // First pass: include top-scoring flight from each country
    for (const flight of sortedRecommendations) {
      if (!includedCountries.has(flight.country) && flight.recommendationScore > 0) {
        diverseRecommendations.push(flight);
        includedCountries.add(flight.country);

        // Stop if we have enough recommendations
        if (diverseRecommendations.length >= 6) break;
      }
    }

    // Second pass: if we don't have enough diverse recommendations,
    // add more from the top-scoring flights
    if (diverseRecommendations.length < 6) {
      for (const flight of sortedRecommendations) {
        if (!diverseRecommendations.includes(flight) && flight.recommendationScore > 0) {
          diverseRecommendations.push(flight);

          // Stop if we have enough recommendations
          if (diverseRecommendations.length >= 6) break;
        }
      }
    }

    // If we still don't have enough, just use the original sorted list
    if (diverseRecommendations.length < 6) {
      return sortedRecommendations.slice(0, 6);
    }

    return diverseRecommendations;
  }, [analyzeUserPreferences, airports, userPreferences, currentSeason]);

  // Use a ref to track the previous closestAirport value
  const prevClosestAirportRef = useRef(null);

  // Use a ref to track if geolocation has been attempted
  const geolocationAttemptedRef = useRef(false);

  // Get user's location
  useEffect(() => {
    console.log("Geolocation effect running");

    // Skip if we've already attempted geolocation and have a closest airport
    if (geolocationAttemptedRef.current && closestAirport) {
      console.log("Already attempted geolocation and have closest airport:", closestAirport.code);
      return;
    }

    console.log("Attempting to get user location");

    // Mark that we've attempted geolocation
    geolocationAttemptedRef.current = true;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Got user location:", position.coords);
          const { latitude, longitude } = position.coords;

          // Find closest airport
          const closest = findClosestAirport(latitude, longitude);
          console.log("Found closest airport:", closest?.code);

          // Only update if we don't have an airport yet or it's different
          if (!prevClosestAirportRef.current || 
              prevClosestAirportRef.current.code !== closest.code) {

            console.log("Updating closest airport to:", closest.code);

            // Update in a single batch to reduce renders
            // First update the ref
            prevClosestAirportRef.current = closest;

            // Then update the state
            setUserLocation({ lat: latitude, lng: longitude });
            setClosestAirport(closest);

            // Reset hasFetchedForCurrentAirportRef to ensure we fetch flights for the new airport
            hasFetchedForCurrentAirportRef.current = false;
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a specific airport if geolocation fails
          if (!closestAirport) {
            console.log("Defaulting to first airport:", airports[0].code);
            setClosestAirport(airports[0]); // Default to first airport in the list
            prevClosestAirportRef.current = airports[0];
          }
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Default to a specific airport if geolocation is not supported
      if (!closestAirport) {
        console.log("Geolocation not supported, defaulting to first airport:", airports[0].code);
        setClosestAirport(airports[0]); // Default to first airport in the list
        prevClosestAirportRef.current = airports[0];
      }
    }
  }, []); // No dependencies - only run once on mount

  // Use a ref to track if the component is mounted
  const isMountedRef = useRef(true);

  // Initialize isMountedRef to true
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Maximum number of retries
  const MAX_RETRIES = 3;

  // Helper function to check if circuit breaker allows requests
  const canMakeRequest = useCallback(() => {
    const now = Date.now();

    // If circuit is OPEN, check if it's time to try again
    if (circuitBreakerState.status === 'OPEN') {
      const timeElapsed = now - (circuitBreakerState.lastFailureTime || 0);

      // If enough time has passed, move to HALF_OPEN state
      if (timeElapsed > circuitBreakerState.resetTimeout) {
        setCircuitBreakerState(prev => ({
          ...prev,
          status: 'HALF_OPEN'
        }));
        return true;
      }

      // Circuit is OPEN and timeout hasn't elapsed, don't make request
      return false;
    }

    // If circuit is CLOSED or HALF_OPEN, allow the request
    return true;
  }, [circuitBreakerState.status, circuitBreakerState.lastFailureTime, circuitBreakerState.resetTimeout]);

  // Helper function to record a successful request
  const recordSuccess = useCallback(() => {
    // If we were in HALF_OPEN state, move back to CLOSED
    if (circuitBreakerState.status === 'HALF_OPEN') {
      setCircuitBreakerState(prev => ({
        ...prev,
        status: 'CLOSED',
        failureCount: 0,
        lastFailureTime: null
      }));
    }
  }, [circuitBreakerState.status]);

  // Helper function to record a failed request
  const recordFailure = useCallback(() => {
    const now = Date.now();
    const newFailureCount = circuitBreakerState.failureCount + 1;

    // If we've reached the threshold, open the circuit
    if (newFailureCount >= circuitBreakerState.failureThreshold) {
      setCircuitBreakerState(prev => ({
        ...prev,
        status: 'OPEN',
        failureCount: newFailureCount,
        lastFailureTime: now
      }));
    } else {
      // Otherwise just increment the failure count
      setCircuitBreakerState(prev => ({
        ...prev,
        failureCount: newFailureCount,
        lastFailureTime: now
      }));
    }
  }, [circuitBreakerState.failureCount, circuitBreakerState.failureThreshold]);

  // Ref to track if we're currently fetching flights
  const isFetchingRef = useRef(false);

  // Memoize the fetchFlightsWithRetry function to prevent it from being recreated on every render
  const fetchFlightsWithRetry = useCallback(async (retryCount = 0, abortSignal) => {
    console.log("fetchFlightsWithRetry called", { retryCount, airport: closestAirport?.code });

    // Skip if no airport or component unmounted
    if (!closestAirport) {
      console.log("No closest airport, skipping fetch");
      return;
    }

    if (!isMountedRef.current) {
      console.log("Component not mounted, skipping fetch");
      return;
    }

    // Check if already fetching
    if (isFetchingRef.current) {
      console.log("Already fetching, skipping duplicate fetch");
      return;
    }

    // Set fetching flag to true
    isFetchingRef.current = true;

    // Always set loading to true when starting a fetch
    if (isMountedRef.current) {
      console.log("Setting loading to true");
      setLoading(true);
      setError(null);
    }

    // Check if circuit breaker allows this request
    if (!canMakeRequest()) {
      console.log('Circuit breaker is OPEN. Using sample data instead.');

      if (isMountedRef.current) {
        setError("Backend server is temporarily unavailable. Using sample data instead.");

        // Use sample data when circuit breaker is open
        const sampleData = getSampleFlights(closestAirport.code);
        setFlights(sampleData);

        // Generate recommendations from sample data
        const recommendations = generateRecommendations(sampleData);
        setRecommendedFlights(recommendations);
        setLoading(false);
      }

      // Reset fetching flag
      isFetchingRef.current = false;
      return;
    }

    // Track this search in user preferences (only on first attempt)
    if (retryCount === 0) {
      trackSearchInteraction({
        origin: closestAirport.code,
        searchType: 'nearby'
      });
    }

    try {
      console.log(`Fetching flights for ${closestAirport.code}, attempt ${retryCount + 1}`);

      // Add a small delay to prevent rapid successive requests
      // Exponential backoff for retries
      const delay = retryCount > 0 ? Math.min(1000 * Math.pow(2, retryCount - 1), 5000) : 100;
      await new Promise(resolve => setTimeout(resolve, delay));

      // Check if the request has been aborted or component unmounted
      if (abortSignal && abortSignal.aborted) {
        console.log("Request aborted, skipping fetch");
        return;
      }

      if (!isMountedRef.current) {
        console.log("Component unmounted during delay, skipping fetch");
        return;
      }

      // Create a new AbortController for the timeout
      const timeoutController = new AbortController();

      // Set up a timeout for the fetch request
      const timeoutId = setTimeout(() => {
        console.log("Fetch timeout reached, aborting request");
        timeoutController.abort("Timeout reached");
      }, 10000);

      // Define abortListener outside the try block so it's in scope for the finally block
      let abortListener = null;

      // Only set up the abort listener if we have a valid abortSignal
      if (abortSignal && !abortSignal.aborted) {
        // Listen for abort events from the original signal
        abortListener = () => {
          console.log("Original abort signal triggered, aborting timeout controller");
          timeoutController.abort("Parent aborted");
          clearTimeout(timeoutId);
        };

        // Add the abort listener to the original signal
        abortSignal.addEventListener('abort', abortListener);
      }

      let response;
      try {
        // We'll use the original abortSignal to check if the request should be aborted
        if (abortSignal && abortSignal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        console.log(`Making fetch request to: /api/flights/nearby?origin=${closestAirport.code}`);

        response = await fetch(
          `/api/flights/nearby?origin=${closestAirport.code}`,
          { 
            signal: timeoutController.signal
          }
        );

        console.log(`Fetch response status: ${response.status} ${response.statusText}`);
        console.log(`Response headers:`, Object.fromEntries([...response.headers.entries()]));

        // Clear the timeout since the request completed
        clearTimeout(timeoutId);
      } catch (fetchError) {
        // Clear the timeout in case of error
        clearTimeout(timeoutId);
        throw fetchError;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Received ${data.length} flights for ${closestAirport.code}`);

      // Check if the request has been aborted or component unmounted before updating state
      if (abortSignal && abortSignal.aborted) {
        console.log("Request aborted after fetch, skipping state update");
        return;
      }

      if (!isMountedRef.current) {
        console.log("Component unmounted after fetch, skipping state update");
        return;
      }

      // Record successful request for circuit breaker
      recordSuccess();

      // Update state with fetched data
      setFlights(data);

      // Generate recommendations based on fetched flights
      const recommendations = generateRecommendations(data);
      setRecommendedFlights(recommendations);

      // Reset error state if successful after retries
      if (retryCount > 0) {
        setError(null);
      }

      // Set loading to false after successful fetch
      setLoading(false);
      console.log("Fetch completed successfully, loading set to false");

    } catch (error) {
      // Don't update state if the request was aborted or component unmounted
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }

      if (!isMountedRef.current) {
        console.log('Component unmounted, skipping error handling');
        return;
      }

      console.error(`Error fetching nearby flights (attempt ${retryCount + 1}):`, error);
      console.error(`Error name: ${error.name}, message: ${error.message}`);
      console.error(`Error stack:`, error.stack);

      // Log additional information about the error
      if (error.cause) {
        console.error(`Error cause:`, error.cause);
      }

      // Check if it's a CORS error
      if (error.message.includes('CORS')) {
        console.error('This appears to be a CORS error. Check that the backend has proper CORS headers configured.');
      }

      // Check if it's a network error
      if (error.name === 'TypeError' || 
          error.message.includes('NetworkError') || 
          error.message.includes('ECONNREFUSED') || 
          error.message.includes('Failed to fetch')) {
        console.error('This appears to be a network error. Check that the backend server is running and accessible.');
        recordFailure();
      }

      // Retry logic for network errors
      if ((error.name === 'TypeError' || 
           error.message.includes('NetworkError') || 
           error.message.includes('ECONNREFUSED') || 
           error.message.includes('Failed to fetch')) && 
          retryCount < MAX_RETRIES && 
          isMountedRef.current && 
          circuitBreakerState.status !== 'OPEN') {
        console.log(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);

        // Reset fetching flag before retrying
        isFetchingRef.current = false;

        return fetchFlightsWithRetry(retryCount + 1, abortSignal);
      }

      // Only set error state if all retries failed and component is still mounted
      if (isMountedRef.current) {
        if (error.message.includes('ECONNREFUSED') || error.message.includes('Failed to fetch')) {
          setError("Backend server is not available. Using sample data instead.");
        } else {
          setError("Failed to load flights. Please try again later.");
        }

        // For demo purposes, use sample data if API fails after all retries
        const sampleData = getSampleFlights(closestAirport.code);
        setFlights(sampleData);

        // Generate recommendations from sample data
        const recommendations = generateRecommendations(sampleData);
        setRecommendedFlights(recommendations);

        // Set loading to false after using sample data
        setLoading(false);
        console.log("Using sample data, loading set to false");
      }
    } finally {
      // Reset fetching flag
      isFetchingRef.current = false;

      // Clean up the abort listener
      if (abortSignal && abortListener) {
        abortSignal.removeEventListener('abort', abortListener);
      }

      // Ensure loading is set to false if the component is still mounted
      if (isMountedRef.current && !(abortSignal && abortSignal.aborted)) {
        setLoading(false);
        console.log("Finally block: loading set to false");
      }
    }
  }, [
    canMakeRequest, 
    recordSuccess, 
    recordFailure, 
    generateRecommendations, 
    trackSearchInteraction,
    // Use circuitBreakerState.status instead of the whole object
    circuitBreakerState.status,
    // Include closestAirport.code to ensure the function is recreated when the airport changes
    closestAirport?.code
  ]);

  // Ref to track if we've already fetched flights for the current airport
  const hasFetchedForCurrentAirportRef = useRef(false);

  // Fetch nearby flights when closest airport is determined
  useEffect(() => {
    // Skip if we don't have a closestAirport yet
    if (!closestAirport) return;

    console.log("Fetching flights for airport:", closestAirport.code);

    // Reset the ref when the airport changes
    if (prevClosestAirportRef.current?.code !== closestAirport.code) {
      hasFetchedForCurrentAirportRef.current = false;
    }

    // Skip if we've already fetched for this airport
    if (hasFetchedForCurrentAirportRef.current && 
        prevClosestAirportRef.current?.code === closestAirport.code) {
      console.log("Already fetched for this airport, skipping");
      return;
    }

    // Update the ref to track that we're fetching for this airport
    hasFetchedForCurrentAirportRef.current = true;
    prevClosestAirportRef.current = closestAirport;

    // Create a reference to the current abort controller
    const abortController = new AbortController();
    const signal = abortController.signal;

    // Call fetchFlightsWithRetry with the abort signal
    fetchFlightsWithRetry(0, signal);

    // Cleanup function to abort the fetch request when the component unmounts
    // or when closestAirport changes
    return () => {
      abortController.abort();
    };
  }, [fetchFlightsWithRetry, closestAirport]); // Depend on both the memoized function and closestAirport

  // Sample flight data for demonstration purposes
  // Prices are in EUR
  const getSampleFlights = (originCode) => {
    return [
      {
        id: 1,
        destinationCity: "Paris",
        destinationCode: "CDG",
        price: 199, // Price in EUR
        departureDate: "2025-06-15",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: 2,
        destinationCity: "Rome",
        destinationCode: "FCO",
        price: 249, // Price in EUR
        departureDate: "2025-07-10",
        imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: 3,
        destinationCity: "Barcelona",
        destinationCode: "BCN",
        price: 179, // Price in EUR
        departureDate: "2025-06-20",
        imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: 4,
        destinationCity: "Amsterdam",
        destinationCode: "AMS",
        price: 229, // Price in EUR
        departureDate: "2025-07-05",
        imageUrl: "https://images.unsplash.com/photo-1576924542622-772281a5c2da?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: 5,
        destinationCity: "Prague",
        destinationCode: "PRG",
        price: 189, // Price in EUR
        departureDate: "2025-06-25",
        imageUrl: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: 6,
        destinationCity: "Vienna",
        destinationCode: "VIE",
        price: 209, // Price in EUR
        departureDate: "2025-07-15",
        imageUrl: "https://images.unsplash.com/photo-1516550893885-985c836c5be1?q=80&w=800&auto=format&fit=crop"
      }
    ];
  };

  const destinationImages = {
    "Barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800&auto=format&fit=crop",
    "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop",
    "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
    "Amsterdam": "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800&auto=format&fit=crop",
    "Vienna": "https://images.unsplash.com/photo-1516550893885-985c836c5be1?q=80&w=800&auto=format&fit=crop",
    "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop",
    "Prague": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=800&auto=format&fit=crop",
    "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop",
    "Los Angeles": "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?q=80&w=800&auto=format&fit=crop",
    "Bucharest": "https://images.unsplash.com/photo-1584646098378-0874589d76b1?q=80&w=800&auto=format&fit=crop",
    "Cluj": "https://images.unsplash.com/photo-1567967455389-e724f0e7e1d0?q=80&w=800&auto=format&fit=crop",
    "Munich": "https://images.unsplash.com/photo-1595867818082-083862f3d630?q=80&w=800&auto=format&fit=crop",
    "Berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=800&auto=format&fit=crop",
    "Milan": "https://images.unsplash.com/photo-1603122630570-680edbc53d03?q=80&w=800&auto=format&fit=crop",
    "Madrid": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=800&auto=format&fit=crop",
    "Athens": "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?q=80&w=800&auto=format&fit=crop",
    "Zurich": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=800&auto=format&fit=crop",
    "Tirana": "https://images.unsplash.com/photo-1592485283540-c5b10a3abc9b?q=80&w=800&auto=format&fit=crop",
    "Yerevan": "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=800&auto=format&fit=crop",
    "Baku": "https://images.unsplash.com/photo-1601074231585-ac6a1c644f6f?q=80&w=800&auto=format&fit=crop",
    "Brussels Charleroi": "https://images.unsplash.com/photo-1605826832916-d0a401fdb2a5?q=80&w=800&auto=format&fit=crop"
  };

  // Format flight data for display and ensure country diversity
  // Memoize this function to avoid unnecessary recalculations
  const formatFlightData = useCallback((flights, isRecommended = false, airport = null) => {
    if (!flights || flights.length === 0) return [];

    // Determine user's country and currency
    // Use the provided airport parameter or fall back to closestAirport
    const currentAirport = airport || closestAirport;
    const userCountry = currentAirport?.country || 'Romania'; // Default to Romania if no country is detected
    const userCurrency = getCurrencyForCountry(userCountry);

    // First, map all flights to get their data
    const mappedFlights = flights.map(flight => {
      // Find the city name for the destination
      // Check both destinationCode (from sample data) and destination (from API)
      const destinationCode = flight.destinationCode || flight.destination;
      const destinationAirport = airports.find(airport => airport.code === destinationCode);
      const cityName = destinationAirport ? 
        destinationAirport.city : 
        (flight.destinationCity || "Unknown");

      // Get the country for this destination
      const country = destinationAirport?.country || "Unknown";

      // Format date to show only the month
      let monthDisplay = "In June"; // Default fallback
      if (flight.departureDate) {
        const date = new Date(flight.departureDate);
        const month = date.toLocaleString('default', { month: 'long' });
        monthDisplay = `In ${month}`;
      }

      // Convert and format price based on user's country
      let formattedPrice = "";
      if (flight.price) {
        // Assume the price from API is in EUR
        const priceInEUR = parseFloat(flight.price);
        // Convert to user's currency
        const convertedPrice = convertFromEUR(priceInEUR, userCurrency);
        // Format with appropriate currency symbol
        formattedPrice = formatPrice(convertedPrice, userCurrency);
      }

      return {
        destination: cityName,
        country: country, // Add country to the returned object
        destinationCode: destinationCode,
        imageUrl: flight.imageUrl || destinationImages[cityName] || `https://source.unsplash.com/featured/?${cityName},city`,
        price: formattedPrice,
        ticketType: "Return", // Always show "Return"
        date: monthDisplay,
        link: `/flights/availability?origin=${flight.originCode || flight.origin || closestAirport?.code}&destination=${destinationCode}&departureDate=${flight.departureDate}`,
        isRecommended: isRecommended,
        recommendationScore: flight.recommendationScore || 0
      };
    });

    // If these are not recommendations, ensure country diversity
    if (!isRecommended) {
      // Track countries we've already included to avoid duplicates
      const includedCountries = new Set();

      // Filter to ensure country diversity
      const diverseFlights = mappedFlights.filter(flight => {
        // If we haven't seen this country before, include it
        if (!includedCountries.has(flight.country)) {
          includedCountries.add(flight.country);
          return true;
        }
        return false;
      });

      // If we don't have enough diverse flights, add more flights regardless of country
      if (diverseFlights.length < 6 && mappedFlights.length > diverseFlights.length) {
        const remainingFlights = mappedFlights.filter(flight => !diverseFlights.includes(flight));
        diverseFlights.push(...remainingFlights.slice(0, 6 - diverseFlights.length));
      }

      return diverseFlights;
    }

    // For recommendations, we already handled diversity in the recommendation algorithm
    return mappedFlights;
  }, [airports, destinationImages]);

  // Handle case where no flights are available
  if (!loading && (flights.length === 0 || error)) {
    return (
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-12 text-center">
            <h2 className="fw-semibold">Explore Direct Flights From Your Area</h2>
            <p className="text-muted">
              {error || "No flights available from your area at this time."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Memoize formatted flight data to avoid unnecessary recalculations
  // Use a stable reference to closestAirport to prevent unnecessary recalculations
  const stableClosestAirport = useMemo(() => closestAirport, [closestAirport?.code]);

  const formattedRegularFlights = useMemo(() => 
    formatFlightData(flights, false, stableClosestAirport), 
    [flights, formatFlightData, stableClosestAirport]);

  const formattedRecommendedFlights = useMemo(() => 
    formatFlightData(recommendedFlights, true, stableClosestAirport), 
    [recommendedFlights, formatFlightData, stableClosestAirport]);

  return (
    <div className="container py-5">
      {/* Section Title */}
      <div className="row mb-4">
        <div className="col-12 text-center">
          <h2 className="fw-semibold">Explore Direct Flights From Your Area</h2>
          {closestAirport && (
            <p className="text-muted">
              Showing flights from {closestAirport.city} ({closestAirport.code})
            </p>
          )}
        </div>
      </div>

      {/* Toggle between Popular and Recommended */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-center">
          <div className="btn-group" role="group" aria-label="Flight view options">
            <button 
              type="button" 
              className={`btn ${!showRecommended ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setShowRecommended(false)}
            >
              Popular Destinations
            </button>
            <button 
              type="button" 
              className={`btn ${showRecommended ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setShowRecommended(true)}
            >
              Recommended For You
            </button>
          </div>
        </div>
      </div>

      {/* Flight Tickets Row */}
      <div className="row">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Finding flights from your area...</p>
          </div>
        ) : (
          (showRecommended ? formattedRecommendedFlights : formattedRegularFlights).map((flight, index) => (
            <FlightTicketCard
              key={index}
              destination={flight.destination}
              imageUrl={flight.imageUrl}
              price={flight.price}
              ticketType={flight.ticketType}
              date={flight.date}
              link={flight.link}
              destinationCode={flight.destinationCode}
              isRecommended={flight.isRecommended}
              onFeedback={handleRecommendationFeedback}
              recommendationScore={flight.recommendationScore}
            />
          ))
        )}
      </div>

      {/* View All Flights Button */}
      <div className="row mt-4">
        <div className="col-12 text-center">
          <button
            type="button"
            className="btn rounded-pill px-4 py-2 text-white fw-medium"
            style={{ backgroundColor: "#5DB4D0", fontSize: '1.1rem' }}
            onClick={() => {
              // Track this interaction
              trackSearchInteraction({
                action: 'viewAllFlights',
                origin: closestAirport?.code
              });
              window.location.href = "/flights";
            }}
          >
            View All Flights
          </button>
        </div>
      </div>
    </div>
  );
}
