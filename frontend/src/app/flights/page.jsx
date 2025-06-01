"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Image from "next/image";
import {
  FaSearch,
  FaArrowRight,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaPlane,
  FaGlobe,
  FaStar,
  FaFilter,
  FaHeart,
  FaShare,
  FaClock,
  FaUsers,
  FaBolt,
} from "react-icons/fa";
import {
  getCurrencyForCountry,
  convertFromEUR,
  formatPrice,
} from "@/utils/currencyUtils";

const FlightBookingApp = () => {
  const router = useRouter();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [userCurrency, setUserCurrency] = useState("RON");
  const [userCountry, setUserCountry] = useState("Romania");
  const [userLocation, setUserLocation] = useState(null);

  // Airport code to city name mapping
  const airportToCityMap = {
    OTP: "Bucharest",
    BCN: "Barcelona",
    LHR: "London",
    JFK: "New York",
    LAX: "Los Angeles",
    TIA: "Tirana",
    EVN: "Yerevan",
    VIE: "Vienna",
    GYD: "Baku",
    CRL: "Brussels",
    AMS: "Amsterdam",
    CDG: "Paris",
    FCO: "Rome",
    MXP: "Milan",
    MUC: "Munich",
    BER: "Berlin",
    CLJ: "Cluj",
    MAD: "Madrid",
    ATH: "Athens",
    ZRH: "Zurich",
    PRG: "Prague",
    WAW: "Warsaw",
    BUD: "Budapest",
    OSL: "Oslo",
    ARN: "Stockholm",
    CPH: "Copenhagen",
    HEL: "Helsinki",
    DUB: "Dublin",
    EDI: "Edinburgh",
    MAN: "Manchester",
    LIS: "Lisbon",
    OPO: "Porto",
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

  // Placeholder image (soft gradient or illustration)
  const placeholderImage = "/images/placeholder-travel.jpg";

  // Get city image with Unsplash fallback
  const getCityImage = (cityName) => {
    return (
      destinationImages[cityName] ||
      `https://source.unsplash.com/featured/?${cityName},city`
    );
  };

  // Helper to get full country name from airport code
  const getCountryName = (city, flightsArr) => {
    const match = flightsArr.find(
      (f) => f.origin === city || f.destination === city
    );
    return match ? match.country : "";
  };

  // Fetch flights from the API
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/flights");
        if (!response.ok) {
          throw new Error("Failed to fetch flights");
        }
        const data = await response.json();
        setFlights(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching flights:", err);
        setError("Failed to load flights. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  // Update the useEffect for location detection
  useEffect(() => {
    const getLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;

              // Use Nominatim OpenStreetMap for reverse geocoding
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
                {
                  headers: {
                    Accept: "application/json",
                    "User-Agent": "XLR8Travel/1.0", // Required by Nominatim ToS
                  },
                }
              );

              if (response.ok) {
                const data = await response.json();
                const countryName = data.address?.country || "Romania";
                const currency = getCurrencyForCountry(countryName);

                setUserCountry(countryName);
                setUserCurrency(currency);
                console.log(
                  `Location detected: ${countryName}, using currency: ${currency}`
                );
              } else {
                console.warn("Geocoding failed, using default values");
                setUserCountry("Romania");
                setUserCurrency("RON");
              }
            } catch (error) {
              console.error("Error in location detection:", error);
              setUserCountry("Romania");
              setUserCurrency("RON");
            }
          },
          (error) => {
            console.warn("Geolocation permission denied or error:", error);
            setUserCountry("Romania");
            setUserCurrency("RON");
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else {
        console.warn("Geolocation is not supported");
        setUserCountry("Romania");
        setUserCurrency("RON");
      }
    };

    getLocation();
  }, []);

  // Filter and sort flights
  const filteredFlights = flights
    .filter((flight) => {
      const matchesSearch =
        searchTerm === "" ||
        flight.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.origin.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "promotions" && flight.price < flight.regularPrice) ||
        (activeFilter === "direct" && !flight.hasStops);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "duration":
          return a.duration - b.duration;
        case "departure":
          return new Date(a.departureTime) - new Date(b.departureTime);
        default:
          return 0;
      }
    });

  const FlightCard = ({ flight }) => {
    const handleBookNow = () => {
      const searchParams = new URLSearchParams({
        origin: flight.origin,
        destination: flight.destination,
        departureDate: flight.departureDate,
        tripType: "oneWay",
      });
      router.push(`/flights/availability?${searchParams.toString()}`);
    };

    // Convert airport codes to city names
    const originCity = airportToCityMap[flight.origin] || flight.origin;
    const destinationCity =
      airportToCityMap[flight.destination] || flight.destination;

    // Get city image using Unsplash
    const imageUrl = getCityImage(destinationCity);

    // Get full country names
    const originCountry =
      flight.originCountry ||
      flight.origin_country ||
      flight.originCountryName ||
      flight.origin_country_name ||
      flight.originCountryFull ||
      flight.originCountryFullName ||
      "";
    const destinationCountry =
      flight.destinationCountry ||
      flight.destination_country ||
      flight.destinationCountryName ||
      flight.destination_country_name ||
      flight.destinationCountryFull ||
      flight.destinationCountryFullName ||
      "";

    const isPromotion = flight.price < flight.regularPrice;

    return (
      <div className="ultra-modern-flight-card">
        {/* Card Header with Image */}
        <div className="card-header-section">
          <div className="card-image-container">
            <img
              key={`flight-img-${destinationCity}`}
              src={
                destinationImages[destinationCity] ||
                `https://source.unsplash.com/featured/?${destinationCity},city`
              }
              alt={destinationCity}
              className="card-image"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
            <div className="image-overlay"></div>
            <div className="image-gradient"></div>

            {/* Floating Action Buttons */}
            <div className="floating-actions">
              <button className="action-btn favorite-btn">
                <FaHeart />
              </button>
              <button className="action-btn share-btn">
                <FaShare />
              </button>
            </div>

            {/* Promotion Badge */}
            {isPromotion && (
              <div className="promotion-badge">
                <FaBolt />
                <span>Hot Deal</span>
              </div>
            )}

            {/* Destination Info Overlay */}
            <div className="destination-overlay">
              <h3 className="destination-city">{destinationCity}</h3>
              <p className="destination-country">{destinationCountry}</p>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="card-content-section">
          {/* Route Info */}
          <div className="route-section">
            <div className="route-info">
              <div className="origin-info">
                <span className="airport-code">{originCity}</span>
                <span className="country-name">{originCountry}</span>
              </div>
              <div className="route-visual">
                <div className="route-line">
                  <div className="route-dot origin-dot"></div>
                  <div className="route-path">
                    <FaPlane className="plane-icon" />
                  </div>
                  <div className="route-dot destination-dot"></div>
                </div>
                <span className="flight-type">
                  {flight.hasStops ? "1+ stops" : "Direct"}
                </span>
              </div>
              <div className="destination-info">
                <span className="airport-code">{destinationCity}</span>
                <span className="country-name">{destinationCountry}</span>
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="details-section">
            <div className="detail-item">
              <FaCalendarAlt className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Departure</span>
                <span className="detail-value">
                  {new Date(flight.departureDate).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <FaClock className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Duration</span>
                <span className="detail-value">{flight.duration}h</span>
              </div>
            </div>

            <div className="detail-item">
              <FaUsers className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Seats</span>
                <span className="detail-value">Available</span>
              </div>
            </div>
          </div>

          {/* Price and Booking */}
          <div className="booking-section">
            <div className="price-container">
              <div className="price-info">
                <span className="price-label">From</span>
                <div className="price-main">
                  <span className="currency-symbol">
                    {formatPrice(
                      convertFromEUR(flight.price, userCurrency),
                      userCurrency
                    ).slice(0, 1)}
                  </span>
                  <span className="price-amount">
                    {formatPrice(
                      convertFromEUR(flight.price, userCurrency),
                      userCurrency
                    ).slice(1)}
                  </span>
                </div>
                {isPromotion && (
                  <span className="original-price">
                    {formatPrice(
                      convertFromEUR(flight.regularPrice, userCurrency),
                      userCurrency
                    )}
                  </span>
                )}
              </div>

              <button className="modern-book-btn" onClick={handleBookNow}>
                <span>Book Flight</span>
                <FaArrowRight className="btn-arrow" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ultra-modern-flights-page">
      {/* Animated Background */}
      <div className="page-background">
        <div className="bg-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
        </div>

        <div className="floating-elements">
          <FaPlane className="floating-icon icon-1" />
          <FaGlobe className="floating-icon icon-2" />
          <FaStar className="floating-icon icon-3" />
          <FaMapMarkerAlt className="floating-icon icon-4" />
        </div>
      </div>

      <Container>
        {/* Hero Section */}
        <div className="hero-section">
          <div className="location-indicator">
            <FaMapMarkerAlt className="location-icon" />
            <span>Personalized for Your Location</span>
          </div>

          <h1 className="main-title">
            Discover Amazing
            <span className="gradient-text"> Flight Deals</span>
          </h1>

          <p className="main-subtitle">
            Curated flights departing from{" "}
            <strong>{userCountry || "Romania"}</strong> • Find your next
            adventure
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="controls-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-search-input"
              />
            </div>
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <button
                className={`filter-btn ${
                  activeFilter === "all" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("all")}
              >
                <span>All Flights</span>
              </button>
              <button
                className={`filter-btn ${
                  activeFilter === "promotions" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("promotions")}
              >
                <FaBolt />
                <span>Hot Deals</span>
              </button>
              <button
                className={`filter-btn ${
                  activeFilter === "direct" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("direct")}
              >
                <FaPlane />
                <span>Direct Only</span>
              </button>
            </div>

            <div className="sort-controls">
              <FaFilter className="sort-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="modern-select"
              >
                <option value="price">Sort by Price</option>
                <option value="duration">Sort by Duration</option>
                <option value="departure">Sort by Departure</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-plane">
                  <FaPlane />
                </div>
              </div>
              <h3 className="loading-title">Discovering Amazing Flights</h3>
              <p className="loading-subtitle">
                Please wait while we find the best deals for you
              </p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <h3 className="error-title">Oops! Something went wrong</h3>
              <p className="error-message">{error}</p>
              <button
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                <FaArrowRight />
                Try Again
              </button>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon">
                <FaSearch />
              </div>
              <h3 className="empty-title">No flights found</h3>
              <p className="empty-message">
                Try adjusting your search criteria or filters
              </p>
            </div>
          ) : (
            <div className="flights-grid">
              {filteredFlights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          )}
        </div>
      </Container>

      <style jsx global>{`
        :root {
          --primary-orange: #ff6f00;
          --secondary-gold: #fbbf24;
          --success-green: #10b981;
          --error-red: #ef4444;
          --dark-bg: rgb(0, 0, 0);
          --darker-bg: rgb(0, 0, 0);
          --glass-bg: rgba(255, 255, 255, 0.05);
          --glass-border: rgba(255, 255, 255, 0.1);
          --text-primary: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.8);
          --text-muted: rgba(255, 255, 255, 0.6);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--darker-bg);
          color: var(--text-primary);
          overflow-x: hidden;
        }

        .ultra-modern-flights-page {
          min-height: 100vh;
          position: relative;
          background: linear-gradient(
            135deg,
            var(--darker-bg) 0%,
            var(--dark-bg) 50%,
            var(--darker-bg) 100%
          );
          padding: 2rem 0 4rem 0;
        }

        /* Animated Background */
        .page-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .bg-particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          opacity: 0.08;
          animation: float 25s ease-in-out infinite;
        }

        .particle-1 {
          width: 400px;
          height: 400px;
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .particle-2 {
          width: 300px;
          height: 300px;
          top: 50%;
          right: -150px;
          animation-delay: 8s;
        }

        .particle-3 {
          width: 250px;
          height: 250px;
          bottom: -125px;
          left: 50%;
          animation-delay: 16s;
        }

        .particle-4 {
          width: 180px;
          height: 180px;
          top: 30%;
          left: 80%;
          animation-delay: 4s;
        }

        .particle-5 {
          width: 220px;
          height: 220px;
          bottom: 40%;
          left: 15%;
          animation-delay: 12s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1) rotate(0deg);
            opacity: 0.08;
          }
          33% {
            transform: translateY(-40px) scale(1.15) rotate(120deg);
            opacity: 0.15;
          }
          66% {
            transform: translateY(25px) scale(0.85) rotate(240deg);
            opacity: 0.12;
          }
        }

        .floating-elements {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .floating-icon {
          position: absolute;
          color: var(--primary-orange);
          font-size: 2.5rem;
          opacity: 0.08;
          animation: floatIcon 18s ease-in-out infinite;
        }

        .icon-1 {
          top: 15%;
          left: 12%;
          animation-delay: 0s;
        }
        .icon-2 {
          top: 25%;
          right: 18%;
          animation-delay: 4s;
        }
        .icon-3 {
          bottom: 25%;
          left: 25%;
          animation-delay: 8s;
        }
        .icon-4 {
          bottom: 35%;
          right: 15%;
          animation-delay: 12s;
        }

        @keyframes floatIcon {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.08;
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
            opacity: 0.2;
          }
        }

        /* Hero Section */
        .hero-section {
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
          padding: 2rem 0;
        }

        .location-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          color: var(--primary-orange);
          font-weight: 600;
          padding: 0.8rem 1.5rem;
          border-radius: 50px;
          margin-bottom: 2rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          font-size: 0.9rem;
        }

        .location-icon {
          font-size: 1.1rem;
        }

        .main-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          color: var(--text-primary);
          margin-bottom: 1rem;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .gradient-text {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            var(--secondary-gold) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .main-subtitle {
          color: var(--text-secondary);
          font-size: clamp(1rem, 2.5vw, 1.3rem);
          font-weight: 400;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Controls Section */
        .controls-section {
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }

        .search-container {
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
        }

        .search-input-wrapper {
          position: relative;
          width: 100%;
          max-width: 600px;
        }

        .search-icon {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 1.2rem;
          z-index: 2;
        }

        .modern-search-input {
          width: 100%;
          padding: 1.3rem 1.5rem 1.3rem 3.5rem;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 2px solid var(--glass-border);
          border-radius: 20px;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 500;
          transition: all 0.3s ease;
          outline: none;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .modern-search-input:focus {
          border-color: var(--primary-orange);
          box-shadow: 0 0 0 4px rgba(255, 111, 0, 0.1),
            0 12px 35px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.08);
        }

        .modern-search-input::placeholder {
          color: var(--text-muted);
        }

        .filter-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          gap: 1rem;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 0.5rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .filter-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-weight: 600;
          border-radius: 12px;
          padding: 0.8rem 1.5rem;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .filter-btn.active,
        .filter-btn:hover {
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 111, 0, 0.3);
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0.8rem 1.2rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .sort-icon {
          color: var(--primary-orange);
          font-size: 1rem;
        }

        .modern-select {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-weight: 500;
          font-size: 0.95rem;
          outline: none;
          cursor: pointer;
        }

        .modern-select option {
          background: var(--dark-bg);
          color: var(--text-primary);
        }

        /* Results Section */
        .results-section {
          position: relative;
          z-index: 1;
        }

        .flights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Flight Card */
        .ultra-modern-flight-card {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          position: relative;
        }

        .ultra-modern-flight-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(255, 111, 0, 0.15),
            0 8px 32px rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 111, 0, 0.3);
        }

        /* Card Header */
        .card-header-section {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .card-image-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.4) 0%,
            rgba(0, 0, 0, 0.1) 50%,
            rgba(0, 0, 0, 0.6) 100%
          );
          z-index: 1;
        }

        .image-gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.8) 0%,
            transparent 100%
          );
          z-index: 2;
        }

        .floating-actions {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
          z-index: 3;
        }

        .action-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .action-btn:hover {
          background: var(--primary-orange);
          border-color: var(--primary-orange);
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(255, 111, 0, 0.4);
        }

        .promotion-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: linear-gradient(135deg, var(--error-red), #dc2626);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          z-index: 3;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .destination-overlay {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          z-index: 3;
        }

        .destination-city {
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.2rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .destination-country {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
        }

        /* Card Content */
        .card-content-section {
          padding: 1.5rem;
        }

        /* Route Section */
        .route-section {
          margin-bottom: 1.5rem;
        }

        .route-info {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 1rem;
        }

        .origin-info,
        .destination-info {
          text-align: center;
        }

        .airport-code {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
          color: black;
          margin-bottom: 0.2rem;
        }

        .country-name {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .route-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .route-line {
          position: relative;
          width: 80px;
          height: 2px;
          background: linear-gradient(
            90deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .route-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: absolute;
        }

        .origin-dot {
          left: -4px;
          background: var(--primary-orange);
        }

        .destination-dot {
          right: -4px;
          background: var(--secondary-gold);
        }

        .route-path {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .plane-icon {
          color: white;
          font-size: 0.9rem;
          filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));
          animation: planeFly 3s ease-in-out infinite;
        }

        @keyframes planeFly {
          0%,
          100% {
            transform: translateX(-2px);
          }
          50% {
            transform: translateX(2px);
          }
        }

        .flight-type {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Details Section */
        .details-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .detail-icon {
          color: var(--primary-orange);
          font-size: 1rem;
          flex-shrink: 0;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .detail-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.1rem;
        }

        .detail-value {
          font-size: 0.9rem;
          color: var(--text-primary);
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Booking Section */
        .booking-section {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1.5rem;
        }

        .price-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .price-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .price-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.3rem;
        }

        .price-main {
          display: flex;
          align-items: baseline;
          gap: 0.2rem;
        }

        .currency-symbol {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--primary-orange);
        }

        .price-amount {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }

        .original-price {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-decoration: line-through;
          margin-top: 0.2rem;
        }

        .modern-book-btn {
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          border: none;
          border-radius: 16px;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          padding: 1rem 2rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          display: flex;
          align-items: center;
          gap: 0.8rem;
          box-shadow: 0 8px 25px rgba(255, 111, 0, 0.3);
          position: relative;
          overflow: hidden;
        }

        .modern-book-btn:before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .modern-book-btn:hover:before {
          left: 100%;
        }

        .modern-book-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(255, 111, 0, 0.4);
        }

        .btn-arrow {
          font-size: 1rem;
          transition: transform 0.3s ease;
        }

        .modern-book-btn:hover .btn-arrow {
          transform: translateX(4px);
        }

        /* Loading States */
        .loading-container,
        .error-container,
        .empty-container {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .loading-spinner {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
        }

        .spinner-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid var(--primary-orange);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner-plane {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--primary-orange);
          font-size: 1.5rem;
          animation: planeBounce 2s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes planeBounce {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        .loading-title,
        .error-title,
        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .loading-subtitle,
        .error-message,
        .empty-message {
          color: var(--text-secondary);
          font-size: 1rem;
          line-height: 1.6;
        }

        .error-icon,
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          opacity: 0.6;
        }

        .empty-icon {
          color: var(--text-muted);
        }

        .retry-btn {
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          padding: 0.8rem 1.5rem;
          margin-top: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 111, 0, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .flights-grid {
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .ultra-modern-flights-page {
            padding: 1rem 0 2rem 0;
          }

          .hero-section {
            padding: 1rem 0;
            margin-bottom: 2rem;
          }

          .main-title {
            font-size: 2.5rem;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .filter-group {
            justify-content: center;
          }

          .sort-controls {
            justify-content: center;
          }

          .flights-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .price-container {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .modern-book-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .main-title {
            font-size: 2rem;
          }

          .card-header-section {
            height: 180px;
          }

          .destination-city {
            font-size: 1.5rem;
          }

          .card-content-section {
            padding: 1rem;
          }

          .details-section {
            grid-template-columns: 1fr;
            gap: 0.8rem;
            padding: 0.8rem;
          }

          .route-info {
            grid-template-columns: 1fr;
            gap: 1rem;
            text-align: center;
          }

          .route-visual {
            order: 2;
          }

          .route-line {
            width: 60px;
          }

          .filter-group {
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .filter-btn {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }
        }

        /* Enhanced Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .particle,
          .floating-icon,
          .plane-icon,
          .spinner-ring,
          .spinner-plane {
            animation: none;
          }

          .ultra-modern-flight-card {
            transition: none;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .ultra-modern-flight-card {
            border: 2px solid var(--text-primary);
          }

          .filter-btn.active {
            border: 2px solid white;
          }
        }
      `}</style>
    </div>
  );
};

export default FlightBookingApp;
