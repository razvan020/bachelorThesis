"use client";

import React from "react";
import FlightSearchComponent from "@/components/FlightSearchComponent";
import NearbyFlightsSection from "@/components/NearbyFlightsSection";
import InfoCardsSection from "@/components/InfoCardsSection";

export default function HomePage() {
  return (
    <>
      {/* --- Enhanced Hero Section (keeping original video layout) --- */}
      <div
        className="modern-hero-section-simple container-fluid px-0 overflow-hidden"
        style={{ backgroundColor: "#000000" }}
      >
        {/* Subtle Background Elements (no overlay on video) */}
        <div className="hero-bg-elements-subtle position-absolute top-0 start-0 w-100 h-100">
          <div className="hero-floating-element-subtle hero-element-1"></div>
          <div className="hero-floating-element-subtle hero-element-2"></div>
        </div>

        <div
          className="row g-0 align-items-center position-relative overflow-hidden"
          style={{ minHeight: "75vh" }}
        >
          {/* Video Column - Original Layout Preserved */}
          <div className="col-12 col-md-6 col-lg-7">
            <video
              className="d-block w-100 align-middle"
              autoPlay
              loop
              muted
              playsInline
              style={{ maxHeight: "75vh", objectFit: "cover" }}
            >
              <source src="/video2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Enhanced Text Column */}
          <div className="hero-text-column col-12 col-md-6 col-lg-5 d-flex flex-column justify-content-center text-white position-relative z-2 px-3 py-5 p-md-4 ms-md-n5">
            {/* Trust Badge */}
            <div className="hero-badge-simple d-inline-flex align-items-center mb-3">
              <span className="badge-dot-simple"></span>
              <span className="badge-text-simple">
                Trusted by 2M+ travelers
              </span>
            </div>

            {/* Enhanced Title */}
            <h1 className="hero-title-enhanced fw-bold mb-3">
              Your Next
              <span className="hero-title-highlight-simple d-block">
                Adventure Awaits
              </span>
            </h1>

            {/* Enhanced Subtitle */}
            <p className="hero-subtitle-enhanced mb-4">
              Experience lightning-fast bookings, unbeatable deals, and the
              freedom to travel anywhere. Let us handle your flights, so you can
              focus on the journey.
            </p>

            {/* Enhanced CTA Button */}
            <div className="hero-cta-enhanced mb-4">
              <button className="btn hero-btn-modern btn-lg rounded-pill fw-semibold">
                <span className="btn-text">Start Your Journey</span>
                <div className="btn-icon-modern">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            </div>

            {/* Stats */}
            <div className="hero-stats-simple d-flex gap-3">
              <div className="stat-item-simple">
                <div className="stat-number-simple">2M+</div>
                <div className="stat-label-simple">Travelers</div>
              </div>
              <div className="stat-divider-simple"></div>
              <div className="stat-item-simple">
                <div className="stat-number-simple">190+</div>
                <div className="stat-label-simple">Countries</div>
              </div>
              <div className="stat-divider-simple"></div>
              <div className="stat-item-simple">
                <div className="stat-number-simple">4.9★</div>
                <div className="stat-label-simple">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODERN SEARCH SECTION --- */}
      <FlightSearchComponent />

      {/* --- Nearby Flights Section --- */}
      <NearbyFlightsSection />

      {/* --- Additional Info Cards Section --- */}
      <div className="container py-5">
        <InfoCardsSection />
      </div>
    </>
  );
}
