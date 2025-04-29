"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { useAuth } from "@/contexts/AuthContext";
import SeatMap from "@/components/SeatMap";
import styles from "./page.module.css";

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
  if (isoDateStr?.includes("T")) {
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

export default function CheckInPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [selectedSeatType, setSelectedSeatType] =
    useState("SEAT_TYPE_STANDARD");
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);

  // Seat configuration
  const rows = 30;
  const seatsPerRow = 6; // A-F
  const seatLetters = ["A", "B", "C", "D", "E", "F"];

  // Fetch eligible tickets
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchTickets = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/check-in/eligible-tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch tickets");
        }

        const data = await response.json();
        setTickets(data);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError(err.message || "Failed to fetch tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated, authLoading, router]);

  // Handle ticket selection
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowSeatModal(true);
  };

  // Handle seat selection from SeatMap
  const handleSeatSelect = (seatNumber) => {
    setSelectedSeat(seatNumber);

    // Determine seat type based on seat number
    const row = parseInt(seatNumber.match(/\d+/)[0]);
    if (row <= 5) {
      setSelectedSeatType("SEAT_TYPE_UPFRONT");
    } else if (row === 14 || row === 15 || row === 30) {
      setSelectedSeatType("SEAT_TYPE_EXTRA_LEGROOM");
    } else {
      setSelectedSeatType("SEAT_TYPE_STANDARD");
    }
  };

  // Handle seat type selection (for dropdown)
  const handleSeatTypeChange = (e) => {
    setSelectedSeatType(e.target.value);
  };

  // Handle check-in with seat
  const handleCheckInWithSeat = async () => {
    if (!selectedTicket || !selectedSeat) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/check-in/${selectedTicket.id}/with-seat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seatNumber: selectedSeat,
            seatType: selectedSeatType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errorMessage || "Failed to check in");
      }

      setCheckInResult(data);
      setCheckInSuccess(true);
      setShowSeatModal(false);

      // Remove the checked-in ticket from the list
      setTickets(tickets.filter((t) => t.id !== selectedTicket.id));
    } catch (err) {
      console.error("Error checking in:", err);
      setError(err.message || "Failed to check in");
    }
  };

  // Handle check-in without seat
  const handleCheckInWithoutSeat = async () => {
    if (!selectedTicket) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/check-in/${selectedTicket.id}/without-seat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errorMessage || "Failed to check in");
      }

      setCheckInResult(data);
      setCheckInSuccess(true);
      setShowSeatModal(false);

      // Remove the checked-in ticket from the list
      setTickets(tickets.filter((t) => t.id !== selectedTicket.id));
    } catch (err) {
      console.error("Error checking in:", err);
      setError(err.message || "Failed to check in");
    }
  };

  // Generate seat options
  const seatOptions = [];
  for (let row = 1; row <= rows; row++) {
    for (let seat = 0; seat < seatsPerRow; seat++) {
      seatOptions.push(`${row}${seatLetters[seat]}`);
    }
  }

  // Render loading state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading tickets...</p>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  // Render success state
  if (checkInSuccess && checkInResult) {
    return (
      <Container className="py-5">
        <Alert variant="success">
          <Alert.Heading>Check-in Successful!</Alert.Heading>
          <p>You have successfully checked in for your flight.</p>
        </Alert>

        <Card className={`mt-4 ${styles["boarding-pass"]}`}>
          <Card.Header as="h5" className={styles["boarding-pass-header"]}>
            Boarding Pass
          </Card.Header>
          <Card.Body className={styles["boarding-pass-body"]}>
            <Row>
              <Col md={6}>
                <p>
                  <strong>Passenger:</strong> {checkInResult.passengerName}
                </p>
                <p>
                  <strong>Flight:</strong> {checkInResult.flightNumber}
                </p>
                <p>
                  <strong>From:</strong> {checkInResult.origin}
                </p>
                <p>
                  <strong>To:</strong> {checkInResult.destination}
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <strong>Date:</strong> {checkInResult.departureDate}
                </p>
                <p>
                  <strong>Time:</strong> {checkInResult.departureTime}
                </p>
                <p>
                  <strong>Gate:</strong> {checkInResult.gate || "TBA"}
                </p>
                <p>
                  <strong>Terminal:</strong> {checkInResult.terminal || "TBA"}
                </p>
              </Col>
            </Row>
            {checkInResult.seatNumber && (
              <div className={styles["seat-highlight"]}>
                <h2 className={styles["seat-number"]}>
                  Seat: {checkInResult.seatNumber}
                </h2>
                <p className={styles["seat-type"]}>
                  {checkInResult.seatType
                    ?.replace("SEAT_TYPE_", "")
                    .replace("_", " ")}
                </p>
              </div>
            )}
          </Card.Body>
          <Card.Footer className={styles["boarding-pass-footer"]}>
            <p className="mb-0">
              Please arrive at the airport at least 2 hours before departure.
            </p>
          </Card.Footer>
        </Card>

        <div className="mt-4 text-center">
          <Button
            variant="primary"
            onClick={() => router.push("/boarding-passes")}
          >
            View All Boarding Passes
          </Button>
        </div>

        {tickets.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline-primary"
              onClick={() => {
                setCheckInSuccess(false);
                setCheckInResult(null);
              }}
            >
              Check in another flight
            </Button>
          </div>
        )}
      </Container>
    );
  }

  // Render empty state
  if (tickets.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="info">
          <Alert.Heading>No Eligible Tickets</Alert.Heading>
          <p>You don't have any tickets eligible for check-in at this time.</p>
        </Alert>
      </Container>
    );
  }

  // Render tickets list
  return (
    <Container className="py-5">
      <h1 className="mb-4 text-center">Flight Check-in</h1>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <p className="text-center mb-4">
        Select a flight below to check in. You can choose your seat or check in
        without selecting a seat.
      </p>

      <Row>
        {tickets.map((ticket) => (
          <Col key={ticket.id} md={6} lg={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Header as="h5" className="bg-light">
                {ticket.flight?.name || "Flight"}
              </Card.Header>
              <Card.Body>
                <Card.Title>
                  {ticket.flight?.origin} → {ticket.flight?.destination}
                </Card.Title>
                <Card.Text>
                  <strong>Departure:</strong>{" "}
                  {formatDisplayDateTime(
                    ticket.flight?.departureDate,
                    ticket.flight?.departureTime
                  )}
                  <br />
                  <strong>Terminal:</strong> {ticket.flight?.terminal || "TBA"}
                  <br />
                  <strong>Gate:</strong> {ticket.flight?.gate || "TBA"}
                  <br />
                </Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white border-top-0">
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => handleSelectTicket(ticket)}
                >
                  Check In
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Seat Selection Modal */}
      <Modal
        show={showSeatModal}
        onHide={() => setShowSeatModal(false)}
        centered
        size="lg"
        dialogClassName={styles["seat-selection-modal"]}
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Your Seat</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles["modal-body"]}>
          <p>
            Flight: {selectedTicket?.flight?.name}
            <br />
            From: {selectedTicket?.flight?.origin} To:{" "}
            {selectedTicket?.flight?.destination}
            <br />
            Departure:{" "}
            {selectedTicket &&
              formatDisplayDateTime(
                selectedTicket.flight?.departureDate,
                selectedTicket.flight?.departureTime
              )}
          </p>

          <div className="mb-4">
            <h5 className="mb-3">Select Your Seat</h5>
            <SeatMap
              onSelectSeat={handleSeatSelect}
              selectedSeat={selectedSeat}
              seatType={selectedSeatType}
              flightId={selectedTicket?.flight?.id}
            />
          </div>

          {selectedSeat && (
            <div className="mb-3">
              <div className={styles["seat-highlight"]}>
                <h3 className={styles["seat-number"]}>
                  Selected Seat: {selectedSeat}
                </h3>
                <p className={styles["seat-type"]}>
                  {selectedSeatType.replace("SEAT_TYPE_", "").replace("_", " ")}
                  {selectedSeatType === "SEAT_TYPE_STANDARD" && " ($7.00)"}
                  {selectedSeatType === "SEAT_TYPE_UPFRONT" && " ($10.00)"}
                  {selectedSeatType === "SEAT_TYPE_EXTRA_LEGROOM" &&
                    " ($13.00)"}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" onClick={handleCheckInWithoutSeat}>
            Check In Without Seat Selection
          </Button>
          <Button
            variant="primary"
            onClick={handleCheckInWithSeat}
            disabled={!selectedSeat}
          >
            Confirm Seat Selection
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
