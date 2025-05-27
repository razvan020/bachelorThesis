"use client";
import React, { useState } from "react";

const FlightBookingApp = () => {
  const [activeFilter, setActiveFilter] = useState("All offers");
  const [expandedCards, setExpandedCards] = useState({});

  const flights = [
    {
      id: 1,
      destination: "Budapest",
      image:
        "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&h=300&fit=crop",
      dates: "31 May - 7 Jun",
      passengers: 1,
      duration: "1h 30m",
      regularPrice: 258,
      discountPrice: 258,
      isNew: true,
    },
    {
      id: 2,
      destination: "London Luton",
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop",
      dates: "12 Jun - 19 Jun",
      passengers: 1,
      duration: "3h 20m",
      regularPrice: 288,
      discountPrice: 235,
      isNew: true,
    },
    {
      id: 3,
      destination: "Naples",
      image:
        "https://images.unsplash.com/photo-1534445538923-ab38438550d5?w=400&h=300&fit=crop",
      dates: "12 Jun - 19 Jun",
      passengers: 1,
      duration: "2h 0m",
      regularPrice: 298,
      discountPrice: 245,
      isNew: false,
    },
    {
      id: 4,
      destination: "Kraków",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      dates: "15 Jun - 22 Jun",
      passengers: 1,
      duration: "1h 35m",
      regularPrice: 318,
      discountPrice: 212,
      isNew: false,
    },
    {
      id: 5,
      destination: "Warsaw Chopin",
      image:
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
      dates: "10 Jun - 17 Jun",
      passengers: 1,
      duration: "1h 55m",
      regularPrice: 318,
      discountPrice: 212,
      isNew: true,
    },
    {
      id: 6,
      destination: "Wrocław",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      dates: "23 Jul - 30 Jul",
      passengers: 1,
      duration: "1h 55m",
      regularPrice: 318,
      discountPrice: 212,
      isNew: true,
    },
    {
      id: 7,
      destination: "Abu Dhabi",
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
      dates: "2 Jun - 9 Jun",
      passengers: 1,
      duration: "4h 55m",
      regularPrice: 738,
      discountPrice: 632,
      isNew: true,
    },
  ];

  const filters = ["All offers", "Promotion", "New"];

  const toggleExpanded = (cardId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const FlightCard = ({ flight }) => {
    const isExpanded = expandedCards[flight.id];

    return (
      <div className="flight-card">
        <img
          src={flight.image}
          alt={flight.destination}
          className="destination-image"
        />
        <div className="flight-info">
          <div className="destination-name">
            {flight.destination}
            {flight.isNew && <span className="new-badge">New</span>}
          </div>
          <div className="flight-details">
            <div className="detail-item">📅 {flight.dates}</div>
            <div className="detail-item">👤 {flight.passengers}</div>
            <div className="detail-item">↩️ Return</div>
            <div className="detail-item">⏱️ {flight.duration}</div>
          </div>
        </div>
        <div className="pricing">
          <div className="regular-price">
            <div className="price-label">Regular price</div>
            <div className="price">from lei {flight.regularPrice}</div>
          </div>
          <div className="discount-section">
            <div className="wizz-logo">WIZZ DISCOUNT CLUB</div>
            <div className="discount-price-value">
              from lei {flight.discountPrice}
            </div>
          </div>
        </div>
        <button
          className="expand-btn"
          onClick={() => toggleExpanded(flight.id)}
          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ⌄
        </button>
      </div>
    );
  };

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #2d1b82 0%, #1e40af 100%)",
            padding: "30px",
            color: "white",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 300,
              marginBottom: "20px",
              background: "linear-gradient(45deg, #ffffff, #e0e7ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Cheap flights from Bucharest Baneasa
          </h1>

          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: "12px 24px",
                  border: `2px solid ${
                    activeFilter === filter ? "white" : "rgba(255,255,255,0.3)"
                  }`,
                  background: `${
                    activeFilter === filter
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.1)"
                  }`,
                  color: "white",
                  borderRadius: "50px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== filter) {
                    e.target.style.background = "rgba(255,255,255,0.2)";
                    e.target.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== filter) {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                    e.target.style.transform = "translateY(0px)";
                  }
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <button
              style={{
                padding: "12px 20px",
                border: "2px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                borderRadius: "25px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
              }}
            >
              <span>📤</span> Share
            </button>
            <button
              style={{
                padding: "12px 20px",
                border: "2px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                borderRadius: "25px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
              }}
            >
              <span>↕️</span> Sort by: Price low to high
            </button>
          </div>
        </div>

        {/* Flight Results */}
        <div style={{ padding: "30px" }}>
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .flight-card {
          display: block;
          padding: 0;
          margin-bottom: 20px;
          border-radius: 15px;
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .flight-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .flight-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .flight-card:hover::before {
          opacity: 1;
        }

        .destination-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .flight-card:hover .destination-image {
          transform: scale(1.05);
        }

        .flight-info {
          padding: 20px;
        }

        .destination-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .new-badge {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .flight-details {
          color: #666;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.85rem;
          margin-bottom: 15px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .pricing {
          padding: 0 20px 20px 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .regular-price,
        .discount-price {
          margin-bottom: 0;
        }

        .price-label {
          font-size: 0.8rem;
          color: #888;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .price {
          font-size: 1.2rem;
          font-weight: 700;
          color: #333;
        }

        .discount-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .wizz-logo {
          background: linear-gradient(45deg, #e91e63, #9c27b0);
          color: white;
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .discount-price-value {
          font-size: 1.4rem;
          font-weight: 800;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .expand-btn {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #666;
          transition: transform 0.3s ease;
          padding: 5px;
        }

        .expand-btn:hover {
          color: #333;
        }

        @media (max-width: 768px) {
          .pricing {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }

          .discount-section {
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default FlightBookingApp;
