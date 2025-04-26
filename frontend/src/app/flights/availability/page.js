"use client"; // Required for hooks

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Hook to read URL parameters
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaUser,
  FaSuitcase,
  FaChair,
} from "react-icons/fa"; // Icons
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
  const router = useRouter();
  const { fetchCartCount } = useAuth(); // Get function to update navbar cart count

  // Flight search and selection states
  const [outboundFlights, setOutboundFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected flights
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);

  // Booking flow states
  const [currentStep, setCurrentStep] = useState("flights"); // 'flights', 'passengers', 'seats', 'payment'

  // Passenger details
  const [passengerDetails, setPassengerDetails] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    baggageType: "BAGGAGE_TYPE_WEIGHT_CARRY_ON_0", // Default to free carry-on
  });

  // Available seats
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // Pricing
  const [totalPrice, setTotalPrice] = useState(0);

  // Get search criteria from URL
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departureDate = searchParams.get("departureDate");
  const arrivalDate = searchParams.get("arrivalDate"); // Might be null for one-way
  const tripType = searchParams.get("tripType");

  // Baggage options
  const baggageOptions = [
    {
      value: "BAGGAGE_TYPE_WEIGHT_CARRY_ON_0",
      label: "No, free carry-on bag is enough for me (0kg)",
      price: 0,
    },
    {
      value: "BAGGAGE_TYPE_WEIGHT_CHECKED_10",
      label: "Checked baggage (10kg)",
      price: 20,
    },
    {
      value: "BAGGAGE_TYPE_WEIGHT_CHECKED_20",
      label: "Checked baggage (20kg)",
      price: 30,
    },
    {
      value: "BAGGAGE_TYPE_WEIGHT_CHECKED_26",
      label: "Checked baggage (26kg)",
      price: 40,
    },
    {
      value: "BAGGAGE_TYPE_WEIGHT_CHECKED_32",
      label: "Checked baggage (32kg)",
      price: 50,
    },
  ];

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

      try {
        // Fetch outbound flights
        // If tripType is roundTrip but no arrivalDate is provided, use oneWay instead
        const effectiveTripType =
          tripType === "roundTrip" && !arrivalDate
            ? "oneWay"
            : tripType || "oneWay";

        const outboundQuery = new URLSearchParams({
          origin,
          destination,
          departureDate,
          tripType: "oneWay",
        });

        const outboundApiUrl = `/api/flights/search?${outboundQuery.toString()}`;
        console.log("Fetching outbound flights from:", outboundApiUrl);

        const outboundResponse = await fetch(outboundApiUrl);

        if (!outboundResponse.ok) {
          let errorMsg = `Error fetching outbound flights (${outboundResponse.status})`;
          try {
            const errData = await outboundResponse.json();
            errorMsg = errData.message || errData.error || errorMsg;
          } catch (e) {
            /* Ignore parsing error */
          }
          throw new Error(errorMsg);
        }

        const outboundData = await outboundResponse.json();
        setOutboundFlights(outboundData || []);

        // Fetch return flights if round trip
        if (tripType === "roundTrip" && arrivalDate) {
          const returnQuery = new URLSearchParams({
            origin: destination, // Swap origin and destination for return
            destination: origin,
            departureDate: arrivalDate, // Use arrival date as departure for return
            tripType: "oneWay", // Change from "roundTrip" to "oneWay"
          });

          const returnApiUrl = `/api/flights/search?${returnQuery.toString()}`;
          console.log("Fetching return flights from:", returnApiUrl);

          const returnResponse = await fetch(returnApiUrl);

          if (!returnResponse.ok) {
            let errorMsg = `Error fetching return flights (${returnResponse.status})`;
            try {
              const errData = await returnResponse.json();
              errorMsg = errData.message || errData.error || errorMsg;
            } catch (e) {
              /* Ignore parsing error */
            }
            throw new Error(errorMsg);
          }

          const returnData = await returnResponse.json();
          setReturnFlights(returnData || []);
        }
      } catch (err) {
        console.error("Failed to fetch available flights:", err);
        setError(err.message || "Failed to load available flights.");
        setOutboundFlights([]);
        setReturnFlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableFlights();
  }, [origin, destination, departureDate, arrivalDate, tripType]);

  // Update total price when selections change
  useEffect(() => {
    let price = 0;

    // Add flight prices
    if (selectedOutboundFlight) {
      price += selectedOutboundFlight.price;
    }

    if (selectedReturnFlight) {
      price += selectedReturnFlight.price;
    }

    // Add baggage price
    const selectedBaggage = baggageOptions.find(
      (option) => option.value === passengerDetails.baggageType
    );
    if (selectedBaggage) {
      price += selectedBaggage.price;
    }

    // Add seat price if selected
    if (selectedSeat && selectedSeat.price) {
      price += selectedSeat.price;
    }

    setTotalPrice(price);
  }, [
    selectedOutboundFlight,
    selectedReturnFlight,
    passengerDetails.baggageType,
    selectedSeat,
  ]);

  // Handle flight selection
  const handleFlightSelection = (flight, type) => {
    if (type === "outbound") {
      setSelectedOutboundFlight(flight);
    } else {
      setSelectedReturnFlight(flight);
    }
  };

  // Handle passenger details change
  const handlePassengerDetailsChange = (e) => {
    const { name, value } = e.target;
    setPassengerDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle seat selection
  const handleSeatSelection = (seat) => {
    setSelectedSeat(seat);
  };

  // Handle navigation between steps
  const handleNextStep = async () => {
    if (currentStep === "flights") {
      // Validate flight selection
      if (
        !selectedOutboundFlight ||
        (tripType === "roundTrip" && !selectedReturnFlight)
      ) {
        alert("Please select flights for your journey");
        return;
      }
      setCurrentStep("passengers");
    } else if (currentStep === "passengers") {
      // Validate passenger details
      if (
        !passengerDetails.firstName ||
        !passengerDetails.lastName ||
        !passengerDetails.gender
      ) {
        alert("Please fill in all passenger details");
        return;
      }
      // Fetch available seats (mock for now)
      setAvailableSeats([
        {
          id: 1,
          number: "A1",
          type: "SEAT_TYPE_STANDARD",
          price: 7,
          available: true,
        },
        {
          id: 2,
          number: "B1",
          type: "SEAT_TYPE_STANDARD",
          price: 7,
          available: true,
        },
        {
          id: 3,
          number: "C1",
          type: "SEAT_TYPE_UPFRONT",
          price: 10,
          available: true,
        },
        {
          id: 4,
          number: "D1",
          type: "SEAT_TYPE_EXTRA_LEGROOM",
          price: 13,
          available: true,
        },
        // Add more seats as needed
      ]);
      setCurrentStep("seats");
    } else if (currentStep === "seats") {
      localStorage.setItem("selectedBaggageType", passengerDetails.baggageType);
      localStorage.setItem("selectedSeatType", selectedSeat.type);
      // Validate seat selection
      if (!selectedSeat) {
        alert("Please select a seat");
        return;
      }

      try {
        // Get the token from localStorage
        const token = localStorage.getItem("token");

        // First, add the outbound flight to the cart
        if (selectedOutboundFlight) {
          const response = await fetch("/api/cart/add", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              flightId: selectedOutboundFlight.id,
              // You can add additional details if your API supports it
              baggageType: passengerDetails.baggageType,
              seatId: selectedSeat.id,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Error adding outbound flight to cart (${response.status})`
            );
          }
        }

        // If it's a round trip, add the return flight too
        if (tripType === "roundTrip" && selectedReturnFlight) {
          const response = await fetch("/api/cart/add", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              flightId: selectedReturnFlight.id,
              // You can add additional details if your API supports it
              baggageType: passengerDetails.baggageType,
              seatId: selectedSeat.id,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Error adding return flight to cart (${response.status})`
            );
          }
        }

        // Update the cart count in the navbar
        if (fetchCartCount) {
          fetchCartCount();
        }

        // Redirect to the cart page
        router.push("/cart");
      } catch (error) {
        console.error("Failed to add flights to cart:", error);
        alert("Failed to add flights to cart. Please try again.");
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "passengers") {
      setCurrentStep("flights");
    } else if (currentStep === "seats") {
      setCurrentStep("passengers");
    }
  };

  // Render flight selection step
  const renderFlightSelectionStep = () => {
    return (
      <>
        <h2 className="mb-4">Select Your Flights</h2>

        {/* Outbound Flights */}
        <h3 className="h5 mb-3">
          <FaPlaneDeparture className="me-2" />
          Outbound Flight: {origin} to {destination}
        </h3>

        {outboundFlights.length > 0 ? (
          <Row className="g-4 mb-5">
            {outboundFlights.map((flight) => (
              <Col md={12} key={flight.id}>
                <Card
                  className={`shadow-sm ticket-card-react ${
                    selectedOutboundFlight?.id === flight.id
                      ? "border-primary"
                      : ""
                  }`}
                  onClick={() => handleFlightSelection(flight, "outbound")}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col xs="auto" className="d-none d-sm-block">
                        <FaPlaneDeparture size="2em" className="text-info" />
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
                          ${flight.price?.toFixed(2) ?? "N/A"}
                        </h4>
                        <Form.Check
                          type="radio"
                          id={`outbound-${flight.id}`}
                          label="Select this flight"
                          name="outboundFlight"
                          checked={selectedOutboundFlight?.id === flight.id}
                          onChange={() =>
                            handleFlightSelection(flight, "outbound")
                          }
                          className="mb-0"
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Alert variant="info" className="mb-4">
            No outbound flights available for the selected date.
          </Alert>
        )}

        {/* Return Flights (if round trip) */}
        {tripType === "roundTrip" && (
          <>
            <h3 className="h5 mb-3">
              <FaPlaneArrival className="me-2" />
              Return Flight: {destination} to {origin}
            </h3>

            {returnFlights.length > 0 ? (
              <Row className="g-4 mb-4">
                {returnFlights.map((flight) => (
                  <Col md={12} key={flight.id}>
                    <Card
                      className={`shadow-sm ticket-card-react ${
                        selectedReturnFlight?.id === flight.id
                          ? "border-primary"
                          : ""
                      }`}
                      onClick={() => handleFlightSelection(flight, "return")}
                      style={{ cursor: "pointer" }}
                    >
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col xs="auto" className="d-none d-sm-block">
                            <FaPlaneArrival size="2em" className="text-info" />
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
                              ${flight.price?.toFixed(2) ?? "N/A"}
                            </h4>
                            <Form.Check
                              type="radio"
                              id={`return-${flight.id}`}
                              label="Select this flight"
                              name="returnFlight"
                              checked={selectedReturnFlight?.id === flight.id}
                              onChange={() =>
                                handleFlightSelection(flight, "return")
                              }
                              className="mb-0"
                            />
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info" className="mb-4">
                No return flights available for the selected date.
              </Alert>
            )}
          </>
        )}

        <div className="d-flex justify-content-end mt-4">
          <Button
            variant="primary"
            onClick={handleNextStep}
            disabled={
              !selectedOutboundFlight ||
              (tripType === "roundTrip" && !selectedReturnFlight)
            }
          >
            Continue to Passengers & Baggage
          </Button>
        </div>
      </>
    );
  };

  // Render passenger details step
  const renderPassengerDetailsStep = () => {
    return (
      <>
        <h2 className="mb-4">
          <FaUser className="me-2" />
          Passenger & Baggage Details
        </h2>

        <Form className="mb-4">
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="passengerFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={passengerDetails.firstName}
                  onChange={handlePassengerDetailsChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="passengerLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={passengerDetails.lastName}
                  onChange={handlePassengerDetailsChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4" controlId="passengerGender">
            <Form.Label>Gender</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                id="gender-male"
                label="Male"
                name="gender"
                value="male"
                checked={passengerDetails.gender === "male"}
                onChange={handlePassengerDetailsChange}
                required
              />
              <Form.Check
                inline
                type="radio"
                id="gender-female"
                label="Female"
                name="gender"
                value="female"
                checked={passengerDetails.gender === "female"}
                onChange={handlePassengerDetailsChange}
                required
              />
            </div>
          </Form.Group>

          <h3 className="h5 mb-3">
            <FaSuitcase className="me-2" />
            Baggage Selection
          </h3>

          <Form.Group className="mb-4" controlId="baggageType">
            <Form.Label>Choose your baggage option:</Form.Label>
            {baggageOptions.map((option) => (
              <Form.Check
                key={option.value}
                type="radio"
                id={`baggage-${option.value}`}
                label={`${option.label} (+$${option.price.toFixed(2)})`}
                name="baggageType"
                value={option.value}
                checked={passengerDetails.baggageType === option.value}
                onChange={handlePassengerDetailsChange}
                className="mb-2"
              />
            ))}
          </Form.Group>
        </Form>

        <div className="d-flex justify-content-between mt-4">
          <Button variant="outline-secondary" onClick={handlePreviousStep}>
            Back to Flight Selection
          </Button>
          <Button
            variant="primary"
            onClick={handleNextStep}
            disabled={
              !passengerDetails.firstName ||
              !passengerDetails.lastName ||
              !passengerDetails.gender
            }
          >
            Continue to Seat Selection
          </Button>
        </div>
      </>
    );
  };

  // Render seat selection step
  const renderSeatSelectionStep = () => {
    return (
      <>
        <h2 className="mb-4">
          <FaChair className="me-2" />
          Seat Selection
        </h2>

        <div className="mb-4">
          <h3 className="h5 mb-3">Choose your seat:</h3>

          <div className="seat-map mb-4">
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
              {availableSeats.map((seat) => (
                <Button
                  key={seat.id}
                  variant={
                    selectedSeat?.id === seat.id
                      ? "primary"
                      : seat.type === "SEAT_TYPE_STANDARD"
                      ? "outline-secondary"
                      : seat.type === "SEAT_TYPE_UPFRONT"
                      ? "outline-info"
                      : "outline-warning"
                  }
                  className="seat-button"
                  style={{ width: "60px", height: "60px" }}
                  onClick={() => handleSeatSelection(seat)}
                  disabled={!seat.available}
                >
                  <div className="d-flex flex-column align-items-center">
                    <small>{seat.number}</small>
                    <small>${seat.price}</small>
                  </div>
                </Button>
              ))}
            </div>

            <div className="seat-legend d-flex justify-content-center gap-4 small">
              <div>
                <span className="badge bg-secondary me-1"></span> Standard
              </div>
              <div>
                <span className="badge bg-info me-1"></span> Up Front
              </div>
              <div>
                <span className="badge bg-warning me-1"></span> Extra Legroom
              </div>
            </div>
          </div>

          {selectedSeat && (
            <Alert variant="success">
              You selected seat {selectedSeat.number} ($
              {selectedSeat.price.toFixed(2)})
            </Alert>
          )}
        </div>

        <div className="price-summary mb-4 p-3 bg-light rounded">
          <h3 className="h5 mb-3">Price Summary</h3>
          <div className="d-flex justify-content-between mb-2">
            <span>Flight(s):</span>
            <span>
              $
              {(
                selectedOutboundFlight?.price +
                (selectedReturnFlight?.price || 0)
              ).toFixed(2)}
            </span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Baggage:</span>
            <span>
              $
              {baggageOptions
                .find((option) => option.value === passengerDetails.baggageType)
                ?.price.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Seat Selection:</span>
            <span>${selectedSeat?.price.toFixed(2) || "0.00"}</span>
          </div>
          <hr />
          <div className="d-flex justify-content-between fw-bold">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <Button variant="outline-secondary" onClick={handlePreviousStep}>
            Back to Passenger Details
          </Button>
          <Button
            variant="success"
            onClick={handleNextStep}
            disabled={!selectedSeat}
          >
            Complete Booking
          </Button>
        </div>
      </>
    );
  };

  return (
    <Container className="py-4 py-md-5">
      <header className="text-center mb-5">
        <h1 className="display-5 text-uppercase fw-bold">Book Your Flight</h1>
        <p className="lead text-muted">
          {origin} to {destination}{" "}
          {tripType === "roundTrip" ? "(Round Trip)" : "(One Way)"}
        </p>
        <Link href="/" className="btn btn-sm btn-outline-secondary">
          Modify Search
        </Link>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading flights...</span>
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

      {/* Booking Steps */}
      {!loading && !error && (
        <div className="booking-steps">
          {/* Progress Indicator */}
          <div className="booking-progress mb-5">
            <Nav variant="pills" className="booking-nav">
              <Nav.Item>
                <Nav.Link
                  active={currentStep === "flights"}
                  onClick={() =>
                    currentStep !== "flights" && handlePreviousStep()
                  }
                  className={
                    currentStep === "flights"
                      ? "active"
                      : currentStep === "passengers" || currentStep === "seats"
                      ? "completed"
                      : ""
                  }
                >
                  1. Select Flights
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={currentStep === "passengers"}
                  onClick={() =>
                    currentStep === "seats" && handlePreviousStep()
                  }
                  className={
                    currentStep === "passengers"
                      ? "active"
                      : currentStep === "seats"
                      ? "completed"
                      : ""
                  }
                  disabled={currentStep === "flights"}
                >
                  2. Passengers & Baggage
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={currentStep === "seats"}
                  disabled={
                    currentStep === "flights" || currentStep === "passengers"
                  }
                >
                  3. Seat Selection
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          {/* Step Content */}
          <div className="step-content">
            {currentStep === "flights" && renderFlightSelectionStep()}
            {currentStep === "passengers" && renderPassengerDetailsStep()}
            {currentStep === "seats" && renderSeatSelectionStep()}
          </div>
        </div>
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
