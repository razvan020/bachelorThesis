"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

export default function AddFlightPage() {
  // --- FIXED: Renamed state variable ---
  const [name, setName] = useState(""); // Changed from flightName
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [price, setPrice] = useState("");
  const [terminal, setTerminal] = useState("");
  const [gate, setGate] = useState("");

  // State for submission status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const router = useRouter();

  const handleAddSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Basic Validation
    const departureDateTimeStr = `${departureDate}T${
      departureTime || "00:00"
    }:00`;
    const arrivalDateTimeStr = `${arrivalDate}T${arrivalTime || "00:00"}:00`;
    if (new Date(arrivalDateTimeStr) <= new Date(departureDateTimeStr)) {
      setError("Arrival date and time must be after departure date and time.");
      setIsLoading(false);
      return;
    }

    // --- Prepare Data Payload ---
    // --- FIXED: Use 'name' state variable ---
    const flightData = {
      name, // Use the renamed state variable
      origin,
      destination,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      price: parseFloat(price) || 0,
      terminal,
      gate,
    };
    console.log("Submitting Flight Data:", flightData);

    try {
      const response = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flightData),
      });

      if (!response.ok) {
        let errorMsg = `Error: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || errorMsg;
        } catch (parseError) {
          /* Ignore */
        }
        throw new Error(errorMsg);
      }

      const createdFlight = await response.json();
      // --- FIXED: Use createdFlight.name ---
      setSuccessMessage(
        `Flight "${createdFlight.name}" (ID: ${createdFlight.id}) added successfully! Form will reset.`
      );
      // Clear form
      setName(""); // Clear the renamed state variable
      setOrigin("");
      setDestination("");
      setDepartureDate("");
      setDepartureTime("");
      setArrivalDate("");
      setArrivalTime("");
      setPrice("");
      setTerminal("");
      setGate("");
      // setTimeout(() => router.push('/admin/flights/manage'), 2000);
    } catch (err) {
      console.error("Failed to add flight:", err);
      setError(
        err.message ||
          "Failed to add flight. Please check your input and try again."
      );
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm">
            <Card.Header as="h1" className="text-center text-uppercase h4 py-3">
              Add a New Flight
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              {error && (
                <Alert
                  variant="danger"
                  onClose={() => setError(null)}
                  dismissible
                >
                  {error}
                </Alert>
              )}
              {successMessage && (
                <Alert
                  variant="success"
                  onClose={() => setSuccessMessage(null)}
                  dismissible
                >
                  {successMessage}
                </Alert>
              )}

              <Form onSubmit={handleAddSubmit}>
                {/* Flight Name */}
                {/* --- FIXED: Update controlId, value, onChange --- */}
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Flight Name/Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., XT101"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Form.Group>

                {/* Origin */}
                <Form.Group className="mb-3" controlId="origin">
                  <Form.Label>Origin</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., OTP"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Form.Group>

                {/* Destination */}
                <Form.Group className="mb-3" controlId="destination">
                  <Form.Label>Destination</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., LHR"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Form.Group>

                {/* Departure Date/Time */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="departureDate">
                      <Form.Label>Departure Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        required
                        disabled={isLoading}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="departureTime">
                      <Form.Label>Departure Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Arrival Date/Time */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="arrivalDate">
                      <Form.Label>Arrival Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                        min={departureDate}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="arrivalTime">
                      <Form.Label>Arrival Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Terminal & Gate */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="terminal">
                      <Form.Label>Terminal</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., A"
                        value={terminal}
                        onChange={(e) => setTerminal(e.target.value)}
                        disabled={isLoading}
                      />
                      <Form.Text className="text-muted">Optional</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="gate">
                      <Form.Label>Gate</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., 10"
                        value={gate}
                        onChange={(e) => setGate(e.target.value)}
                        disabled={isLoading}
                      />
                      <Form.Text className="text-muted">Optional</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Price */}
                <Form.Group className="mb-4" controlId="price">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g., 199.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                    disabled={isLoading}
                  />
                </Form.Group>

                {/* Buttons */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <Button variant="success" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />{" "}
                        Saving...
                      </>
                    ) : (
                      "Save Flight"
                    )}
                  </Button>
                  <Button variant="secondary" as={Link} href="/flights/manage">
                    Cancel / Back to List
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
