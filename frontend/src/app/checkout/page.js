// app/checkout/page.js
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
import { useAuth } from "@/contexts/AuthContext";
import { getCurrencyForCountry, convertFromEUR, formatPrice } from '@/utils/currencyUtils';

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
  if (isoDateStr.includes("T")) {
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
  const [userCountry, setUserCountry] = useState('Romania'); // Default to Romania
  const [userCurrency, setUserCurrency] = useState('RON'); // Default to RON

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

  // Sample airport data with coordinates (same as in cart page)
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

  // Get user's location and set country/currency
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Find closest airport
          const closest = findClosestAirport(latitude, longitude);
          if (closest) {
            setUserCountry(closest.country);
            setUserCurrency(getCurrencyForCountry(closest.country));
            console.log(`User location detected: ${closest.country}, using currency: ${getCurrencyForCountry(closest.country)}`);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default values already set in state initialization
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Default values already set in state initialization
    }
  }, []);

  useEffect(() => {
    // Define baggage prices (same as in page.js)
    const baggageOptions = [
      { value: "BAGGAGE_TYPE_WEIGHT_CARRY_ON_0", price: 0 },
      { value: "BAGGAGE_TYPE_WEIGHT_CHECKED_10", price: 20 },
      { value: "BAGGAGE_TYPE_WEIGHT_CHECKED_20", price: 30 },
      { value: "BAGGAGE_TYPE_WEIGHT_CHECKED_26", price: 40 },
      { value: "BAGGAGE_TYPE_WEIGHT_CHECKED_32", price: 50 },
    ];

    // Define seat prices (same as in page.js)
    const seatTypes = [
      { type: "SEAT_TYPE_STANDARD", price: 7 },
      { type: "SEAT_TYPE_UPFRONT", price: 10 },
      { type: "SEAT_TYPE_EXTRA_LEGROOM", price: 13 },
    ];

    // Get baggage and seat info from localStorage if available
    const storedBaggageType =
      localStorage.getItem("selectedBaggageType") ||
      "BAGGAGE_TYPE_WEIGHT_CARRY_ON_0";
    const storedSeatType =
      localStorage.getItem("selectedSeatType") || "SEAT_TYPE_STANDARD";

    // Calculate prices
    const baggage = baggageOptions.find(
      (option) => option.value === storedBaggageType
    );
    const seat = seatTypes.find((option) => option.type === storedSeatType);

    const baggageCost = baggage ? baggage.price : 0;
    const seatCost = seat ? seat.price : 7; // Default to 7 if not found

    // Set state
    setBaggagePrice(baggageCost);
    setSeatPrice(seatCost);

    // Calculate adjusted total
    const adjustedTotal = totalPrice + baggageCost + seatCost;
    setAdjustedTotalPrice(adjustedTotal);
  }, [totalPrice]); // Recalculate when totalPrice changes

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
      // 1) Create PaymentIntent
      const token = localStorage.getItem("token");
      const intentRes = await fetch("/api/checkout/create-payment-intent", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(convertFromEUR(adjustedTotalPrice, userCurrency) * 100),
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

      // 2) Confirm the card payment
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

          // Call the backend to create order and send email
          const orderRes = await fetch("/api/checkout/confirm", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerName: customerName,
              customerEmail: customerEmail,
              // Add any other fields needed by CheckoutRequestDTO
            }),
          });

          const orderData = await orderRes.json();
          if (!orderRes.ok) {
            console.error("Order creation failed:", orderData.error);
            // Still continue with cart clearing
          } else {
            // Use order ID from backend instead of payment intent ID
            setOrderNumber(orderData.orderId || result.paymentIntent.id);
          }

          // Continue with existing cart clearing logic...
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

          // Set empty cart items locally
          setCartItems([]);
          setTotalPrice(0);
          setAdjustedTotalPrice(0);

          // Update UI states
          setPaymentSuccess(true);
          setOrderNumber(result.paymentIntent.id);
          fetchCartCount(); // This will update the cart count in the navbar
        } catch (clearError) {
          console.error("Error clearing cart:", clearError);
          // Still mark payment as successful even if cart clearing fails
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

  // Render loading, error, or the form
  if (loadingCart) {
    return (
      <Container className="text-center p-5">
        <Spinner animation="border" />
        <p>Loading Cart...</p>
      </Container>
    );
  }
  if (error && !paymentSuccess) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  if (!cartItems.length && !paymentSuccess) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="info">
          Your cart is empty. <Link href="/">Browse flights</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4 py-md-5">
      <header className="text-center mb-5">
        <h1 className="display-5 text-uppercase fw-bold">Checkout</h1>
      </header>

      {paymentSuccess ? (
        <Alert variant="success">
          <h4>Purchase Successful!</h4>
          <p>Your payment (ID: {orderNumber}) succeeded.</p>
          <hr />
          <Link href="/">Return Home</Link>
        </Alert>
      ) : (
        <Row className="justify-content-center">
          {/* Order Summary */}
          <Col lg={7} md={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header as="h3" className="h5 text-center py-3">
                Order Summary
              </Card.Header>
              <ListGroup variant="flush">
                {cartItems.map((item) => (
                  <ListGroup.Item
                    key={item.id}
                    className="d-flex justify-content-between align-items-start flex-wrap"
                  >
                    <div className="me-auto">
                      <div className="fw-bold">
                        {item.flightName} ({item.code || item.id})
                      </div>
                      <small className="text-muted d-block">
                        {item.origin} → {item.destination}
                      </small>
                      <small className="text-muted d-block">
                        Depart:{" "}
                        {formatDisplayDateTime(
                          item.departureDate,
                          item.departureTime
                        )}
                      </small>
                    </div>
                    <span className="text-nowrap fw-bold ms-3">
                      {item.quantity} x {formatPrice(convertFromEUR(parseFloat(item.price || 0), userCurrency), userCurrency)}
                    </span>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Flight(s):</span>
                  <span>{formatPrice(convertFromEUR(totalPrice, userCurrency), userCurrency)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Baggage:</span>
                  <span>{formatPrice(convertFromEUR(baggagePrice, userCurrency), userCurrency)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Seat Selection:</span>
                  <span>{formatPrice(convertFromEUR(seatPrice, userCurrency), userCurrency)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between fw-bold">
                  <span>Total Price:</span>
                  <span>{formatPrice(convertFromEUR(adjustedTotalPrice, userCurrency), userCurrency)}</span>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>

          {/* Billing & Stripe Element */}
          <Col lg={5} md={8}>
            <Card className="shadow-sm">
              <Card.Header as="h3" className="h5 text-center py-3">
                Billing Information
              </Card.Header>
              <Card.Body>
                {paymentError && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setPaymentError(null)}
                  >
                    {paymentError}
                  </Alert>
                )}
                <Form onSubmit={handleConfirmPurchase}>
                  <Form.Group className="mb-3" controlId="customerName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      disabled={isProcessing}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="customerEmail">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      disabled={isProcessing}
                    />
                  </Form.Group>

                  <h5 className="mt-4 mb-3 fs-6">Card Details</h5>
                  <CardElement
                    options={{
                      style: {
                        base: { fontSize: "16px", color: "#424770" },
                        invalid: { color: "#9e2146" },
                      },
                    }}
                  />

                  <div className="d-grid mt-4">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={!stripe || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Spinner as="span" size="sm" /> Processing...
                        </>
                      ) : (
                        "Confirm Purchase"
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center p-5">
          <Spinner animation="border" /> Loading Checkout...
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
