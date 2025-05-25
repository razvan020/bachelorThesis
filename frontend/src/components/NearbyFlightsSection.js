// components/NearbyFlightsSection.js
"use client";

import React, { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import {
  getCurrencyForCountry,
  convertFromEUR,
  formatPrice,
} from "../utils/currencyUtils";

// A reusable card component for flight tickets
const FlightTicketCard = ({
  destination,
  imageUrl,
  price,
  ticketType,
  date,
  link = "#",
}) => (
  <div className="col-md-4 col-sm-6 mb-4">
    <div className="card h-100 border-0 shadow">
      <img
        src={
          imageUrl ||
          `https://source.unsplash.com/featured/?${destination},airport`
        }
        className="card-img-top"
        alt={destination}
        style={{ aspectRatio: "4/3", objectFit: "cover" }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{destination}</h5>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-primary fw-bold">
            {price}
          </span>
          <span className="badge bg-light text-dark">{ticketType}</span>
        </div>
        <p className="card-text text-muted">
          <small>
            <FaCalendarAlt
              className="me-1"
              style={{ verticalAlign: "text-top" }}
            />
            {date}
          </small>
        </p>
        <a href={link} className="btn btn-primary mt-auto">
          Book Now
        </a>
      </div>
    </div>
  </div>
);

export default function NearbyFlightsSection() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [closestAirport, setClosestAirport] = useState(null);

  // Sample airport data with coordinates (in a real app, this would come from an API)
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

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Find closest airport
          const closest = findClosestAirport(latitude, longitude);
          setClosestAirport(closest);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a specific airport if geolocation fails
          setClosestAirport(airports[0]); // Default to first airport in the list
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Default to a specific airport if geolocation is not supported
      setClosestAirport(airports[0]); // Default to first airport in the list
    }
  }, []);

  // Fetch nearby flights when closest airport is determined
  useEffect(() => {
    if (closestAirport) {
      setLoading(true);
      fetch(`/api/flights/nearby?origin=${closestAirport.code}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setFlights(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching nearby flights:", error);
          setError("Failed to load flights. Please try again later.");
          setLoading(false);

          // For demo purposes, use sample data if API fails
          setFlights(getSampleFlights(closestAirport.code));
        });
    }
  }, [closestAirport]);

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
        imageUrl:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: 2,
        destinationCity: "Rome",
        destinationCode: "FCO",
        price: 249, // Price in EUR
        departureDate: "2025-07-10",
        imageUrl:
          "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: 3,
        destinationCity: "Barcelona",
        destinationCode: "BCN",
        price: 179, // Price in EUR
        departureDate: "2025-06-20",
        imageUrl:
          "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: 4,
        destinationCity: "Amsterdam",
        destinationCode: "AMS",
        price: 229, // Price in EUR
        departureDate: "2025-07-05",
        imageUrl:
          "https://images.unsplash.com/photo-1576924542622-772281a5c2da?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: 5,
        destinationCity: "Prague",
        destinationCode: "PRG",
        price: 189, // Price in EUR
        departureDate: "2025-06-25",
        imageUrl:
          "https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: 6,
        destinationCity: "Vienna",
        destinationCode: "VIE",
        price: 209, // Price in EUR
        departureDate: "2025-07-15",
        imageUrl:
          "https://images.unsplash.com/photo-1516550893885-985c836c5be1?q=80&w=800&auto=format&fit=crop",
      },
    ];
  };

  const destinationImages = {
    Barcelona:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800&auto=format&fit=crop",
    London:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop",
    Paris:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
    Amsterdam:
      "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800&auto=format&fit=crop",
    Vienna:
      "https://images.unsplash.com/photo-1516550893885-985c836c5be1?q=80&w=800&auto=format&fit=crop",
    Rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop",
    Prague:
      "https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=800&auto=format&fit=crop",
    "New York":
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop",
    "Los Angeles":
      "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?q=80&w=800&auto=format&fit=crop",
    Bucharest:
      "https://images.unsplash.com/photo-1584646098378-0874589d76b1?q=80&w=800&auto=format&fit=crop",
    Cluj: "https://images.unsplash.com/photo-1567967455389-e724f0e7e1d0?q=80&w=800&auto=format&fit=crop",
    Munich:
      "https://images.unsplash.com/photo-1595867818082-083862f3d630?q=80&w=800&auto=format&fit=crop",
    Berlin:
      "https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=800&auto=format&fit=crop",
    Milan:
      "https://images.unsplash.com/photo-1603122630570-680edbc53d03?q=80&w=800&auto=format&fit=crop",
    Madrid:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=800&auto=format&fit=crop",
    Athens:
      "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?q=80&w=800&auto=format&fit=crop",
    Zurich:
      "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=800&auto=format&fit=crop",
    Tirana:
      "https://images.unsplash.com/photo-1592485283540-c5b10a3abc9b?q=80&w=800&auto=format&fit=crop",
    Yerevan:
      "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=800&auto=format&fit=crop",
    Baku: "https://images.unsplash.com/photo-1601074231585-ac6a1c644f6f?q=80&w=800&auto=format&fit=crop",
    "Brussels Charleroi":
      "https://images.unsplash.com/photo-1605826832916-d0a401fdb2a5?q=80&w=800&auto=format&fit=crop",
  };

  // Format flight data for display and ensure country diversity
  const formatFlightData = (flights) => {
    // Determine user's country and currency
    const userCountry = closestAirport?.country || "Romania"; // Default to Romania if no country is detected
    const userCurrency = getCurrencyForCountry(userCountry);

    // Debug logging
    console.log(`User country: ${userCountry}, Currency: ${userCurrency}`);

    // Track countries we've already included to avoid duplicates
    const includedCountries = new Set();

    // First, map all flights to get their data
    const mappedFlights = flights.map((flight) => {
      // Find the city name for the destination
      // Check both destinationCode (from sample data) and destination (from API)
      const destinationCode = flight.destinationCode || flight.destination;
      const destinationAirport = airports.find(
        (airport) => airport.code === destinationCode
      );
      const cityName = destinationAirport
        ? destinationAirport.city
        : flight.destinationCity || "Unknown";

      // Get the country for this destination
      const country = destinationAirport?.country || "Unknown";

      // Format date to show only the month
      let monthDisplay = "In June"; // Default fallback
      if (flight.departureDate) {
        const date = new Date(flight.departureDate);
        const month = date.toLocaleString("default", { month: "long" });
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

        // Debug logging for price conversion
        console.log(
          `Flight to ${cityName}: Price in EUR: ${priceInEUR}, Converted to ${userCurrency}: ${convertedPrice}, Formatted: ${formattedPrice}`
        );
      }

      return {
        destination: cityName,
        country: country, // Add country to the returned object
        imageUrl:
          flight.imageUrl ||
          destinationImages[cityName] ||
          `https://source.unsplash.com/featured/?${cityName},city`,
        price: formattedPrice,
        ticketType: "Return", // Always show "Return"
        date: monthDisplay,
        link: `/flights/availability?origin=${
          flight.originCode || flight.origin || closestAirport?.code
        }&destination=${destinationCode}&departureDate=${flight.departureDate}`,
      };
    });

    // Then filter to ensure country diversity
    const diverseFlights = mappedFlights.filter((flight) => {
      // If we haven't seen this country before, include it
      if (!includedCountries.has(flight.country)) {
        includedCountries.add(flight.country);
        return true;
      }
      return false;
    });

    // If we don't have enough diverse flights, add more flights regardless of country
    if (
      diverseFlights.length < 6 &&
      mappedFlights.length > diverseFlights.length
    ) {
      const remainingFlights = mappedFlights.filter(
        (flight) => !diverseFlights.includes(flight)
      );
      diverseFlights.push(
        ...remainingFlights.slice(0, 6 - diverseFlights.length)
      );
    }

    return diverseFlights;
  };

  // Handle case where no flights are available
  if (!loading && (flights.length === 0 || error)) {
    return (
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-12 text-center">
            <h2 className="fw-semibold">
              Explore Direct Flights From Your Area
            </h2>
            <p className="text-muted">
              {error || "No flights available from your area at this time."}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          formatFlightData(flights).map((flight, index) => (
            <FlightTicketCard
              key={index}
              destination={flight.destination}
              imageUrl={flight.imageUrl}
              price={flight.price}
              ticketType={flight.ticketType}
              date={flight.date}
              link={flight.link}
            />
          ))
        )}
      </div>

      {/* View All Flights Button */}
      <div className="row mt-4">
        <div className="col-12 text-center">
          <button
            type="button"
            className="btn btn-primary rounded-pill px-4 py-2 fw-medium"
            style={{ fontSize: "1.1rem" }}
            onClick={() => (window.location.href = "/flights")}
          >
            View All Flights
          </button>
        </div>
      </div>
    </div>
  );
}
