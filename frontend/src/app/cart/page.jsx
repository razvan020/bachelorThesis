"use client";
import React, { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import InputGroup from "react-bootstrap/InputGroup";
import {
  FaTrashAlt,
  FaShoppingCart,
  FaPlaneDeparture,
  FaPlus,
  FaMinus,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaSuitcase,
  FaChair,
  FaPlaneArrival,
} from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCurrencyForCountry,
  convertFromEUR,
  formatPrice,
} from "@/utils/currencyUtils";

// Helper function to format date/time
const formatDisplayDateTime = (isoDateStr, isoTimeStr) => {
  const datePart = isoDateStr
    ? new Date(isoDateStr + "T00:00:00Z").toLocaleDateString("en-GB", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : null;
  const timePart = isoTimeStr || "";

  if (datePart && timePart) return `${datePart} ${timePart}`;

  if (isoDateStr && isoDateStr.includes("T")) {
    try {
      const date = new Date(isoDateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
    } catch (e) {
      /* ignore parsing error */
    }
  }
  if (datePart) return datePart;

  return "N/A";
};

// Main Component Content
function CartPageContent() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemBeingAdjusted, setItemBeingAdjusted] = useState(null);
  const { fetchCartCount } = useAuth();
  const [baggagePrice, setBaggagePrice] = useState(0);
  const [seatPrice, setSeatPrice] = useState(0);
  const [adjustedTotalPrice, setAdjustedTotalPrice] = useState(0);

  // Currency state
  const [userCountry, setUserCountry] = useState("Romania");
  const [userCurrency, setUserCurrency] = useState("RON");

  // Sample airport data
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
  ];

  // Function to calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  // Function to find closest airport
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

  // Define fetchCart using useCallback
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("CartPageContent: Fetching cart data...");
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error fetching cart (${response.status})`);
      }

      const data = await response.json();
      console.log("CartPageContent: Fetched data:", data);
      setCartItems(data.items || []);
      setTotalPrice(data.totalPrice || 0);
    } catch (err) {
      console.error("CartPageContent: Failed to fetch cart:", err);
      setError(err.message || "Failed to load cart data.");
      setCartItems([]);
      setTotalPrice(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cart on initial component load
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Get user's location and set country/currency
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const closest = findClosestAirport(latitude, longitude);
          if (closest) {
            setUserCountry(closest.country);
            setUserCurrency(getCurrencyForCountry(closest.country));
            console.log(
              `User location detected: ${
                closest.country
              }, using currency: ${getCurrencyForCountry(closest.country)}`
            );
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    const baggageOptions = [
      { value: "BAGGAGE_TYPE_WEIGHT_CARRY_ON_0", price: 0 },
      { value: "BAGGAGE_TYPE_WEIGHT_CHECKED_10", price: 20 },
      { value: "BAGGAGE_TYPE_WEIGHT_CHECKED_20", price: 30 },
      { value: "BAGGAGE_TYPE_WEIGHT_CHECKED_26", price: 40 },
      { value: "BAGGAGE_TYPE_WEIGHT_CHECKED_32", price: 50 },
    ];

    const seatTypes = [
      { type: "SEAT_TYPE_STANDARD", price: 7 },
      { type: "SEAT_TYPE_UPFRONT", price: 10 },
      { type: "SEAT_TYPE_EXTRA_LEGROOM", price: 13 },
    ];

    const storedBaggageType =
      localStorage.getItem("selectedBaggageType") ||
      "BAGGAGE_TYPE_WEIGHT_CARRY_ON_0";
    const storedSeatType =
      localStorage.getItem("selectedSeatType") || "SEAT_TYPE_STANDARD";

    const baggage = baggageOptions.find(
      (option) => option.value === storedBaggageType
    );
    const seat = seatTypes.find((option) => option.type === storedSeatType);

    // Check if any cart item has random seat allocation
    const hasRandomSeatAllocation = cartItems.some(item => item.allocateRandomSeat);

    const baggageCost = baggage ? baggage.price : 0;
    // Set seat cost to 0 if any cart item has random seat allocation
    const seatCost = hasRandomSeatAllocation ? 0 : (seat ? seat.price : 7);

    setBaggagePrice(baggageCost);
    setSeatPrice(seatCost);

    const adjustedTotal = totalPrice + baggageCost + seatCost;
    setAdjustedTotalPrice(adjustedTotal);
  }, [totalPrice, cartItems]);

  // Update Cart Function
  const updateCartItem = useCallback(
    async (flightId, action) => {
      if (!flightId) return;
      setItemBeingAdjusted(flightId);
      setError(null);

      let apiUrl;
      let method;
      let body = null;

      switch (action) {
        case "increase":
          apiUrl = `/api/cart/add`;
          method = "POST";
          body = JSON.stringify({ flightId });
          break;
        case "decrease":
          apiUrl = `/api/cart/decrease/${flightId}`;
          method = "POST";
          break;
        case "remove":
          apiUrl = `/api/cart/remove/${flightId}`;
          method = "DELETE";
          break;
        default:
          console.error("Invalid cart action:", action);
          setItemBeingAdjusted(null);
          return;
      }

      console.log(`Cart Action: ${action}, URL: ${apiUrl}, Method: ${method}`);

      try {
        const token = localStorage.getItem("token");

        const options = {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        };

        if (body) {
          options.body = body;
        }

        const response = await fetch(apiUrl, options);

        if (!response.ok) {
          throw new Error(`Error updating cart (${response.status})`);
        }

        const data = await response.json();
        console.log("Cart updated:", data);
        setCartItems(data.items || []);
        setTotalPrice(data.totalPrice || 0);
        fetchCartCount();
      } catch (err) {
        console.error(`Failed to ${action} item ${flightId}:`, err);
        setError(err.message || `Failed to ${action} item.`);
      } finally {
        setItemBeingAdjusted(null);
      }
    },
    [fetchCartCount]
  );

  return (
    <>
      <style jsx global>{`
        /* Modern 2025 Cart Page Styles */
        .modern-cart-page {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            rgb(0, 0, 0) 0%,
            rgb(0, 0, 0) 50%,
            rgb(0, 0, 0) 100%
          );
          position: relative;
          overflow-x: hidden;
        }

        .cart-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .cart-bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
              circle at 20% 30%,
              rgba(255, 111, 0, 0.14) 5%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(59, 130, 246, 0.08) 0%,
              transparent 50%
            );
        }

        .cart-bg-particles .cart-particle {
          position: absolute;
          width: 250px;
          height: 250px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 50%;
          animation: cartFloat 18s ease-in-out infinite;
        }

        .cart-particle-1 {
          top: 15%;
          left: 15%;
          animation-delay: 0s;
        }

        .cart-particle-2 {
          top: 70%;
          right: 20%;
          animation-delay: 9s;
        }

        @keyframes cartFloat {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-15px) scale(1.05);
            opacity: 0.7;
          }
        }

        .cart-container {
          position: relative;
          z-index: 1;
          padding: 2rem 0;
        }

        /* Header Styles */
        .cart-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .cart-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          padding: 0.5rem 1rem;
          color: white;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .cart-icon {
          color: var(--primary-orange);
        }

        .cart-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .cart-title-highlight {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cart-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1.5rem;
        }

        /* Loading State */
        .cart-loading-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cart-loading-spinner {
          margin-bottom: 2rem;
        }

        .cart-loading-spinner .spinner-border {
          width: 3rem;
          height: 3rem;
          border-width: 3px;
          color: var(--primary-orange);
        }

        .cart-loading-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
          font-weight: 500;
        }

        /* Error Alert */
        .cart-error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 20px;
          color: rgba(255, 255, 255, 0.9);
          padding: 2rem;
          text-align: center;
        }

        /* Cart Content */
        .cart-content-card {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .cart-items-section {
          padding: 2rem;
        }

        /* Flight Item Cards */
        .flight-item-card {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid rgba(33, 34, 34, 0.5);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .flight-item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          border-color: rgba(255, 111, 0, 0.3);
        }

        .flight-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .flight-info {
          flex: 1;
        }

        .flight-name {
          font-size: 1.3rem;
          font-weight: 700;
          color: rgb(255, 255, 255);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .flight-type-icon {
          color: var(--primary-orange);
          font-size: 1.2rem;
        }

        .flight-route {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          color: rgb(255, 255, 255);
          font-weight: 500;
        }

        .route-arrow {
          color: var(--primary-orange);
          font-size: 1rem;
        }

        .flight-times-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 2rem;
          align-items: center;
          background: black;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .time-detail {
          text-align: center;
        }

        .time-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: rgb(255, 255, 255);
          margin-bottom: 0.25rem;
        }

        .time-label {
          font-size: 0.85rem;
          color: rgb(255, 255, 255);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .flight-path-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .path-line {
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, var(--primary-orange), #fbbf24);
          border-radius: 1px;
        }

        .path-plane {
          position: absolute;
          color: var(--primary-orange);
          font-size: 1.1rem;
          background: white;
          padding: 4px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(255, 111, 0, 0.2);
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .quantity-section {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 12px;
          padding: 0.5rem;
          border: 2px solid #e5e7eb;
        }

        .quantity-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: var(--primary-orange);
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .quantity-btn:hover:not(:disabled) {
          background: #e65100;
          transform: scale(1.05);
        }

        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .quantity-display {
          min-width: 40px;
          text-align: center;
          font-weight: 600;
          color: #374151;
          padding: 0 0.75rem;
        }

        .remove-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: none;
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .remove-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .remove-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .price-display {
          text-align: right;
        }

        .item-price {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.25rem;
        }

        .price-per-unit {
          font-size: 0.8rem;
          color: #6b7280;
        }

        /* Summary Section */
        .cart-summary {
          background: linear-gradient(
            135deg,
            rgb(0, 0, 0) 0%,
            rgb(0, 0, 0) 100%
          );
          padding: 2rem;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
        }

        .summary-card {
          background: black;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(226, 232, 240, 0.8);
          margin-bottom: 2rem;
        }

        .summary-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: rgb(255, 255, 255);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .summary-icon {
          color: var(--primary-orange);
        }

        .summary-items {
          margin-bottom: 1.5rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.61);
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-label {
          color: rgb(255, 255, 255);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .summary-value {
          font-weight: 600;
          color: rgb(255, 255, 255);
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 0 0;
          border-top: 2px solid rgba(255, 255, 255, 0.36);
          margin-top: 1rem;
        }

        .total-label {
          font-size: 1.3rem;
          font-weight: 700;
          color: rgb(255, 255, 255);
        }

        .total-price {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Action Buttons */
        .cart-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .continue-shopping-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }

        .continue-shopping-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          color: white;
          transform: translateY(-2px);
          text-decoration: none;
        }

        .checkout-btn {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 8px 24px rgba(255, 111, 0, 0.3);
          text-decoration: none;
        }

        .checkout-btn:hover {
          background: linear-gradient(
            135deg,
            #e65100 0%,
            var(--primary-orange) 100%
          );
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255, 111, 0, 0.4);
          text-decoration: none;
        }

        /* Empty Cart State */
        .empty-cart {
          text-align: center;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, #000000 0%, #000000 100%);
          border-radius: 20px;
          margin: 2rem 0;
        }

        .empty-cart-icon {
          font-size: 4rem;
          color: rgb(255, 255, 255);
          margin-bottom: 1.5rem;
        }

        .empty-cart-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: rgb(255, 255, 255);
          margin-bottom: 1rem;
        }

        .empty-cart-text {
          color: rgb(255, 255, 255);
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .find-flights-btn {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }

        .find-flights-btn:hover {
          background: linear-gradient(
            135deg,
            #e65100 0%,
            var(--primary-orange) 100%
          );
          color: white;
          transform: translateY(-2px);
          text-decoration: none;
        }

        /* Protection Features */
        .protection-features {
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }

        .protection-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .protection-icon {
          color: #10b981;
          font-size: 1.2rem;
        }

        .protection-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #065f46;
          margin: 0;
        }

        .protection-list {
          display: grid;
          gap: 0.75rem;
        }

        .protection-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .protection-check {
          color: #10b981;
          font-size: 1rem;
        }

        .protection-text {
          color: #065f46;
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .cart-container {
            padding: 1rem;
          }

          .cart-title {
            font-size: 2rem;
          }

          .flight-times-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            text-align: center;
          }

          .flight-path-visual {
            order: -1;
            transform: rotate(90deg);
          }

          .flight-item-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .quantity-controls {
            justify-content: center;
            flex-wrap: wrap;
          }

          .cart-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .continue-shopping-btn,
          .checkout-btn {
            width: 100%;
            justify-content: center;
          }

          .summary-card {
            padding: 1.5rem;
          }

          .cart-items-section {
            padding: 1.5rem;
          }

          .cart-summary {
            padding: 1.5rem;
          }
        }

        @media (max-width: 576px) {
          .cart-badge {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }

          .cart-subtitle {
            font-size: 1rem;
          }

          .flight-item-card {
            padding: 1.5rem;
          }

          .flight-name {
            font-size: 1.1rem;
          }

          .time-value {
            font-size: 1rem;
          }

          .item-price {
            font-size: 1.2rem;
          }

          .total-price {
            font-size: 1.5rem;
          }

          .quantity-btn {
            width: 32px;
            height: 32px;
            font-size: 0.8rem;
          }

          .quantity-display {
            min-width: 30px;
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className="modern-cart-page">
        {/* Animated background */}
        <div className="cart-background">
          <div className="cart-bg-gradient"></div>
          <div className="cart-bg-particles">
            <div className="cart-particle cart-particle-1"></div>
            <div className="cart-particle cart-particle-2"></div>
          </div>
        </div>

        <Container className="cart-container">
          {/* Header */}
          <header className="cart-header">
            <div className="cart-badge">
              <FaShoppingCart className="cart-icon" />
              <span>Your Flight Cart</span>
            </div>
            <h1 className="cart-title">
              Your Flight
              <span className="cart-title-highlight"> Cart</span>
            </h1>
            <p className="cart-subtitle">
              Review your selected flights and proceed to checkout
            </p>
          </header>

          {/* Loading State */}
          {loading && (
            <div className="cart-loading-state">
              <div className="cart-loading-spinner">
                <Spinner animation="border" variant="primary" />
              </div>
              <p className="cart-loading-text">Loading your cart...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert variant="danger" className="cart-error-alert">
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {/* Cart Content */}
          {!loading && !error && (
            <div className="cart-content-card">
              {cartItems.length > 0 ? (
                <>
                  <div className="cart-items-section">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flight-item-card">
                        <div className="flight-item-header">
                          <div className="flight-info">
                            <h3 className="flight-name">
                              <FaPlaneDeparture className="flight-type-icon" />
                              {item.flightName || "Flight"}
                            </h3>
                            <div className="flight-route">
                              <span>{item.origin}</span>
                              <FaArrowRight className="route-arrow" />
                              <span>{item.destination}</span>
                            </div>
                            {item.allocateRandomSeat && (
                              <div className="random-seat-info" style={{ 
                                color: 'var(--primary-orange)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                marginTop: '0.5rem',
                                fontSize: '0.9rem'
                              }}>
                                <FaChair />
                                <span>Random seat will be allocated (free)</span>
                              </div>
                            )}
                          </div>
                          <div className="price-display">
                            <div className="item-price">
                              {formatPrice(
                                convertFromEUR(
                                  parseFloat(item.price || 0),
                                  userCurrency
                                ),
                                userCurrency
                              )}
                            </div>
                            <div className="price-per-unit">per person</div>
                          </div>
                        </div>

                        <div className="flight-times-grid">
                          <div className="time-detail">
                            <div className="time-value">
                              {formatDisplayDateTime(
                                item.departureDate,
                                item.departureTime
                              ).split(" ")[1] || "N/A"}
                            </div>
                            <div className="time-label">
                              <FaClock />
                              Departure
                            </div>
                          </div>
                          <div className="flight-path-visual">
                            <div className="path-line"></div>
                            <FaPlaneDeparture className="path-plane" />
                          </div>
                          <div className="time-detail">
                            <div className="time-value">
                              {formatDisplayDateTime(
                                item.arrivalDate,
                                item.arrivalTime
                              ).split(" ")[1] || "N/A"}
                            </div>
                            <div className="time-label">
                              <FaClock />
                              Arrival
                            </div>
                          </div>
                        </div>

                        <div className="quantity-controls">
                          {item.quantity > 1 ? (
                            <div className="quantity-section">
                              <button
                                className="quantity-btn"
                                onClick={() =>
                                  updateCartItem(item.id, "decrease")
                                }
                                disabled={itemBeingAdjusted === item.id}
                                aria-label={`Decrease quantity of ${item.flightName}`}
                              >
                                <FaMinus />
                              </button>
                              <div className="quantity-display">
                                {item.quantity}
                              </div>
                              <button
                                className="quantity-btn"
                                onClick={() =>
                                  updateCartItem(item.id, "increase")
                                }
                                disabled={itemBeingAdjusted === item.id}
                                aria-label={`Increase quantity of ${item.flightName}`}
                              >
                                <FaPlus />
                              </button>
                            </div>
                          ) : (
                            <button
                              className="remove-btn"
                              onClick={() => updateCartItem(item.id, "remove")}
                              disabled={itemBeingAdjusted === item.id}
                              aria-label={`Remove ${item.flightName} from cart`}
                            >
                              {itemBeingAdjusted === item.id ? (
                                <Spinner size="sm" animation="border" />
                              ) : (
                                <>
                                  <FaTrashAlt />
                                  Remove
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-summary">
                    <div className="summary-card">
                      <h3 className="summary-title">
                        <FaShoppingCart className="summary-icon" />
                        Price Summary
                      </h3>

                      <div className="summary-items">
                        <div className="summary-item">
                          <span className="summary-label">
                            <FaPlaneDeparture />
                            Flight(s)
                          </span>
                          <span className="summary-value">
                            {formatPrice(
                              convertFromEUR(totalPrice, userCurrency),
                              userCurrency
                            )}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">
                            <FaSuitcase />
                            Baggage
                          </span>
                          <span className="summary-value">
                            {formatPrice(
                              convertFromEUR(baggagePrice, userCurrency),
                              userCurrency
                            )}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">
                            <FaChair />
                            {cartItems.some(item => item.allocateRandomSeat) 
                              ? "Random Seat Allocation (Free)" 
                              : "Seat Selection"}
                          </span>
                          <span className="summary-value">
                            {formatPrice(
                              convertFromEUR(seatPrice, userCurrency),
                              userCurrency
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="summary-total">
                        <span className="total-label">Total</span>
                        <span className="total-price">
                          {formatPrice(
                            convertFromEUR(adjustedTotalPrice, userCurrency),
                            userCurrency
                          )}
                        </span>
                      </div>

                      <div className="protection-features">
                        <div className="protection-header">
                          <FaShieldAlt className="protection-icon" />
                          <h4 className="protection-title">
                            Your Booking is Protected
                          </h4>
                        </div>
                        <div className="protection-list">
                          <div className="protection-item">
                            <FaCheckCircle className="protection-check" />
                            <span className="protection-text">
                              Free cancellation within 24 hours
                            </span>
                          </div>
                          <div className="protection-item">
                            <FaCheckCircle className="protection-check" />
                            <span className="protection-text">
                              Price match guarantee
                            </span>
                          </div>
                          <div className="protection-item">
                            <FaCheckCircle className="protection-check" />
                            <span className="protection-text">
                              Secure payment processing
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="cart-actions">
                      <Link href="/" className="continue-shopping-btn">
                        <FaPlaneDeparture />
                        Continue Shopping
                      </Link>
                      <Link href="/checkout" className="checkout-btn">
                        Proceed to Checkout
                        <FaArrowRight />
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-cart">
                  <FaShoppingCart className="empty-cart-icon" />
                  <h2 className="empty-cart-title">Your cart is empty</h2>
                  <p className="empty-cart-text">
                    Discover amazing flight deals and start planning your next
                    adventure!
                  </p>
                  <Link href="/" className="find-flights-btn">
                    <FaPlaneDeparture />
                    Find Flights
                  </Link>
                </div>
              )}
            </div>
          )}
        </Container>
      </div>
    </>
  );
}

// Main Page Component Wrapper
export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="cart-loading-state">
          <Spinner animation="border" />
          <span>Loading Cart...</span>
        </div>
      }
    >
      <CartPageContent />
    </Suspense>
  );
}
