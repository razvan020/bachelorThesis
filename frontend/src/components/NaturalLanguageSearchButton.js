import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { FaMagic } from 'react-icons/fa';
import axios from 'axios';

// Sample airport data with coordinates (copied from NearbyFlightsSection.js)
const airports = [
  {
    code: "OTP",
    name: "Henri Coandă Intl.",
    city: "Bucharest",
    country: "Romania",
    lat: 44.5711,
    lng: 26.0858,
  },
  {
    code: "BCN",
    name: "El Prat Airport",
    city: "Barcelona",
    country: "Spain",
    lat: 41.2974,
    lng: 2.0833,
  },
  {
    code: "LHR",
    name: "Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    lat: 51.47,
    lng: -0.4543,
  },
  {
    code: "JFK",
    name: "John F. Kennedy Intl.",
    city: "New York",
    country: "USA",
    lat: 40.6413,
    lng: -73.7781,
  },
  {
    code: "LAX",
    name: "Los Angeles Intl.",
    city: "Los Angeles",
    country: "USA",
    lat: 33.9416,
    lng: -118.4085,
  },
  {
    code: "TIA",
    name: "Rinas Mother Teresa",
    city: "Tirana",
    country: "Albania",
    lat: 41.4147,
    lng: 19.7206,
  },
  {
    code: "EVN",
    name: "Zvartnots Intl",
    city: "Yerevan",
    country: "Armenia",
    lat: 40.1473,
    lng: 44.3959,
  },
  {
    code: "VIE",
    name: "Vienna Intl",
    city: "Vienna",
    country: "Austria",
    lat: 48.1102,
    lng: 16.5697,
  },
  {
    code: "GYD",
    name: "Heydar Aliyev Intl",
    city: "Baku",
    country: "Azerbaijan",
    lat: 40.4675,
    lng: 50.0467,
  },
  {
    code: "CRL",
    name: "Brussels South Charleroi",
    city: "Brussels Charleroi",
    country: "Belgium",
    lat: 50.4592,
    lng: 4.4525,
  },
  {
    code: "AMS",
    name: "Amsterdam Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
    lat: 52.3105,
    lng: 4.7683,
  },
  {
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    lat: 49.0097,
    lng: 2.5479,
  },
  {
    code: "FCO",
    name: "Leonardo da Vinci Fiumicino",
    city: "Rome",
    country: "Italy",
    lat: 41.8002,
    lng: 12.2388,
  },
  {
    code: "MXP",
    name: "Milano Malpensa",
    city: "Milan",
    country: "Italy",
    lat: 45.63,
    lng: 8.7255,
  },
  {
    code: "MUC",
    name: "Franz Josef Strauss",
    city: "Munich",
    country: "Germany",
    lat: 48.3537,
    lng: 11.775,
  },
  {
    code: "BER",
    name: "Berlin Brandenburg",
    city: "Berlin",
    country: "Germany",
    lat: 52.3667,
    lng: 13.5033,
  },
  {
    code: "CLJ",
    name: "Avram Iancu",
    city: "Cluj",
    country: "Romania",
    lat: 46.7852,
    lng: 23.6862,
  },
  {
    code: "MAD",
    name: "Adolfo Suárez Madrid–Barajas",
    city: "Madrid",
    country: "Spain",
    lat: 40.4983,
    lng: -3.5676,
  },
  {
    code: "ATH",
    name: "Athens International",
    city: "Athens",
    country: "Greece",
    lat: 37.9364,
    lng: 23.9445,
  },
  {
    code: "ZRH",
    name: "Zurich Airport",
    city: "Zurich",
    country: "Switzerland",
    lat: 47.4647,
    lng: 8.5492,
  },
];

// Function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

// Function to find the closest airport to the user's location
const findClosestAirport = (userLat, userLng) => {
  if (!userLat || !userLng) return null;

  let closestAirport = null;
  let minDistance = Infinity;

  airports.forEach((airport) => {
    const distance = calculateDistance(
      userLat,
      userLng,
      airport.lat,
      airport.lng
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestAirport = airport;
    }
  });

  return closestAirport;
};

const NaturalLanguageSearchButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [closestAirport, setClosestAirport] = useState(null);
  const [suggestions] = useState([
    'Weekend trip from Bucharest to Amsterdam',
    'One way to London next month',
    'Flights from Bucharest to Barcelona under $200',
    'Family vacation to Rome in July with 2 kids',
    'Business trip to Berlin next week'
  ]);

  // Get user's location when component mounts
  useEffect(() => {
    // Use a free IP geolocation service
    fetch('https://ipapi.co/json/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("IP Geolocation data:", data);
        if (data.latitude && data.longitude) {
          setUserLocation({ lat: data.latitude, lng: data.longitude });

          // Find closest airport
          const closest = findClosestAirport(data.latitude, data.longitude);
          setClosestAirport(closest);
        } else {
          throw new Error('No location data available');
        }
      })
      .catch(error => {
        console.error("Error getting location from IP:", error);

        // Fallback to browser geolocation if IP geolocation fails
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lng: longitude });

              // Find closest airport
              const closest = findClosestAirport(latitude, longitude);
              setClosestAirport(closest);
            },
            (geoError) => {
              console.error("Geolocation error:", geoError);
              // Default to a specific airport if all geolocation methods fail
              setClosestAirport(airports[0]); // Default to first airport in the list
            }
          );
        } else {
          console.error("Geolocation is not supported by this browser.");
          // Default to a specific airport if geolocation is not supported
          setClosestAirport(airports[0]); // Default to first airport in the list
        }
      });
  }, []);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare request with user location and closest airport
      const requestData = {
        query: query
      };

      // Add closest airport if available
      if (closestAirport) {
        requestData.closestAirport = closestAirport.code;
        console.log(`Including closest airport in request: ${closestAirport.code} (${closestAirport.city})`);
      }

      // Add user coordinates if available
      if (userLocation) {
        requestData.userLatitude = userLocation.lat;
        requestData.userLongitude = userLocation.lng;
        console.log(`Including user coordinates in request: ${userLocation.lat}, ${userLocation.lng}`);
      }

      const response = await axios.post('/api/flights/natural-language/search', requestData);

      const searchParams = response.data;

      if (searchParams.success) {
        // Build URL parameters for flight search
        const params = new URLSearchParams({
          origin: searchParams.origin,
          destination: searchParams.destination,
          departureDate: searchParams.departureDate,
          adults: searchParams.adults.toString(),
          children: searchParams.children.toString(),
          infants: searchParams.infants.toString(),
          tripType: searchParams.tripType,
        });

        if (searchParams.tripType === 'roundTrip' && searchParams.returnDate) {
          params.append('arrivalDate', searchParams.returnDate);
        }

        // Redirect to flight search results
        window.location.href = `/flights/availability?${params.toString()}`;
      } else {
        setError(searchParams.error || 'Failed to process your search query');
      }
    } catch (err) {
      console.error('Error processing natural language search:', err);
      setError(err.response?.data?.error || 'An error occurred while processing your search');
    } finally {
      setIsLoading(false);
    }
  };

  const useSuggestion = (suggestion) => {
    setQuery(suggestion);
  };

  return (
    <>
      <Button 
        variant="outline-primary" 
        onClick={handleShow}
        className="d-flex align-items-center"
      >
        <FaMagic className="me-2" /> Try Natural Language Search
      </Button>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Natural Language Flight Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Describe your trip in natural language and our AI will find the best flights for you.
          </p>

          <Form onSubmit={handleSearch}>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Example: Weekend trip from Bucharest to Amsterdam"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
              />
            </Form.Group>

            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Processing...
                  </>
                ) : (
                  'Search Flights'
                )}
              </Button>
            </div>
          </Form>

          <div className="mt-4">
            <p className="text-muted small mb-2">Try these examples:</p>
            <div className="d-flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => useSuggestion(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NaturalLanguageSearchButton;
