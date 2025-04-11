// components/FlightSearchComponent.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Typeahead } from 'react-bootstrap-typeahead';
import DatePicker from "react-datepicker"; // <-- Import DatePicker

// Import CSS for libraries
import 'react-bootstrap-typeahead/css/Typeahead.css';
import "react-datepicker/dist/react-datepicker.css"; // <-- Import DatePicker CSS
// Optional: Add custom CSS for react-datepicker input styling (see below)
// import "./FlightSearchComponent.css";

// --- Sample Airport Data (Keep as is) ---
const airportOptions = [
  // ... your airport options
  { id: 'JFK', code: 'JFK', label: 'New York - John F. Kennedy Intl.' },
  { id: 'LHR', code: 'LHR', label: 'London - Heathrow Airport' },
  { id: 'CDG', code: 'CDG', label: 'Paris - Charles de Gaulle Airport' },
  { id: 'HND', code: 'HND', label: 'Tokyo - Haneda Airport' },
  { id: 'DXB', code: 'DXB', label: 'Dubai International Airport' },
  { id: 'LAX', code: 'LAX', label: 'Los Angeles International Airport' },
  { id: 'AMS', code: 'AMS', label: 'Amsterdam - Schiphol Airport' },
  { id: 'FRA', code: 'FRA', label: 'Frankfurt Airport' },
  { id: 'IST', code: 'IST', label: 'Istanbul Airport' },
  { id: 'OTP', code: 'OTP', label: 'Bucharest - Henri Coandă Intl.' },
  { id: 'BCN', code: 'BCN', label: 'Barcelona - El Prat Airport' },
  { id: 'SYD', code: 'SYD', label: 'Sydney - Kingsford Smith Airport' },
];
// --- End Sample Data ---

// Helper function to format Date object to YYYY-MM-DD for submission
const formatDateForSubmit = (date) => {
  if (!date) return '';
  // Basic formatting, consider a library like date-fns for robustness
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export default function FlightSearchComponent() {
  // --- State ---
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState([]);

  // Use null or Date object for DatePicker state
  const [departureDate, setDepartureDate] = useState(null); // <-- Initialize as null
  const [arrivalDate, setArrivalDate] = useState(null);     // <-- Initialize as null

  // --- Refs ---
  const dropdownBtnRef = useRef(null);
  const dropdownContentRef = useRef(null);

  // --- Functions (increment, decrement, totalPassengersText remain the same) ---
   const increment = (id) => {
    if (id === "adults") setAdults((prev) => prev + 1);
    if (id === "children") setChildren((prev) => prev + 1);
    if (id === "infants") setInfants((prev) => prev + 1);
  };

  const decrement = (id) => {
    if (id === "adults" && adults > 1) setAdults((prev) => prev - 1);
    if (id === "children" && children > 0) setChildren((prev) => prev - 1);
    if (id === "infants" && infants > 0) setInfants((prev) => prev - 1);
  };

   const totalPassengersText = () => {
    let text = `${adults} adult${adults > 1 ? "s" : ""}`;
    if (children > 0) {
      text += `, ${children} child${children > 1 ? "ren" : ""}`;
    }
    if (infants > 0) {
      text += `, ${infants} infant${infants > 1 ? "s" : ""}`;
    }
    return text;
  };


  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // Validation (ensure Date objects are selected)
    if (!origin || !destination || !departureDate || !arrivalDate) {
       alert("Please fill in all required fields.");
       return;
    }
    const params = new URLSearchParams({
      origin,
      destination,
      // Format Date objects back to YYYY-MM-DD for submission
      departureDate: formatDateForSubmit(departureDate),
      arrivalDate: formatDateForSubmit(arrivalDate),
      adults,
      children,
      infants,
    });
    console.log("Search flights with:", params.toString());
    // window.location.href = `/getAvailableFlights?${params.toString()}`;
  };

  // --- Effect for dropdown (remains the same) ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        dropdownBtnRef.current &&
        !dropdownBtnRef.current.contains(event.target) &&
        dropdownContentRef.current &&
        !dropdownContentRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);


  // --- JSX ---
  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="row justify-content-center">
        <div className="col-xl-10 col-lg-11">
          <form
            id="flightSearchForm"
            className="modern-form-container"
            onSubmit={handleSearchSubmit}
          >
            {/* Origin Typeahead */}
            <div className="modern-input-group">
              <label htmlFor="origin-typeahead" className="modern-input-label">From</label>
              <Typeahead
                id="origin-typeahead"
                options={airportOptions}
                labelKey="label"
                selected={selectedOrigin}
                onChange={(selected) => {
                  setSelectedOrigin(selected);
                  setOrigin(selected.length > 0 ? selected[0].code : '');
                }}
                placeholder="City or airport"
                inputProps={{ className: 'modern-input' }}
              />
            </div>

            {/* Destination Typeahead */}
            <div className="modern-input-group">
              <label htmlFor="destination-typeahead" className="modern-input-label">To</label>
              <Typeahead
                id="destination-typeahead"
                labelKey="label"
                options={airportOptions}
                selected={selectedDestination}
                onChange={(selected) => {
                  setSelectedDestination(selected);
                  setDestination(selected.length > 0 ? selected[0].code : '');
                }}
                placeholder="City or airport"
                inputProps={{ className: 'modern-input' }}
              />
            </div>

            {/* Departure Date - Using DatePicker */}
            <div className="modern-input-group">
              <label htmlFor="departureDate" className="modern-input-label">Depart</label>
              <DatePicker
                id="departureDate"
                selected={departureDate} // Pass Date object or null
                onChange={(date) => setDepartureDate(date)} // Receives Date object or null
                dateFormat="dd/MM/yyyy" // <-- Set display format
                className="modern-input" // Apply styling class
                placeholderText="Departure" // Show format in placeholder
                minDate={new Date()} // Prevent selecting past dates
                required // Add required attribute
                autoComplete="off" // Prevent browser autofill
              />
            </div>

            {/* Arrival Date - Using DatePicker */}
            <div className="modern-input-group">
              <label htmlFor="arrivalDate" className="modern-input-label">Return</label>
              <DatePicker
                id="arrivalDate"
                selected={arrivalDate}
                onChange={(date) => setArrivalDate(date)}
                dateFormat="dd/MM/yyyy" // <-- Set display format
                className="modern-input"
                placeholderText="Return"
                // Min date is departure date or today if departure not selected
                minDate={departureDate || new Date()}
                // Disable if departure date is not selected
                disabled={!departureDate}
                required
                autoComplete="off"
              />
            </div>

            {/* Passengers Input Group */}
            <div className="modern-input-group">
               {/* ... (passenger button and dropdown remain the same) ... */}
               <label htmlFor="dropdownBtnPassengers" className="modern-input-label">Passengers</label>
              <div className="dropdown position-relative">
                <button
                  ref={dropdownBtnRef}
                  className="modern-passenger-btn"
                  id="dropdownBtnPassengers"
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {totalPassengersText()}
                </button>
                <div
                  ref={dropdownContentRef}
                  className={`dropdown-menu modern-dropdown-content shadow border bg-white p-3 mt-2 ${showDropdown ? 'show' : ''}`}
                  aria-labelledby="dropdownBtnPassengers"
                  style={{ minWidth: '280px', right: 0, left: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                >
                   <div className="passenger-type d-flex justify-content-between align-items-center mb-2">
                    <label className="me-3">Adults <small className="text-muted">(14+)</small></label>
                    <div className="input-group input-group-sm" style={{ width: '120px' }}>
                      <button type="button" className="btn btn-outline-secondary rounded-start" onClick={() => decrement("adults")}>-</button>
                      <input type="text" value={adults} readOnly className="form-control text-center" style={{borderLeft: 0, borderRight: 0}}/>
                      <button type="button" className="btn btn-outline-secondary rounded-end" onClick={() => increment("adults")}>+</button>
                    </div>
                  </div>
                  <div className="passenger-type d-flex justify-content-between align-items-center mb-2">
                    <label className="me-3">Children <small className="text-muted">(2-14)</small></label>
                    <div className="input-group input-group-sm" style={{ width: '120px' }}>
                      <button type="button" className="btn btn-outline-secondary rounded-start" onClick={() => decrement("children")}>-</button>
                      <input type="text" value={children} readOnly className="form-control text-center" style={{borderLeft: 0, borderRight: 0}}/>
                      <button type="button" className="btn btn-outline-secondary rounded-end" onClick={() => increment("children")}>+</button>
                    </div>
                  </div>
                  <div className="passenger-type d-flex justify-content-between align-items-center mb-3">
                    <label className="me-3">Infants <small className="text-muted">(0-2)</small></label>
                    <div className="input-group input-group-sm" style={{ width: '120px' }}>
                      <button type="button" className="btn btn-outline-secondary rounded-start" onClick={() => decrement("infants")}>-</button>
                      <input type="text" value={infants} readOnly className="form-control text-center" style={{borderLeft: 0, borderRight: 0}}/>
                      <button type="button" className="btn btn-outline-secondary rounded-end" onClick={() => increment("infants")}>+</button>
                    </div>
                  </div>
                  <hr/>
                  <button type="button" className="btn btn-link btn-sm float-end" onClick={() => setShowDropdown(false)}>Done</button>
                </div>
              </div>
            </div>

            {/* Search Button Wrapper */}
            <div className="modern-search-btn-wrapper ms-lg-3">
              <button type="submit" className="modern-search-btn"> Search </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}