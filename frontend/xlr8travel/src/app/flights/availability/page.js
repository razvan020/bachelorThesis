"use client"; // Required for hooks

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation"; // Hook to read URL parameters
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { FaPlaneDeparture, FaShoppingCart } from "react-icons/fa"; // Icons
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth to update cart count

// Helper function to format date/time (customize as needed)
const formatDisplayDateTime = (isoDateStr, isoTimeStr) => {
  // Combine or use directly based on backend format
  // This example assumes separate date and time strings might be needed
  // If your DTO returns combined LocalDateTime/Timestamp as ISO string, adjust accordingly
  const datePart = isoDateStr
    ? new Date(isoDateStr + "T00:00:00").toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";
  const timePart = isoTimeStr || ""; // Assuming time is already HH:mm
  if (datePart && timePart) return `${datePart} ${timePart}`;
  if (datePart) return datePart;
  return "N/A";
};

// --- Main Component Content ---
function FlightAvailabilityContent() {
  const searchParams = useSearchParams(); // Get URL query parameters
  const { fetchCartCount } = useAuth(); // Get function to update navbar cart count

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartStatus, setCartStatus] = useState({}); // Tracks adding state for each flight { flightId: 'loading' | 'success' | 'error', message?: string }

  // Get search criteria from URL
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departureDate = searchParams.get("departureDate");
  const arrivalDate = searchParams.get("arrivalDate"); // Might be null for one-way
  const tripType = searchParams.get("tripType");
  // Add passenger counts if your API uses them for filtering
  // const adults = searchParams.get('adults');

  useEffect(() => {
    const fetchAvailableFlights = async () => {
      // Ensure required parameters are present
      if (!origin || !destination || !departureDate) {
        setError(
          "Missing search criteria (Origin, Destination, Departure Date)."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setCartStatus({}); // Clear cart statuses

      // Build the query string for the backend API
      const query = new URLSearchParams({
        origin,
        destination,
        departureDate,
        tripType: tripType || "roundTrip", // Default if missing
        // Add passenger counts if needed by API
        // adults: adults || '1',
        // children: searchParams.get('children') || '0',
        // infants: searchParams.get('infants') || '0',
      });
      // Add arrivalDate only if it exists (for round trips)
      if (arrivalDate) {
        query.append("arrivalDate", arrivalDate);
      }

      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        const apiUrl = `${backendUrl}/api/flights/search?${query.toString()}`;
        console.log("Fetching available flights from:", apiUrl); // Debug log

        const response = await fetch(apiUrl);

        if (!response.ok) {
          let errorMsg = `Error fetching flights (${response.status})`;
          try {
            const errData = await response.json();
            errorMsg = errData.message || errData.error || errorMsg;
          } catch (e) {
            /* Ignore parsing error */
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log("Received flights:", data); // Debug log
        setFlights(data || []); // Ensure it's an array
      } catch (err) {
        console.error("Failed to fetch available flights:", err);
        setError(err.message || "Failed to load available flights.");
        setFlights([]); // Clear flights on error
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableFlights();
    // Re-fetch if search parameters change
  }, [origin, destination, departureDate, arrivalDate, tripType]); // Dependency array

  // --- Add to Cart Logic ---
  const handleAddToCart = async (flightId) => {
    if (!flightId) return;

    setCartStatus((prev) => ({ ...prev, [flightId]: { state: "loading" } })); // Set loading state for this specific button
    setError(null); // Clear general page errors

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const response = await fetch(`${backendUrl}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightId }),
        credentials: "include",
      });

      const data = await response.json(); // Assume backend returns updated cart or success message

      if (!response.ok) {
        throw new Error(
          data.error || `Error adding to cart (${response.status})`
        );
      }

      // Success!
      setCartStatus((prev) => ({
        ...prev,
        [flightId]: { state: "success", message: "Added!" },
      }));
      fetchCartCount(); // Update the cart count in the navbar context
      // Optionally hide success message after a delay
      setTimeout(
        () =>
          setCartStatus((prev) => ({ ...prev, [flightId]: { state: null } })),
        2000
      );
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setCartStatus((prev) => ({
        ...prev,
        [flightId]: { state: "error", message: err.message || "Failed" },
      }));
    }
    // Note: isLoading for the button resets automatically when state changes from 'loading'
  };

  return (
    <Container className="py-4 py-md-5">
      {" "}
      {/* Main container with padding */}
      <header className="text-center mb-5">
        <h1 className="display-5 text-uppercase fw-bold">Available Flights</h1>
        {/* Display search criteria */}
        <p className="lead text-muted">
          Showing flights from <strong>{origin}</strong> to{" "}
          <strong>{destination}</strong> departing{" "}
          <strong>{departureDate}</strong>
          {arrivalDate && tripType === "roundTrip"
            ? ` returning ${arrivalDate}`
            : " (One Way)"}
        </p>
        {/* Link back to search? */}
        <Link href="/" className="btn btn-sm btn-outline-secondary">
          Modify Search
        </Link>
      </header>
      {/* Loading State */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">
              Loading available flights...
            </span>
          </Spinner>
          <p className="mt-2 text-muted">Finding flights...</p>
        </div>
      )}
      {/* Error State */}
      {error && !loading && (
        <Alert variant="danger">
          <strong>Error:</strong> {error} Please{" "}
          <Alert.Link href="/">try your search again</Alert.Link>.
        </Alert>
      )}
      {/* Results */}
      {!loading && !error && (
        <>
          {flights.length > 0 ? (
            <Row className="g-4">
              {" "}
              {/* Use Row with gap */}
              {flights.map((flight) => (
                <Col md={12} key={flight.id}>
                  {" "}
                  {/* Full width column for each card */}
                  {/* Using Card component for structure */}
                  <Card className="shadow-sm ticket-card-react">
                    {" "}
                    {/* Added new class */}
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col xs="auto" className="d-none d-sm-block">
                          {" "}
                          {/* Hide icon on extra small */}
                          <FaPlaneDeparture size="3em" className="text-info" />
                        </Col>
                        <Col>
                          <h5 className="card-title mb-1 fw-bold">
                            {flight.name}
                          </h5>
                          <p className="card-text mb-1 small">
                            <strong>From:</strong> {flight.origin}{" "}
                            <strong className="ms-3">To:</strong>{" "}
                            {flight.destination}
                          </p>
                          <p className="card-text mb-1 small">
                            <strong>Depart:</strong>{" "}
                            {formatDisplayDateTime(
                              flight.departureDate,
                              flight.departureTime
                            )}
                          </p>
                          {/* Show arrival only if different from departure (covers one-way/round-trip display) */}
                          {flight.arrivalDate && flight.arrivalTime && (
                            <p className="card-text mb-2 small">
                              <strong>Arrive:</strong>{" "}
                              {formatDisplayDateTime(
                                flight.arrivalDate,
                                flight.arrivalTime
                              )}
                            </p>
                          )}
                        </Col>
                        <Col md={3} className="text-md-end mt-3 mt-md-0">
                          <h4 className="mb-2 price-tag-react">
                            {" "}
                            {/* Added new class */}$
                            {flight.price?.toFixed(2) ?? "N/A"}
                          </h4>
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-100"
                            onClick={() => handleAddToCart(flight.id)}
                            disabled={
                              cartStatus[flight.id]?.state === "loading"
                            }
                          >
                            {cartStatus[flight.id]?.state === "loading" ? (
                              <Spinner size="sm" animation="border" />
                            ) : cartStatus[flight.id]?.state === "success" ? (
                              "Added!"
                            ) : cartStatus[flight.id]?.state === "error" ? (
                              "Error!"
                            ) : (
                              <>
                                <FaShoppingCart className="me-1" /> Add to Cart
                              </>
                            )}
                          </Button>
                          {/* Optional: small error message below button */}
                          {cartStatus[flight.id]?.state === "error" && (
                            <small className="text-danger d-block mt-1">
                              {cartStatus[flight.id]?.message}
                            </small>
                          )}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info" className="text-center">
              No flights found matching your criteria. Please{" "}
              <Alert.Link href="/">try modifying your search</Alert.Link>.
            </Alert>
          )}
        </>
      )}
    </Container>
  );
}

// --- Main Page Wrapper (Handles Suspense for useSearchParams) ---
// This is needed because useSearchParams requires a Suspense boundary
export default function FlightAvailabilityPage() {
  return (
    // Suspense is required for useSearchParams in Next.js App Router
    <Suspense
      fallback={
        <div className="text-center p-5">
          <Spinner animation="border" /> Loading Search...
        </div>
      }
    >
      <FlightAvailabilityContent />
    </Suspense>
  );
}
