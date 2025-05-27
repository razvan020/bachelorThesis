"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import {
  FaCreditCard,
  FaShieldAlt,
  FaCheckCircle,
  FaPlaneDeparture,
  FaUser,
  FaEnvelope,
  FaLock,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaSuitcase,
  FaChair,
  FaArrowRight,
  FaHome,
} from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCurrencyForCountry,
  convertFromEUR,
  formatPrice,
} from "@/utils/currencyUtils";

// Helper for date/time formatting
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
      const d = new Date(isoDateStr);
      if (!isNaN(d))
        return d.toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
    } catch {}
  }
  return datePart || "N/A";
};

function CheckoutPageContent() {
  const stripe = useStripe();
  const elements = useElements();
  const { fetchCartCount } = useAuth();

  const [baggagePrice, setBaggagePrice] = useState(0);
  const [seatPrice, setSeatPrice] = useState(0);
  const [adjustedTotalPrice, setAdjustedTotalPrice] = useState(0);

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);
  const [error, setError] = useState(null);

  // Billing form
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Payment state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

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

  // Load the cart
  const fetchCart = useCallback(async () => {
    setLoadingCart(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/cart", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || res.statusText);
      setCartItems(body.items || []);
      setTotalPrice(body.totalPrice || 0);
      if (!body.items?.length) {
        setError("Your cart is empty. Add flights before checking out.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCart(false);
    }
  }, []);

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

    const baggageCost = baggage ? baggage.price : 0;
    const seatCost = seat ? seat.price : 7;

    setBaggagePrice(baggageCost);
    setSeatPrice(seatCost);

    const adjustedTotal = totalPrice + baggageCost + seatCost;
    setAdjustedTotalPrice(adjustedTotal);
  }, [totalPrice]);

  // Handle the Stripe payment flow
  const handleConfirmPurchase = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);

    if (!stripe || !elements) {
      setPaymentError("Stripe has not loaded yet.");
      setIsProcessing(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const intentRes = await fetch("/api/checkout/create-payment-intent", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(
            convertFromEUR(adjustedTotalPrice, userCurrency) * 100
          ),
          email: customerEmail,
          currency: userCurrency.toLowerCase(),
        }),
      });
      const intentBody = await intentRes.json();
      if (!intentRes.ok) {
        throw new Error(intentBody.error || "Failed to create payment intent");
      }
      const clientSecret = intentBody.clientSecret;
      if (!clientSecret) {
        throw new Error("Payment intent did not return a clientSecret");
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: customerName, email: customerEmail },
        },
      });

      if (result.error) throw result.error;
      if (result.paymentIntent.status === "succeeded") {
        try {
          const token = localStorage.getItem("token");

          const orderRes = await fetch("/api/checkout/confirm", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerName: customerName,
              customerEmail: customerEmail,
            }),
          });

          const orderData = await orderRes.json();
          if (!orderRes.ok) {
            console.error("Order creation failed:", orderData.error);
          } else {
            setOrderNumber(orderData.orderId || result.paymentIntent.id);
          }

          for (const item of cartItems) {
            await fetch(`/api/cart/remove/${item.id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            });
          }

          setCartItems([]);
          setTotalPrice(0);
          setAdjustedTotalPrice(0);

          setPaymentSuccess(true);
          setOrderNumber(result.paymentIntent.id);
          fetchCartCount();
        } catch (clearError) {
          console.error("Error clearing cart:", clearError);
          setPaymentSuccess(true);
          setOrderNumber(result.paymentIntent.id);
          fetchCartCount();
        }
      } else {
        throw new Error("Payment did not succeed.");
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      setPaymentError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Render loading state
  if (loadingCart) {
    return (
      <>
        <style jsx global>{`
          .checkout-loading-state {
            min-height: 100vh;
            background: linear-gradient(135deg, #000000 0%, #000000 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            gap: 1.5rem;
          }

          .checkout-loading-spinner .spinner-border {
            width: 3rem;
            height: 3rem;
            border-width: 3px;
            color: var(--primary-orange);
          }

          .checkout-loading-text {
            font-size: 1.2rem;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.8);
          }
        `}</style>
        <div className="checkout-loading-state">
          <div className="checkout-loading-spinner">
            <Spinner animation="border" />
          </div>
          <p className="checkout-loading-text">Loading Checkout...</p>
        </div>
      </>
    );
  }

  // Render error state
  if (error && !paymentSuccess) {
    return (
      <>
        <style jsx global>{`
          .checkout-error-page {
            min-height: 100vh;
            background: linear-gradient(135deg, rgb(0, 0, 0) 0%, #1e293b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .checkout-error-alert {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 20px;
            color: rgba(255, 255, 255, 0.9);
            padding: 2rem;
            text-align: center;
            max-width: 500px;
          }
        `}</style>
        <div className="checkout-error-page">
          <Alert variant="danger" className="checkout-error-alert">
            <strong>Error:</strong> {error}
          </Alert>
        </div>
      </>
    );
  }

  // Render empty cart state
  if (!cartItems.length && !paymentSuccess) {
    return (
      <>
        <style jsx global>{`
          .checkout-empty-page {
            min-height: 100vh;
            background: linear-gradient(135deg, rgb(0, 0, 0rgb(0, 0, 0)e293b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .checkout-empty-alert {
            background: rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 20px;
            color: rgba(255, 255, 255, 0.9);
            padding: 2rem;
            text-align: center;
            max-width: 500px;
          }

          .checkout-empty-alert a {
            color: var(--primary-orange);
            text-decoration: none;
            font-weight: 600;
          }

          .checkout-empty-alert a:hover {
            text-decoration: underline;
          }
        `}</style>
        <div className="checkout-empty-page">
          <Alert variant="info" className="checkout-empty-alert">
            Your cart is empty. <Link href="/">Browse flights</Link>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        /* Modern 2025 Checkout Page Styles */
        .modern-checkout-page {
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

        .checkout-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .checkout-bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
              circle at 25% 25%,
              rgba(255, 111, 0, 0.06) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 75% 75%,
              rgba(59, 130, 246, 0.06) 0%,
              transparent 50%
            );
        }

        .checkout-bg-particles .checkout-particle {
          position: absolute;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50%;
          animation: checkoutFloat 16s ease-in-out infinite;
        }

        .checkout-particle-1 {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .checkout-particle-2 {
          top: 60%;
          right: 15%;
          animation-delay: 8s;
        }

        @keyframes checkoutFloat {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-25px) scale(1.1);
            opacity: 0.6;
          }
        }

        .checkout-container {
          position: relative;
          z-index: 1;
          padding: 2rem 0;
        }

        /* Header Styles */
        .checkout-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .checkout-badge {
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

        .checkout-icon {
          color: var(--primary-orange);
        }

        .checkout-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .checkout-title-highlight {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .checkout-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1.5rem;
        }

        /* Card Styles - Dark Theme */
        .checkout-card {
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          color: white;
        }

        .checkout-card-header {
          background: rgba(0, 0, 0, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          text-align: center;
        }

        .checkout-card-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: white;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .checkout-card-icon {
          color: var(--primary-orange);
        }

        /* Order Summary Styles */
        .order-summary-list {
          background: transparent;
          border: none;
        }

        .order-summary-item {
          background: rgba(0, 0, 0, 0);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-bottom: 0.5rem;
          padding: 1.5rem;
          color: white;
        }

        .order-summary-item:last-child {
          margin-bottom: 0;
        }

        .flight-item-details {
          flex: 1;
        }

        .flight-item-name {
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .flight-item-route {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .flight-item-time {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .flight-item-price {
          font-weight: 700;
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.1rem;
          white-space: nowrap;
          margin-left: 1rem;
        }

        .summary-row {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-bottom: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-row:last-child {
          margin-bottom: 0;
        }

        .summary-label {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .summary-value {
          color: white;
          font-weight: 600;
        }

        .summary-total {
          background: linear-gradient(
            135deg,
            rgba(255, 111, 0, 0.15) 0%,
            rgba(251, 191, 36, 0.15) 100%
          );
          border: 1px solid rgba(255, 111, 0, 0.3);
          font-weight: 700;
          font-size: 1.2rem;
        }

        .summary-total .summary-value {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.4rem;
        }

        /* Billing Form Styles */
        .billing-card {
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .billing-form {
          padding: 2rem;
        }

        .form-group-modern {
          margin-bottom: 1.5rem;
        }

        .form-label-modern {
          color: white;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
        }

        .form-control-modern {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-control-modern:focus {
          background: rgba(0, 0, 0, 0.9);
          border-color: var(--primary-orange);
          box-shadow: 0 0 0 4px rgba(255, 111, 0, 0.1);
          color: white;
          outline: none;
        }

        .form-control-modern::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        /* Card Element Styling */
        .card-element-container {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          transition: all 0.3s ease;
        }

        .card-element-container:focus-within {
          border-color: var(--primary-orange);
          box-shadow: 0 0 0 4px rgba(255, 111, 0, 0.1);
        }

        .card-section-title {
          color: white;
          font-weight: 600;
          margin: 2rem 0 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.1rem;
        }

        /* Payment Button */
        .payment-button {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          border: none;
          color: white;
          padding: 1.25rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: 0 8px 24px rgba(255, 111, 0, 0.3);
          width: 100%;
        }

        .payment-button:hover:not(:disabled) {
          background: linear-gradient(
            135deg,
            #e65100 0%,
            var(--primary-orange) 100%
          );
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255, 111, 0, 0.4);
        }

        .payment-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Error Alert */
        .payment-error-alert {
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #fca5a5;
          margin-bottom: 1.5rem;
        }

        /* Success State */
        .success-page {
          min-height: 100vh;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .success-card {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 24px;
          padding: 3rem;
          text-align: center;
          max-width: 600px;
          backdrop-filter: blur(20px);
        }

        .success-icon {
          color: #10b981;
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .success-title {
          color: #10b981;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .success-message {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .order-number {
          color: var(--primary-orange);
          font-weight: 700;
          font-family: "Monaco", "Menlo", monospace;
          background: rgba(255, 111, 0, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          display: inline-block;
        }

        .home-button {
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
          margin-top: 1rem;
        }

        .home-button:hover {
          background: linear-gradient(
            135deg,
            #e65100 0%,
            var(--primary-orange) 100%
          );
          color: white;
          transform: translateY(-2px);
          text-decoration: none;
        }

        /* Security Features */
        .security-features {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .security-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .security-icon {
          color: #10b981;
          font-size: 1.2rem;
        }

        .security-title {
          color: #10b981;
          font-weight: 600;
          margin: 0;
          font-size: 1.1rem;
        }

        .security-list {
          display: grid;
          gap: 0.75rem;
        }

        .security-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .security-check {
          color: #10b981;
          font-size: 1rem;
        }

        .security-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .checkout-container {
            padding: 1rem;
          }

          .checkout-title {
            font-size: 2rem;
          }

          .checkout-card,
          .billing-card {
            border-radius: 20px;
          }

          .checkout-card-header,
          .billing-form {
            padding: 1.5rem;
          }

          .order-summary-item {
            padding: 1rem;
          }

          .flight-item-details {
            margin-bottom: 1rem;
          }

          .flight-item-price {
            margin-left: 0;
            text-align: right;
          }

          .summary-row {
            padding: 0.75rem 1rem;
          }

          .payment-button {
            padding: 1rem 1.5rem;
            font-size: 1rem;
          }

          .success-card {
            padding: 2rem;
            margin: 1rem;
          }

          .success-title {
            font-size: 1.5rem;
          }

          .success-icon {
            font-size: 3rem;
          }
        }

        @media (max-width: 576px) {
          .checkout-badge {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }

          .checkout-subtitle {
            font-size: 1rem;
          }

          .checkout-card-title {
            font-size: 1.1rem;
          }

          .flight-item-name {
            font-size: 0.95rem;
          }

          .flight-item-route,
          .flight-item-time {
            font-size: 0.8rem;
          }

          .summary-row {
            padding: 0.5rem 0.75rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .summary-value {
            align-self: flex-end;
          }

          .form-control-modern {
            padding: 0.875rem 1rem;
            font-size: 0.95rem;
          }

          .payment-button {
            padding: 0.875rem 1.25rem;
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="modern-checkout-page">
        {/* Animated background */}
        <div className="checkout-background">
          <div className="checkout-bg-gradient"></div>
          <div className="checkout-bg-particles">
            <div className="checkout-particle checkout-particle-1"></div>
            <div className="checkout-particle checkout-particle-2"></div>
          </div>
        </div>

        <Container className="checkout-container">
          {/* Header */}
          <header className="checkout-header">
            <div className="checkout-badge">
              <FaCreditCard className="checkout-icon" />
              <span>Secure Checkout</span>
            </div>
            <h1 className="checkout-title">
              Complete Your
              <span className="checkout-title-highlight"> Purchase</span>
            </h1>
            <p className="checkout-subtitle">
              Review your order and complete your booking securely
            </p>
          </header>

          {paymentSuccess ? (
            <div className="success-page">
              <div className="success-card">
                <FaCheckCircle className="success-icon" />
                <h2 className="success-title">Purchase Successful!</h2>
                <p className="success-message">
                  Thank you for your booking! Your flight reservation has been
                  confirmed.
                </p>
                <div className="order-number">Order ID: {orderNumber}</div>
                <p className="success-message">
                  A confirmation email has been sent to your email address with
                  all the details.
                </p>
                <Link href="/" className="home-button">
                  <FaHome />
                  Return Home
                </Link>
              </div>
            </div>
          ) : (
            <Row className="justify-content-center g-4">
              {/* Order Summary */}
              <Col lg={7} md={8}>
                <div className="checkout-card">
                  <div className="checkout-card-header">
                    <h3 className="checkout-card-title">
                      <FaPlaneDeparture className="checkout-card-icon" />
                      Order Summary
                    </h3>
                  </div>
                  <div className="order-summary-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="order-summary-item">
                        <div className="d-flex justify-content-between align-items-start flex-wrap">
                          <div className="flight-item-details">
                            <div className="flight-item-name">
                              <FaPlaneDeparture />
                              {item.flightName} ({item.code || item.id})
                            </div>
                            <div className="flight-item-route">
                              <FaMapMarkerAlt />
                              {item.origin} → {item.destination}
                            </div>
                            <div className="flight-item-time">
                              <FaClock />
                              Depart:{" "}
                              {formatDisplayDateTime(
                                item.departureDate,
                                item.departureTime
                              )}
                            </div>
                          </div>
                          <div className="flight-item-price">
                            {item.quantity} ×{" "}
                            {formatPrice(
                              convertFromEUR(
                                parseFloat(item.price || 0),
                                userCurrency
                              ),
                              userCurrency
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="summary-row">
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

                    <div className="summary-row">
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

                    <div className="summary-row">
                      <span className="summary-label">
                        <FaChair />
                        Seat Selection
                      </span>
                      <span className="summary-value">
                        {formatPrice(
                          convertFromEUR(seatPrice, userCurrency),
                          userCurrency
                        )}
                      </span>
                    </div>

                    <div className="summary-row summary-total">
                      <span className="summary-label">Total Price</span>
                      <span className="summary-value">
                        {formatPrice(
                          convertFromEUR(adjustedTotalPrice, userCurrency),
                          userCurrency
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Billing & Payment */}
              <Col lg={5} md={8}>
                <div className="billing-card">
                  <div className="checkout-card-header">
                    <h3 className="checkout-card-title">
                      <FaUser className="checkout-card-icon" />
                      Billing Information
                    </h3>
                  </div>
                  <div className="billing-form">
                    {paymentError && (
                      <Alert
                        variant="danger"
                        dismissible
                        onClose={() => setPaymentError(null)}
                        className="payment-error-alert"
                      >
                        {paymentError}
                      </Alert>
                    )}

                    <Form onSubmit={handleConfirmPurchase}>
                      <div className="form-group-modern">
                        <label
                          htmlFor="customerName"
                          className="form-label-modern"
                        >
                          <FaUser />
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="customerName"
                          className="form-control-modern"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                          disabled={isProcessing}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="form-group-modern">
                        <label
                          htmlFor="customerEmail"
                          className="form-label-modern"
                        >
                          <FaEnvelope />
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="customerEmail"
                          className="form-control-modern"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          required
                          disabled={isProcessing}
                          placeholder="Enter your email address"
                        />
                      </div>

                      <div className="card-section-title">
                        <FaCreditCard />
                        Card Details
                      </div>

                      <div className="card-element-container">
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: "16px",
                                color: "#ffffff",
                                backgroundColor: "transparent",
                                "::placeholder": {
                                  color: "rgba(255, 255, 255, 0.5)",
                                },
                              },
                              invalid: {
                                color: "#fca5a5",
                              },
                            },
                          }}
                        />
                      </div>

                      <div className="security-features">
                        <div className="security-header">
                          <FaShieldAlt className="security-icon" />
                          <h4 className="security-title">
                            Your Payment is Secure
                          </h4>
                        </div>
                        <div className="security-list">
                          <div className="security-item">
                            <FaCheckCircle className="security-check" />
                            <span className="security-text">
                              256-bit SSL encryption
                            </span>
                          </div>
                          <div className="security-item">
                            <FaCheckCircle className="security-check" />
                            <span className="security-text">
                              PCI DSS compliant
                            </span>
                          </div>
                          <div className="security-item">
                            <FaCheckCircle className="security-check" />
                            <span className="security-text">
                              Secure payment processing
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="d-grid mt-4">
                        <button
                          type="submit"
                          className="payment-button"
                          disabled={!stripe || isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Spinner as="span" size="sm" animation="border" />
                              Processing Payment...
                            </>
                          ) : (
                            <>
                              <FaLock />
                              Confirm Purchase
                              <FaArrowRight />
                            </>
                          )}
                        </button>
                      </div>
                    </Form>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="checkout-loading-state">
          <Spinner animation="border" />
          <span>Loading Checkout...</span>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
