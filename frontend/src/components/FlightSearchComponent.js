"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Typeahead, Menu, MenuItem } from "react-bootstrap-typeahead";
import DatePicker from "react-datepicker";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import {
  FaSearch,
  FaMagic,
  FaKeyboard,
  FaSpinner,
  FaPlane,
  FaCalendarAlt,
  FaUsers,
} from "react-icons/fa";
import axios from "axios";

import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-datepicker/dist/react-datepicker.css";

// --- Sample Structured Airport Data ---
const sampleStructuredAirportOptions = [
  {
    id: "TIA",
    code: "TIA",
    name: "Rinas Mother Teresa",
    city: "Tirana",
    country: "Albania",
    lat: 41.4147,
    lng: 19.7206,
  },
  {
    id: "EVN",
    code: "EVN",
    name: "Zvartnots Intl",
    city: "Yerevan",
    country: "Armenia",
    lat: 40.1473,
    lng: 44.3959,
  },
  {
    id: "VIE",
    code: "VIE",
    name: "Vienna Intl",
    city: "Vienna",
    country: "Austria",
    lat: 48.1102,
    lng: 16.5697,
  },
  {
    id: "GYD",
    code: "GYD",
    name: "Heydar Aliyev Intl",
    city: "Baku",
    country: "Azerbaijan",
    lat: 40.4675,
    lng: 50.0467,
  },
  {
    id: "GBB",
    code: "GBB",
    name: "Qabala Intl",
    city: "Gabala",
    country: "Azerbaijan",
    lat: 40.8222,
    lng: 47.7125,
  },
  {
    id: "CRL",
    code: "CRL",
    name: "Brussels South Charleroi",
    city: "Brussels Charleroi",
    country: "Belgium",
    lat: 50.4592,
    lng: 4.4525,
  },
  {
    id: "OTP",
    code: "OTP",
    name: "Henri Coandă Intl.",
    city: "Bucharest",
    country: "Romania",
    lat: 44.5711,
    lng: 26.0858,
  },
  {
    id: "CLJ",
    code: "CLJ",
    name: "Avram Iancu",
    city: "Cluj",
    country: "Romania",
    lat: 46.7852,
    lng: 23.6862,
  },
  {
    id: "BCN",
    code: "BCN",
    name: "El Prat Airport",
    city: "Barcelona",
    country: "Spain",
    lat: 41.2974,
    lng: 2.0833,
  },
  {
    id: "MAD",
    code: "MAD",
    name: "Adolfo Suárez Madrid–Barajas",
    city: "Madrid",
    country: "Spain",
    lat: 40.4983,
    lng: -3.5676,
  },
  {
    id: "LHR",
    code: "LHR",
    name: "Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    lat: 51.47,
    lng: -0.4543,
  },
  {
    id: "JFK",
    code: "JFK",
    name: "John F. Kennedy Intl.",
    city: "New York",
    country: "USA",
    lat: 40.6413,
    lng: -73.7781,
  },
  {
    id: "LAX",
    code: "LAX",
    name: "Los Angeles Intl.",
    city: "Los Angeles",
    country: "USA",
    lat: 33.9416,
    lng: -118.4085,
  },
  {
    id: "AMS",
    code: "AMS",
    name: "Amsterdam Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
    lat: 52.3105,
    lng: 4.7683,
  },
  {
    id: "CDG",
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    lat: 49.0097,
    lng: 2.5479,
  },
  {
    id: "FCO",
    code: "FCO",
    name: "Leonardo da Vinci Fiumicino",
    city: "Rome",
    country: "Italy",
    lat: 41.8002,
    lng: 12.2388,
  },
  {
    id: "MXP",
    code: "MXP",
    name: "Milano Malpensa",
    city: "Milan",
    country: "Italy",
    lat: 45.63,
    lng: 8.7255,
  },
  {
    id: "MUC",
    code: "MUC",
    name: "Franz Josef Strauss",
    city: "Munich",
    country: "Germany",
    lat: 48.3537,
    lng: 11.775,
  },
  {
    id: "BER",
    code: "BER",
    name: "Berlin Brandenburg",
    city: "Berlin",
    country: "Germany",
    lat: 52.3667,
    lng: 13.5033,
  },
  {
    id: "ATH",
    code: "ATH",
    name: "Athens International",
    city: "Athens",
    country: "Greece",
    lat: 37.9364,
    lng: 23.9445,
  },
  {
    id: "ZRH",
    code: "ZRH",
    name: "Zurich Airport",
    city: "Zurich",
    country: "Switzerland",
    lat: 47.4647,
    lng: 8.5492,
  },
];

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
  const lowerText = text.toLowerCase();

  for (const airport of allAirports) {
    if (lowerText.includes(airport.city.toLowerCase())) {
      return airport;
    }
  }

  for (const airport of allAirports) {
    const words = lowerText.split(/\s+/);
    const cityWords = airport.city.toLowerCase().split(/\s+/);

    for (const word of words) {
      for (const cityWord of cityWords) {
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

  const inTimeMatch = text.match(
    /\bin\s+(\d+)\s+(day|days|week|weeks|month|months)\b/i
  );
  if (inTimeMatch) {
    const amount = parseInt(inTimeMatch[1]);
    const unit = inTimeMatch[2].toLowerCase();

    const date = new Date(today);

    if (unit === "day" || unit === "days") {
      date.setDate(date.getDate() + amount);
      return date;
    }

    if (unit === "week" || unit === "weeks") {
      date.setDate(date.getDate() + amount * 7);
      return date;
    }

    if (unit === "month" || unit === "months") {
      date.setMonth(date.getMonth() + amount);
      return date;
    }
  }

  if (text.match(/\bthis weekend\b/i) || text.match(/\bweekend\b/i)) {
    const date = new Date(today);
    const daysUntilSaturday = (6 - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + daysUntilSaturday);
    return date;
  }

  if (text.match(/\bnext weekend\b/i)) {
    const date = new Date(today);
    const daysUntilSaturday = (6 - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + daysUntilSaturday + 7);
    return date;
  }

  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  for (let i = 0; i < months.length; i++) {
    const monthRegex = new RegExp(`\\b${months[i]}\\b`, "i");
    if (text.match(monthRegex)) {
      const date = new Date(today);
      const targetMonth = i;

      if (targetMonth < date.getMonth()) {
        date.setFullYear(date.getFullYear() + 1);
      }

      date.setMonth(targetMonth);
      date.setDate(15);

      const dayMatch = text.match(
        new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+${months[i]}\\b`, "i")
      );
      if (dayMatch) {
        const day = parseInt(dayMatch[1]);
        if (day >= 1 && day <= 31) {
          date.setDate(day);
        }
      }

      return date;
    }
  }

  const dateFormatMatch = text.match(
    /\b(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?\b/
  );
  if (dateFormatMatch) {
    const firstNumber = parseInt(dateFormatMatch[1]);
    const secondNumber = parseInt(dateFormatMatch[2]);
    let year = dateFormatMatch[3]
      ? parseInt(dateFormatMatch[3])
      : today.getFullYear();

    if (year < 100) {
      year += 2000;
    }

    let month, day;

    if (firstNumber <= 12) {
      month = firstNumber - 1;
      day = secondNumber;
    } else {
      day = firstNumber;
      month = secondNumber - 1;
    }

    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const date = new Date(year, month, day);

      if (date < today) {
        date.setFullYear(date.getFullYear() + 1);
      }

      return date;
    }
  }

  return null;
};

const extractBudget = (text) => {
  if (!text) return null;

  const currencyMatch = text.match(/[\$\€\£\¥](\d+)/);
  if (currencyMatch) {
    return parseInt(currencyMatch[1]);
  }

  const underMatch = text.match(
    /\b(?:under|less than|below|max|maximum)\s+(?:[\$\€\£\¥])?(\d+)/i
  );
  if (underMatch) {
    return parseInt(underMatch[1]);
  }

  const amountMatch = text.match(
    /\b(\d+)\s+(?:dollars|euros|pounds|usd|eur|gbp)\b/i
  );
  if (amountMatch) {
    return parseInt(amountMatch[1]);
  }

  return null;
};

const extractTripType = (text) => {
  if (!text) return null;

  if (text.match(/\bone[\s-]?way\b/i)) {
    return "oneWay";
  }

  if (text.match(/\b(?:round[\s-]?trip|return|two[\s-]?way)\b/i)) {
    return "roundTrip";
  }

  return null;
};

const extractPassengers = (text) => {
  if (!text) return { adults: 1, children: 0, infants: 0 };

  const result = { adults: 1, children: 0, infants: 0 };

  const adultsMatch = text.match(/\b(\d+)\s+(?:adult|adults)\b/i);
  if (adultsMatch) {
    result.adults = parseInt(adultsMatch[1]);
  }

  const childrenMatch = text.match(/\b(\d+)\s+(?:child|children|kid|kids)\b/i);
  if (childrenMatch) {
    result.children = parseInt(childrenMatch[1]);
  }

  const infantsMatch = text.match(
    /\b(\d+)\s+(?:infant|infants|baby|babies)\b/i
  );
  if (infantsMatch) {
    result.infants = parseInt(infantsMatch[1]);
  }

  return result;
};

export default function FlightSearchComponent() {
  // State
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState([]);
  const [departureDate, setDepartureDate] = useState(null);
  const [arrivalDate, setArrivalDate] = useState(null);
  const [tripType, setTripType] = useState("roundTrip");

  const [allAirportOptions, setAllAirportOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState(null);

  const [showNlpSearch, setShowNlpSearch] = useState(false);
  const [nlpQuery, setNlpQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState([]);
  const [nlpError, setNlpError] = useState(null);
  const [nlpSuggestions, setNlpSuggestions] = useState([
    "Weekend trip from Bucharest to Paris",
    "One way to London next month",
    "Flights from Bucharest to Barcelona under $200",
    "Family vacation to Rome in July with 2 kids",
    "Business trip to Berlin next week",
  ]);

  const [userLocation, setUserLocation] = useState(null);
  const [closestAirport, setClosestAirport] = useState(null);

  const dropdownBtnRef = useRef(null);
  const dropdownContentRef = useRef(null);
  const nlpInputRef = useRef(null);

  // Functions
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

  const findClosestAirport = (userLat, userLng) => {
    if (!userLat || !userLng) return null;

    let closestAirport = null;
    let minDistance = Infinity;

    const airportsWithCoordinates = allAirportOptions.filter(
      (airport) => airport.lat && airport.lng
    );

    if (airportsWithCoordinates.length === 0) {
      return (
        allAirportOptions.find((airport) => airport.code === "OTP") ||
        allAirportOptions[0]
      );
    }

    airportsWithCoordinates.forEach((airport) => {
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

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const isRoundTrip = tripType === "roundTrip";
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

  // Effects
  useEffect(() => {
    const fetchAirports = async () => {
      setOptionsLoading(true);
      setOptionsError(null);
      try {
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

  useEffect(() => {
    if (showNlpSearch && nlpInputRef.current) {
      setTimeout(() => {
        nlpInputRef.current.focus();
      }, 100);
    }
  }, [showNlpSearch]);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("IP Geolocation data:", data);
        if (data.latitude && data.longitude) {
          setUserLocation({ lat: data.latitude, lng: data.longitude });
          const closest = findClosestAirport(data.latitude, data.longitude);
          setClosestAirport(closest);
        } else {
          throw new Error("No location data available");
        }
      })
      .catch((error) => {
        console.error("Error getting location from IP:", error);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lng: longitude });
              const closest = findClosestAirport(latitude, longitude);
              setClosestAirport(closest);
            },
            (geoError) => {
              console.error("Geolocation error:", geoError);
              setClosestAirport(
                allAirportOptions.find((airport) => airport.code === "OTP") ||
                  allAirportOptions[0]
              );
            }
          );
        } else {
          console.error("Geolocation is not supported by this browser.");
          setClosestAirport(
            allAirportOptions.find((airport) => airport.code === "OTP") ||
              allAirportOptions[0]
          );
        }
      });
  }, [allAirportOptions]);

  // NLP functions
  const parseNaturalLanguageQuery = useCallback(
    async (query) => {
      if (!query.trim()) {
        setNlpError("Please enter a search query");
        return { result: null, canSearch: false };
      }

      setIsProcessing(true);
      setProcessingSteps([]);
      setNlpError(null);

      try {
        setProcessingSteps((prev) => [...prev, "Analyzing your query..."]);

        const response = await axios.post(
          "/api/flights/natural-language/search",
          {
            query: query,
            closestAirport: closestAirport ? closestAirport.code : null,
            userLatitude: userLocation ? userLocation.lat : null,
            userLongitude: userLocation ? userLocation.lng : null,
          }
        );

        const searchParams = response.data;

        if (!searchParams.success) {
          setNlpError(
            searchParams.error || "Failed to process your search query"
          );
          return { result: null, canSearch: false };
        }

        const result = {
          origin: searchParams.origin,
          destination: searchParams.destination,
          departureDate: searchParams.departureDate
            ? new Date(searchParams.departureDate)
            : null,
          returnDate: searchParams.returnDate
            ? new Date(searchParams.returnDate)
            : null,
          tripType: searchParams.tripType || "roundTrip",
          passengers: {
            adults: searchParams.adults || 1,
            children: searchParams.children || 0,
            infants: searchParams.infants || 0,
          },
        };

        if (result.tripType) {
          setProcessingSteps((prev) => [
            ...prev,
            `Detected trip type: ${
              result.tripType === "oneWay" ? "One Way" : "Round Trip"
            }`,
          ]);
        } else {
          setProcessingSteps((prev) => [
            ...prev,
            "Assuming Round Trip (default)",
          ]);
        }

        if (result.origin) {
          const originAirport = allAirportOptions.find(
            (airport) => airport.code === result.origin
          );
          if (originAirport) {
            setProcessingSteps((prev) => [
              ...prev,
              `Found origin airport: ${originAirport.city} (${originAirport.code})`,
            ]);
          } else {
            setProcessingSteps((prev) => [
              ...prev,
              `Found origin airport code: ${result.origin}`,
            ]);
          }
        } else {
          setProcessingSteps((prev) => [
            ...prev,
            "No origin location detected",
          ]);
        }

        if (result.destination) {
          const destAirport = allAirportOptions.find(
            (airport) => airport.code === result.destination
          );
          if (destAirport) {
            setProcessingSteps((prev) => [
              ...prev,
              `Found destination airport: ${destAirport.city} (${destAirport.code})`,
            ]);
          } else {
            setProcessingSteps((prev) => [
              ...prev,
              `Found destination airport code: ${result.destination}`,
            ]);
          }
        } else {
          setProcessingSteps((prev) => [
            ...prev,
            "No destination location detected",
          ]);
        }

        setProcessingSteps((prev) => [...prev, "Looking for travel dates..."]);

        if (result.departureDate) {
          setProcessingSteps((prev) => [
            ...prev,
            `Found departure date: ${result.departureDate.toLocaleDateString()}`,
          ]);
        } else {
          setProcessingSteps((prev) => [...prev, "No departure date found"]);
        }

        if (result.tripType === "roundTrip") {
          if (result.returnDate) {
            setProcessingSteps((prev) => [
              ...prev,
              `Found return date: ${result.returnDate.toLocaleDateString()}`,
            ]);
          } else {
            setProcessingSteps((prev) => [...prev, "No return date found"]);
          }
        }

        if (result.passengers) {
          setProcessingSteps((prev) => [
            ...prev,
            `Detected passengers: ${result.passengers.adults} adult(s), ${result.passengers.children} child(ren), ${result.passengers.infants} infant(s)`,
          ]);
        } else {
          setProcessingSteps((prev) => [
            ...prev,
            "Using default passenger count: 1 adult",
          ]);
        }

        setProcessingSteps((prev) => [
          ...prev,
          "Finalizing search parameters...",
        ]);

        if (result.origin) {
          const originAirport = allAirportOptions.find(
            (airport) => airport.code === result.origin
          );
          if (originAirport) {
            setSelectedOrigin([originAirport]);
            setOrigin(result.origin);
          }
        }

        if (result.destination) {
          const destAirport = allAirportOptions.find(
            (airport) => airport.code === result.destination
          );
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

        const canSearch =
          result.origin &&
          result.destination &&
          result.departureDate &&
          (result.tripType !== "roundTrip" || result.returnDate);

        if (canSearch) {
          setProcessingSteps((prev) => [
            ...prev,
            "Search parameters complete! Ready to search.",
          ]);
        } else {
          const missing = [];
          if (!result.origin) missing.push("origin");
          if (!result.destination) missing.push("destination");
          if (!result.departureDate) missing.push("departure date");
          if (result.tripType === "roundTrip" && !result.returnDate)
            missing.push("return date");

          setProcessingSteps((prev) => [
            ...prev,
            `Missing required parameters: ${missing.join(", ")}`,
          ]);
          setNlpError(`Please provide ${missing.join(", ")}`);
        }

        return { result, canSearch };
      } catch (error) {
        console.error("Error parsing natural language query:", error);
        setNlpError(
          error.response?.data?.error ||
            "Sorry, I couldn't understand that query. Please try again or use the standard search form."
        );
        return { result: null, canSearch: false };
      } finally {
        setIsProcessing(false);
      }
    },
    [allAirportOptions]
  );

  const handleNlpSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }

    const { result, canSearch } = await parseNaturalLanguageQuery(nlpQuery);

    if (canSearch) {
      setTimeout(() => {
        const params = new URLSearchParams({
          origin: result.origin,
          destination: result.destination,
          departureDate: formatDateForSubmit(result.departureDate),
          adults: result.passengers.adults.toString(),
          children: result.passengers.children.toString(),
          infants: result.passengers.infants.toString(),
          tripType: result.tripType,
        });

        if (result.tripType === "roundTrip" && result.returnDate) {
          params.append("arrivalDate", formatDateForSubmit(result.returnDate));
        }

        window.location.href = `/flights/availability?${params.toString()}`;
      }, 1000);
    }
  };

  const useSuggestion = (suggestion) => {
    setNlpQuery(suggestion);
    parseNaturalLanguageQuery(suggestion);
  };

  // Custom Typeahead Rendering Functions
  const renderAirportMenu = (results, menuProps) => {
    const safeMenuProps = {
      id: menuProps.id,
      className: `${menuProps.className} modern-airport-menu`,
      style: {
        ...menuProps.style,
        zIndex: 9999, // Fix z-index issue
        position: "absolute",
      },
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
            <Dropdown.Header className="modern-airport-group-header">
              {country}
            </Dropdown.Header>
            {groupedResults[country].map((airport) => {
              itemIndex++;
              return renderAirportMenuItem(airport, menuProps, itemIndex);
            })}
          </React.Fragment>
        ))}
        {results.length === 0 && !optionsLoading && (
          <div className="modern-no-results">
            {optionsError || "No matches found."}
          </div>
        )}
        {optionsLoading && (
          <div className="modern-loading-results">
            <FaSpinner className="fa-spin me-2" />
            Loading...
          </div>
        )}
      </Menu>
    );
  };

  const renderAirportMenuItem = (option, props, index) => {
    return (
      <MenuItem key={option.id || option.code} option={option} position={index}>
        <div className="modern-airport-menu-item">
          <div className="airport-info">
            <span className="airport-name">
              {option.city &&
              option.city.toLowerCase() !== option.name.toLowerCase()
                ? `${option.city} - ${option.name}`
                : option.name}
            </span>
            <span className="airport-country">{option.country}</span>
          </div>
          <span className="airport-code">{option.code}</span>
        </div>
      </MenuItem>
    );
  };

  return (
    <div className="modern-search-section">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-11">
            <div className="modern-search-container">
              {/* Fixed Header with consistent layout */}
              <div className="search-container-header">
                {/* Trip Type Selector - Always first, only show for standard search */}
                {!showNlpSearch && (
                  <div className="trip-type-selector">
                    <div className="trip-type-options">
                      <Form.Check
                        inline
                        type="radio"
                        label="Round Trip"
                        name="tripTypeOptions"
                        id="tripTypeRound"
                        value="roundTrip"
                        checked={tripType === "roundTrip"}
                        onChange={handleTripTypeChange}
                        className="trip-type-option"
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
                        className="trip-type-option"
                      />
                    </div>
                  </div>
                )}

                {/* Search Mode Toggle - Always second */}
                <div className="search-mode-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${!showNlpSearch ? "active" : ""}`}
                    onClick={() => setShowNlpSearch(false)}
                  >
                    <FaKeyboard className="me-2" />
                    Standard Search
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${showNlpSearch ? "active" : ""}`}
                    onClick={() => setShowNlpSearch(true)}
                  >
                    <FaMagic className="me-2" />
                    AI Search
                  </button>
                </div>
              </div>

              {showNlpSearch ? (
                // NLP Search Interface
                <div className="nlp-search-container">
                  <div className="nlp-search-header">
                    <h4 className="nlp-title">
                      <FaMagic className="me-2" />
                      Ask AI to Find Your Perfect Flight
                    </h4>
                    <p className="nlp-subtitle">
                      Just describe your trip in natural language, and our AI
                      will handle the rest
                    </p>
                  </div>

                  <form onSubmit={handleNlpSubmit} className="nlp-form">
                    <div className="nlp-input-container">
                      <input
                        ref={nlpInputRef}
                        type="text"
                        className="nlp-input"
                        placeholder="Try: 'Weekend trip from Bucharest to Paris under €300' or 'One way to London next month for 2 adults'"
                        value={nlpQuery}
                        onChange={(e) => setNlpQuery(e.target.value)}
                        disabled={isProcessing}
                      />
                      <button
                        className="nlp-search-btn"
                        type="submit"
                        disabled={isProcessing || !nlpQuery.trim()}
                      >
                        {isProcessing ? (
                          <FaSpinner className="fa-spin" />
                        ) : (
                          <FaSearch />
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Processing Steps */}
                  {processingSteps.length > 0 && (
                    <div className="processing-steps">
                      <h6 className="processing-title">
                        Processing your request:
                      </h6>
                      <div className="steps-list">
                        {processingSteps.map((step, index) => (
                          <div
                            key={index}
                            className={`step-item ${
                              index === processingSteps.length - 1
                                ? "current"
                                : "completed"
                            }`}
                          >
                            <div className="step-indicator"></div>
                            <span className="step-text">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {nlpError && (
                    <div className="nlp-error">
                      <div className="error-content">
                        <strong>Hmm, I need more information:</strong>
                        <p>{nlpError}</p>
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  <div className="nlp-suggestions">
                    <p className="suggestions-label">Try these examples:</p>
                    <div className="suggestions-grid">
                      {nlpSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="suggestion-chip"
                          onClick={() => useSuggestion(suggestion)}
                          disabled={isProcessing}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Standard Search Interface with fixed z-index container
                <form
                  onSubmit={handleSearchSubmit}
                  className="standard-search-form"
                  style={{ position: "relative", zIndex: 1 }}
                >
                  {/* Search Fields Grid */}
                  <div className="search-fields-grid">
                    {/* Origin Field with fixed z-index */}
                    <div
                      className="search-field origin-field"
                      style={{ position: "relative", zIndex: 1000 }}
                    >
                      <div className="field-header">
                        <FaPlane className="field-icon" />
                        <label className="field-label">From</label>
                      </div>
                      <Typeahead
                        id="origin-typeahead"
                        options={allAirportOptions}
                        labelKey={(option) =>
                          option.isHeader
                            ? ""
                            : `${option.city} (${option.code})`
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
                        inputProps={{ className: "modern-typeahead-input" }}
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
                        dropup={false}
                        flip={true}
                      />
                    </div>

                    {/* Destination Field with fixed z-index */}
                    <div
                      className="search-field destination-field"
                      style={{ position: "relative", zIndex: 999 }}
                    >
                      <div className="field-header">
                        <FaPlane className="field-icon destination-icon" />
                        <label className="field-label">To</label>
                      </div>
                      <Typeahead
                        id="destination-typeahead"
                        options={allAirportOptions}
                        labelKey={(option) =>
                          option.isHeader
                            ? ""
                            : `${option.city} (${option.code})`
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
                        inputProps={{ className: "modern-typeahead-input" }}
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
                        dropup={false}
                        flip={true}
                      />
                    </div>

                    {/* Departure Date with fixed z-index */}
                    <div
                      className="search-field date-field"
                      style={{ position: "relative", zIndex: 998 }}
                    >
                      <div className="field-header">
                        <FaCalendarAlt className="field-icon" />
                        <label className="field-label">Depart</label>
                      </div>
                      <DatePicker
                        selected={departureDate}
                        onChange={(date) => setDepartureDate(date)}
                        dateFormat="dd/MM/yyyy"
                        className="modern-date-input"
                        placeholderText="Select Date"
                        minDate={new Date()}
                        required
                        autoComplete="off"
                        popperProps={{
                          placement: "top-start",
                          strategy: "fixed",
                          modifiers: [
                            {
                              name: "offset",
                              options: {
                                offset: [0, 10],
                              },
                            },
                            {
                              name: "preventOverflow",
                              options: {
                                rootBoundary: "viewport",
                                tether: false,
                                altAxis: true,
                              },
                            },
                          ],
                        }}
                        popperClassName="date-picker-popper"
                      />
                    </div>

                    {/* Return Date with fixed z-index */}
                    {tripType === "roundTrip" && (
                      <div
                        className="search-field date-field"
                        style={{ position: "relative", zIndex: 997 }}
                      >
                        <div className="field-header">
                          <FaCalendarAlt className="field-icon" />
                          <label className="field-label">Return</label>
                        </div>
                        <DatePicker
                          selected={arrivalDate}
                          onChange={(date) => setArrivalDate(date)}
                          dateFormat="dd/MM/yyyy"
                          className="modern-date-input"
                          placeholderText="Select Date"
                          minDate={departureDate || new Date()}
                          disabled={!departureDate}
                          required={tripType === "roundTrip"}
                          autoComplete="off"
                          popperProps={{
                            placement: "top-start",
                            strategy: "fixed",
                            modifiers: [
                              {
                                name: "offset",
                                options: {
                                  offset: [0, 10],
                                },
                              },
                              {
                                name: "preventOverflow",
                                options: {
                                  rootBoundary: "viewport",
                                  tether: false,
                                  altAxis: true,
                                },
                              },
                            ],
                          }}
                          popperClassName="date-picker-popper"
                        />
                      </div>
                    )}

                    {/* Passengers with fixed z-index */}
                    <div
                      className="search-field passengers-field"
                      style={{ position: "relative", zIndex: 996 }}
                    >
                      <div className="field-header">
                        <FaUsers className="field-icon" />
                        <label className="field-label">Passengers</label>
                      </div>
                      <div className="passengers-dropdown">
                        <button
                          ref={dropdownBtnRef}
                          className="passengers-btn"
                          type="button"
                          onClick={() => setShowDropdown(!showDropdown)}
                        >
                          <span className="passengers-text">
                            {totalPassengersText()}
                          </span>
                          <span className="dropdown-arrow">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </button>

                        <div
                          ref={dropdownContentRef}
                          className={`passengers-dropdown-menu ${
                            showDropdown ? "show" : ""
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ zIndex: 9999 }}
                        >
                          <div className="passenger-type">
                            <div className="passenger-info">
                              <span className="passenger-label">Adults</span>
                              <span className="passenger-sublabel">
                                14+ years
                              </span>
                            </div>
                            <div className="passenger-controls">
                              <button
                                type="button"
                                className="passenger-btn decrease"
                                onClick={() => decrement("adults")}
                                disabled={adults <= 1}
                              >
                                -
                              </button>
                              <span className="passenger-count">{adults}</span>
                              <button
                                type="button"
                                className="passenger-btn increase"
                                onClick={() => increment("adults")}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="passenger-type">
                            <div className="passenger-info">
                              <span className="passenger-label">Children</span>
                              <span className="passenger-sublabel">
                                2-14 years
                              </span>
                            </div>
                            <div className="passenger-controls">
                              <button
                                type="button"
                                className="passenger-btn decrease"
                                onClick={() => decrement("children")}
                                disabled={children <= 0}
                              >
                                -
                              </button>
                              <span className="passenger-count">
                                {children}
                              </span>
                              <button
                                type="button"
                                className="passenger-btn increase"
                                onClick={() => increment("children")}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="passenger-type">
                            <div className="passenger-info">
                              <span className="passenger-label">Infants</span>
                              <span className="passenger-sublabel">
                                0-2 years
                              </span>
                            </div>
                            <div className="passenger-controls">
                              <button
                                type="button"
                                className="passenger-btn decrease"
                                onClick={() => decrement("infants")}
                                disabled={infants <= 0}
                              >
                                -
                              </button>
                              <span className="passenger-count">{infants}</span>
                              <button
                                type="button"
                                className="passenger-btn increase"
                                onClick={() => increment("infants")}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="dropdown-footer">
                            <button
                              type="button"
                              className="done-btn"
                              onClick={() => setShowDropdown(false)}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Search Button */}
                    <div className="search-field search-btn-field">
                      <button type="submit" className="main-search-btn">
                        <FaSearch className="me-2" />
                        <span>Search Flights</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
