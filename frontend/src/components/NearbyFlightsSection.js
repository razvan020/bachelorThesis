"use client";

import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPlane,
  FaArrowRight,
  FaEuroSign,
} from "react-icons/fa";
import {
  getCurrencyForCountry,
  convertFromEUR,
  formatPrice,
} from "../utils/currencyUtils";

// Modern flight card with glassmorphism and smooth animations
const FlightTicketCard = ({
  destination,
  imageUrl,
  price,
  ticketType,
  date,
  link = "#",
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="col-lg-4 col-md-6 mb-4"
      style={{
        animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
      }}
    >
      <div
        className={`modern-flight-card-enhanced h-100 position-relative overflow-hidden rounded-4 bg-white shadow-lg transition-all ${
          isHovered ? "hovered" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="position-relative overflow-hidden modern-image-container">
          {!imageLoaded && (
            <div className="position-absolute top-0 start-0 w-100 h-100 modern-image-placeholder" />
          )}
          <img
            src={
              imageUrl ||
              `https://source.unsplash.com/featured/?${destination},airport`
            }
            className={`w-100 h-100 object-fit-cover modern-card-image ${
              imageLoaded ? "loaded" : ""
            }`}
            alt={destination}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Gradient Overlay */}
          <div className="modern-gradient-overlay-new position-absolute top-0 start-0 w-100 h-100" />

          {/* Floating Badge */}
          <div className="position-absolute top-3 end-3">
            <span className="badge modern-floating-badge">{ticketType}</span>
          </div>

          {/* Price Tag - Enhanced visibility */}
          <div className="position-absolute bottom-3 start-3">
            <div className="d-flex align-items-center">
              <div className="modern-price-tag">
                <div className="modern-price-label">From</div>
                <div className="modern-price-display fw-bold">{price}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="card-body p-4">
          <div className="d-flex align-items-start justify-content-between mb-3">
            <div className="flex-grow-1">
              <h5 className="card-title fw-bold text-dark mb-2">
                {destination}
              </h5>
              <div className="d-flex align-items-center text-muted small mb-2">
                <FaCalendarAlt className="me-2" />
                <span>{date}</span>
              </div>

              {/* Additional Price Display in Card Body */}
              <div className="d-flex align-items-center justify-content-between">
                <div className="modern-price-secondary">
                  <span className="text-muted small">Starting from</span>
                  <div className="fw-bold text-primary h6 mb-0">{price}</div>
                </div>
                <div className="modern-plane-icon d-flex align-items-center justify-content-center">
                  <FaPlane />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <a
            href={link}
            className="btn modern-book-button w-100 d-flex align-items-center justify-content-center"
          >
            <span className="me-2">Book Flight</span>
            <FaArrowRight className="modern-arrow-icon" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default function NearbyFlightsSection() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [closestAirport, setClosestAirport] = useState(null);

  // airports array...
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

  // Get location with better error handling
  useEffect(() => {
    const getLocation = async () => {
      try {
        // Try IP geolocation first
        const response = await fetch("https://ipapi.co/json/", {
          timeout: 5000, // 5 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          console.log("IP Geolocation data:", data);

          if (data.latitude && data.longitude) {
            setUserLocation({ lat: data.latitude, lng: data.longitude });
            const closest = findClosestAirport(data.latitude, data.longitude);
            setClosestAirport(closest);
            return;
          }
        }
      } catch (ipError) {
        console.warn("IP geolocation failed:", ipError);
      }

      // Fallback to browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            const closest = findClosestAirport(latitude, longitude);
            setClosestAirport(closest);
          },
          (geoError) => {
            console.warn("Geolocation error:", geoError);
            // Final fallback - use default airport
            setClosestAirport(airports[0]); // Default to Bucharest
          },
          { timeout: 10000 } // 10 second timeout
        );
      } else {
        console.warn("Geolocation is not supported by this browser.");
        // Final fallback - use default airport
        setClosestAirport(airports[0]); // Default to Bucharest
      }
    };

    getLocation();
  }, []);

  // Get flights with better error handling
  useEffect(() => {
    if (closestAirport) {
      setLoading(true);
      setError(null);

      // Try to fetch from API first, but fallback to sample data immediately if it fails
      const fetchWithTimeout = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

          const response = await fetch(
            `/api/flights/nearby?origin=${closestAirport.code}`,
            {
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            setFlights(data);
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        } catch (fetchError) {
          console.warn("API fetch failed, using sample data:", fetchError);
          // Use sample data instead of showing error
          setFlights(getSampleFlights(closestAirport.code));
        } finally {
          setLoading(false);
        }
      };

      fetchWithTimeout();
    }
  }, [closestAirport]);

  const getSampleFlights = (originCode) => {
    return [
      {
        id: 1,
        destinationCity: "Paris",
        destinationCode: "CDG",
        price: 199,
        departureDate: "2025-06-15",
        imageUrl:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: 2,
        destinationCity: "Rome",
        destinationCode: "FCO",
        price: 249,
        departureDate: "2025-07-10",
        imageUrl:
          "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: 3,
        destinationCity: "Barcelona",
        destinationCode: "BCN",
        price: 179,
        departureDate: "2025-06-20",
        imageUrl:
          "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: 4,
        destinationCity: "Amsterdam",
        destinationCode: "AMS",
        price: 229,
        departureDate: "2025-07-05",
        imageUrl:
          "https://images.unsplash.com/photo-1576924542622-772281a5c2da?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: 5,
        destinationCity: "Prague",
        destinationCode: "PRG",
        price: 189,
        departureDate: "2025-06-25",
        imageUrl:
          "https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: 6,
        destinationCity: "Vienna",
        destinationCode: "VIE",
        price: 209,
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

  const formatFlightData = (flights) => {
    const userCountry = closestAirport?.country || "Romania";
    const userCurrency = getCurrencyForCountry(userCountry);
    const includedCountries = new Set();

    const mappedFlights = flights.map((flight) => {
      const destinationCode = flight.destinationCode || flight.destination;
      const destinationAirport = airports.find(
        (airport) => airport.code === destinationCode
      );
      const cityName = destinationAirport
        ? destinationAirport.city
        : flight.destinationCity || "Unknown";
      const country = destinationAirport?.country || "Unknown";

      let monthDisplay = "In June";
      if (flight.departureDate) {
        const date = new Date(flight.departureDate);
        const month = date.toLocaleString("default", { month: "long" });
        monthDisplay = `In ${month}`;
      }

      let formattedPrice = "";
      if (flight.price) {
        const priceInEUR = parseFloat(flight.price);
        const convertedPrice = convertFromEUR(priceInEUR, userCurrency);
        formattedPrice = formatPrice(convertedPrice, userCurrency);
      }

      return {
        destination: cityName,
        country: country,
        imageUrl:
          flight.imageUrl ||
          destinationImages[cityName] ||
          `https://source.unsplash.com/featured/?${cityName},city`,
        price: formattedPrice,
        ticketType: "Return",
        date: monthDisplay,
        link: `/flights/availability?origin=${
          flight.originCode || flight.origin || closestAirport?.code
        }&destination=${destinationCode}&departureDate=${flight.departureDate}`,
      };
    });

    const diverseFlights = mappedFlights.filter((flight) => {
      if (!includedCountries.has(flight.country)) {
        includedCountries.add(flight.country);
        return true;
      }
      return false;
    });

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

  return (
    <section className="modern-flights-section-enhanced position-relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="modern-bg-elements position-absolute top-0 start-0 w-100 h-100">
        <div className="modern-bg-circle-1"></div>
        <div className="modern-bg-circle-2"></div>
        <div className="modern-bg-circle-3"></div>
      </div>

      <div className="container py-5 position-relative">
        {/* Enhanced Section Header */}
        <div className="row mb-5">
          <div className="col-12 text-center">
            <div className="modern-section-header-new">
              <div className="modern-location-indicator d-inline-flex align-items-center mb-4">
                <FaMapMarkerAlt className="me-2" />
                <span>Personalized for Your Location</span>
              </div>

              <h2 className="modern-section-title-enhanced mb-4">
                Discover Amazing
                <span className="d-block modern-gradient-text">
                  Flight Deals
                </span>
              </h2>

              {closestAirport && !loading && (
                <p className="modern-section-subtitle-new">
                  Curated flights departing from{" "}
                  <span className="fw-bold text-white">
                    {closestAirport.city} ({closestAirport.code})
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Flight Cards Grid */}
        <div className="row g-4">
          {loading ? (
            <div className="col-12">
              <div className="modern-loading-state-new d-flex flex-column align-items-center justify-content-center py-5">
                <div className="modern-spinner-container position-relative">
                  <div className="spinner-border text-white" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="modern-spinner-ring position-absolute top-0 start-0"></div>
                </div>
                <p className="text-white mt-4 modern-loading-text">
                  Finding the best flights for you...
                </p>
              </div>
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
                index={index}
              />
            ))
          )}
        </div>

        {/* Enhanced CTA Button */}
        {!loading && (
          <div className="row mt-5">
            <div className="col-12 text-center">
              <button
                type="button"
                className="modern-cta-button-new"
                onClick={() => (window.location.href = "/flights")}
              >
                <span className="me-3">Explore All Destinations</span>
                <div className="modern-cta-icon d-flex align-items-center justify-content-center">
                  <FaArrowRight />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
