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
          amount: Math.round(adjustedTotalPrice * 100),
          email: customerEmail,
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
                      {item.quantity} x ${item.price.toFixed(2)}
                    </span>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Flight(s):</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Baggage:</span>
                  <span>${baggagePrice.toFixed(2)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Seat Selection:</span>
                  <span>${seatPrice.toFixed(2)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between fw-bold">
                  <span>Total Price:</span>
                  <span>${adjustedTotalPrice.toFixed(2)}</span>
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
