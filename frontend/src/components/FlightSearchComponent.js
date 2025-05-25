// components/FlightSearchComponent.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
// Import Menu and MenuItem for custom rendering
import { Typeahead, Menu, MenuItem } from "react-bootstrap-typeahead";
import DatePicker from "react-datepicker";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown"; // Needed for Dropdown.Header

// Import CSS
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-datepicker/dist/react-datepicker.css";
// Import custom CSS for typeahead styling if you have it
// import "./FlightSearchComponent.css";

// --- Sample Structured Airport Data ---
// TODO: Replace this with data fetched from your API
const sampleStructuredAirportOptions = [
  {
    id: "TIA",
    code: "TIA",
    name: "Rinas Mother Teresa",
    city: "Tirana",
    country: "Albania",
  },
  {
    id: "EVN",
    code: "EVN",
    name: "Zvartnots Intl",
    city: "Yerevan",
    country: "Armenia",
  },
  {
    id: "VIE",
    code: "VIE",
    name: "Vienna Intl",
    city: "Vienna",
    country: "Austria",
  },
  {
    id: "GYD",
    code: "GYD",
    name: "Heydar Aliyev Intl",
    city: "Baku",
    country: "Azerbaijan",
  },
  {
    id: "GBB",
    code: "GBB",
    name: "Qabala Intl",
    city: "Gabala",
    country: "Azerbaijan",
  },
  {
    id: "CRL",
    code: "CRL",
    name: "Brussels South Charleroi",
    city: "Brussels Charleroi",
    country: "Belgium",
  },
  {
    id: "OTP",
    code: "OTP",
    name: "Henri Coandă Intl.",
    city: "Bucharest",
    country: "Romania",
  },
  {
    id: "CLJ",
    code: "CLJ",
    name: "Avram Iancu",
    city: "Cluj",
    country: "Romania",
  },
  {
    id: "BCN",
    code: "BCN",
    name: "El Prat Airport",
    city: "Barcelona",
    country: "Spain",
  },
  {
    id: "MAD",
    code: "MAD",
    name: "Adolfo Suárez Madrid–Barajas",
    city: "Madrid",
    country: "Spain",
  },
  {
    id: "LHR",
    code: "LHR",
    name: "Heathrow Airport",
    city: "London",
    country: "United Kingdom",
  },
  {
    id: "JFK",
    code: "JFK",
    name: "John F. Kennedy Intl.",
    city: "New York",
    country: "USA",
  },
  {
    id: "LAX",
    code: "LAX",
    name: "Los Angeles Intl.",
    city: "Los Angeles",
    country: "USA",
  },
  {
    id: "AMS",
    code: "AMS",
    name: "Amsterdam Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
  },
  {
    id: "CDG",
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
  },
  {
    id: "FCO",
    code: "FCO",
    name: "Leonardo da Vinci Fiumicino",
    city: "Rome",
    country: "Italy",
  },
  {
    id: "MXP",
    code: "MXP",
    name: "Milano Malpensa",
    city: "Milan",
    country: "Italy",
  },
  {
    id: "MUC",
    code: "MUC",
    name: "Franz Josef Strauss",
    city: "Munich",
    country: "Germany",
  },
  {
    id: "BER",
    code: "BER",
    name: "Berlin Brandenburg",
    city: "Berlin",
    country: "Germany",
  },
  {
    id: "ATH",
    code: "ATH",
    name: "Athens International",
    city: "Athens",
    country: "Greece",
  },
  {
    id: "ZRH",
    code: "ZRH",
    name: "Zurich Airport",
    city: "Zurich",
    country: "Switzerland",
  },
];
// --- End Sample Data ---

// Helper function
const formatDateForSubmit = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function FlightSearchComponent() {
  // --- State ---
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [origin, setOrigin] = useState(""); // Stores selected origin code (e.g., "JFK")
  const [destination, setDestination] = useState(""); // Stores selected destination code
  const [selectedOrigin, setSelectedOrigin] = useState([]); // For Typeahead binding
  const [selectedDestination, setSelectedDestination] = useState([]); // For Typeahead binding
  const [departureDate, setDepartureDate] = useState(null);
  const [arrivalDate, setArrivalDate] = useState(null); // For Return Date
  const [tripType, setTripType] = useState("roundTrip");

  // State for airport options
  const [allAirportOptions, setAllAirportOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState(null);

  // --- Refs ---
  const dropdownBtnRef = useRef(null);
  const dropdownContentRef = useRef(null);

  // --- Fetch Airport Data (Simulated) ---
  useEffect(() => {
    const fetchAirports = async () => {
      setOptionsLoading(true);
      setOptionsError(null);
      try {
        // TODO: Replace with API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        const sortedData = sampleStructuredAirportOptions.sort((a, b) => {
          if (a.country < b.country) return -1;
          if (a.country > b.country) return 1;
          const nameA = a.city || a.name;
          const nameB = b.city || b.name;
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
        setAllAirportOptions(sortedData);
      } catch (err) {
        setOptionsError("Could not load locations.");
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchAirports();
  }, []);

  // --- Functions ---
  const increment = (id) => {
    if (id === "adults") setAdults((p) => p + 1);
    if (id === "children") setChildren((p) => p + 1);
    if (id === "infants") setInfants((p) => p + 1);
  };
  const decrement = (id) => {
    if (id === "adults" && adults > 1) setAdults((p) => p - 1);
    if (id === "children" && children > 0) setChildren((p) => p - 1);
    if (id === "infants" && infants > 0) setInfants((p) => p - 1);
  };
  const totalPassengersText = () => {
    let t = `${adults} adult${adults > 1 ? "s" : ""}`;
    if (children > 0) t += `, ${children} child${children > 1 ? "ren" : ""}`;
    if (infants > 0) t += `, ${infants} infant${infants > 1 ? "s" : ""}`;
    return t;
  };
  const handleTripTypeChange = (event) => {
    const v = event.target.value;
    setTripType(v);
    if (v === "oneWay") setArrivalDate(null);
  };
  // Removed handleDateChange for range picker

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const isRoundTrip = tripType === "roundTrip";
    // Validation uses departureDate and arrivalDate state
    if (
      !origin ||
      !destination ||
      !departureDate ||
      (isRoundTrip && !arrivalDate)
    ) {
      alert(
        `Please fill in Origin, Destination, and ${
          isRoundTrip ? "both Departure and Return dates." : "Departure date."
        }`
      );
      return;
    }
    const params = new URLSearchParams({
      origin,
      destination,
      departureDate: formatDateForSubmit(departureDate),
      adults: adults.toString(),
      children: children.toString(),
      infants: infants.toString(),
      tripType,
    });
    if (isRoundTrip && arrivalDate) {
      params.append("arrivalDate", formatDateForSubmit(arrivalDate));
    }
    console.log("Search flights with:", params.toString());
    window.location.href = `/flights/availability?${params.toString()}`;
  };

  // --- Effect for Passenger Dropdown ---
  useEffect(() => {
    const h = (e) => {
      if (
        showDropdown &&
        dropdownBtnRef.current &&
        !dropdownBtnRef.current.contains(e.target) &&
        dropdownContentRef.current &&
        !dropdownContentRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showDropdown]);

  // --- Custom Typeahead Rendering Functions ---
  const renderAirportMenu = (results, menuProps) => {
    const safeMenuProps = {
      id: menuProps.id,
      className: menuProps.className,
      style: menuProps.style,
      ref: menuProps.ref,
      role: menuProps.role || "listbox",
      "aria-label": menuProps["aria-label"] || "Airports",
    };
    const groupedResults = results.reduce((groups, airport) => {
      const c = airport.country || "Other";
      if (!groups[c]) groups[c] = [];
      groups[c].push(airport);
      return groups;
    }, {});
    const countriesInOrder = results.reduce((acc, airport) => {
      const c = airport.country || "Other";
      if (!acc.includes(c)) acc.push(c);
      return acc;
    }, []);
    let itemIndex = -1;
    return (
      <Menu {...safeMenuProps}>
        {countriesInOrder.map((country) => (
          <React.Fragment key={country}>
            <Dropdown.Header className="airport-group-header bg-light text-dark sticky-top py-1 px-3">
              {country}
            </Dropdown.Header>
            {groupedResults[country].map((airport) => {
              itemIndex++;
              return renderAirportMenuItem(airport, menuProps, itemIndex);
            })}
          </React.Fragment>
        ))}
        {results.length === 0 && !optionsLoading && (
          <div className="text-center p-2 text-muted">
            {optionsError || "No matches found."}
          </div>
        )}
        {optionsLoading && (
          <div className="text-center p-2 text-muted">Loading...</div>
        )}
      </Menu>
    );
  };
  const renderAirportMenuItem = (option, props, index) => {
    return (
      <MenuItem key={option.id || option.code} option={option} position={index}>
        <div className="d-flex justify-content-between align-items-center airport-menu-item">
          <span className="airport-name fw-bold">
            {option.city &&
            option.city.toLowerCase() !== option.name.toLowerCase()
              ? `${option.city} - ${option.name}`
              : option.name}
          </span>
          <span className="airport-code text-muted ms-2">{option.code}</span>
        </div>
      </MenuItem>
    );
  };
  // --- End Custom Typeahead Rendering ---

  // --- JSX ---
  return (
    <div
      className="container-fluid py-4"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="row justify-content-center">
        <div className="col-xl-10 col-lg-11">
          <form
            id="flightSearchForm"
            className="modern-form-container"
            onSubmit={handleSearchSubmit}
          >
            {/* Trip Type Selector */}
            <div className="d-flex justify-content-center flex-wrap pb-2 pt-1 w-100 border-bottom mb-2">
              <Form.Check
                inline
                type="radio"
                label="Round Trip"
                name="tripTypeOptions"
                id="tripTypeRound"
                value="roundTrip"
                checked={tripType === "roundTrip"}
                onChange={handleTripTypeChange}
                className="me-3"
              />
              <Form.Check
                inline
                type="radio"
                label="One Way"
                name="tripTypeOptions"
                id="tripTypeOneWay"
                value="oneWay"
                checked={tripType === "oneWay"}
                onChange={handleTripTypeChange}
              />
            </div>
            {/* Input Fields Wrapper */}
            <div className="d-flex flex-wrap flex-grow-1">
              {/* Origin */}
              <div className="modern-input-group">
                <label
                  htmlFor="origin-typeahead"
                  className="modern-input-label"
                >
                  From
                </label>
                <Typeahead
                  id="origin-typeahead"
                  options={allAirportOptions}
                  labelKey={(option) =>
                    option.isHeader ? "" : `${option.city} (${option.code})`
                  }
                  selected={selectedOrigin}
                  onChange={(selected) => {
                    if (
                      selected.length > 0 &&
                      !selected[0].isHeader &&
                      selected[0].code
                    ) {
                      setSelectedOrigin(selected);
                      setOrigin(selected[0].code);
                    } else if (selected.length === 0) {
                      setSelectedOrigin([]);
                      setOrigin("");
                    }
                  }}
                  placeholder="City or airport"
                  inputProps={{ className: "modern-input" }}
                  isLoading={optionsLoading}
                  renderMenu={renderAirportMenu}
                  renderMenuItemChildren={renderAirportMenuItem}
                  filterBy={["name", "city", "code", "country"]}
                  emptyLabel={
                    optionsLoading
                      ? "Loading..."
                      : optionsError || "No matches found."
                  }
                  paginate={false}
                  isMenuItemActive={(option) => !option.isHeader}
                  ariaLabelKey={(option) =>
                    option.isHeader
                      ? option.country + " Header"
                      : `${option.city} ${option.name} ${option.code}`
                  }
                />
              </div>
              {/* Destination */}
              <div className="modern-input-group">
                <label
                  htmlFor="destination-typeahead"
                  className="modern-input-label"
                >
                  To
                </label>
                <Typeahead
                  id="destination-typeahead"
                  options={allAirportOptions}
                  labelKey={(option) =>
                    option.isHeader ? "" : `${option.city} (${option.code})`
                  }
                  selected={selectedDestination}
                  onChange={(selected) => {
                    if (
                      selected.length > 0 &&
                      !selected[0].isHeader &&
                      selected[0].code
                    ) {
                      setSelectedDestination(selected);
                      setDestination(selected[0].code);
                    } else if (selected.length === 0) {
                      setSelectedDestination([]);
                      setDestination("");
                    }
                  }}
                  placeholder="City or airport"
                  inputProps={{ className: "modern-input" }}
                  isLoading={optionsLoading}
                  renderMenu={renderAirportMenu}
                  renderMenuItemChildren={renderAirportMenuItem}
                  filterBy={["name", "city", "code", "country"]}
                  emptyLabel={
                    optionsLoading
                      ? "Loading..."
                      : optionsError || "No matches found."
                  }
                  paginate={false}
                  isMenuItemActive={(option) => !option.isHeader}
                  ariaLabelKey={(option) =>
                    option.isHeader
                      ? option.country + " Header"
                      : `${option.city} ${option.name} ${option.code}`
                  }
                />
              </div>

              {/* --- Date Picker Section - REVERTED to separate pickers --- */}
              {/* Departure DatePicker */}
              <div className="modern-input-group">
                <label htmlFor="departureDate" className="modern-input-label">
                  Depart
                </label>
                <DatePicker
                  id="departureDate"
                  selected={departureDate}
                  // Use simple state setter
                  onChange={(date) => setDepartureDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="modern-input"
                  placeholderText="Select Date"
                  minDate={new Date()}
                  required
                  autoComplete="off"
                  // Removed range props
                />
              </div>
              {/* Arrival DatePicker - CONDITIONAL based on tripType */}
              {tripType === "roundTrip" && (
                <div className="modern-input-group">
                  <label htmlFor="arrivalDate" className="modern-input-label">
                    Return
                  </label>
                  <DatePicker
                    id="arrivalDate"
                    selected={arrivalDate}
                    // Use simple state setter
                    onChange={(date) => setArrivalDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="modern-input"
                    placeholderText="Select Date"
                    minDate={departureDate || new Date()}
                    disabled={!departureDate}
                    required={tripType === "roundTrip"}
                    autoComplete="off"
                    // Removed range props
                  />
                </div>
              )}
              {/* --- End Date Picker Section --- */}

              {/* Passengers */}
              <div className="modern-input-group">
                <label
                  htmlFor="dropdownBtnPassengers"
                  className="modern-input-label"
                >
                  Passengers
                </label>
                {/* Passenger Dropdown Button/Menu... */}
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
                    className={`dropdown-menu modern-dropdown-content shadow border bg-white p-3 mt-2 ${
                      showDropdown ? "show" : ""
                    }`}
                    aria-labelledby="dropdownBtnPassengers"
                    style={{ minWidth: "280px", right: 0, left: "auto" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {" "}
                    <div className="passenger-type d-flex justify-content-between align-items-center mb-2">
                      <label className="me-3">
                        Adults <small className="text-muted">(14+)</small>
                      </label>
                      <div
                        className="input-group input-group-sm"
                        style={{ width: "120px" }}
                      >
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-start"
                          onClick={() => decrement("adults")}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={adults}
                          readOnly
                          className="form-control text-center"
                          style={{ borderLeft: 0, borderRight: 0 }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-end"
                          onClick={() => increment("adults")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="passenger-type d-flex justify-content-between align-items-center mb-2">
                      <label className="me-3">
                        Children <small className="text-muted">(2-14)</small>
                      </label>
                      <div
                        className="input-group input-group-sm"
                        style={{ width: "120px" }}
                      >
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-start"
                          onClick={() => decrement("children")}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={children}
                          readOnly
                          className="form-control text-center"
                          style={{ borderLeft: 0, borderRight: 0 }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-end"
                          onClick={() => increment("children")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="passenger-type d-flex justify-content-between align-items-center mb-3">
                      <label className="me-3">
                        Infants <small className="text-muted">(0-2)</small>
                      </label>
                      <div
                        className="input-group input-group-sm"
                        style={{ width: "120px" }}
                      >
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-start"
                          onClick={() => decrement("infants")}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={infants}
                          readOnly
                          className="form-control text-center"
                          style={{ borderLeft: 0, borderRight: 0 }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-end"
                          onClick={() => increment("infants")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <hr />
                    <button
                      type="button"
                      className="btn btn-link btn-sm float-end"
                      onClick={() => setShowDropdown(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* End input fields wrapper */}
            {/* Search Button Wrapper */}
            <div className="modern-search-btn-wrapper ms-lg-3 align-self-center">
              <button type="submit" className="modern-search-btn">
                {" "}
                Search{" "}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- Add Required CSS ---
/* Add this to your global CSS or a specific stylesheet */
/*
.airport-group-header {
  font-weight: bold; padding: 0.5rem 1rem; font-size: 0.9em;
  color: #6c757d; background-color: #f8f9fa; position: sticky;
  top: 0; z-index: 1; border-bottom: 1px solid #dee2e6;
}
.airport-menu-item { width: 100%; padding: 0.4rem 1rem; }
.airport-menu-item .airport-name {
  text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin-right: 0.5rem;
}
.airport-menu-item .airport-code { font-size: 0.9em; white-space: nowrap; }
.rbt-menu { max-height: 300px; overflow-y: auto; }
*/
