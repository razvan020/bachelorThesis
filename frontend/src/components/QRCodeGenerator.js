"use client";

import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";

const QRCodeGenerator = ({ ticket, size = 120 }) => {
  const canvasRef = useRef(null);

  // Generate QR code data (same format as backend)
  const generateQRData = (ticket) => {
    const qrData = [];
    qrData.push(`TICKET_ID:${ticket.id}`);
    qrData.push(`FLIGHT:${ticket.flight?.name || ""}`);
    qrData.push(
      `PASSENGER:${ticket.user?.firstname || ""} ${ticket.user?.lastname || ""}`
    );
    qrData.push(`ORIGIN:${ticket.flight?.origin || ""}`);
    qrData.push(`DESTINATION:${ticket.flight?.destination || ""}`);

    if (ticket.flight?.departureDate) {
      qrData.push(`DATE:${ticket.flight.departureDate}`);
    }

    if (ticket.flight?.departureTime) {
      qrData.push(`TIME:${ticket.flight.departureTime}`);
    }

    if (ticket.seat?.seatNumber) {
      qrData.push(`SEAT:${ticket.seat.seatNumber}`);
    }

    if (ticket.flight?.gate) {
      qrData.push(`GATE:${ticket.flight.gate}`);
    }

    qrData.push(`STATUS:${ticket.ticketStatus || ""}`);

    return qrData.join("|");
  };

  useEffect(() => {
    const generateQR = async () => {
      if (canvasRef.current && ticket) {
        try {
          const qrData = generateQRData(ticket);

          await QRCode.toCanvas(canvasRef.current, qrData, {
            width: size,
            height: size,
            color: {
              dark: "#ffffff", // White QR code for dark theme
              light: "#000000", // Black background
            },
            margin: 1,
            errorCorrectionLevel: "M",
          });
        } catch (error) {
          console.error("Error generating QR code:", error);
          // Fallback to placeholder if QR generation fails
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          canvas.width = size;
          canvas.height = size;
          ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.font = "24px Arial";
          ctx.textAlign = "center";
          ctx.fillText("QR", size / 2, size / 2 + 8);
        }
      }
    };

    generateQR();
  }, [ticket, size]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backgroundColor: "transparent",
        }}
      />
      <span
        style={{
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: "0.8rem",
        }}
      >
        Scan at gate
      </span>
    </div>
  );
};

export default QRCodeGenerator;
