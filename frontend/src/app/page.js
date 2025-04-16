"use client";

import React from "react"; // Removed unused hooks if only used for deleted sections
import FlightSearchComponent from "@/components/FlightSearchComponent";
import PackagesSection from "@/components/PackagesSection";
import InfoCardsSection from "@/components/InfoCardsSection"; // <-- Import the new component

// --- Sample Package Data (Keep as is or fetch) ---
const samplePackages = [
  // ... (your package data here)
   {
    id: 'bali',
    title: 'Bali',
    description: 'Discover the magic of Balis temples, beaches, and lush rice paddies.',
    imageUrl: 'https://images.unsplash.com/photo-1574080344876-1f4089ba07fe?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3',
    link: '/packages/bali' // Example link
  },
  {
    id: 'delta',
    title: 'Delta Dunarii',
    description: 'Experience the unique biodiversity and tranquility of the Danube Delta.',
    imageUrl: '/delta.jpg', // Ensure this image is in your public folder
    link: '/packages/delta'
  },
  {
    id: 'malaysia',
    title: 'Malaysia',
    description: 'Explore vibrant cities, stunning islands, and diverse cultures in Malaysia.',
    imageUrl: 'https://images.unsplash.com/photo-1602427384420-71c70e2b2a2f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3',
    link: '/packages/malaysia'
  },
  {
    id: 'canyon',
    title: 'Grand Canyon',
    description: 'Witness the breathtaking scale and beauty of the Grand Canyon.',
    imageUrl: 'https://images.unsplash.com/photo-1575527048208-6475b441e0a0?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3',
    link: '/packages/grand-canyon'
  }
];
// --- End Sample Data ---


export default function HomePage() {
  // No state needed here unless other interactive elements exist on HomePage

  return (
    <>
      {/* --- Hero Section --- */}
      <div className="container-fluid px-0 overflow-hidden" style={{ backgroundColor: "#000000" }}>
        <div className="row g-0 align-items-center position-relative overflow-hidden" style={{ minHeight: '75vh' }}>
            {/* Video Column */}
           <div className="col-12 col-md-6 col-lg-7">
            <video
              className={`d-block w-100 align-middle`}
              autoPlay
              loop
              muted
              playsInline
              style={{ maxHeight: '75vh', objectFit: 'cover' }}
            >
              <source src="/video2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
           {/* Text Column */}
           <div
            className={
              "col-12 col-md-6 col-lg-5 " +
              "d-flex flex-column justify-content-center " +
              "text-white position-relative z-2 " +
              "px-3 py-5 p-md-4 " +
              "ms-md-n5"
            }
            style={{ maxWidth: '480px', marginRight: 0 }}
          >
            <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}>
              Your Next Adventure Awaits
            </h1>
            <p className="mb-4" style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", lineHeight: "1.5" }}>
              Experience lightning-fast bookings, unbeatable deals,
              and the freedom to travel anywhere.
              Let us handle your flights, so you can focus on the journey.
            </p>
            <a href="#" className="btn btn-lg rounded-pill fw-semibold" style={{ alignSelf: 'flex-start', backgroundColor: "#FF6F00", color: "white" }}>
              Book Now
            </a>
          </div>
        </div>
      </div>

      {/* --- MODERN SEARCH SECTION --- */}
      <FlightSearchComponent />


      {/* --- Packages Section --- */}
      <PackagesSection packages={samplePackages} />


      {/* --- Additional Info Cards Section --- */}
      {/* Render the new InfoCardsSection component inside the container */}
      <div className="container py-5">
        <InfoCardsSection />
      </div> {/* End container for info cards */}

    </>
  );
}