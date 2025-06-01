"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaUser,
  FaSuitcase,
  FaChair,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaShieldAlt,
  FaPlane,
  FaRandom,
  FaClock,
} from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCurrencyForCountry,
  convertFromEUR,
  formatPrice,
} from "@/utils/currencyUtils";
import SeatMap from "@/components/SeatMap";
import CabinTour from "@/components/CabinTour";

// Helper function to format date/time
const formatDisplayDateTime = (isoDateStr, isoTimeStr) => {
  const datePart = isoDateStr
    ? new Date(isoDateStr + "T00:00:00").toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";
  const timePart = isoTimeStr || "";
  if (datePart && timePart) return `${datePart} ${timePart}`;
  if (datePart) return datePart;
  return "N/A";
};

// Main Component Content
function FlightAvailabilityContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchCartCount } = useAuth();

  // All state variables
  const [outboundFlights, setOutboundFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  const [currentStep, setCurrentStep] = useState("flights");
  const [passengerDetails, setPassengerDetails] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    baggageType: "BAGGAGE_TYPE_WEIGHT_CARRY_ON_0",
  });
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [userCountry, setUserCountry] = useState("Romania");
  const [userCurrency, setUserCurrency] = useState("RON");
  const [allocateRandomSeat, setAllocateRandomSeat] = useState(false);
  const [deferSeatSelection, setDeferSeatSelection] = useState(false);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState("");

  // Get search criteria from URL
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departureDate = searchParams.get("departureDate");
  const arrivalDate = searchParams.get("arrivalDate");
  const tripType = searchParams.get("tripType");

  // Sample airport data
  const airports = [
    {
      code: "OTP",
      name: "Henri Coandă Intl.",
      city: "Bucharest",
      country: "Romania",
      lat: 44.5711,
      lng: 26.0858,
    },
    {
      code: "BCN",
      name: "El Prat Airport",
      city: "Barcelona",
      country: "Spain",
      lat: 41.2974,
      lng: 2.0833,
    },
    {
      code: "LHR",
      name: "Heathrow Airport",
      city: "London",
      country: "United Kingdom",
      lat: 51.47,
      lng: -0.4543,
    },
    {
      code: "JFK",
      name: "John F. Kennedy Intl.",
      city: "New York",
      country: "USA",
      lat: 40.6413,
      lng: -73.7781,
    },
    {
      code: "LAX",
      name: "Los Angeles Intl.",
      city: "Los Angeles",
      country: "USA",
      lat: 33.9416,
      lng: -118.4085,
    },
    {
      code: "TIA",
      name: "Rinas Mother Teresa",
      city: "Tirana",
      country: "Albania",
      lat: 41.4147,
      lng: 19.7206,
    },
    {
      code: "EVN",
      name: "Zvartnots Intl",
      city: "Yerevan",
      country: "Armenia",
      lat: 40.1473,
      lng: 44.3959,
    },
    {
      code: "VIE",
      name: "Vienna Intl",
      city: "Vienna",
      country: "Austria",
      lat: 48.1102,
      lng: 16.5697,
    },
    {
      code: "GYD",
      name: "Heydar Aliyev Intl",
      city: "Baku",
      country: "Azerbaijan",
      lat: 40.4675,
      lng: 50.0467,
    },
    {
      code: "CRL",
      name: "Brussels South Charleroi",
      city: "Brussels Charleroi",
      country: "Belgium",
      lat: 50.4592,
      lng: 4.4525,
    },
    {
      code: "AMS",
      name: "Amsterdam Schiphol",
      city: "Amsterdam",
      country: "Netherlands",
      lat: 52.3105,
      lng: 4.7683,
    },
  ];

  // Function to calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  // Function to find closest airport
  const findClosestAirport = (userLat, userLng) => {
    if (!userLat || !userLng) return null;
    let closestAirport = null;
    let minDistance = Infinity;
    airports.forEach((airport) => {
      const distance = calculateDistance(
        userLat,
        userLng,
        airport.lat,
        airport.lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestAirport = airport;
      }
    });
    return closestAirport;
  };

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

  // All useEffect hooks
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const closest = findClosestAirport(latitude, longitude);
          if (closest) {
            setUserCountry(closest.country);
            setUserCurrency(getCurrencyForCountry(closest.country));
            console.log(
              `User location detected: ${
                closest.country
              }, using currency: ${getCurrencyForCountry(closest.country)}`
            );
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    const fetchAvailableFlights = async () => {
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
          } catch (e) {}
          throw new Error(errorMsg);
        }

        const outboundData = await outboundResponse.json();
        setOutboundFlights(outboundData || []);

        if (tripType === "roundTrip" && arrivalDate) {
          const returnQuery = new URLSearchParams({
            origin: destination,
            destination: origin,
            departureDate: arrivalDate,
            tripType: "oneWay",
          });

          const returnApiUrl = `/api/flights/search?${returnQuery.toString()}`;
          console.log("Fetching return flights from:", returnApiUrl);

          const returnResponse = await fetch(returnApiUrl);

          if (!returnResponse.ok) {
            let errorMsg = `Error fetching return flights (${returnResponse.status})`;
            try {
              const errData = await returnResponse.json();
              errorMsg = errData.message || errData.error || errorMsg;
            } catch (e) {}
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
    if (selectedOutboundFlight) {
      price += selectedOutboundFlight.price;
    }
    if (selectedReturnFlight) {
      price += selectedReturnFlight.price;
    }
    const selectedBaggage = baggageOptions.find(
      (option) => option.value === passengerDetails.baggageType
    );
    if (selectedBaggage) {
      price += selectedBaggage.price;
    }
    // Only add seat price if a specific seat is selected and not using random allocation
    if (selectedSeat && selectedSeat.price && !allocateRandomSeat) {
      price += selectedSeat.price;
    }
    setTotalPrice(price);
  }, [
    selectedOutboundFlight,
    selectedReturnFlight,
    passengerDetails.baggageType,
    selectedSeat,
    allocateRandomSeat,
  ]);

  // All handler functions
  const handleFlightSelection = (flight, type) => {
    if (type === "outbound") {
      setSelectedOutboundFlight(flight);
    } else {
      setSelectedReturnFlight(flight);
    }
  };

  const handlePassengerDetailsChange = (e) => {
    const { name, value } = e.target;
    setPassengerDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSeatSelection = (seat) => {
    // If selecting a seat, turn off the other options
    setAllocateRandomSeat(false);
    setDeferSeatSelection(false);
    setSelectedSeat(seat);
  };

  const handleSeatNumberSelection = (seatNumber) => {
    // If selecting a seat number, turn off the other options
    setAllocateRandomSeat(false);
    setDeferSeatSelection(false);
    setSelectedSeatNumber(seatNumber);

    // Find the seat object that matches this seat number
    const matchingSeat = availableSeats.find(
      (seat) => seat.number === seatNumber
    );
    if (matchingSeat) {
      setSelectedSeat(matchingSeat);
    } else {
      // If no matching seat is found, create a dummy seat object
      // Determine seat type and price based on the seat number
      let seatType = "SEAT_TYPE_STANDARD";
      let price = 0;

      // Extract row number from seat number (e.g., "12A" -> 12)
      const row = parseInt(seatNumber.match(/\d+/)[0]);

      if (row <= 5) {
        seatType = "SEAT_TYPE_UPFRONT";
        price = 10;
      } else if (row === 14 || row === 15 || row === 30) {
        seatType = "SEAT_TYPE_EXTRA_LEGROOM";
        price = 13;
      } else {
        seatType = "SEAT_TYPE_STANDARD";
        price = 7;
      }

      const dummySeat = {
        id: Date.now(), // Generate a unique ID
        number: seatNumber,
        type: seatType,
        price: price,
        available: true,
      };

      setSelectedSeat(dummySeat);
    }
  };

  const handleRandomSeatSelection = () => {
    setAllocateRandomSeat(true);
    setDeferSeatSelection(false);
    setSelectedSeat(null);
    setSelectedSeatNumber("");
  };

  const handleDeferSeatSelection = () => {
    setDeferSeatSelection(true);
    setAllocateRandomSeat(false);
    setSelectedSeat(null);
    setSelectedSeatNumber("");
  };

  const handleNextStep = async () => {
    if (currentStep === "flights") {
      if (
        !selectedOutboundFlight ||
        (tripType === "roundTrip" && !selectedReturnFlight)
      ) {
        alert("Please select flights for your journey");
        return;
      }
      setCurrentStep("passengers");
    } else if (currentStep === "passengers") {
      if (
        !passengerDetails.firstName ||
        !passengerDetails.lastName ||
        !passengerDetails.gender
      ) {
        alert("Please fill in all passenger details");
        return;
      }
      setAvailableSeats([
        {
          id: 1,
          number: "A1",
          type: "SEAT_TYPE_STANDARD",
          price: 0,
          available: true,
        },
        {
          id: 2,
          number: "B1",
          type: "SEAT_TYPE_STANDARD",
          price: 0,
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
        {
          id: 5,
          number: "E1",
          type: "SEAT_TYPE_STANDARD",
          price: 0,
          available: true,
        },
        {
          id: 6,
          number: "F1",
          type: "SEAT_TYPE_STANDARD",
          price: 0,
          available: true,
        },
        {
          id: 7,
          number: "A2",
          type: "SEAT_TYPE_STANDARD",
          price: 0,
          available: true,
        },
        {
          id: 8,
          number: "B2",
          type: "SEAT_TYPE_UPFRONT",
          price: 10,
          available: true,
        },
      ]);
      setCurrentStep("seats");
    } else if (currentStep === "seats") {
      localStorage.setItem("selectedBaggageType", passengerDetails.baggageType);

      // Validate that one of the seat options is selected
      if (!selectedSeat && !allocateRandomSeat && !deferSeatSelection) {
        alert(
          "Please select a seat option (specific seat, random seat, or defer selection)"
        );
        return;
      }

      // Store the selected seat type if a specific seat is selected
      if (selectedSeat) {
        localStorage.setItem("selectedSeatType", selectedSeat.type);
      }

      try {
        const token = localStorage.getItem("token");

        if (selectedOutboundFlight) {
          // Prepare the request body based on the selected option
          const requestBody = {
            flightId: selectedOutboundFlight.id,
            baggageType: passengerDetails.baggageType,
          };

          // Add seat information based on the selected option
          if (selectedSeat) {
            requestBody.seatId = selectedSeat.id;
            requestBody.deferSeatSelection = false;
          } else if (allocateRandomSeat) {
            requestBody.allocateRandomSeat = true;
            requestBody.deferSeatSelection = false;
          } else if (deferSeatSelection) {
            requestBody.deferSeatSelection = true;
          }

          const response = await fetch("/api/cart/add", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(
              `Error adding outbound flight to cart (${response.status})`
            );
          }
        }

        if (tripType === "roundTrip" && selectedReturnFlight) {
          // Prepare the request body based on the selected option
          const requestBody = {
            flightId: selectedReturnFlight.id,
            baggageType: passengerDetails.baggageType,
          };

          // Add seat information based on the selected option
          if (selectedSeat) {
            requestBody.seatId = selectedSeat.id;
            requestBody.deferSeatSelection = false;
          } else if (allocateRandomSeat) {
            requestBody.allocateRandomSeat = true;
            requestBody.deferSeatSelection = false;
          } else if (deferSeatSelection) {
            requestBody.deferSeatSelection = true;
          }

          const response = await fetch("/api/cart/add", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(
              `Error adding return flight to cart (${response.status})`
            );
          }
        }

        if (fetchCartCount) {
          fetchCartCount();
        }

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

  // Modern Step Indicator Component
  const StepIndicator = () => (
    <div className="modern-step-indicator">
      <div className="step-progress-bar">
        {[
          { key: "flights", label: "Select Flights", icon: FaPlaneDeparture },
          { key: "passengers", label: "Passenger Details", icon: FaUser },
          { key: "seats", label: "Seats & Extras", icon: FaChair },
        ].map((step, index) => {
          const isActive = currentStep === step.key;
          const isCompleted =
            (step.key === "flights" &&
              (currentStep === "passengers" || currentStep === "seats")) ||
            (step.key === "passengers" && currentStep === "seats");
          const IconComponent = step.icon;

          return (
            <div
              key={step.key}
              className={`step-item ${isActive ? "active" : ""} ${
                isCompleted ? "completed" : ""
              }`}
            >
              <div className="step-circle">
                <IconComponent className="step-icon" />
                {isCompleted && <FaCheckCircle className="check-icon" />}
              </div>
              <div className="step-label">{step.label}</div>
              {index < 3 && <div className="step-connector"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render flight selection step with modern design
  const renderFlightSelectionStep = () => {
    return (
      <div className="modern-flight-selection">
        {/* Outbound Flights */}
        <div className="flight-section">
          <div className="section-header">
            <FaPlaneDeparture className="section-icon outbound" />
            <div>
              <h2 className="section-title">Outbound Flight</h2>
              <div className="route-info">
                {origin} → {destination}
              </div>
            </div>
          </div>

          {outboundFlights.length > 0 ? (
            <div className="flights-grid">
              {outboundFlights.map((flight) => (
                <div
                  key={flight.id}
                  className={`modern-flight-card ${
                    selectedOutboundFlight?.id === flight.id ? "selected" : ""
                  }`}
                  onClick={() => handleFlightSelection(flight, "outbound")}
                >
                  <div className="flight-card-body">
                    <div className="flight-header">
                      <div className="airline-info">
                        <h3 className="airline-name">{flight.name}</h3>
                        <div className="flight-details">
                          <span className="origin-dest">
                            {flight.origin} → {flight.destination}
                          </span>
                        </div>
                      </div>
                      <div className="price-section">
                        <div className="price-amount">
                          {formatPrice(
                            convertFromEUR(
                              parseFloat(flight.price || 0),
                              userCurrency
                            ),
                            userCurrency
                          )}
                        </div>
                        <div className="price-label">per person</div>
                      </div>
                    </div>

                    <div className="flight-times">
                      <div className="time-info">
                        <div className="time">
                          {flight.departureTime || "N/A"}
                        </div>
                        <div className="location">{flight.origin}</div>
                      </div>
                      <div className="flight-path">
                        <div className="path-line"></div>
                        <FaPlane className="plane-icon" />
                      </div>
                      <div className="time-info">
                        <div className="time">
                          {flight.arrivalTime || "N/A"}
                        </div>
                        <div className="location">{flight.destination}</div>
                      </div>
                    </div>

                    <div className="flight-meta">
                      <span>Direct Flight</span>
                      <span>
                        {formatDisplayDateTime(flight.departureDate, "")}
                      </span>
                    </div>

                    <div className="selection-indicator">
                      <div className="custom-radio">
                        <input
                          type="radio"
                          id={`outbound-${flight.id}`}
                          name="outboundFlight"
                          checked={selectedOutboundFlight?.id === flight.id}
                          onChange={() =>
                            handleFlightSelection(flight, "outbound")
                          }
                        />
                      </div>
                      <span className="selection-text">
                        {selectedOutboundFlight?.id === flight.id
                          ? "Selected"
                          : "Select this flight"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert variant="info" className="modern-alert">
              <div className="alert-content">
                <FaPlaneDeparture className="alert-icon" />
                <span>
                  No outbound flights available for the selected date.
                </span>
              </div>
            </Alert>
          )}
        </div>

        {/* Return Flights (if round trip) */}
        {tripType === "roundTrip" && (
          <div className="flight-section">
            <div className="section-header">
              <FaPlaneArrival className="section-icon return" />
              <div>
                <h2 className="section-title">Return Flight</h2>
                <div className="route-info">
                  {destination} → {origin}
                </div>
              </div>
            </div>

            {returnFlights.length > 0 ? (
              <div className="flights-grid">
                {returnFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className={`modern-flight-card ${
                      selectedReturnFlight?.id === flight.id ? "selected" : ""
                    }`}
                    onClick={() => handleFlightSelection(flight, "return")}
                  >
                    <div className="flight-card-body">
                      <div className="flight-header">
                        <div className="airline-info">
                          <h3 className="airline-name">{flight.name}</h3>
                          <div className="flight-details">
                            <span className="origin-dest">
                              {flight.origin} → {flight.destination}
                            </span>
                          </div>
                        </div>
                        <div className="price-section">
                          <div className="price-amount">
                            {formatPrice(
                              convertFromEUR(
                                parseFloat(flight.price || 0),
                                userCurrency
                              ),
                              userCurrency
                            )}
                          </div>
                          <div className="price-label">per person</div>
                        </div>
                      </div>

                      <div className="flight-times">
                        <div className="time-info">
                          <div className="time">
                            {flight.departureTime || "N/A"}
                          </div>
                          <div className="location">{flight.origin}</div>
                        </div>
                        <div className="flight-path">
                          <div className="path-line"></div>
                          <FaPlane className="plane-icon" />
                        </div>
                        <div className="time-info">
                          <div className="time">
                            {flight.arrivalTime || "N/A"}
                          </div>
                          <div className="location">{flight.destination}</div>
                        </div>
                      </div>

                      <div className="flight-meta">
                        <span>Direct Flight</span>
                        <span>
                          {formatDisplayDateTime(flight.departureDate, "")}
                        </span>
                      </div>

                      <div className="selection-indicator">
                        <div className="custom-radio">
                          <input
                            type="radio"
                            id={`return-${flight.id}`}
                            name="returnFlight"
                            checked={selectedReturnFlight?.id === flight.id}
                            onChange={() =>
                              handleFlightSelection(flight, "return")
                            }
                          />
                        </div>
                        <span className="selection-text">
                          {selectedReturnFlight?.id === flight.id
                            ? "Selected"
                            : "Select this flight"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert variant="info" className="modern-alert">
                <div className="alert-content">
                  <FaPlaneArrival className="alert-icon" />
                  <span>
                    No return flights available for the selected date.
                  </span>
                </div>
              </Alert>
            )}
          </div>
        )}

        <div className="step-navigation">
          <div></div>
          <Button
            variant="primary"
            onClick={handleNextStep}
            disabled={
              !selectedOutboundFlight ||
              (tripType === "roundTrip" && !selectedReturnFlight)
            }
            className="continue-btn"
          >
            Continue to Passengers
            <FaUser className="btn-icon" />
          </Button>
        </div>
      </div>
    );
  };

  // Render passenger details step with modern design
  const renderPassengerDetailsStep = () => {
    return (
      <div className="modern-passenger-section">
        <div className="passenger-form-container">
          <div className="section-header mb-4">
            <FaUser className="section-icon" />
            <h2 className="section-subtitle">Passenger & Baggage Details</h2>
          </div>

          <Form className="modern-form">
            <Row className="form-row">
              <Col md={6}>
                <div className="modern-form-group">
                  <label className="modern-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={passengerDetails.firstName}
                    onChange={handlePassengerDetailsChange}
                    className="modern-input"
                    required
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="modern-form-group">
                  <label className="modern-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={passengerDetails.lastName}
                    onChange={handlePassengerDetailsChange}
                    className="modern-input"
                    required
                  />
                </div>
              </Col>
            </Row>

            <div className="gender-group">
              <label className="modern-label">Gender</label>
              <div className="gender-options">
                <div className="modern-radio">
                  <input
                    type="radio"
                    id="gender-male"
                    name="gender"
                    value="male"
                    checked={passengerDetails.gender === "male"}
                    onChange={handlePassengerDetailsChange}
                  />
                  <label htmlFor="gender-male">Male</label>
                </div>
                <div className="modern-radio">
                  <input
                    type="radio"
                    id="gender-female"
                    name="gender"
                    value="female"
                    checked={passengerDetails.gender === "female"}
                    onChange={handlePassengerDetailsChange}
                  />
                  <label htmlFor="gender-female">Female</label>
                </div>
              </div>
            </div>

            <div className="baggage-section">
              <div className="section-header mb-3">
                <FaSuitcase className="section-icon" />
                <h3 className="section-subtitle">Baggage Selection</h3>
              </div>

              <div className="baggage-options">
                {baggageOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`baggage-option ${
                      passengerDetails.baggageType === option.value
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handlePassengerDetailsChange({
                        target: { name: "baggageType", value: option.value },
                      })
                    }
                  >
                    <div className="baggage-radio">
                      <input
                        type="radio"
                        id={`baggage-${option.value}`}
                        name="baggageType"
                        value={option.value}
                        checked={passengerDetails.baggageType === option.value}
                        onChange={handlePassengerDetailsChange}
                      />
                    </div>
                    <div className="baggage-content">
                      <div className="baggage-info">
                        <h4 className="baggage-title">{option.label}</h4>
                      </div>
                      <div className="baggage-price">
                        {option.price === 0 ? (
                          <span className="free-badge">Free</span>
                        ) : (
                          <span className="price-badge">
                            +
                            {formatPrice(
                              convertFromEUR(option.price, userCurrency),
                              userCurrency
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Form>
        </div>

        <div className="step-navigation">
          <Button
            variant="outline-secondary"
            onClick={handlePreviousStep}
            className="back-btn"
          >
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
            className="continue-btn"
          >
            Continue to Seat Selection
            <FaChair className="btn-icon" />
          </Button>
        </div>
      </div>
    );
  };

  // Render seat selection step with modern design
  const renderSeatSelectionStep = () => {
    return (
      <div className="modern-seat-section">
        <Row className="seat-layout">
          <Col lg={8}>
            <div className="seat-map-container">
              <div className="section-header">
                <FaChair className="section-icon" />
                <h2 className="section-title">Choose Your Seat</h2>
              </div>

              <div className="seat-options">
                <div
                  className={`seat-option-card ${
                    !allocateRandomSeat && !deferSeatSelection ? "active" : ""
                  }`}
                  onClick={() =>
                    setDeferSeatSelection(false) & setAllocateRandomSeat(false)
                  }
                >
                  <div className="option-icon">
                    <FaChair />
                  </div>
                  <div className="option-content">
                    <h4>Select a Specific Seat</h4>
                    <p>Choose your preferred seat from the seat map below</p>
                  </div>
                </div>

                <div
                  className={`seat-option-card ${
                    allocateRandomSeat ? "active" : ""
                  }`}
                  onClick={handleRandomSeatSelection}
                >
                  <div className="option-icon">
                    <FaRandom />
                  </div>
                  <div className="option-content">
                    <h4>Allocate a Random Seat</h4>
                    <p>We'll assign you a seat automatically at check-in</p>
                  </div>
                </div>

                <div
                  className={`seat-option-card ${
                    deferSeatSelection ? "active" : ""
                  }`}
                  onClick={handleDeferSeatSelection}
                >
                  <div className="option-icon">
                    <FaClock />
                  </div>
                  <div className="option-content">
                    <h4>Choose Seat During Check-in</h4>
                    <p>Select your seat later during the check-in process</p>
                  </div>
                </div>
              </div>

              {!allocateRandomSeat && !deferSeatSelection && (
                <>
                  <CabinTour
                    selectedSeat={selectedSeatNumber}
                    onSelectSeat={handleSeatNumberSelection}
                    flightId={selectedOutboundFlight?.id}
                  />
                  <div className="seat-map-wrapper">
                    <SeatMap
                      onSelectSeat={handleSeatNumberSelection}
                      selectedSeat={selectedSeatNumber}
                      flightId={selectedOutboundFlight?.id}
                    />
                  </div>
                </>
              )}

              {allocateRandomSeat && (
                <div className="seat-status-card random">
                  <div className="status-content">
                    <div className="status-icon">
                      <FaRandom />
                    </div>
                    <div className="status-details">
                      <h4>Random Seat Allocation</h4>
                      <p>We'll assign you a seat automatically at check-in</p>
                    </div>
                  </div>
                </div>
              )}

              {deferSeatSelection && (
                <div className="seat-status-card deferred">
                  <div className="status-content">
                    <div className="status-icon">
                      <FaClock />
                    </div>
                    <div className="status-details">
                      <h4>Seat Selection Deferred</h4>
                      <p>You'll select your seat during the check-in process</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Col>

          <Col lg={4}>
            <div className="booking-summary-sidebar">
              <div className="price-summary-card">
                <h3 className="summary-title">Booking Summary</h3>

                <div className="summary-items">
                  {selectedOutboundFlight && (
                    <div className="summary-item">
                      <span className="item-label">Outbound Flight</span>
                      <span className="item-price">
                        {formatPrice(
                          convertFromEUR(
                            selectedOutboundFlight.price,
                            userCurrency
                          ),
                          userCurrency
                        )}
                      </span>
                    </div>
                  )}

                  {selectedReturnFlight && (
                    <div className="summary-item">
                      <span className="item-label">Return Flight</span>
                      <span className="item-price">
                        {formatPrice(
                          convertFromEUR(
                            selectedReturnFlight.price,
                            userCurrency
                          ),
                          userCurrency
                        )}
                      </span>
                    </div>
                  )}

                  <div className="summary-item">
                    <span className="item-label">Baggage</span>
                    <span className="item-price">
                      {formatPrice(
                        convertFromEUR(
                          baggageOptions.find(
                            (option) =>
                              option.value === passengerDetails.baggageType
                          )?.price || 0,
                          userCurrency
                        ),
                        userCurrency
                      )}
                    </span>
                  </div>

                  {selectedSeat && selectedSeat.price > 0 && (
                    <div className="summary-item">
                      <span className="item-label">Seat Selection</span>
                      <span className="item-price">
                        {formatPrice(
                          convertFromEUR(selectedSeat.price, userCurrency),
                          userCurrency
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="summary-total">
                  <span className="total-label">Total</span>
                  <span className="total-price">
                    {formatPrice(
                      convertFromEUR(totalPrice, userCurrency),
                      userCurrency
                    )}
                  </span>
                </div>
              </div>

              <div className="protection-card">
                <div className="protection-header">
                  <FaShieldAlt className="protection-icon" />
                  <h4 className="protection-title">
                    Your Booking is Protected
                  </h4>
                </div>
                <div className="protection-features">
                  <div className="feature-item">
                    <FaCheckCircle className="feature-icon" />
                    <span>Free cancellation within 24 hours</span>
                  </div>
                  <div className="feature-item">
                    <FaCheckCircle className="feature-icon" />
                    <span>Price match guarantee</span>
                  </div>
                  <div className="feature-item">
                    <FaCheckCircle className="feature-icon" />
                    <span>Secure payment processing</span>
                  </div>
                </div>
              </div>

              {/* Add seat confirmation here */}
              {selectedSeat && !allocateRandomSeat && !deferSeatSelection && (
                <div className="seat-status-card">
                  <div className="status-content">
                    <div className="status-icon">
                      <FaCheckCircle />
                    </div>
                    <div className="status-details">
                      <h4>Seat {selectedSeat.number} Selected</h4>
                      <p className="status-price">
                        {selectedSeat.price > 0
                          ? `+${formatPrice(
                              convertFromEUR(selectedSeat.price, userCurrency),
                              userCurrency
                            )}`
                          : "Included in your fare"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons moved here */}
              <div className="step-navigation">
                <Button
                  variant="outline-secondary"
                  onClick={handlePreviousStep}
                  className="back-btn"
                >
                  Back to Passenger Details
                </Button>
                <Button
                  variant="success"
                  onClick={handleNextStep}
                  disabled={
                    !selectedSeat && !allocateRandomSeat && !deferSeatSelection
                  }
                  className="complete-btn"
                >
                  Complete Booking
                  <FaCheckCircle className="btn-icon" />
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-orange: #ff6f00;
        }

        /* Modern 2025 Flight Booking Styles */
        .modern-booking-page {
          min-height: 100vh;
          position: relative;
          background: linear-gradient(
            135deg,
            rgb(0, 0, 0) 0%,
            rgb(0, 0, 0) 50%,
            rgb(0, 0, 0) 100%
          );
          overflow-x: hidden;
        }

        .booking-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .bg-particles .particle {
          position: absolute;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 50%;
          animation: float 20s ease-in-out infinite;
        }

        .particle-1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .particle-2 {
          top: 60%;
          right: 10%;
          animation-delay: 7s;
        }

        .particle-3 {
          bottom: 20%;
          left: 50%;
          animation-delay: 14s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-20px) scale(1.1);
            opacity: 0.8;
          }
        }

        .booking-container {
          position: relative;
          z-index: 1;
          padding: 2rem 0;
        }

        /* Header Styles */
        .booking-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .route-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          padding: 0.5rem 1rem;
          color: white;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .route-icon {
          color: var(--primary-orange);
        }

        .booking-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .title-highlight {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .booking-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1.5rem;
        }

        .modify-search-link {
          display: inline-block;
          color: var(--primary-orange);
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border: 1px solid var(--primary-orange);
          border-radius: 50px;
          transition: all 0.3s ease;
        }

        .modify-search-link:hover {
          background: var(--primary-orange);
          color: white;
          transform: translateY(-2px);
        }

        /* Step Indicator Styles */
        .modern-step-indicator {
          display: flex;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .step-progress-bar {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 50px;
          padding: 1.5rem 3rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          gap: 1rem;
          margin: 0 1.5rem;
        }

        .step-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          margin-bottom: 0.5rem;
        }

        .step-item.active .step-circle {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          border-color: var(--primary-orange);
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(255, 111, 0, 0.4);
        }

        .step-item.completed .step-circle {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-color: #10b981;
        }

        .step-icon {
          color: white;
          font-size: 1.2rem;
        }

        .check-icon {
          position: absolute;
          top: -5px;
          right: -5px;
          color: #10b981;
          background: white;
          border-radius: 50%;
          font-size: 1rem;
        }

        .step-label {
          color: white;
          font-size: 0.85rem;
          font-weight: 500;
          text-align: center;
          opacity: 0.8;
        }

        .step-item.active .step-label,
        .step-item.completed .step-label {
          opacity: 1;
          font-weight: 600;
        }

        .step-connector {
          width: 60px;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          margin: 0 1rem;
          margin-top: 30px;
          transition: all 0.3s ease;
        }

        .step-item.active .step-connector {
          background: var(--primary-orange);
        }

        .step-item.completed .step-connector {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Flight Selection Styles */
        .modern-flight-selection {
          max-width: 1000px;
          margin: 0 auto;
        }

        .flight-section {
          margin-bottom: 3rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1rem 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .section-icon {
          font-size: 1.5rem;
          color: var(--primary-orange);
        }

        .section-icon.outbound {
          color: var(--primary-orange);
        }

        .section-icon.return {
          color: #3b82f6;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .section-subtitle {
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
          margin: 0;
        }

        .route-info {
          color: rgba(255, 255, 255, 0.77);
          font-size: 1rem;
        }

        .flights-grid {
          display: grid;
          gap: 1rem;
        }

        .modern-flight-card {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          overflow: hidden;
        }

        .modern-flight-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: rgba(255, 111, 0, 0.3);
        }

        .modern-flight-card.selected {
          border-color: var(--primary-orange);
          box-shadow: 0 0 0 4px rgba(255, 111, 0, 0.2);
          background: rgb(0, 0, 0);
        }

        .flight-card-body {
          padding: 2rem;
        }

        .flight-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .airline-info {
          flex: 1;
        }

        .airline-name {
          font-size: 1.3rem;
          font-weight: 700;
          color: rgb(255, 255, 255);
          margin-bottom: 0.5rem;
        }

        .flight-details {
          color: rgb(255, 255, 255);
          font-size: 0.9rem;
        }

        .origin-dest {
          font-weight: 500;
        }

        .price-section {
          text-align: right;
        }

        .price-amount {
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
          line-height: 1;
        }

        .price-label {
          font-size: 0.8rem;
          color: rgb(255, 255, 255);
          margin-top: 0.25rem;
        }

        .flight-times {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 2rem;
          margin-bottom: 1rem;
          padding: 1.5rem;
          background: rgba(12, 11, 11, 0.8);
          border-radius: 12px;
        }

        .time-info {
          text-align: center;
        }

        .time {
          font-size: 1.5rem;
          font-weight: 700;
          color: rgb(255, 255, 255);
          margin-bottom: 0.25rem;
        }

        .location {
          font-size: 0.9rem;
          color: rgb(255, 255, 255);
          font-weight: 500;
        }

        .flight-path {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .path-line {
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, var(--primary-orange), #fbbf24);
          border-radius: 1px;
        }

        .plane-icon {
          position: absolute;
          color: var(--primary-orange);
          font-size: 1.2rem;
          background: white;
          padding: 4px;
          border-radius: 50%;
        }

        .flight-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          font-size: 0.85rem;
          color: rgb(255, 255, 255);
        }

        .selection-indicator {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid rgba(229, 231, 235, 0.8);
        }

        .custom-radio input[type="radio"] {
          accent-color: var(--primary-orange);
          transform: scale(1.2);
        }

        .selection-text {
          font-weight: 600;
          color: var(--primary-orange);
        }

        .modern-flight-card.selected .selection-text {
          color: var(--primary-orange);
        }

        /* Modern Alert Styles */
        .modern-alert {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          color: rgba(255, 255, 255, 0.9);
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .alert-icon {
          color: #3b82f6;
          font-size: 1.2rem;
        }

        /* Passenger Details Styles */
        .modern-passenger-section {
          max-width: 800px;
          margin: 0 auto;
        }

        .passenger-form-container {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .modern-form {
          margin-bottom: 2rem;
        }

        .form-row {
          margin-bottom: 1.5rem;
        }

        .modern-form-group {
          margin-bottom: 1.5rem;
        }

        .modern-label {
          font-weight: 600;
          color: rgb(255, 255, 255);
          margin-bottom: 0.5rem;
          display: block;
        }

        .modern-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }

        .modern-input:focus {
          outline: none;
          border-color: var(--primary-orange);
          box-shadow: 0 0 0 4px rgba(255, 111, 0, 0.1);
        }

        .gender-group {
          margin-bottom: 2rem;
        }

        .gender-options {
          display: flex;
          gap: 2rem;
        }

        .modern-radio input[type="radio"] {
          accent-color: var(--primary-orange);
          transform: scale(1.2);
          margin-right: 0.5rem;
        }

        .modern-radio label {
          font-weight: 500;
          color: rgb(255, 255, 255);
        }

        .baggage-section {
          margin-top: 2rem;
        }

        .baggage-options {
          display: grid;
          gap: 1rem;
        }

        .baggage-option {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          transition: all 0.3s ease;
          cursor: pointer;
          background: black;
        }

        .baggage-option:hover {
          border-color: rgba(255, 111, 0, 0.3);
          background: rgba(0, 0, 0, 0.02);
        }

        .baggage-option.selected {
          border-color: var(--primary-orange);
          background: rgba(255, 111, 0, 0.05);
        }

        .baggage-radio {
          margin-right: 1rem;
        }

        .baggage-radio input[type="radio"] {
          accent-color: var(--primary-orange);
          transform: scale(1.3);
        }

        .baggage-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .baggage-info {
          flex: 1;
        }

        .baggage-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: rgb(255, 255, 255);
          margin: 0;
        }

        .baggage-price {
          text-align: right;
        }

        .free-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .price-badge {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        /* Seat Selection Styles */
        .modern-seat-section {
          max-width: 1200px;
          margin: 0 auto;
        }

        .seat-layout {
          margin-bottom: 2rem;
        }

        .seat-map-container {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 1rem;
        }

        .aircraft-visualization {
          background: linear-gradient(
            135deg,
            rgb(0, 0, 0) 0%,
            rgb(0, 0, 0) 100%
          );
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .aircraft-nose {
          width: 40px;
          height: 60px;
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          margin: 0 auto 2rem;
        }

        /* Seat Options */
        .seat-options {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .seat-option-card {
          flex: 1;
          min-width: 200px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .seat-option-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 111, 0, 0.3);
        }

        .seat-option-card.active {
          background: linear-gradient(
            135deg,
            rgba(255, 111, 0, 0.2) 0%,
            rgba(255, 111, 0, 0.1) 100%
          );
          border-color: rgba(255, 111, 0, 0.5);
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .option-icon {
          font-size: 2rem;
          color: var(--primary-orange);
          margin-bottom: 15px;
        }

        .option-content h4 {
          color: white;
          margin-bottom: 10px;
          font-size: 1.1rem;
        }

        .option-content p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .seat-map-wrapper {
          margin-top: 30px;
          margin-bottom: 30px;
        }

        .seat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 1rem;
          justify-items: center;
          margin-bottom: 2rem;
        }

        .seat-button {
          width: 70px;
          height: 70px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .seat-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .seat-button.selected {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          border-color: var(--primary-orange);
          color: white;
          transform: scale(1.1);
          box-shadow: 0 0 0 4px rgba(255, 111, 0, 0.2);
        }

        .seat-button.standard {
          border-color: #d1d5db;
        }

        .seat-button.upfront {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .seat-button.extra-legroom {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .seat-content {
          text-align: center;
        }

        .seat-number {
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .seat-price {
          font-size: 0.7rem;
          opacity: 0.8;
          font-weight: 500;
        }

        .seat-legend {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 2px solid;
        }

        .legend-color.standard {
          background: white;
          border-color: #d1d5db;
        }

        .legend-color.upfront {
          background: rgba(59, 130, 246, 0.1);
          border-color: #3b82f6;
        }

        .legend-color.extra-legroom {
          background: rgba(16, 185, 129, 0.1);
          border-color: #10b981;
        }

        .seat-confirmation {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 16px;
          color: #065f46;
        }

        .confirmation-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .confirmation-icon {
          color: #10b981;
          font-size: 1.5rem;
        }

        .confirmation-price {
          font-size: 0.9rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        /* Booking Summary Sidebar */
        .booking-summary-sidebar {
          display: grid;
          gap: 1.5rem;
        }

        .price-summary-card {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .summary-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: rgb(255, 255, 255);
          margin-bottom: 1.5rem;
        }

        .summary-items {
          margin-bottom: 1.5rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgb(255, 255, 255);
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .item-label {
          color: rgb(255, 255, 255);
          font-weight: 500;
        }

        .item-price {
          font-weight: 600;
          color: rgb(255, 255, 255);
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 2px solid rgb(255, 255, 255);
        }

        .total-label {
          font-size: 1.2rem;
          font-weight: 700;
          color: rgb(255, 255, 255);
        }

        .total-price {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .protection-card {
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 20px;
          padding: 1.5rem;
        }

        .protection-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .protection-icon {
          color: #10b981;
          font-size: 1.2rem;
        }

        .protection-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #065f46;
          margin: 0;
        }

        .protection-features {
          display: grid;
          gap: 0.75rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .feature-icon {
          color: #10b981;
          font-size: 1rem;
        }

        .feature-item span {
          color: #065f46;
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* Navigation Buttons */
        .step-navigation {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          justify-content: space-between;
        }

        .back-btn,
        .continue-btn,
        .complete-btn {
          flex: 1;
          max-width: 48%;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          white-space: nowrap;
          padding: 0 1.5rem;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: white;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .continue-btn {
          background: linear-gradient(
            135deg,
            var(--primary-orange) 0%,
            #fbbf24 100%
          );
          border: none;
          color: white;
          box-shadow: 0 8px 24px rgba(255, 111, 0, 0.3);
        }

        .continue-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255, 111, 0, 0.4);
        }

        .complete-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          color: white;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        }

        .complete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
        }

        .btn-icon {
          font-size: 1.2rem;
        }

        @media (max-width: 576px) {
          .step-navigation {
            flex-direction: column;
            padding: 1rem;
          }

          .back-btn,
          .continue-btn,
          .complete-btn {
            max-width: 100%;
            width: 100%;
            height: 48px;
            font-size: 0.95rem;
          }

          .btn-icon {
            font-size: 1.1rem;
          }
        }

        /* Loading and Error States */
        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .loading-spinner {
          margin-bottom: 2rem;
        }

        .loading-spinner .spinner-border {
          width: 3rem;
          height: 3rem;
          border-width: 3px;
          color: var(--primary-orange);
        }

        .loading-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
          font-weight: 500;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 20px;
          color: rgba(255, 255, 255, 0.9);
          padding: 2rem;
        }

        .error-content {
          text-align: center;
        }

        .error-content strong {
          color: #fca5a5;
          font-size: 1.2rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .error-content p {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1rem;
        }

        .suspense-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          gap: 1rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .booking-container {
            padding: 1rem;
          }

          .booking-title {
            font-size: 2rem;
          }

          .step-progress-bar {
            padding: 0.75rem 1rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .step-connector {
            width: 2px;
            height: 30px;
            margin: 0.5rem 0;
          }

          .flight-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .flight-times {
            grid-template-columns: 1fr;
            gap: 1rem;
            text-align: center;
          }

          .flight-path {
            order: -1;
            transform: rotate(90deg);
          }

          .passenger-form-container {
            padding: 2rem 1.5rem;
          }

          .form-row {
            flex-direction: column;
          }

          .gender-options {
            flex-direction: column;
            gap: 1rem;
          }

          .seat-layout {
            flex-direction: column;
          }

          .seat-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
          }

          .seat-button {
            width: 60px;
            height: 60px;
          }

          .step-navigation {
            flex-direction: column;
            gap: 1rem;
          }

          .back-btn,
          .continue-btn,
          .complete-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .route-badge {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }

          .booking-subtitle {
            font-size: 1rem;
          }

          .section-header {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .step-circle {
            width: 50px;
            height: 50px;
          }

          .step-label {
            font-size: 0.75rem;
          }

          .seat-button {
            width: 50px;
            height: 50px;
          }

          .seat-number {
            font-size: 0.8rem;
          }

          .seat-price {
            font-size: 0.6rem;
          }

          .price-amount {
            font-size: 1.5rem;
          }

          .airline-name {
            font-size: 1.1rem;
          }

          .time {
            font-size: 1.2rem;
          }
        }

        .seat-status-card {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .seat-status-card.random {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .seat-status-card.deferred {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.2);
        }

        .status-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .status-icon {
          font-size: 1.5rem;
          color: #10b981;
        }

        .seat-status-card.random .status-icon {
          color: #3b82f6;
        }

        .seat-status-card.deferred .status-icon {
          color: #f59e0b;
        }

        .status-details h4 {
          color: white;
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .status-details p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0.25rem 0 0 0;
          font-size: 0.9rem;
        }

        .status-price {
          color: var(--primary-orange) !important;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .seat-status-card {
            padding: 1.25rem;
          }

          .status-details h4 {
            font-size: 1rem;
          }

          .status-details p {
            font-size: 0.85rem;
          }
        }
      `}</style>

      <div className="modern-booking-page">
        {/* Animated background */}
        <div className="booking-background">
          <div className="bg-gradient"></div>
          <div className="bg-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
          </div>
        </div>

        <Container className="booking-container">
          {/* Header */}
          <header className="booking-header">
            <div className="route-badge">
              <FaMapMarkerAlt className="route-icon" />
              <span>
                {origin} → {destination}
              </span>
            </div>
            <h1 className="booking-title">
              Complete Your
              <span className="title-highlight"> Booking</span>
            </h1>
            <p className="booking-subtitle">
              {tripType === "roundTrip" ? "Round Trip" : "One Way"} • Just a few
              steps away
            </p>
            <Link href="/" className="modify-search-link">
              Modify Search
            </Link>
          </header>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner">
                <Spinner animation="border" variant="primary" />
              </div>
              <p className="loading-text">
                Finding the best flights for you...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert variant="danger" className="error-alert">
              <div className="error-content">
                <strong>Oops! Something went wrong</strong>
                <p>{error}</p>
                <Link href="/">Try your search again</Link>
              </div>
            </Alert>
          )}

          {/* Booking Steps */}
          {!loading && !error && (
            <div className="booking-content">
              <StepIndicator />

              <div className="step-content">
                {currentStep === "flights" && renderFlightSelectionStep()}
                {currentStep === "passengers" && renderPassengerDetailsStep()}
                {currentStep === "seats" && renderSeatSelectionStep()}
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}

// Main Page Wrapper with Suspense
export default function FlightAvailabilityPage() {
  return (
    <Suspense
      fallback={
        <div className="suspense-fallback">
          <Spinner animation="border" />
          <span>Loading Search...</span>
        </div>
      }
    >
      <FlightAvailabilityContent />
    </Suspense>
  );
}
