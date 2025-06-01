"use client";

import React, { useEffect, useState } from "react";
import {
  FaTemperatureHigh,
  FaWind,
  FaTint,
  FaEye,
  FaCompressArrowsAlt,
  FaSun,
  FaMoon,
  FaCloud,
  FaCloudRain,
  FaBolt,
  FaSnowflake,
  FaSmog,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  getWeatherWithLocationFallback,
  getWeatherForecast,
  getWeatherCondition,
} from "@/utils/weatherService";
import { useAppTheme } from "@/contexts/ThemeContext";

const WeatherInfo = ({
  city,
  country,
  showForecast = true,
  compact = false,
}) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useAppTheme();

  // Get weather icon component
  const getWeatherIcon = (iconCode, size = "2rem") => {
    const iconMap = {
      "01d": <FaSun style={{ color: "#FFA500", fontSize: size }} />,
      "01n": <FaMoon style={{ color: "#FFD700", fontSize: size }} />,
      "02d": <FaCloud style={{ color: "#87CEEB", fontSize: size }} />,
      "02n": <FaCloud style={{ color: "#708090", fontSize: size }} />,
      "03d": <FaCloud style={{ color: "#778899", fontSize: size }} />,
      "03n": <FaCloud style={{ color: "#696969", fontSize: size }} />,
      "04d": <FaCloud style={{ color: "#696969", fontSize: size }} />,
      "04n": <FaCloud style={{ color: "#2F4F4F", fontSize: size }} />,
      "09d": <FaCloudRain style={{ color: "#4682B4", fontSize: size }} />,
      "09n": <FaCloudRain style={{ color: "#483D8B", fontSize: size }} />,
      "10d": <FaCloudRain style={{ color: "#1E90FF", fontSize: size }} />,
      "10n": <FaCloudRain style={{ color: "#191970", fontSize: size }} />,
      "11d": <FaBolt style={{ color: "#FFD700", fontSize: size }} />,
      "11n": <FaBolt style={{ color: "#DAA520", fontSize: size }} />,
      "13d": <FaSnowflake style={{ color: "#00BFFF", fontSize: size }} />,
      "13n": <FaSnowflake style={{ color: "#4169E1", fontSize: size }} />,
      "50d": <FaSmog style={{ color: "#A0A0A0", fontSize: size }} />,
      "50n": <FaSmog style={{ color: "#808080", fontSize: size }} />,
    };
    return (
      iconMap[iconCode] || (
        <FaCloud style={{ color: "#87CEEB", fontSize: size }} />
      )
    );
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        console.log("Fetching weather for:", { city, country });
        setLoading(true);
        setError(null);

        const weatherData = await getWeatherWithLocationFallback(city, country);
        console.log("Weather data received:", weatherData);

        if (weatherData) {
          setWeather(weatherData);

          // Fetch forecast if requested
          if (showForecast) {
            try {
              const forecastData = await getWeatherForecast(city, country);
              setForecast(forecastData);
            } catch (forecastError) {
              console.warn("Forecast fetch failed:", forecastError);
              // Don't fail the whole component for forecast
            }
          }
        } else {
          setError("No weather data available");
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError(err.message || "Failed to load weather information");
      } finally {
        setLoading(false);
      }
    };

    if (city && country) {
      fetchWeather();
    } else {
      setError("City and country are required");
      setLoading(false);
    }
  }, [city, country, showForecast]);

  // Compact version for smaller spaces
  if (compact) {
    if (loading) {
      return (
        <div className="weather-compact loading">
          <div className="loading-spinner-compact"></div>
          <span>Loading...</span>
        </div>
      );
    }

    if (error || !weather) {
      return (
        <div className="weather-compact error">
          <FaMapMarkerAlt />
          <span>Weather unavailable</span>
        </div>
      );
    }

    return (
      <>
        <div className="weather-compact">
          <div className="weather-icon-compact">
            {getWeatherIcon(weather.icon, "1.5rem")}
          </div>
          <div className="weather-info-compact">
            <span className="temp-compact">{weather.temperature}°C</span>
            <span className="desc-compact">{weather.description}</span>
          </div>
        </div>
        <style jsx>{`
          .weather-compact {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            background: ${isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.03)"};
            border: 1px solid
              ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"};
            border-radius: 12px;
            transition: all 0.3s ease;
          }

          .weather-compact.loading,
          .weather-compact.error {
            justify-content: center;
            min-width: 150px;
          }

          .weather-compact:hover {
            background: ${isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.05)"};
            border-color: #ff6f00;
          }

          .loading-spinner-compact {
            width: 16px;
            height: 16px;
            border: 2px solid
              ${isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"};
            border-top: 2px solid #ff6f00;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          .weather-icon-compact {
            flex-shrink: 0;
          }

          .weather-info-compact {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .temp-compact {
            font-weight: 700;
            color: ${isDark ? "#ffffff" : "#000000"};
            font-size: 0.9rem;
          }

          .desc-compact {
            font-size: 0.75rem;
            color: ${isDark
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.7)"};
            text-transform: capitalize;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <>
        <div className="modern-weather-card loading">
          <div className="loading-content">
            <div className="weather-loading-spinner"></div>
            <div className="loading-text">
              <h4>Getting weather data...</h4>
              <p>Fetching current conditions for {city}</p>
            </div>
          </div>
        </div>
        <style jsx>{`
          .modern-weather-card.loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 300px;
            text-align: center;
          }

          .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            color: ${isDark
              ? "rgba(255, 255, 255, 0.8)"
              : "rgba(0, 0, 0, 0.8)"};
          }

          .weather-loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid
              ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
            border-top: 4px solid #ff6f00;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          .loading-text h4 {
            margin: 0;
            color: ${isDark ? "#ffffff" : "#000000"};
            font-size: 1.25rem;
            font-weight: 600;
          }

          .loading-text p {
            margin: 0.5rem 0 0 0;
            color: ${isDark
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.7)"};
            font-size: 0.95rem;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  }

  // Error state
  if (error || !weather) {
    return (
      <>
        <div className="modern-weather-card error">
          <div className="error-content">
            <div className="error-icon">🌤️</div>
            <div className="error-text">
              <h4>Weather Unavailable</h4>
              <p>{error || "Unable to fetch weather data"}</p>
              <small>
                Location: {city}, {country}
              </small>
            </div>
          </div>
        </div>
        <style jsx>{`
          .modern-weather-card.error {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 300px;
            text-align: center;
          }

          .error-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            color: ${isDark
              ? "rgba(255, 255, 255, 0.8)"
              : "rgba(0, 0, 0, 0.8)"};
          }

          .error-icon {
            font-size: 3rem;
            opacity: 0.7;
          }

          .error-text h4 {
            margin: 0;
            color: ${isDark ? "#ffffff" : "#000000"};
            font-size: 1.2rem;
            font-weight: 600;
          }

          .error-text p {
            margin: 0.5rem 0;
            color: ${isDark
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.7)"};
          }

          .error-text small {
            color: ${isDark
              ? "rgba(255, 255, 255, 0.5)"
              : "rgba(0, 0, 0, 0.5)"};
            font-size: 0.85rem;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="modern-weather-card">
        {/* Main Weather Display */}
        <div className="weather-hero">
          <div className="weather-location">
            <FaMapMarkerAlt className="location-icon" />
            <div className="location-text">
              <h3>{weather.location}</h3>
              <p>{weather.country}</p>
            </div>
          </div>

          <div className="weather-main">
            <div className="weather-icon-large">
              {getWeatherIcon(weather.icon, "4rem")}
            </div>
            <div className="weather-primary">
              <div className="temperature-display">
                <span className="temp-main">{weather.temperature}</span>
                <span className="temp-unit">°C</span>
              </div>
              <div className="weather-desc">
                {getWeatherCondition(weather.icon)}
              </div>
              <div className="feels-like">Feels like {weather.feelsLike}°C</div>
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="weather-details-grid">
          <div className="detail-item humidity">
            <div className="detail-icon">
              <FaTint />
            </div>
            <div className="detail-info">
              <span className="detail-value">{weather.humidity}%</span>
              <span className="detail-label">Humidity</span>
            </div>
          </div>

          <div className="detail-item wind">
            <div className="detail-icon">
              <FaWind />
            </div>
            <div className="detail-info">
              <span className="detail-value">{weather.windSpeed} m/s</span>
              <span className="detail-label">Wind Speed</span>
            </div>
          </div>

          <div className="detail-item pressure">
            <div className="detail-icon">
              <FaCompressArrowsAlt />
            </div>
            <div className="detail-info">
              <span className="detail-value">{weather.pressure} hPa</span>
              <span className="detail-label">Pressure</span>
            </div>
          </div>

          {weather.visibility && (
            <div className="detail-item visibility">
              <div className="detail-icon">
                <FaEye />
              </div>
              <div className="detail-info">
                <span className="detail-value">{weather.visibility} km</span>
                <span className="detail-label">Visibility</span>
              </div>
            </div>
          )}
        </div>

        {/* Sun Times */}
        {weather.sunrise && weather.sunset && (
          <div className="sun-times">
            <div className="sun-time">
              <FaSun className="sun-icon sunrise" />
              <div className="sun-info">
                <span className="sun-label">Sunrise</span>
                <span className="sun-value">
                  {weather.sunrise.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="sun-time">
              <FaMoon className="sun-icon sunset" />
              <div className="sun-info">
                <span className="sun-label">Sunset</span>
                <span className="sun-value">
                  {weather.sunset.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {showForecast && forecast && forecast.length > 0 && (
          <div className="weather-forecast">
            <div className="forecast-header">
              <FaCalendarAlt className="forecast-icon" />
              <h4>5-Day Forecast</h4>
            </div>
            <div className="forecast-grid">
              {forecast.map((day, index) => (
                <div key={index} className="forecast-day">
                  <div className="forecast-date">
                    {day.date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="forecast-icon">
                    {getWeatherIcon(day.icon, "1.5rem")}
                  </div>
                  <div className="forecast-temps">
                    <span className="temp-high">
                      {day.tempMax || day.temperature}°
                    </span>
                    <span className="temp-low">
                      {day.tempMin || day.temperature - 3}°
                    </span>
                  </div>
                  <div className="forecast-desc">{day.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .modern-weather-card {
          background: linear-gradient(
            145deg,
            ${isDark ? "rgba(0, 0, 0, 0.9)" : "rgba(255, 255, 255, 0.95)"} 0%,
            ${isDark ? "rgba(20, 20, 20, 0.8)" : "rgba(248, 250, 252, 0.9)"}
              100%
          );
          backdrop-filter: blur(20px);
          border: 1px solid
            ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 20px 40px -12px ${isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.08)"},
            0 0 0 1px
              ${isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.8)"},
            inset 0 1px 0
              ${isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(255, 255, 255, 0.9)"};
          margin: 1.5rem 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .modern-weather-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff6f00, #ffa726, #ffb74d);
          border-radius: 24px 24px 0 0;
        }

        .modern-weather-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 32px 64px -12px ${isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.15)"},
            0 0 0 1px
              ${isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(255, 255, 255, 0.9)"},
            inset 0 1px 0
              ${isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 1)"};
        }

        /* Weather Hero Section */
        .weather-hero {
          margin-bottom: 2rem;
        }

        .weather-location {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .location-icon {
          color: #ff6f00;
          font-size: 1.1rem;
        }

        .location-text h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: ${isDark ? "#ffffff" : "#000000"};
          line-height: 1.2;
        }

        .location-text p {
          margin: 0;
          font-size: 0.9rem;
          color: ${isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"};
        }

        .weather-main {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .weather-icon-large {
          flex-shrink: 0;
          padding: 1rem;
          background: ${isDark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.03)"};
          border-radius: 20px;
          border: 1px solid
            ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"};
        }

        .weather-primary {
          flex: 1;
        }

        .temperature-display {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .temp-main {
          font-size: 4rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ff6f00 0%, #ffa726 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .temp-unit {
          font-size: 1.5rem;
          font-weight: 600;
          color: ${isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"};
        }

        .weather-desc {
          font-size: 1.1rem;
          font-weight: 600;
          color: ${isDark ? "#ffffff" : "#000000"};
          text-transform: capitalize;
          margin-bottom: 0.25rem;
        }

        .feels-like {
          font-size: 0.9rem;
          color: ${isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"};
        }

        /* Weather Details Grid */
        .weather-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: ${isDark
            ? "rgba(255, 255, 255, 0.03)"
            : "rgba(0, 0, 0, 0.02)"};
          border: 1px solid
            ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"};
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .detail-item:hover {
          background: ${isDark
            ? "rgba(255, 255, 255, 0.06)"
            : "rgba(0, 0, 0, 0.04)"};
          border-color: ${isDark
            ? "rgba(255, 255, 255, 0.15)"
            : "rgba(0, 0, 0, 0.1)"};
          transform: translateY(-2px);
        }

        .detail-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${isDark
            ? "rgba(255, 111, 0, 0.15)"
            : "rgba(255, 111, 0, 0.1)"};
          border-radius: 12px;
          color: #ff6f00;
          font-size: 1.1rem;
        }

        .detail-info {
          display: flex;
          flex-direction: column;
        }

        .detail-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: ${isDark ? "#ffffff" : "#000000"};
          line-height: 1.2;
        }

        .detail-label {
          font-size: 0.8rem;
          color: ${isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        /* Sun Times */
        .sun-times {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(
            135deg,
            ${isDark ? "rgba(255, 193, 7, 0.1)" : "rgba(255, 193, 7, 0.05)"} 0%,
            ${isDark ? "rgba(255, 152, 0, 0.1)" : "rgba(255, 152, 0, 0.05)"}
              100%
          );
          border: 1px solid
            ${isDark ? "rgba(255, 193, 7, 0.2)" : "rgba(255, 193, 7, 0.15)"};
          border-radius: 16px;
        }

        .sun-time {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sun-icon {
          font-size: 1.5rem;
        }

        .sun-icon.sunrise {
          color: #ffa726;
        }

        .sun-icon.sunset {
          color: #ff7043;
        }

        .sun-info {
          display: flex;
          flex-direction: column;
        }

        .sun-label {
          font-size: 0.8rem;
          color: ${isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sun-value {
          font-size: 1rem;
          font-weight: 600;
          color: ${isDark ? "#ffffff" : "#000000"};
        }

        /* Forecast Section */
        .weather-forecast {
          border-top: 1px solid
            ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
          padding-top: 2rem;
        }

        .forecast-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .forecast-icon {
          color: #ff6f00;
          font-size: 1.1rem;
        }

        .forecast-header h4 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: ${isDark ? "#ffffff" : "#000000"};
        }

        .forecast-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }

        .forecast-day {
          text-align: center;
          padding: 1.25rem 0.75rem;
          background: ${isDark
            ? "rgba(255, 255, 255, 0.03)"
            : "rgba(0, 0, 0, 0.02)"};
          border: 1px solid
            ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"};
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .forecast-day:hover {
          background: ${isDark
            ? "rgba(255, 255, 255, 0.06)"
            : "rgba(0, 0, 0, 0.04)"};
          border-color: #ff6f00;
          transform: translateY(-4px);
        }

        .forecast-date {
          font-size: 0.8rem;
          font-weight: 600;
          color: ${isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"};
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .forecast-icon {
          margin-bottom: 0.75rem;
          height: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .forecast-temps {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .temp-high {
          font-weight: 700;
          color: ${isDark ? "#ffffff" : "#000000"};
          font-size: 0.95rem;
        }

        .temp-low {
          font-weight: 500;
          color: ${isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"};
          font-size: 0.95rem;
        }

        .forecast-desc {
          font-size: 0.75rem;
          color: ${isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"};
          text-transform: capitalize;
          line-height: 1.2;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modern-weather-card {
            padding: 1.5rem;
            margin: 1rem 0;
          }

          .weather-main {
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
          }

          .temp-main {
            font-size: 3rem;
          }

          .weather-details-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }

          .detail-item {
            padding: 1rem;
          }

          .sun-times {
            flex-direction: column;
            gap: 1rem;
          }

          .forecast-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .forecast-grid .forecast-day:nth-child(n + 4) {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .modern-weather-card {
            padding: 1.25rem;
          }

          .temp-main {
            font-size: 2.5rem;
          }

          .weather-details-grid {
            grid-template-columns: 1fr;
          }

          .forecast-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .forecast-grid .forecast-day:nth-child(n + 3) {
            display: none;
          }

          .weather-compact {
            padding: 0.5rem 0.75rem;
            gap: 0.5rem;
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default WeatherInfo;
