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
import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaChair,
  FaCheckCircle,
  FaTicketAlt,
  FaBuilding,
  FaUser,
  FaQrcode,
  FaMobile,
  FaDownload,
  FaArrowRight,
  FaPlane,
  FaDoorOpen,
  FaBan,
} from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import SeatMap from "@/components/SeatMap";

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
  const {
    isAuthenticated,
    loading: authLoading,
    showLoginWithMessage,
  } = useAuth();
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
  const seatsPerRow = 6;
  const seatLetters = ["A", "B", "C", "D", "E", "F"];

  // Fetch eligible tickets
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      showLoginWithMessage("You need to be logged in to access check-in");
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

    const row = parseInt(seatNumber.match(/\d+/)[0]);
    if (row <= 5) {
      setSelectedSeatType("SEAT_TYPE_UPFRONT");
    } else if (row === 14 || row === 15 || row === 30) {
      setSelectedSeatType("SEAT_TYPE_EXTRA_LEGROOM");
    } else {
      setSelectedSeatType("SEAT_TYPE_STANDARD");
    }
  };

  // Handle seat type selection
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
      <>
        <style jsx global>{`
          .checkin-loading-state {
            min-height: 100vh;
            background: black;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            gap: 1.5rem;
          }

          .checkin-loading-spinner .spinner-border {
            width: 3rem;
            height: 3rem;
            border-width: 3px;
            color: var(--primary-orange);
          }

          .checkin-loading-text {
            font-size: 1.2rem;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.8);
          }
        `}</style>
        <div className="checkin-loading-state">
          <div className="checkin-loading-spinner">
            <Spinner animation="border" />
          </div>
          <p className="checkin-loading-text">Loading your tickets...</p>
        </div>
      </>
    );
  }

  // Render error state
  if (error) {
    return (
      <>
        <style jsx global>{`
          .checkin-error-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .checkin-error-alert {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 20px;
            color: rgba(255, 255, 255, 0.9);
            padding: 2rem;
            text-align: center;
            max-width: 500px;
          }

          .checkin-error-alert h4 {
            color: #fca5a5;
            margin-bottom: 1rem;
          }
        `}</style>
        <div className="checkin-error-page">
          <Alert variant="danger" className="checkin-error-alert">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </div>
      </>
    );
  }

  // Render success state
  if (checkInSuccess && checkInResult) {
    return (
      <>
        <style jsx global>{`
          .success-checkin-page {
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

          .success-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
          }

          .success-bg-gradient {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(
                circle at 30% 30%,
                rgba(16, 185, 129, 0.1) 0%,
                transparent 50%
              ),
              radial-gradient(
                circle at 70% 70%,
                rgba(255, 111, 0, 0.05) 0%,
                transparent 50%
              );
          }

          .success-container {
            position: relative;
            z-index: 1;
            padding: 2rem 0;
          }

          .success-alert {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 20px;
            color: rgba(255, 255, 255, 0.9);
            padding: 2rem;
            text-align: center;
            margin-bottom: 2rem;
          }

          .success-alert h4 {
            color: #10b981;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }

          .boarding-pass-modern {
            background: linear-gradient(
              135deg,
              rgba(0, 0, 0, 0.95) 0%,
              rgba(0, 0, 0, 0.95) 100%
            );
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            color: white;
            position: relative;
          }

          .boarding-pass-modern::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(
              90deg,
              var(--primary-orange) 0%,
              #fbbf24 100%
            );
          }

          .boarding-pass-header-modern {
            background: rgba(0, 0, 0, 0.8);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 2rem;
            text-align: center;
            position: relative;
          }

          .boarding-pass-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }

          .boarding-pass-icon {
            color: var(--primary-orange);
            font-size: 1.8rem;
          }

          .boarding-pass-body-modern {
            padding: 2rem;
          }

          .flight-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
          }

          .detail-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }

          .detail-icon {
            color: var(--primary-orange);
            font-size: 1.1rem;
            width: 20px;
          }

          .detail-label {
            color: rgba(255, 255, 255, 0.7);
            font-weight: 500;
            min-width: 80px;
          }

          .detail-value {
            color: white;
            font-weight: 600;
          }

          .seat-highlight-modern {
            background: linear-gradient(
              135deg,
              rgba(0, 0, 0, 0.15) 0%,
              rgba(0, 0, 0, 0.15) 100%
            );
            border: 1px solid rgba(255, 111, 0, 0.3);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            margin-top: 2rem;
          }

          .seat-number-modern {
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(
              135deg,
              var(--primary-orange) 0%,
              #fbbf24 100%
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
          }

          .seat-type-modern {
            color: rgba(0, 0, 0, 0.8);
            font-size: 1.1rem;
            font-weight: 500;
          }

          .boarding-pass-footer-modern {
            background: rgba(0, 0, 0, 0.6);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1.5rem;
            text-align: center;
            position: relative;
          }

          .boarding-pass-footer-modern::before {
            content: "";
            position: absolute;
            top: 0;
            left: 2rem;
            right: 2rem;
            height: 1px;
            background: repeating-linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.3) 0px,
              rgba(0, 0, 0, 0.3) 8px,
              transparent 8px,
              transparent 16px
            );
          }

          .footer-text {
            color: rgba(255, 255, 255, 0.7);
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .action-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 2rem;
          }

          .action-btn {
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
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
          }

          .action-btn:hover {
            background: linear-gradient(
              135deg,
              #e65100 0%,
              var(--primary-orange) 100%
            );
            color: white;
            transform: translateY(-2px);
            text-decoration: none;
          }

          .action-btn-outline {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
          }

          .action-btn-outline:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            color: white;
          }

          /* Mobile responsiveness */
          @media (max-width: 768px) {
            .flight-details-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .boarding-pass-header-modern,
            .boarding-pass-body-modern {
              padding: 1.5rem;
            }

            .seat-number-modern {
              font-size: 2rem;
            }

            .action-buttons {
              flex-direction: column;
              align-items: center;
            }

            .action-btn {
              width: 100%;
              max-width: 300px;
              justify-content: center;
            }
          }
        `}</style>

        <div className="success-checkin-page">
          <div className="success-background">
            <div className="success-bg-gradient"></div>
          </div>

          <Container className="success-container">
            <Alert variant="success" className="success-alert">
              <Alert.Heading>
                <FaCheckCircle />
                Check-in Successful!
              </Alert.Heading>
              <p>You have successfully checked in for your flight.</p>
            </Alert>

            <div className="boarding-pass-modern">
              <div className="boarding-pass-header-modern">
                <h2 className="boarding-pass-title">
                  <FaTicketAlt className="boarding-pass-icon" />
                  Boarding Pass
                </h2>
              </div>

              <div className="boarding-pass-body-modern">
                <div className="flight-details-grid">
                  <div>
                    <div className="detail-item">
                      <FaUser className="detail-icon" />
                      <span className="detail-label">Passenger:</span>
                      <span className="detail-value">
                        {checkInResult.passengerName}
                      </span>
                    </div>
                    <div className="detail-item">
                      <FaPlane className="detail-icon" />
                      <span className="detail-label">Flight:</span>
                      <span className="detail-value">
                        {checkInResult.flightNumber}
                      </span>
                    </div>
                    <div className="detail-item">
                      <FaPlaneDeparture className="detail-icon" />
                      <span className="detail-label">From:</span>
                      <span className="detail-value">
                        {checkInResult.origin}
                      </span>
                    </div>
                    <div className="detail-item">
                      <FaPlaneArrival className="detail-icon" />
                      <span className="detail-label">To:</span>
                      <span className="detail-value">
                        {checkInResult.destination}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="detail-item">
                      <FaCalendarAlt className="detail-icon" />
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">
                        {checkInResult.departureDate}
                      </span>
                    </div>
                    <div className="detail-item">
                      <FaClock className="detail-icon" />
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">
                        {checkInResult.departureTime}
                      </span>
                    </div>
                    <div className="detail-item">
                      <FaBuilding className="detail-icon" />
                      <span className="detail-label">Gate:</span>
                      <span className="detail-value">
                        {checkInResult.gate || "TBA"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <FaDoorOpen className="detail-icon" />
                      <span className="detail-label">Terminal:</span>
                      <span className="detail-value">
                        {checkInResult.terminal || "TBA"}
                      </span>
                    </div>
                  </div>
                </div>

                {checkInResult.seatNumber && (
                  <div className="seat-highlight-modern">
                    <div className="seat-number-modern">
                      Seat {checkInResult.seatNumber}
                    </div>
                    <div className="seat-type-modern">
                      {checkInResult.seatType
                        ?.replace("SEAT_TYPE_", "")
                        .replace("_", " ")}
                    </div>
                  </div>
                )}
              </div>

              <div className="boarding-pass-footer-modern">
                <p className="footer-text">
                  <FaClock />
                  Please arrive at the airport at least 2 hours before departure
                </p>
              </div>
            </div>

            <div className="action-buttons">
              <Button
                className="action-btn"
                onClick={() => router.push("/boarding-passes")}
              >
                <FaTicketAlt />
                View All Boarding Passes
              </Button>

              {tickets.length > 0 && (
                <Button
                  className="action-btn action-btn-outline"
                  onClick={() => {
                    setCheckInSuccess(false);
                    setCheckInResult(null);
                  }}
                >
                  <FaPlane />
                  Check in another flight
                </Button>
              )}
            </div>
          </Container>
        </div>
      </>
    );
  }

  // Render empty state
  if (tickets.length === 0) {
    return (
      <>
        <style jsx global>{`
          .checkin-empty-page {
            min-height: 100vh;
            background: linear-gradient(
              135deg,
              rgb(0, 0, 0) 0%,
              rgb(0, 0, 0) 100%
            );
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rergba (0, 0, 0, 0.1);
          }

          .checkin-empty-alert {
            background: rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(100, 100, 100, 0.3);
            border-radius: 20px;
            color: rgba(255, 255, 255, 0.9);
            padding: 3rem;
            text-align: center;
            max-width: 500px;
          }

          .checkin-empty-alert h4 {
            color: rgb(255, 255, 255);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
          }

          .empty-icon {
            font-size: 4rem;
            color: rgb(255, 255, 255);
            margin-bottom: 1.5rem;
          }
        `}</style>
        <div className="checkin-empty-page">
          <Alert variant="info" className="checkin-empty-alert">
            <FaBan className="empty-icon" />
            <Alert.Heading>
              <FaTicketAlt style={{ marginRight: "1rem" }} />
              No Eligible Tickets
            </Alert.Heading>
            <p>
              You don't have any tickets eligible for check-in at this time.
            </p>
          </Alert>
        </div>
      </>
    );
  }

  // Render tickets list
  return (
    <>
      <style jsx global>{`
        /* Modern 2025 Check-in Page Styles */
        .modern-checkin-page {
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

        .checkin-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .checkin-bg-gradient {
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

        .checkin-bg-particles .checkin-particle {
          position: absolute;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.015);
          border-radius: 50%;
          animation: checkinFloat 18s ease-in-out infinite;
        }

        .checkin-particle-1 {
          top: 15%;
          left: 10%;
          animation-delay: 0s;
        }

        .checkin-particle-2 {
          top: 70%;
          right: 15%;
          animation-delay: 9s;
        }

        @keyframes checkinFloat {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) scale(1.05);
            opacity: 0.6;
          }
        }

        .checkin-container {
          position: relative;
          z-index: 1;
          padding: 2rem 0;
        }

        /* Header Styles */
        .checkin-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .checkin-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          padding: 0.5rem 1rem;
          color: white;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .checkin-icon {
          color: var(--primary-orange);
        }

        .checkin-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .checkin-title-highlight {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .checkin-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1.5rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Error Alert */
        .checkin-error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 20px;
          color: #fca5a5;
          margin-bottom: 2rem;
        }

        /* Ticket Cards */
        .ticket-card-modern {
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          color: white;
          transition: all 0.3s ease;
          height: 100%;
          position: relative;
        }

        .ticket-card-modern::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(
            90deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
        }

        .ticket-card-modern:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          border-color: rgba(255, 111, 0, 0.3);
        }

        .ticket-header-modern {
          background: rgba(0, 0, 0, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          text-align: center;
        }

        .ticket-title-modern {
          font-size: 1.2rem;
          font-weight: 700;
          color: white;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .ticket-icon {
          color: var(--primary-orange);
        }

        .ticket-body-modern {
          padding: 2rem;
        }

        .route-display {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1.5rem;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .route-arrow {
          color: var(--primary-orange);
          font-size: 1.2rem;
        }

        .flight-info-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-icon {
          color: var(--primary-orange);
          font-size: 1rem;
          width: 16px;
        }

        .info-label {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          min-width: 80px;
        }

        .info-value {
          color: white;
          font-weight: 600;
          flex: 1;
        }

        .ticket-footer-modern {
          background: rgba(0, 0, 0, 0.6);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
        }

        .checkin-btn-modern {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 1rem;
        }

        .checkin-btn-modern:hover {
          background: linear-gradient(
            135deg,
            #e65100 0%,
            var(--primary-orange) 100%
          );
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 111, 0, 0.3);
          color: white;
        }

        /* Seat Selection Modal */
        .seat-modal-modern .modal-content {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: black;
        }

        .seat-modal-modern .modal-header {
          background: rgba(0, 0, 0, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px 20px 0 0;
          padding: 1.5rem;
        }

        .seat-modal-modern .modal-title {
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .seat-modal-modern .btn-close {
          filter: invert(1);
          opacity: 0.7;
        }

        .seat-modal-modern .btn-close:hover {
          opacity: 1;
        }

        .seat-modal-modern .modal-body {
          padding: 2rem;
        }

        .flight-info-summary {
          background: rgba(0, 0, 0, 0.6);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .flight-info-summary p {
          margin: 0.5rem 0;
          color: rgba(255, 255, 255, 0.8);
        }

        .flight-info-summary strong {
          color: white;
        }

        .seat-section-title {
          color: white;
          font-weight: 600;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.2rem;
        }

        .selected-seat-display {
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.15) 0%,
            rgba(0, 0, 0, 0.15) 100%
          );
          border: 1px solid rgba(255, 111, 0, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          margin-top: 1.5rem;
        }

        .selected-seat-number {
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
          margin-bottom: 0.5rem;
        }

        .selected-seat-type {
          color: rgb(255, 255, 255);
          font-weight: 500;
        }

        .seat-modal-modern .modal-footer {
          background: rgba(0, 0, 0, 0.6);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0 0 20px 20px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .no-seat-btn {
          background: rgba(0, 0, 0, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .no-seat-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          color: white;
          text-decoration: none;
        }

        .confirm-seat-btn {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .confirm-seat-btn:hover:not(:disabled) {
          background: linear-gradient(
            135deg,
            #e65100 0%,
            var(--primary-orange) 100%
          );
          transform: translateY(-1px);
          color: white;
        }

        .confirm-seat-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .checkin-container {
            padding: 1rem;
          }

          .checkin-title {
            font-size: 2rem;
          }

          .ticket-header-modern,
          .ticket-body-modern,
          .ticket-footer-modern {
            padding: 1.5rem;
          }

          .route-display {
            font-size: 1.2rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .route-arrow {
            transform: rotate(90deg);
          }

          .seat-modal-modern .modal-body,
          .seat-modal-modern .modal-header,
          .seat-modal-modern .modal-footer {
            padding: 1.5rem;
          }

          .seat-modal-modern .modal-footer {
            flex-direction: column;
          }

          .no-seat-btn,
          .confirm-seat-btn {
            width: 100%;
            justify-content: center;
          }

          .selected-seat-number {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 576px) {
          .checkin-badge {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }

          .checkin-subtitle {
            font-size: 1rem;
          }

          .ticket-title-modern {
            font-size: 1rem;
          }

          .route-display {
            font-size: 1.1rem;
          }

          .info-item {
            padding: 0.5rem;
          }

          .checkin-btn-modern {
            padding: 0.875rem 1.5rem;
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="modern-checkin-page">
        {/* Animated background */}
        <div className="checkin-background">
          <div className="checkin-bg-gradient"></div>
          <div className="checkin-bg-particles">
            <div className="checkin-particle checkin-particle-1"></div>
            <div className="checkin-particle checkin-particle-2"></div>
          </div>
        </div>

        <Container className="checkin-container">
          {/* Header */}
          <header className="checkin-header">
            <div className="checkin-badge">
              <FaTicketAlt className="checkin-icon" />
              <span>Flight Check-in</span>
            </div>
            <h1 className="checkin-title">
              Check-in for Your
              <span className="checkin-title-highlight"> Flight</span>
            </h1>
            <p className="checkin-subtitle">
              Select a flight below to check in. You can choose your seat or
              check in without selecting a seat.
            </p>
          </header>

          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError(null)}
              className="checkin-error-alert"
            >
              {error}
            </Alert>
          )}

          <Row className="g-4">
            {tickets.map((ticket) => (
              <Col key={ticket.id} md={6} lg={4} className="mb-4">
                <div className="ticket-card-modern">
                  <div className="ticket-header-modern">
                    <h3 className="ticket-title-modern">
                      <FaPlane className="ticket-icon" />
                      {ticket.flight?.name || "Flight"}
                    </h3>
                  </div>

                  <div className="ticket-body-modern">
                    <div className="route-display">
                      <span>{ticket.flight?.origin}</span>
                      <FaArrowRight className="route-arrow" />
                      <span>{ticket.flight?.destination}</span>
                    </div>

                    <div className="flight-info-grid">
                      <div className="info-item">
                        <FaCalendarAlt className="info-icon" />
                        <span className="info-label">Departure:</span>
                        <span className="info-value">
                          {formatDisplayDateTime(
                            ticket.flight?.departureDate,
                            ticket.flight?.departureTime
                          )}
                        </span>
                      </div>
                      <div className="info-item">
                        <FaDoorOpen className="info-icon" />
                        <span className="info-label">Terminal:</span>
                        <span className="info-value">
                          {ticket.flight?.terminal || "TBA"}
                        </span>
                      </div>
                      <div className="info-item">
                        <FaBuilding className="info-icon" />
                        <span className="info-label">Gate:</span>
                        <span className="info-value">
                          {ticket.flight?.gate || "TBA"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ticket-footer-modern">
                    <button
                      className="checkin-btn-modern"
                      onClick={() => handleSelectTicket(ticket)}
                    >
                      <FaCheckCircle />
                      Check In
                    </button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {/* Seat Selection Modal */}
          <Modal
            show={showSeatModal}
            onHide={() => setShowSeatModal(false)}
            centered
            size="lg"
            className="seat-modal-modern"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <FaChair />
                Select Your Seat
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="flight-info-summary">
                <p>
                  <strong>Flight:</strong> {selectedTicket?.flight?.name}
                </p>
                <p>
                  <strong>Route:</strong> {selectedTicket?.flight?.origin} →{" "}
                  {selectedTicket?.flight?.destination}
                </p>
                <p>
                  <strong>Departure:</strong>{" "}
                  {selectedTicket &&
                    formatDisplayDateTime(
                      selectedTicket.flight?.departureDate,
                      selectedTicket.flight?.departureTime
                    )}
                </p>
              </div>

              <h5 className="seat-section-title">
                <FaChair />
                Select Your Seat
              </h5>

              <SeatMap
                onSelectSeat={handleSeatSelect}
                selectedSeat={selectedSeat}
                seatType={selectedSeatType}
                flightId={selectedTicket?.flight?.id}
              />

              {selectedSeat && (
                <div className="selected-seat-display">
                  <div className="selected-seat-number">
                    Selected Seat: {selectedSeat}
                  </div>
                  <div className="selected-seat-type">
                    {selectedSeatType
                      .replace("SEAT_TYPE_", "")
                      .replace("_", " ")}
                    {selectedSeatType === "SEAT_TYPE_STANDARD" && " ($7.00)"}
                    {selectedSeatType === "SEAT_TYPE_UPFRONT" && " ($10.00)"}
                    {selectedSeatType === "SEAT_TYPE_EXTRA_LEGROOM" &&
                      " ($13.00)"}
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <button
                className="no-seat-btn"
                onClick={handleCheckInWithoutSeat}
              >
                Check In Without Seat Selection
              </button>
              <button
                className="confirm-seat-btn"
                onClick={handleCheckInWithSeat}
                disabled={!selectedSeat}
              >
                <FaCheckCircle />
                Confirm Seat Selection
              </button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </>
  );
}
