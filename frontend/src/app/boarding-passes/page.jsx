"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { useAuth } from "@/contexts/AuthContext";
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

export default function BoardingPassesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [boardingPasses, setBoardingPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch boarding passes
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchBoardingPasses = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/check-in/boarding-passes", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch boarding passes");
        }

        const data = await response.json();
        setBoardingPasses(data);
      } catch (err) {
        console.error("Error fetching boarding passes:", err);
        setError(err.message || "Failed to fetch boarding passes");
      } finally {
        setLoading(false);
      }
    };

    fetchBoardingPasses();
  }, [isAuthenticated, authLoading, router]);

  // Render loading state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading boarding passes...</p>
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

  // Render empty state
  if (boardingPasses.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="info">
          <Alert.Heading>No Boarding Passes</Alert.Heading>
          <p>You don't have any checked-in flights at this time.</p>
        </Alert>
      </Container>
    );
  }

  // Render boarding passes
  return (
    <Container className="py-5">
      <h1 className="mb-4 text-center">My Boarding Passes</h1>

      <Row>
        {boardingPasses.map((ticket) => (
          <Col key={ticket.id} md={6} className="mb-4">
            <Card className={styles["boarding-pass"]}>
              <Card.Header as="h5" className={styles["boarding-pass-header"]}>
                Boarding Pass
              </Card.Header>
              <Card.Body className={styles["boarding-pass-body"]}>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Passenger:</strong> {ticket.user?.firstname}{" "}
                      {ticket.user?.lastname}
                    </p>
                    <p>
                      <strong>Flight:</strong> {ticket.flight?.name}
                    </p>
                    <p>
                      <strong>From:</strong> {ticket.flight?.origin}
                    </p>
                    <p>
                      <strong>To:</strong> {ticket.flight?.destination}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Date:</strong>{" "}
                      {formatDisplayDateTime(
                        ticket.flight?.departureDate,
                        null
                      )}
                    </p>
                    <p>
                      <strong>Time:</strong> {ticket.flight?.departureTime}
                    </p>
                    <p>
                      <strong>Gate:</strong> {ticket.flight?.gate || "TBA"}
                    </p>
                    <p>
                      <strong>Terminal:</strong>{" "}
                      {ticket.flight?.terminal || "TBA"}
                    </p>
                  </Col>
                </Row>
                {ticket.seat && (
                  <div className={styles["seat-highlight"]}>
                    <h2 className={styles["seat-number"]}>
                      Seat: {ticket.seat.seatNumber}
                    </h2>
                    <p className={styles["seat-type"]}>
                      {ticket.seat.seatType
                        ?.replace("SEAT_TYPE_", "")
                        .replace("_", " ")}
                    </p>
                  </div>
                )}
              </Card.Body>
              <Card.Footer className={styles["boarding-pass-footer"]}>
                <p className="mb-0">
                  Please arrive at the airport at least 2 hours before
                  departure.
                </p>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
