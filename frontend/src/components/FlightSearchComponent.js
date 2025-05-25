// components/FlightSearchComponent.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
// Import Menu and MenuItem for custom rendering
import { Typeahead, Menu, MenuItem } from "react-bootstrap-typeahead";
import DatePicker from "react-datepicker";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown"; // Needed for Dropdown.Header
import { FaSearch, FaMagic, FaKeyboard, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

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

// Natural language processing helper functions
const extractCity = (text, allAirports) => {
  if (!text) return null;

  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();

  // First try exact city name matches
  for (const airport of allAirports) {
    if (lowerText.includes(airport.city.toLowerCase())) {
      return airport;
    }
  }

  // Then try fuzzy matching for city names
  for (const airport of allAirports) {
    // Check if any word in the text is similar to the city name
    const words = lowerText.split(/\s+/);
    const cityWords = airport.city.toLowerCase().split(/\s+/);

    for (const word of words) {
      for (const cityWord of cityWords) {
        // Simple fuzzy match - if the word contains most of the city name
        if (word.length > 3 && cityWord.length > 3) {
          if (word.includes(cityWord) || cityWord.includes(word)) {
            return airport;
          }
        }
      }
    }
  }

  return null;
};

const extractDate = (text) => {
  if (!text) return null;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  // Common date patterns
  if (text.match(/\btoday\b/i)) {
    return today;
  }

  if (text.match(/\btomorrow\b/i)) {
    return tomorrow;
  }

  if (text.match(/\bnext week\b/i)) {
    return nextWeek;
  }

  if (text.match(/\bnext month\b/i)) {
    return nextMonth;
  }

  // Handle "in X days/weeks/months"
  const inTimeMatch = text.match(/\bin\s+(\d+)\s+(day|days|week|weeks|month|months)\b/i);
  if (inTimeMatch) {
    const amount = parseInt(inTimeMatch[1]);
    const unit = inTimeMatch[2].toLowerCase();

    const date = new Date(today);

    if (unit === 'day' || unit === 'days') {
      date.setDate(date.getDate() + amount);
      return date;
    }

    if (unit === 'week' || unit === 'weeks') {
      date.setDate(date.getDate() + (amount * 7));
      return date;
    }

    if (unit === 'month' || unit === 'months') {
      date.setMonth(date.getMonth() + amount);
      return date;
    }
  }

  // Handle weekend
  if (text.match(/\bthis weekend\b/i) || text.match(/\bweekend\b/i)) {
    const date = new Date(today);
    // Find the next Saturday
    const daysUntilSaturday = (6 - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + daysUntilSaturday);
    return date;
  }

  if (text.match(/\bnext weekend\b/i)) {
    const date = new Date(today);
    // Find the Saturday after next
    const daysUntilSaturday = (6 - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + daysUntilSaturday + 7);
    return date;
  }

  // Handle specific months
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june', 
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  for (let i = 0; i < months.length; i++) {
    const monthRegex = new RegExp(`\\b${months[i]}\\b`, 'i');
    if (text.match(monthRegex)) {
      const date = new Date(today);
      const targetMonth = i;

      // If the month is already past this year, set it for next year
      if (targetMonth < date.getMonth()) {
        date.setFullYear(date.getFullYear() + 1);
      }

      date.setMonth(targetMonth);
      date.setDate(15); // Default to middle of the month

      // Check for specific day
      const dayMatch = text.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+${months[i]}\\b`, 'i'));
      if (dayMatch) {
        const day = parseInt(dayMatch[1]);
        if (day >= 1 && day <= 31) {
          date.setDate(day);
        }
      }

      return date;
    }
  }

  // Handle MM/DD or DD/MM format
  const dateFormatMatch = text.match(/\b(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?\b/);
  if (dateFormatMatch) {
    // Assume MM/DD format for US, but could be configurable based on locale
    const firstNumber = parseInt(dateFormatMatch[1]);
    const secondNumber = parseInt(dateFormatMatch[2]);
    let year = dateFormatMatch[3] ? parseInt(dateFormatMatch[3]) : today.getFullYear();

    // Handle 2-digit year
    if (year < 100) {
      year += 2000;
    }

    // Try to determine if it's MM/DD or DD/MM based on values
    let month, day;

    if (firstNumber <= 12) {
      // Could be MM/DD
      month = firstNumber - 1;
      day = secondNumber;
    } else {
      // Must be DD/MM
      day = firstNumber;
      month = secondNumber - 1;
    }

    // Validate month and day
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const date = new Date(year, month, day);

      // Ensure the date is in the future
      if (date < today) {
        // If it's in the past, try next year
        date.setFullYear(date.getFullYear() + 1);
      }

      return date;
    }
  }

  return null;
};

const extractBudget = (text) => {
  if (!text) return null;

  // Match currency symbols followed by numbers
  const currencyMatch = text.match(/[\$\€\£\¥](\d+)/);
  if (currencyMatch) {
    return parseInt(currencyMatch[1]);
  }

  // Match "under X" or "less than X" patterns
  const underMatch = text.match(/\b(?:under|less than|below|max|maximum)\s+(?:[\$\€\£\¥])?(\d+)/i);
  if (underMatch) {
    return parseInt(underMatch[1]);
  }

  // Match "X dollars/euros/pounds" patterns
  const amountMatch = text.match(/\b(\d+)\s+(?:dollars|euros|pounds|usd|eur|gbp)\b/i);
  if (amountMatch) {
    return parseInt(amountMatch[1]);
  }

  return null;
};

const extractTripType = (text) => {
  if (!text) return null;

  if (text.match(/\bone[\s-]?way\b/i)) {
    return 'oneWay';
  }

  if (text.match(/\b(?:round[\s-]?trip|return|two[\s-]?way)\b/i)) {
    return 'roundTrip';
  }

  return null;
};

const extractPassengers = (text) => {
  if (!text) return { adults: 1, children: 0, infants: 0 };

  const result = { adults: 1, children: 0, infants: 0 };

  // Extract adults
  const adultsMatch = text.match(/\b(\d+)\s+(?:adult|adults)\b/i);
  if (adultsMatch) {
    result.adults = parseInt(adultsMatch[1]);
  }

  // Extract children
  const childrenMatch = text.match(/\b(\d+)\s+(?:child|children|kid|kids)\b/i);
  if (childrenMatch) {
    result.children = parseInt(childrenMatch[1]);
  }

  // Extract infants
  const infantsMatch = text.match(/\b(\d+)\s+(?:infant|infants|baby|babies)\b/i);
  if (infantsMatch) {
    result.infants = parseInt(infantsMatch[1]);
  }

  return result;
};

export default function FlightSearchComponent() {
  // --- Original State ---
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

  // --- New State for Natural Language Search ---
  const [showNlpSearch, setShowNlpSearch] = useState(false);
  const [nlpQuery, setNlpQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState([]);
  const [nlpError, setNlpError] = useState(null);
  const [nlpSuggestions, setNlpSuggestions] = useState([
    'Weekend trip from Bucharest to Paris',
    'One way to London next month',
    'Flights from Bucharest to Barcelona under $200',
    'Family vacation to Rome in July with 2 kids',
    'Business trip to Berlin next week'
  ]);

  // --- Refs ---
  const dropdownBtnRef = useRef(null);
  const dropdownContentRef = useRef(null);
  const nlpInputRef = useRef(null);

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

  // Focus the NLP input when switching to NLP mode
  useEffect(() => {
    if (showNlpSearch && nlpInputRef.current) {
      setTimeout(() => {
        nlpInputRef.current.focus();
      }, 100);
    }
  }, [showNlpSearch]);

  // Parse natural language query
  const parseNaturalLanguageQuery = useCallback(async (query) => {
    if (!query.trim()) {
      setNlpError("Please enter a search query");
      return { result: null, canSearch: false };
    }

    setIsProcessing(true);
    setProcessingSteps([]);
    setNlpError(null);

    try {
      // Add initial processing step
      setProcessingSteps(prev => [...prev, "Analyzing your query..."]);

      // Call the Gemini API through our backend
      const response = await axios.post('/api/flights/natural-language/search', {
        query: query
      });

      const searchParams = response.data;

      if (!searchParams.success) {
        setNlpError(searchParams.error || 'Failed to process your search query');
        return { result: null, canSearch: false };
      }

      // Initialize result object with the API response
      const result = {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate ? new Date(searchParams.departureDate) : null,
        returnDate: searchParams.returnDate ? new Date(searchParams.returnDate) : null,
        tripType: searchParams.tripType || 'roundTrip',
        passengers: {
          adults: searchParams.adults || 1,
          children: searchParams.children || 0,
          infants: searchParams.infants || 0
        }
      };

      // Add processing steps based on the API response
      if (result.tripType) {
        setProcessingSteps(prev => [...prev, `Detected trip type: ${result.tripType === 'oneWay' ? 'One Way' : 'Round Trip'}`]);
      } else {
        setProcessingSteps(prev => [...prev, "Assuming Round Trip (default)"]);
      }

      if (result.origin) {
        const originAirport = allAirportOptions.find(airport => airport.code === result.origin);
        if (originAirport) {
          setProcessingSteps(prev => [...prev, `Found origin airport: ${originAirport.city} (${originAirport.code})`]);
        } else {
          setProcessingSteps(prev => [...prev, `Found origin airport code: ${result.origin}`]);
        }
      } else {
        setProcessingSteps(prev => [...prev, "No origin location detected"]);
      }

      if (result.destination) {
        const destAirport = allAirportOptions.find(airport => airport.code === result.destination);
        if (destAirport) {
          setProcessingSteps(prev => [...prev, `Found destination airport: ${destAirport.city} (${destAirport.code})`]);
        } else {
          setProcessingSteps(prev => [...prev, `Found destination airport code: ${result.destination}`]);
        }
      } else {
        setProcessingSteps(prev => [...prev, "No destination location detected"]);
      }

      setProcessingSteps(prev => [...prev, "Looking for travel dates..."]);

      if (result.departureDate) {
        setProcessingSteps(prev => [...prev, `Found departure date: ${result.departureDate.toLocaleDateString()}`]);
      } else {
        setProcessingSteps(prev => [...prev, "No departure date found"]);
      }

      if (result.tripType === 'roundTrip') {
        if (result.returnDate) {
          setProcessingSteps(prev => [...prev, `Found return date: ${result.returnDate.toLocaleDateString()}`]);
        } else {
          setProcessingSteps(prev => [...prev, "No return date found"]);
        }
      }

      if (result.passengers) {
        setProcessingSteps(prev => [
          ...prev, 
          `Detected passengers: ${result.passengers.adults} adult(s), ${result.passengers.children} child(ren), ${result.passengers.infants} infant(s)`
        ]);
      } else {
        setProcessingSteps(prev => [...prev, "Using default passenger count: 1 adult"]);
      }

      // Final processing
      setProcessingSteps(prev => [...prev, "Finalizing search parameters..."]);

      // Update form state with parsed values
      if (result.origin) {
        const originAirport = allAirportOptions.find(airport => airport.code === result.origin);
        if (originAirport) {
          setSelectedOrigin([originAirport]);
          setOrigin(result.origin);
        }
      }

      if (result.destination) {
        const destAirport = allAirportOptions.find(airport => airport.code === result.destination);
        if (destAirport) {
          setSelectedDestination([destAirport]);
          setDestination(result.destination);
        }
      }

      if (result.departureDate) {
        setDepartureDate(result.departureDate);
      }

      if (result.returnDate) {
        setArrivalDate(result.returnDate);
      }

      if (result.tripType) {
        setTripType(result.tripType);
      }

      if (result.passengers) {
        setAdults(result.passengers.adults);
        setChildren(result.passengers.children);
        setInfants(result.passengers.infants);
      }

      // Check if we have enough information to perform a search
      const canSearch = result.origin && result.destination && result.departureDate && 
                        (result.tripType !== 'roundTrip' || result.returnDate);

      if (canSearch) {
        setProcessingSteps(prev => [...prev, "Search parameters complete! Ready to search."]);
      } else {
        // Identify missing parameters
        const missing = [];
        if (!result.origin) missing.push("origin");
        if (!result.destination) missing.push("destination");
        if (!result.departureDate) missing.push("departure date");
        if (result.tripType === 'roundTrip' && !result.returnDate) missing.push("return date");

        setProcessingSteps(prev => [...prev, `Missing required parameters: ${missing.join(", ")}`]);
        setNlpError(`Please provide ${missing.join(", ")}`);
      }

      return { result, canSearch };
    } catch (error) {
      console.error("Error parsing natural language query:", error);
      setNlpError(error.response?.data?.error || "Sorry, I couldn't understand that query. Please try again or use the standard search form.");
      return { result: null, canSearch: false };
    } finally {
      setIsProcessing(false);
    }
  }, [allAirportOptions]);

  // Handle NLP search submission
  const handleNlpSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }

    const { result, canSearch } = await parseNaturalLanguageQuery(nlpQuery);

    if (canSearch) {
      // Wait a moment to show the success message before redirecting
      setTimeout(() => {
        // Build URL parameters for flight search
        const params = new URLSearchParams({
          origin: result.origin,
          destination: result.destination,
          departureDate: formatDateForSubmit(result.departureDate),
          adults: result.passengers.adults.toString(),
          children: result.passengers.children.toString(),
          infants: result.passengers.infants.toString(),
          tripType: result.tripType,
        });

        if (result.tripType === 'roundTrip' && result.returnDate) {
          params.append('arrivalDate', formatDateForSubmit(result.returnDate));
        }

        // Redirect to flight search results
        window.location.href = `/flights/availability?${params.toString()}`;
      }, 1000);
    }
  };

  // Use a suggestion as the query
  const useSuggestion = (suggestion) => {
    setNlpQuery(suggestion);
    parseNaturalLanguageQuery(suggestion);
  };

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
            {/* Toggle between Standard and NLP Search */}
            <div className="d-flex justify-content-end mb-3 w-100">
              <button
                type="button"
                className={`btn btn-sm ${showNlpSearch ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
                onClick={() => setShowNlpSearch(!showNlpSearch)}
              >
                {showNlpSearch ? (
                  <>
                    <FaKeyboard className="me-1" /> Use Standard Search
                  </>
                ) : (
                  <>
                    <FaMagic className="me-1" /> Try Natural Language Search
                  </>
                )}
              </button>
            </div>

            {showNlpSearch ? (
              <div className="w-100 mb-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Search flights using natural language</h5>
                    <div className="position-relative mb-3">
                      <input
                        ref={nlpInputRef}
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Try: 'weekend trips from Bucharest under $200' or 'one way to Paris next month'"
                        value={nlpQuery}
                        onChange={(e) => setNlpQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleNlpSubmit();
                          }
                        }}
                        disabled={isProcessing}
                      />
                      <button
                        className="btn btn-primary position-absolute end-0 top-0 bottom-0 m-1"
                        type="button"
                        disabled={isProcessing}
                        onClick={handleNlpSubmit}
                      >
                        {isProcessing ? (
                          <FaSpinner className="fa-spin" />
                        ) : (
                          <FaSearch />
                        )}
                      </button>
                    </div>

                    {/* Processing Steps */}
                    {processingSteps.length > 0 && (
                      <div className="mb-3 p-3 bg-light rounded">
                        <h6 className="mb-2">Processing your request:</h6>
                        <ul className="list-unstyled mb-0">
                          {processingSteps.map((step, index) => (
                            <li key={index} className="mb-1 small">
                              {index === processingSteps.length - 1 ? (
                                <strong>{step}</strong>
                              ) : (
                                <span className="text-muted">{step}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Error Message */}
                    {nlpError && (
                      <div className="alert alert-warning mb-3" role="alert">
                        {nlpError}
                      </div>
                    )}

                    {/* Suggestions */}
                    <div>
                      <p className="text-muted small mb-2">Try these examples:</p>
                      <div className="d-flex flex-wrap gap-2">
                        {nlpSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => useSuggestion(suggestion)}
                            disabled={isProcessing}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
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
