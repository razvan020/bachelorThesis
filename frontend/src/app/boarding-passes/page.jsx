"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import QRCodeGenerator from "@/components/QRCodeGenerator"; // Add this import
import {
  FaTicketAlt,
  FaUser,
  FaPlane,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaDoorOpen,
  FaQrcode,
  FaDownload,
  FaMobile,
  FaBan,
  FaExclamationTriangle,
} from "react-icons/fa";
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
  const {
    isAuthenticated,
    loading: authLoading,
    showLoginWithMessage,
  } = useAuth();
  const router = useRouter();

  const [boardingPasses, setBoardingPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingTicketId, setDownloadingTicketId] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  // Fetch boarding passes
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      showLoginWithMessage(
        "You need to be logged in to access boarding passes"
      );
      return;
    }

    const fetchBoardingPasses = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL_GOOGLE}/api/check-in/boarding-passes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

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
  }, [isAuthenticated, authLoading, router, showLoginWithMessage]);

  // Download boarding pass as PDF
  const downloadBoardingPass = async (ticketId) => {
    setDownloadingTicketId(ticketId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL_GOOGLE}/api/check-in/boarding-passes/${ticketId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to download boarding pass");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers.get("content-disposition");
      let filename = `boarding-pass-${ticketId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(ticketId);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (error) {
      console.error("Error downloading boarding pass:", error);
      setError("Failed to download boarding pass: " + error.message);
    } finally {
      setDownloadingTicketId(null);
    }
  };

  if (loading) {
    return (
      <>
        <style jsx global>{`
          .boarding-loading-state {
            min-height: 100vh;
            background: linear-gradient(135deg, #000000 0%, #000000 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            gap: 1.5rem;
          }
          .boarding-loading-spinner .spinner-border {
            width: 3rem;
            height: 3rem;
            border-width: 3px;
            color: var(--primary-orange);
          }
          .boarding-loading-text {
            font-size: 1.2rem;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.8);
          }
        `}</style>
        <div className="boarding-loading-state">
          <div className="boarding-loading-spinner">
            <Spinner animation="border" />
          </div>
          <p className="boarding-loading-text">Loading boarding passes...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style jsx global>{`
          .boarding-error-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .boarding-error-alert {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 20px;
            color: rgba(255, 255, 255, 0.9);
            padding: 2rem;
            text-align: center;
            max-width: 500px;
          }
          .boarding-error-alert h4 {
            color: #fca5a5;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
          }
        `}</style>
        <div className="boarding-error-page">
          <Alert variant="danger" className="boarding-error-alert">
            <Alert.Heading>
              <FaExclamationTriangle />
              Error
            </Alert.Heading>
            <p>{error}</p>
            <button
              className="action-btn-boarding"
              onClick={() => setError(null)}
              style={{ marginTop: "1rem" }}
            >
              Try Again
            </button>
          </Alert>
        </div>
      </>
    );
  }

  if (boardingPasses.length === 0) {
    return (
      <>
        <style jsx global>{`
          .boarding-empty-page {
            min-height: 100vh;
            background: linear-gradient(
              135deg,
              rgb(0, 0, 0) 0%,
              rgb(0, 0, 0) 100%
            );
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .boarding-empty-alert {
            background: rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(83, 84, 85, 0.3);
            border-radius: 20px;
            color: rgba(255, 255, 255, 0.9);
            padding: 3rem;
            text-align: center;
            max-width: 500px;
          }
          .boarding-empty-alert h4 {
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
        <div className="boarding-empty-page">
          <Alert variant="info" className="boarding-empty-alert">
            <FaBan className="empty-icon" />
            <Alert.Heading>
              <FaTicketAlt style={{ marginRight: "1rem" }} />
              No Boarding Passes
            </Alert.Heading>
            <p>You don't have any checked-in flights at this time.</p>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        .modern-boarding-page {
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
        .boarding-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }
        .boarding-bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
              circle at 20% 30%,
              rgba(255, 111, 0, 0.08) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(16, 185, 129, 0.06) 0%,
              transparent 50%
            );
        }
        .boarding-bg-particles .boarding-particle {
          position: absolute;
          width: 180px;
          height: 180px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 50%;
          animation: boardingFloat 20s ease-in-out infinite;
        }
        .boarding-particle-1 {
          top: 10%;
          left: 15%;
          animation-delay: 0s;
        }
        .boarding-particle-2 {
          top: 60%;
          right: 10%;
          animation-delay: 10s;
        }
        .boarding-particle-3 {
          bottom: 20%;
          left: 50%;
          animation-delay: 5s;
        }
        @keyframes boardingFloat {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-15px) scale(1.08);
            opacity: 0.7;
          }
        }
        .boarding-container {
          position: relative;
          z-index: 1;
          padding: 2rem 0;
        }
        .boarding-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .boarding-badge {
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
        .boarding-icon {
          color: var(--primary-orange);
        }
        .boarding-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          line-height: 1.1;
        }
        .boarding-title-highlight {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .boarding-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1.5rem;
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
          transition: all 0.4s ease;
          position: relative;
          height: 100%;
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
        .boarding-pass-modern:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
          border-color: rgba(255, 111, 0, 0.3);
        }
        .boarding-pass-header-modern {
          background: rgba(0, 0, 0, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem;
          text-align: center;
          position: relative;
        }
        .boarding-pass-title-modern {
          font-size: 1.4rem;
          font-weight: 700;
          color: white;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        .boarding-pass-icon-modern {
          color: var(--primary-orange);
          font-size: 1.6rem;
        }
        .boarding-pass-body-modern {
          padding: 2rem;
        }
        .flight-details-grid-modern {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .detail-item-modern {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .detail-item-modern:hover {
          background: rgba(15, 16, 17, 0.8);
          border-color: rgba(255, 111, 0, 0.2);
        }
        .detail-icon-modern {
          color: var(--primary-orange);
          font-size: 1.1rem;
          width: 20px;
          flex-shrink: 0;
        }
        .detail-label-modern {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          min-width: 80px;
        }
        .detail-value-modern {
          color: white;
          font-weight: 600;
          flex: 1;
        }
        .seat-highlight-modern {
          background: linear-gradient(
            135deg,
            rgba(255, 111, 0, 0.15) 0%,
            rgba(251, 191, 36, 0.15) 100%
          );
          border: 1px solid rgba(255, 111, 0, 0.3);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          margin-top: 2rem;
          position: relative;
          overflow: hidden;
        }
        .seat-highlight-modern::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at center,
            rgba(255, 111, 0, 0.1) 0%,
            transparent 70%
          );
          pointer-events: none;
        }
        .seat-number-modern {
          font-size: 2.5rem;
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
          position: relative;
          z-index: 1;
        }
        .seat-type-modern {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          font-weight: 500;
          text-transform: capitalize;
          position: relative;
          z-index: 1;
        }
        .boarding-pass-footer-modern {
          background: rgba(0, 0, 0, 0.6);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem 2rem;
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
            rgba(255, 255, 255, 0.3) 0px,
            rgba(255, 255, 255, 0.3) 8px,
            transparent 8px,
            transparent 16px
          );
        }
        .footer-text-modern {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        .footer-icon {
          color: var(--primary-orange);
        }
        .boarding-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }
        .action-btn-boarding {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
          text-decoration: none;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .action-btn-boarding:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          color: white;
          transform: translateY(-1px);
          text-decoration: none;
        }
        .action-btn-boarding:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .action-btn-primary {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          border: 2px solid var(--primary-orange);
        }
        .action-btn-primary:hover:not(:disabled) {
          background: linear-gradient(
            135deg,
            #e65100 0%,
            var(--primary-orange) 100%
          );
          border-color: #e65100;
        }
        .action-btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: 2px solid #10b981;
        }
        .action-btn-success:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border-color: #059669;
        }
        .qr-section {
          text-align: center;
          margin-top: 1.5rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .qr-placeholder {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          margin: 0 auto 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .qr-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
        }
        .btn-loading .spinner-border {
          width: 1rem;
          height: 1rem;
          border-width: 2px;
        }
        @media (max-width: 768px) {
          .boarding-container {
            padding: 1rem;
          }
          .boarding-title {
            font-size: 2rem;
          }
          .flight-details-grid-modern {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .boarding-pass-header-modern,
          .boarding-pass-body-modern {
            padding: 1.5rem;
          }
          .boarding-pass-footer-modern {
            padding: 1rem 1.5rem;
          }
          .seat-number-modern {
            font-size: 2rem;
          }
          .detail-item-modern {
            padding: 0.5rem;
          }
          .boarding-actions {
            flex-direction: column;
            align-items: center;
          }
          .action-btn-boarding {
            width: 100%;
            max-width: 200px;
            justify-content: center;
          }
        }
        @media (max-width: 576px) {
          .boarding-badge {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }
          .boarding-subtitle {
            font-size: 1rem;
          }
          .boarding-pass-title-modern {
            font-size: 1.2rem;
          }
          .detail-label-modern {
            min-width: 70px;
            font-size: 0.9rem;
          }
          .detail-value-modern {
            font-size: 0.9rem;
          }
          .seat-highlight-modern {
            padding: 1.5rem;
          }
          .seat-number-modern {
            font-size: 1.8rem;
          }
        }
      `}</style>

      <div className="modern-boarding-page">
        <div className="boarding-background">
          <div className="boarding-bg-gradient"></div>
          <div className="boarding-bg-particles">
            <div className="boarding-particle boarding-particle-1"></div>
            <div className="boarding-particle boarding-particle-2"></div>
            <div className="boarding-particle boarding-particle-3"></div>
          </div>
        </div>

        <Container className="boarding-container">
          <header className="boarding-header">
            <div className="boarding-badge">
              <FaTicketAlt className="boarding-icon" />
              <span>My Boarding Passes</span>
            </div>
            <h1 className="boarding-title">
              Your
              <span className="boarding-title-highlight"> Boarding Passes</span>
            </h1>
            <p className="boarding-subtitle">
              All your checked-in flights and boarding passes in one place
            </p>
          </header>

          <Row className="g-4">
            {boardingPasses.map((ticket) => (
              <Col key={ticket.id} md={6} className="mb-4">
                <div className="boarding-pass-modern">
                  <div className="boarding-pass-header-modern">
                    <h2 className="boarding-pass-title-modern">
                      <FaTicketAlt className="boarding-pass-icon-modern" />
                      Boarding Pass
                    </h2>
                  </div>

                  <div className="boarding-pass-body-modern">
                    <div className="flight-details-grid-modern">
                      <div>
                        <div className="detail-item-modern">
                          <FaUser className="detail-icon-modern" />
                          <span className="detail-label-modern">
                            Passenger:
                          </span>
                          <span className="detail-value-modern">
                            {ticket.user?.firstname} {ticket.user?.lastname}
                          </span>
                        </div>
                        <div className="detail-item-modern">
                          <FaPlane className="detail-icon-modern" />
                          <span className="detail-label-modern">Flight:</span>
                          <span className="detail-value-modern">
                            {ticket.flight?.name}
                          </span>
                        </div>
                        <div className="detail-item-modern">
                          <FaPlaneDeparture className="detail-icon-modern" />
                          <span className="detail-label-modern">From:</span>
                          <span className="detail-value-modern">
                            {ticket.flight?.origin}
                          </span>
                        </div>
                        <div className="detail-item-modern">
                          <FaPlaneArrival className="detail-icon-modern" />
                          <span className="detail-label-modern">To:</span>
                          <span className="detail-value-modern">
                            {ticket.flight?.destination}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="detail-item-modern">
                          <FaCalendarAlt className="detail-icon-modern" />
                          <span className="detail-label-modern">Date:</span>
                          <span className="detail-value-modern">
                            {formatDisplayDateTime(
                              ticket.flight?.departureDate,
                              null
                            )}
                          </span>
                        </div>
                        <div className="detail-item-modern">
                          <FaClock className="detail-icon-modern" />
                          <span className="detail-label-modern">Time:</span>
                          <span className="detail-value-modern">
                            {ticket.flight?.departureTime}
                          </span>
                        </div>
                        <div className="detail-item-modern">
                          <FaBuilding className="detail-icon-modern" />
                          <span className="detail-label-modern">Gate:</span>
                          <span className="detail-value-modern">
                            {ticket.flight?.gate || "TBA"}
                          </span>
                        </div>
                        <div className="detail-item-modern">
                          <FaDoorOpen className="detail-icon-modern" />
                          <span className="detail-label-modern">Terminal:</span>
                          <span className="detail-value-modern">
                            {ticket.flight?.terminal || "TBA"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {ticket.seat && (
                      <div className="seat-highlight-modern">
                        <div className="seat-number-modern">
                          Seat {ticket.seat.seatNumber}
                        </div>
                        <div className="seat-type-modern">
                          {ticket.seat.seatType
                            ?.replace("SEAT_TYPE_", "")
                            .replace("_", " ")}
                        </div>
                      </div>
                    )}

                    <div className="qr-section">
                      <QRCodeGenerator ticket={ticket} size={180} />
                    </div>

                    <div className="boarding-actions">
                      <button
                        className={`action-btn-boarding ${
                          downloadSuccess === ticket.id
                            ? "action-btn-success"
                            : "action-btn-primary"
                        } ${
                          downloadingTicketId === ticket.id ? "btn-loading" : ""
                        }`}
                        onClick={() => downloadBoardingPass(ticket.id)}
                        disabled={downloadingTicketId === ticket.id}
                      >
                        {downloadingTicketId === ticket.id ? (
                          <>
                            <Spinner animation="border" size="sm" />
                            Downloading...
                          </>
                        ) : downloadSuccess === ticket.id ? (
                          <>
                            <FaDownload />
                            Downloaded!
                          </>
                        ) : (
                          <>
                            <FaDownload />
                            Download PDF
                          </>
                        )}
                      </button>
                      <button className="action-btn-boarding">
                        <FaMobile />
                        Mobile Pass
                      </button>
                    </div>
                  </div>

                  <div className="boarding-pass-footer-modern">
                    <p className="footer-text-modern">
                      <FaClock className="footer-icon" />
                      Please arrive at the airport at least 2 hours before
                      departure
                    </p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </>
  );
}
