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
} from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext"; // Ensure path is correct

// Helper function to format date/time
const formatDisplayDateTime = (isoDateStr, isoTimeStr) => {
  // This handles separate date/time or combined ISO strings if backend sends that
  const datePart = isoDateStr
    ? new Date(isoDateStr + "T00:00:00Z").toLocaleDateString("en-GB", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : null; // Use UTC to avoid timezone shifts from date-only strings
  const timePart = isoTimeStr || ""; // Assuming time is already HH:mm

  if (datePart && timePart) return `${datePart} ${timePart}`; // Combine if both present

  // Fallback for combined ISO string in isoDateStr (check if it contains 'T')
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
  if (datePart) return datePart; // Return just date if only date was valid

  return "N/A";
};

// --- Main Component Content ---
function CartPageContent() {
  // Expect items like: { id, flightName, origin, destination, departureDate, departureTime, arrivalDate, arrivalTime, price, quantity }
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemBeingAdjusted, setItemBeingAdjusted] = useState(null);
  const { fetchCartCount } = useAuth(); // Get function to update navbar cart count
  const [baggagePrice, setBaggagePrice] = useState(0);
  const [seatPrice, setSeatPrice] = useState(0);
  const [adjustedTotalPrice, setAdjustedTotalPrice] = useState(0);

  // Define fetchCart using useCallback
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("CartPageContent: Fetching cart data...");
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("token");

      const response = await fetch("/api/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // Check if response is ok before trying to parse JSON
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
  }, [fetchCart]); // Runs once on mount due to useCallback with empty deps

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

  // --- Update Cart Function (Handles Increase/Decrease/Remove) ---
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
          body = JSON.stringify({ flightId }); // Add requires body
          break;
        case "decrease":
          apiUrl = `/api/cart/decrease/${flightId}`;
          method = "POST"; // Or PUT
          // No body needed for decrease in current backend example
          break;
        case "remove":
          apiUrl = `/api/cart/remove/${flightId}`;
          method = "DELETE";
          // No body needed for delete
          break;
        default:
          console.error("Invalid cart action:", action);
          setItemBeingAdjusted(null);
          return;
      }

      console.log(`Cart Action: ${action}, URL: ${apiUrl}, Method: ${method}`);

      try {
        // Get the token from localStorage
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

        // Check if response is ok before trying to parse JSON
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

  // --- JSX ---
  return (
    <Container className="py-4 py-md-5">
      <header className="text-center mb-5">
        <h1 className="display-5 text-uppercase fw-bold">Your Flight Cart</h1>
        <p className="lead text-muted">Review your selected flights.</p>
      </header>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading Cart...</p>
        </div>
      )}
      {error && !loading && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Card className="shadow-sm cart-container">
          <Card.Body>
            {cartItems.length > 0 ? (
              <>
                <Table responsive hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Flight</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Departure</th>
                      <th>Arrival</th>
                      <th className="text-end">Price (each)</th>
                      <th className="text-center">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.flightName || "N/A"}</td>
                        <td>{item.origin}</td>
                        <td>{item.destination}</td>
                        <td>
                          {formatDisplayDateTime(
                            item.departureDate,
                            item.departureTime
                          )}
                        </td>
                        <td>
                          {formatDisplayDateTime(
                            item.arrivalDate,
                            item.arrivalTime
                          )}
                        </td>
                        <td className="text-end price-tag-react">
                          ${item.price?.toFixed(2) ?? "0.00"}
                        </td>
                        <td
                          className="text-center"
                          style={{ minWidth: "120px" }}
                        >
                          {item.quantity > 1 ? (
                            <InputGroup
                              size="sm"
                              className="justify-content-center"
                            >
                              <Button
                                variant="outline-secondary"
                                onClick={() =>
                                  updateCartItem(item.id, "decrease")
                                }
                                disabled={itemBeingAdjusted === item.id}
                                aria-label={`Decrease quantity of ${item.flightName}`}
                              >
                                <FaMinus />
                              </Button>
                              <InputGroup.Text
                                style={{
                                  minWidth: "40px",
                                  display: "inline-block",
                                  textAlign: "center",
                                }}
                              >
                                {item.quantity}
                              </InputGroup.Text>
                              <Button
                                variant="outline-secondary"
                                onClick={() =>
                                  updateCartItem(item.id, "increase")
                                }
                                disabled={itemBeingAdjusted === item.id}
                                aria-label={`Increase quantity of ${item.flightName}`}
                              >
                                <FaPlus />
                              </Button>
                            </InputGroup>
                          ) : (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => updateCartItem(item.id, "remove")}
                              disabled={itemBeingAdjusted === item.id}
                              title="Remove Item"
                              aria-label={`Remove ${item.flightName} from cart`}
                            >
                              {itemBeingAdjusted === item.id ? (
                                <Spinner size="sm" animation="border" />
                              ) : (
                                <FaTrashAlt />
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap">
                  <div>
                    <h4 className="mb-2 mb-md-0">Price Summary</h4>
                    <div className="price-summary p-3 bg-light rounded mt-2">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Flight(s):</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Baggage:</span>
                        <span>${baggagePrice.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Seat Selection:</span>
                        <span>${seatPrice.toFixed(2)}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total:</span>
                        <span className="text-primary">
                          ${adjustedTotalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="secondary"
                      as={Link}
                      href="/"
                      size="sm"
                      className="me-2 mb-2 mb-md-0"
                    >
                      Continue Shopping
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      as={Link}
                      href="/checkout"
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted p-5">
                Your cart is empty. <Link href="/">Find some flights!</Link>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

// --- Main Page Component Wrapper ---
export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center p-5">
          <Spinner animation="border" /> Loading Cart...
        </div>
      }
    >
      <CartPageContent />
    </Suspense>
  );
}

// Add required CSS if needed
/*
.price-tag-react { font-weight: bold; color: #0d6efd; }
.cart-container { ... }
*/
