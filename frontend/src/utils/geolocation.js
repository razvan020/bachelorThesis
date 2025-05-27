// utils/geolocation.js - Create this file to share geolocation logic
export const getLocationFromIP = async () => {
  try {
    // Option 1: Try your backend proxy first (if you implement Solution 2)
    try {
      const response = await fetch("/api/geolocation/ip", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Backend geolocation success:", data);
        return data;
      }
    } catch (backendError) {
      console.log("Backend geolocation not available, trying alternatives...");
    }

    // Option 2: Try alternative services directly
    const alternatives = [
      {
        name: "ipinfo.io",
        url: "https://ipinfo.io/json",
        transform: (data) => ({
          country: data.country,
          city: data.city,
          region: data.region,
          coordinates: data.loc ? data.loc.split(",").map(Number) : null,
        }),
      },
      {
        name: "ip-api.com",
        url: "http://ip-api.com/json/",
        transform: (data) => ({
          country: data.countryCode,
          city: data.city,
          region: data.regionName,
          coordinates: [data.lat, data.lon],
        }),
      },
    ];

    for (const provider of alternatives) {
      try {
        console.log(`Trying ${provider.name}...`);
        const response = await fetch(provider.url, {
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          const transformed = provider.transform(data);
          console.log(`Success with ${provider.name}:`, transformed);
          return transformed;
        }
      } catch (error) {
        console.log(`${provider.name} failed:`, error.message);
        continue;
      }
    }

    throw new Error("All IP geolocation providers failed");
  } catch (error) {
    console.error("IP geolocation completely failed:", error);
    throw error;
  }
};

export const getBrowserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coordinates: [position.coords.latitude, position.coords.longitude],
          accuracy: position.coords.accuracy,
          source: "browser",
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false, // Faster response
        timeout: 8000, // 8 seconds
        maximumAge: 300000, // 5 minutes cache
      }
    );
  });
};

export const getLocationFromTimezone = () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log("User timezone:", timezone);

    // Map common timezones to country/airport codes
    const timezoneToLocation = {
      "Europe/Bucharest": { country: "RO", airport: "OTP", city: "Bucharest" },
      "Europe/London": { country: "GB", airport: "LHR", city: "London" },
      "Europe/Paris": { country: "FR", airport: "CDG", city: "Paris" },
      "Europe/Berlin": { country: "DE", airport: "BER", city: "Berlin" },
      "Europe/Rome": { country: "IT", airport: "FCO", city: "Rome" },
      "Europe/Madrid": { country: "ES", airport: "MAD", city: "Madrid" },
      "Europe/Amsterdam": { country: "NL", airport: "AMS", city: "Amsterdam" },
      "Europe/Vienna": { country: "AT", airport: "VIE", city: "Vienna" },
      "Europe/Zurich": { country: "CH", airport: "ZRH", city: "Zurich" },
      "America/New_York": { country: "US", airport: "JFK", city: "New York" },
      "America/Los_Angeles": {
        country: "US",
        airport: "LAX",
        city: "Los Angeles",
      },
      "America/Chicago": { country: "US", airport: "ORD", city: "Chicago" },
    };

    const locationInfo = timezoneToLocation[timezone];
    if (locationInfo) {
      return {
        country: locationInfo.country,
        city: locationInfo.city,
        airport: locationInfo.airport,
        source: "timezone",
        timezone: timezone,
      };
    }

    return null;
  } catch (error) {
    console.error("Timezone detection failed:", error);
    return null;
  }
};

// Combined location detection with multiple fallbacks
export const getLocation = async () => {
  try {
    // Method 1: Try IP geolocation first (works without user permission)
    console.log("Attempting IP geolocation...");
    const ipLocation = await getLocationFromIP();

    if (ipLocation && ipLocation.coordinates) {
      console.log("IP geolocation successful:", ipLocation);
      return {
        ...ipLocation,
        source: "ip",
      };
    }
  } catch (ipError) {
    console.log("IP geolocation failed, trying browser geolocation...");
  }

  try {
    // Method 2: Try browser geolocation
    console.log("Attempting browser geolocation...");
    const browserLocation = await getBrowserLocation();

    if (browserLocation && browserLocation.coordinates) {
      console.log("Browser geolocation successful:", browserLocation);
      return browserLocation;
    }
  } catch (browserError) {
    console.log("Browser geolocation failed, trying timezone detection...");
  }

  // Method 3: Try timezone-based detection
  const timezoneLocation = getLocationFromTimezone();
  if (timezoneLocation) {
    console.log("Timezone detection successful:", timezoneLocation);
    return timezoneLocation;
  }

  // Method 4: Final fallback - use default location
  console.log("All location methods failed, using default (Romania)");
  return {
    country: "RO",
    city: "Bucharest",
    airport: "OTP",
    source: "default",
  };
};

// Map country codes to airport codes
export const mapCountryToAirport = (countryCode) => {
  const countryToAirport = {
    US: "JFK",
    GB: "LHR",
    FR: "CDG",
    DE: "BER",
    IT: "FCO",
    ES: "MAD",
    CA: "YYZ",
    AU: "SYD",
    JP: "NRT",
    RO: "OTP",
    NL: "AMS",
    AT: "VIE",
    CH: "ZRH",
    // Add more mappings as needed
  };

  return countryToAirport[countryCode?.toUpperCase()] || "OTP"; // Default to Bucharest
};
