// utils/weatherService.js - Enhanced version with all airports
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Comprehensive airport to city mapping with coordinates for accuracy
const airportDetails = {
  OTP: { city: "Bucharest", country: "Romania", lat: 44.5711, lon: 26.0858 },
  BCN: { city: "Barcelona", country: "Spain", lat: 41.2971, lon: 2.0833 },
  LHR: { city: "London", country: "United Kingdom", lat: 51.47, lon: -0.4543 },
  JFK: {
    city: "New York",
    country: "United States",
    lat: 40.6413,
    lon: -73.7781,
  },
  LAX: {
    city: "Los Angeles",
    country: "United States",
    lat: 33.9425,
    lon: -118.4081,
  },
  TIA: { city: "Tirana", country: "Albania", lat: 41.4147, lon: 19.7206 },
  EVN: { city: "Yerevan", country: "Armenia", lat: 40.1473, lon: 44.3959 },
  VIE: { city: "Vienna", country: "Austria", lat: 48.1102, lon: 16.5697 },
  GYD: { city: "Baku", country: "Azerbaijan", lat: 40.4675, lon: 50.0467 },
  CRL: { city: "Brussels", country: "Belgium", lat: 50.4592, lon: 4.4525 },
  AMS: { city: "Amsterdam", country: "Netherlands", lat: 52.3105, lon: 4.7683 },
  CDG: { city: "Paris", country: "France", lat: 49.0097, lon: 2.5478 },
  FCO: { city: "Rome", country: "Italy", lat: 41.8003, lon: 12.2389 },
  MXP: { city: "Milan", country: "Italy", lat: 45.6306, lon: 8.7281 },
  MUC: { city: "Munich", country: "Germany", lat: 48.3538, lon: 11.7861 },
  BER: { city: "Berlin", country: "Germany", lat: 52.3667, lon: 13.5033 },
  CLJ: { city: "Cluj-Napoca", country: "Romania", lat: 46.7853, lon: 23.6861 },
  MAD: { city: "Madrid", country: "Spain", lat: 40.4719, lon: -3.5626 },
  ATH: { city: "Athens", country: "Greece", lat: 37.9364, lon: 23.9475 },
  ZRH: { city: "Zurich", country: "Switzerland", lat: 47.4647, lon: 8.5492 },
  PRG: {
    city: "Prague",
    country: "Czech Republic",
    lat: 50.1008,
    lon: 14.2632,
  },
  WAW: { city: "Warsaw", country: "Poland", lat: 52.1657, lon: 20.9671 },
  BUD: { city: "Budapest", country: "Hungary", lat: 47.4267, lon: 19.2611 },
  OSL: { city: "Oslo", country: "Norway", lat: 60.1976, lon: 11.1004 },
  ARN: { city: "Stockholm", country: "Sweden", lat: 59.6519, lon: 17.9186 },
  CPH: { city: "Copenhagen", country: "Denmark", lat: 55.6181, lon: 12.6561 },
  HEL: { city: "Helsinki", country: "Finland", lat: 60.3172, lon: 24.9633 },
  DUB: { city: "Dublin", country: "Ireland", lat: 53.4264, lon: -6.2499 },
  EDI: {
    city: "Edinburgh",
    country: "United Kingdom",
    lat: 55.95,
    lon: -3.3725,
  },
  MAN: {
    city: "Manchester",
    country: "United Kingdom",
    lat: 53.3539,
    lon: -2.275,
  },
  LIS: { city: "Lisbon", country: "Portugal", lat: 38.7813, lon: -9.1363 },
  OPO: { city: "Porto", country: "Portugal", lat: 41.2481, lon: -8.6814 },
  DXB: {
    city: "Dubai",
    country: "United Arab Emirates",
    lat: 25.2532,
    lon: 55.3657,
  },
  IST: { city: "Istanbul", country: "Turkey", lat: 41.2619, lon: 28.7414 },
  SVO: { city: "Moscow", country: "Russia", lat: 55.9726, lon: 37.4146 },
  LED: {
    city: "Saint Petersburg",
    country: "Russia",
    lat: 59.8003,
    lon: 30.2625,
  },
  CAI: { city: "Cairo", country: "Egypt", lat: 30.1127, lon: 31.4056 },
  TLV: { city: "Tel Aviv", country: "Israel", lat: 32.0114, lon: 34.8867 },
  BEY: { city: "Beirut", country: "Lebanon", lat: 33.8208, lon: 35.4881 },
  AMM: { city: "Amman", country: "Jordan", lat: 31.7226, lon: 35.9929 },
  ATL: {
    city: "Atlanta",
    country: "United States",
    lat: 33.6407,
    lon: -84.4277,
  },
  ORD: {
    city: "Chicago",
    country: "United States",
    lat: 41.9742,
    lon: -87.9073,
  },
  DFW: {
    city: "Dallas",
    country: "United States",
    lat: 32.8998,
    lon: -97.0403,
  },
  DEN: {
    city: "Denver",
    country: "United States",
    lat: 39.8561,
    lon: -104.6737,
  },
  LAS: {
    city: "Las Vegas",
    country: "United States",
    lat: 36.084,
    lon: -115.1537,
  },
  MIA: { city: "Miami", country: "United States", lat: 25.7959, lon: -80.287 },
  SEA: {
    city: "Seattle",
    country: "United States",
    lat: 47.4502,
    lon: -122.3088,
  },
  SFO: {
    city: "San Francisco",
    country: "United States",
    lat: 37.6213,
    lon: -122.379,
  },
  YYZ: { city: "Toronto", country: "Canada", lat: 43.6777, lon: -79.6248 },
  YVR: { city: "Vancouver", country: "Canada", lat: 49.1951, lon: -123.1816 },
  MEX: { city: "Mexico City", country: "Mexico", lat: 19.4363, lon: -99.0721 },
  GRU: { city: "São Paulo", country: "Brazil", lat: -23.4356, lon: -46.4731 },
  EZE: {
    city: "Buenos Aires",
    country: "Argentina",
    lat: -34.8222,
    lon: -58.5358,
  },
  SCL: { city: "Santiago", country: "Chile", lat: -33.3927, lon: -70.7854 },
  NRT: { city: "Tokyo", country: "Japan", lat: 35.772, lon: 140.3929 },
  ICN: { city: "Seoul", country: "South Korea", lat: 37.4602, lon: 126.4407 },
  PEK: { city: "Beijing", country: "China", lat: 40.0799, lon: 116.6031 },
  PVG: { city: "Shanghai", country: "China", lat: 31.1443, lon: 121.8083 },
  HKG: { city: "Hong Kong", country: "Hong Kong", lat: 22.308, lon: 113.9185 },
  SIN: { city: "Singapore", country: "Singapore", lat: 1.3644, lon: 103.9915 },
  BKK: { city: "Bangkok", country: "Thailand", lat: 13.69, lon: 100.7501 },
  KUL: {
    city: "Kuala Lumpur",
    country: "Malaysia",
    lat: 2.7456,
    lon: 101.7072,
  },
  CGK: { city: "Jakarta", country: "Indonesia", lat: -6.1275, lon: 106.6537 },
  MNL: { city: "Manila", country: "Philippines", lat: 14.5086, lon: 121.0194 },
  SYD: { city: "Sydney", country: "Australia", lat: -33.9399, lon: 151.1753 },
  MEL: { city: "Melbourne", country: "Australia", lat: -37.669, lon: 144.841 },
  AKL: {
    city: "Auckland",
    country: "New Zealand",
    lat: -37.0082,
    lon: 174.785,
  },
  JNB: {
    city: "Johannesburg",
    country: "South Africa",
    lat: -26.1367,
    lon: 28.2411,
  },
  CPT: {
    city: "Cape Town",
    country: "South Africa",
    lat: -33.9648,
    lon: 18.6017,
  },
  CAI: { city: "Cairo", country: "Egypt", lat: 30.1127, lon: 31.4056 },
  ADD: { city: "Addis Ababa", country: "Ethiopia", lat: 8.9774, lon: 38.7992 },
  LOS: { city: "Lagos", country: "Nigeria", lat: 6.5774, lon: 3.3211 },
  DEL: { city: "New Delhi", country: "India", lat: 28.5562, lon: 77.1 },
  BOM: { city: "Mumbai", country: "India", lat: 19.0896, lon: 72.8656 },
  BLR: { city: "Bangalore", country: "India", lat: 13.1986, lon: 77.7066 },
  MAA: { city: "Chennai", country: "India", lat: 12.9941, lon: 80.1709 },
};

// Primary weather fetching function
export const getWeatherByCity = async (city, country) => {
  try {
    if (!city || !country) {
      console.error("Missing city or country:", { city, country });
      throw new Error("City and country are required");
    }

    console.log("Fetching weather for:", { city, country });

    // Check if it's an airport code first
    let targetCity = city;
    let targetCountry = country;

    if (city.length === 3 && airportDetails[city.toUpperCase()]) {
      const airportData = airportDetails[city.toUpperCase()];
      targetCity = airportData.city;
      targetCountry = airportData.country;
      console.log("Using airport city and country:", {
        targetCity,
        targetCountry,
      });
    } else {
      // For city searches, try to find in our database
      const foundAirport = Object.values(airportDetails).find(
        (airport) =>
          airport.city.toLowerCase() === city.toLowerCase() &&
          airport.country.toLowerCase().includes(country.toLowerCase())
      );

      if (foundAirport) {
        targetCity = foundAirport.city;
        targetCountry = foundAirport.country;
        console.log("Found matching city in airport database:", {
          targetCity,
          targetCountry,
        });
      }
    }

    // Call our backend API instead of OpenWeatherMap directly
    const url = `${BACKEND_API_URL}/api/weather?city=${encodeURIComponent(
      targetCity
    )}&country=${encodeURIComponent(targetCountry)}`;
    console.log("Backend Weather API URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Weather API error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Weather data received:", data);

    return data; // Backend already formats the data to match our expected structure
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw error;
  }
};

// Get weather forecast (5-day)
// Get weather forecast (5-day) - Using backend API
export const getWeatherForecast = async (city, country) => {
  try {
    let targetCity = city;
    let targetCountry = country;

    if (city.length === 3 && airportDetails[city.toUpperCase()]) {
      const airportData = airportDetails[city.toUpperCase()];
      targetCity = airportData.city;
      targetCountry = airportData.country;
      console.log("Using airport city and country for forecast:", {
        targetCity,
        targetCountry,
      });
    } else {
      // For city searches, try to find in our database
      const foundAirport = Object.values(airportDetails).find(
        (airport) =>
          airport.city.toLowerCase() === city.toLowerCase() &&
          airport.country.toLowerCase().includes(country.toLowerCase())
      );

      if (foundAirport) {
        targetCity = foundAirport.city;
        targetCountry = foundAirport.country;
        console.log("Found matching city in airport database for forecast:", {
          targetCity,
          targetCountry,
        });
      }
    }

    // Call our backend API instead of OpenWeatherMap directly
    const url = `${BACKEND_API_URL}/api/weather/forecast?city=${encodeURIComponent(
      targetCity
    )}&country=${encodeURIComponent(targetCountry)}`;
    console.log("Backend Weather Forecast API URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Forecast API error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Forecast data received:", data);

    return data; // Backend already formats the data to match our expected structure
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    throw error;
  }
};

// Enhanced weather with fallback - Using backend API
export const getWeatherWithLocationFallback = async (city, country) => {
  try {
    // Try the primary method first
    return await getWeatherByCity(city, country);
  } catch (error) {
    console.warn("Primary weather fetch failed:", error);

    // Try with country code if available
    const countryCodeMap = {
      italy: "IT",
      france: "FR",
      spain: "ES",
      germany: "DE",
      "united kingdom": "GB",
      uk: "GB",
      usa: "US",
      "united states": "US",
      canada: "CA",
      romania: "RO",
      netherlands: "NL",
      poland: "PL",
      "czech republic": "CZ",
      austria: "AT",
      belgium: "BE",
      portugal: "PT",
      greece: "GR",
      switzerland: "CH",
      norway: "NO",
      sweden: "SE",
      denmark: "DK",
      finland: "FI",
      ireland: "IE",
    };

    const countryCode = countryCodeMap[country.toLowerCase()];

    if (countryCode) {
      try {
        console.log(`Trying with country code: ${city}, ${countryCode}`);
        // Use the backend API with country code
        const url = `${BACKEND_API_URL}/api/weather?city=${encodeURIComponent(
          city
        )}&country=${countryCode}`;
        console.log("Backend Weather API URL (fallback):", url);

        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          console.log("Fallback weather data received:", data);
          return data;
        }
      } catch (fallbackError) {
        console.warn("Country code fallback failed:", fallbackError);
      }
    }

    // Final fallback - try with just city name
    try {
      console.log(`Final fallback: trying with just city name: ${city}`);
      // Use the backend API with just city name
      const url = `${BACKEND_API_URL}/api/weather?city=${encodeURIComponent(
        city
      )}&country=`;
      console.log("Backend Weather API URL (final fallback):", url);

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log("Final fallback weather data received:", data);
        return data;
      }
    } catch (finalError) {
      console.error("All weather fetch methods failed:", finalError);
    }

    throw new Error("Unable to fetch weather data for this location");
  }
};

// Helper function to get airport data
export const getAirportData = (airportCode) => {
  if (!airportCode) return null;
  return airportDetails[airportCode.toUpperCase()] || null;
};

// Helper function to get all available airports
export const getAllAirports = () => {
  return Object.keys(airportDetails).map((code) => ({
    code,
    ...airportDetails[code],
  }));
};

// Helper function to format weather condition
export const getWeatherCondition = (iconCode) => {
  const conditions = {
    "01d": "Clear Sky",
    "01n": "Clear Sky",
    "02d": "Few Clouds",
    "02n": "Few Clouds",
    "03d": "Scattered Clouds",
    "03n": "Scattered Clouds",
    "04d": "Broken Clouds",
    "04n": "Broken Clouds",
    "09d": "Shower Rain",
    "09n": "Shower Rain",
    "10d": "Rain",
    "10n": "Rain",
    "11d": "Thunderstorm",
    "11n": "Thunderstorm",
    "13d": "Snow",
    "13n": "Snow",
    "50d": "Mist",
    "50n": "Mist",
  };
  return conditions[iconCode] || "Unknown";
};
