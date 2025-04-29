import React, { useState, useEffect } from "react";
import styles from "./SeatMap.module.css";

const SeatMap = ({ onSelectSeat, selectedSeat, seatType, flightId }) => {
  // Configuration
  const rows = 30;
  const seatsPerRow = 6; // A-F
  const seatLetters = ["A", "B", "C", "D", "E", "F"];

  // State for occupied seats
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch occupied seats from API
  useEffect(() => {
    const fetchOccupiedSeats = async () => {
      if (!flightId) {
        setOccupiedSeats([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/check-in/flights/${flightId}/booked-seats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch booked seats");
        }

        const data = await response.json();
        setOccupiedSeats(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching booked seats:", err);
        setError(err.message);
        // Fallback to empty array if API fails
        setOccupiedSeats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupiedSeats();
  }, [flightId]);

  // Determine seat class based on row and seat
  const getSeatClass = (row, seat) => {
    const seatNumber = `${row}${seatLetters[seat]}`;

    // If this is the selected seat
    if (seatNumber === selectedSeat) {
      return styles.selected;
    }

    // If this seat is occupied
    if (occupiedSeats.includes(seatNumber)) {
      return styles.occupied;
    }

    // Seat types based on position
    if (row <= 5) {
      return styles.upfront; // First 5 rows are upfront
    } else if (row === 14 || row === 15 || row === 30) {
      return styles.extraLegroom; // Exit rows have extra legroom
    } else {
      return styles.standard; // All other seats are standard
    }
  };

  // Handle seat click
  const handleSeatClick = (row, seat) => {
    const seatNumber = `${row}${seatLetters[seat]}`;

    // Don't allow selecting occupied seats
    if (occupiedSeats.includes(seatNumber)) {
      return;
    }

    onSelectSeat(seatNumber);
  };

  return (
    <div className={styles.seatMapContainer}>
      <div className={styles.planeHeader}>
        <div className={styles.cockpit}></div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.seat} ${styles.standard}`}></div>
          <span>Standard ($7)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.seat} ${styles.upfront}`}></div>
          <span>Upfront ($10)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.seat} ${styles.extraLegroom}`}></div>
          <span>Extra Legroom ($13)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.seat} ${styles.occupied}`}></div>
          <span>Occupied</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.seat} ${styles.selected}`}></div>
          <span>Selected</span>
        </div>
      </div>

      <div className={styles.seatMap}>
        <div className={styles.rowLabels}>
          {Array.from({ length: rows }, (_, i) => (
            <div key={`row-label-${i + 1}`} className={styles.rowLabel}>
              {i + 1}
            </div>
          ))}
        </div>

        <div className={styles.seats}>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={`row-${rowIndex + 1}`} className={styles.row}>
              {Array.from({ length: seatsPerRow }, (_, seatIndex) => (
                <div
                  key={`seat-${rowIndex + 1}${seatLetters[seatIndex]}`}
                  className={`${styles.seat} ${getSeatClass(
                    rowIndex + 1,
                    seatIndex
                  )}`}
                  onClick={() => handleSeatClick(rowIndex + 1, seatIndex)}
                >
                  {seatLetters[seatIndex]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
