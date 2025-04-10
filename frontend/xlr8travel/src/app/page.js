"use client"; // Required for interactive components (useState)

import React, { useState, useEffect } from "react";
// Assuming CSS is imported globally or via CSS Modules
// import styles from './HomePage.module.css'; // Example for CSS Modules

export default function HomePage() {
  // --- State and functions (same as before) ---
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");

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
    const params = new URLSearchParams({
      origin,
      destination,
      departureDate,
      arrivalDate,
      adults,
      children,
      infants,
    });
    console.log("Search flights with:", params.toString());
    // window.location.href = `/getAvailableFlights?${params.toString()}`;
  };

  // Close dropdown if clicked outside (optional but good UX)
  useEffect(() => {
    const handleClickOutside = (event) => {
        // Check if the click is outside the dropdown trigger and content
        const dropdownBtn = document.getElementById('dropdownBtn');
        const dropdownContent = document.getElementById('dropdownContent');
        if (showDropdown && dropdownBtn && !dropdownBtn.contains(event.target) && dropdownContent && !dropdownContent.contains(event.target)) {
            setShowDropdown(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        // Clean up the event listener on component unmount
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]); // Only re-run if showDropdown changes

  return (
    <>
      {/* --- Hero Section (Assuming it's correct from previous step) --- */}
      <div className="container-fluid px-0 overflow-hidden" style={{ backgroundColor: "#000000" }}>
        <div className="row g-0 align-items-center" style={{ minHeight: '75vh' }}>
          <div className="col-lg-8 col-md-7">
            <video className="d-block w-100" autoPlay loop muted playsInline poster="/background.jpg">
              <source src="/video2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="col-lg-4 col-md-5 d-flex flex-column justify-content-center ps-md-4 pe-3 py-5 py-md-0 text-white ms-lg-n4 ms-md-n3 z-1"> {/* Adjusted negative margin/padding slightly */}
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
      <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa" }}> {/* Lighter background */}
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-11">
             {/* Form now uses custom classes */}
            <form
                id="flightSearchForm"
                method="get"
                className="modern-form-container" // Main container class
                onSubmit={handleSearchSubmit}
            >
                {/* Origin Input Group */}
                <div className="modern-input-group">
                    <label htmlFor="origin" className="modern-input-label">From</label>
                    <input
                        id="origin"
                        name="origin"
                        placeholder="City or airport"
                        className="modern-input" // Custom input class
                        required
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                    />
                </div>

                {/* Destination Input Group */}
                 <div className="modern-input-group">
                    <label htmlFor="destination" className="modern-input-label">To</label>
                    <input
                        id="destination"
                        name="destination"
                        placeholder="City or airport"
                        className="modern-input"
                        required
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />
                </div>

                {/* Departure Date Input Group */}
                <div className="modern-input-group">
                     <label htmlFor="departureDate" className="modern-input-label">Depart</label>
                    <input
                        type="date"
                        id="departureDate"
                        name="departureDate"
                        className="modern-input" // Custom class
                        required
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        // Add min attribute for usability
                        min={new Date().toISOString().split("T")[0]}
                    />
                </div>

                 {/* Arrival Date Input Group */}
                <div className="modern-input-group">
                     <label htmlFor="arrivalDate" className="modern-input-label">Return</label>
                    <input
                        type="date"
                        id="arrivalDate"
                        name="arrivalDate"
                        className="modern-input" // Custom class
                        required
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                        // Add min attribute based on departure date
                        min={departureDate || new Date().toISOString().split("T")[0]}
                    />
                </div>

                {/* Passengers Input Group */}
                <div className="modern-input-group">
                    <label htmlFor="dropdownBtn" className="modern-input-label">Passengers</label>
                    <div className="dropdown position-relative">
                        <button
                            className="modern-passenger-btn" // Custom button class
                            id="dropdownBtn"
                            type="button"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            {totalPassengersText()} {/* Display selected count */}
                        </button>
                        {/* Use Bootstrap classes + custom class for styling */}
                        <div
                            className={`dropdown-menu modern-dropdown-content shadow border bg-white p-3 mt-2 ${showDropdown ? 'show' : ''}`}
                            id="dropdownContent"
                            aria-labelledby="dropdownBtn"
                            style={{ /* Bootstrap 'show' class handles display, zIndex handled by .dropdown-menu */ minWidth: '280px', right: 0, left: 'auto' /* Align dropdown right */ }}
                            onClick={(e) => e.stopPropagation()} // Prevent close on click inside
                        >
                            {/* Passenger Type Rows */}
                             <div className="passenger-type d-flex justify-content-between align-items-center">
                                <label className="me-3">Adults <small className="text-muted">(14+)</small></label>
                                <div className="input-group input-group-sm" style={{ width: '120px' }}>
                                    <button type="button" className="btn btn-outline-secondary rounded-start" onClick={() => decrement("adults")}>-</button>
                                    <input type="text" value={adults} readOnly className="form-control text-center" style={{borderLeft: 0, borderRight: 0}}/>
                                    <button type="button" className="btn btn-outline-secondary rounded-end" onClick={() => increment("adults")}>+</button>
                                </div>
                            </div>
                            <div className="passenger-type d-flex justify-content-between align-items-center">
                                <label className="me-3">Children <small className="text-muted">(2-14)</small></label>
                                <div className="input-group input-group-sm" style={{ width: '120px' }}>
                                    <button type="button" className="btn btn-outline-secondary rounded-start" onClick={() => decrement("children")}>-</button>
                                    <input type="text" value={children} readOnly className="form-control text-center" style={{borderLeft: 0, borderRight: 0}}/>
                                    <button type="button" className="btn btn-outline-secondary rounded-end" onClick={() => increment("children")}>+</button>
                                </div>
                             </div>
                             <div className="passenger-type d-flex justify-content-between align-items-center">
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
                     <button
                        type="submit"
                        className="modern-search-btn" // Custom button class
                        >
                        Search
                    </button>
                </div>
            </form>
          </div>
        </div>
      </div>
    

      {/* --- Content Sections Start Here (Keep as is from previous version) --- */}
      <div className="container py-5">
        {/* Very Cool Packages Section */}
        <div className="row mb-4">
          <div className="col-12 text-center">
            <h2 className="fw-semibold">Very Cool Packages</h2>
          </div>
        </div>

        {/* Packages Card Row 1 */}
        <div className="row gy-4 justify-content-center">
          {/* Card 1: Bali */}
          <div className="col-lg-3 col-md-6 col-sm-10">
             <div className="card h-100 border-0 shadow">
                <img
                 src="https://images.unsplash.com/photo-1574080344876-1f4089ba07fe?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3"
                 className="card-img-top"
                 alt="Bali"
                 style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
               <div className="card-body d-flex flex-column">
                  <h5 className="card-title">Bali</h5>
                  <p className="card-text">
                    Discover the magic of Balis temples, beaches, and lush rice paddies.
                  </p>
                  <a href="#" className="btn btn-primary mt-auto">
                   Explore Package
                 </a>
                </div>
             </div>
          </div>
          {/* Card 2: Delta Dunarii */}
          <div className="col-lg-3 col-md-6 col-sm-10">
             <div className="card h-100 border-0 shadow">
                <img
                 src="/delta.jpg"
                 className="card-img-top"
                 alt="Delta Dunarii"
                 style={{ aspectRatio: '4/3', objectFit: 'cover' }}
               />
               <div className="card-body d-flex flex-column">
                  <h5 className="card-title">Delta Dunarii</h5>
                  <p className="card-text">
                    Experience the unique biodiversity and tranquility of the Danube Delta.
                 </p>
                 <a href="#" className="btn btn-primary mt-auto">
                   Explore Package
                 </a>
               </div>
              </div>
           </div>
          {/* Card 3: Malaysia */}
           <div className="col-lg-3 col-md-6 col-sm-10">
             <div className="card h-100 border-0 shadow">
               <img
                  src="https://images.unsplash.com/photo-1602427384420-71c70e2b2a2f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3"
                  className="card-img-top"
                  alt="Malaysia"
                  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">Malaysia</h5>
                  <p className="card-text">
                    Explore vibrant cities, stunning islands, and diverse cultures in Malaysia.
                  </p>
                  <a href="#" className="btn btn-primary mt-auto">
                   Explore Package
                  </a>
                </div>
              </div>
           </div>
          {/* Card 4: Grand Canyon */}
           <div className="col-lg-3 col-md-6 col-sm-10">
             <div className="card h-100 border-0 shadow">
               <img
                  src="https://images.unsplash.com/photo-1575527048208-6475b441e0a0?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3"
                  className="card-img-top"
                  alt="Grand Canyon"
                  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">Grand Canyon</h5>
                  <p className="card-text">
                    Witness the breathtaking scale and beauty of the Grand Canyon.
                 </p>
                 <a href="#" className="btn btn-primary mt-auto">
                   Explore Package
                 </a>
               </div>
             </div>
           </div>
        </div>

        {/* View All Packages Button */}
        <div className="row mt-5 mb-5">
          <div className="col-12 text-center">
             <button
               type="button"
               className="btn rounded-pill px-4 py-2 text-white fw-medium"
               style={{ backgroundColor: "#5DB4D0", fontSize: '1.1rem' }}
             >
               View All Packages
             </button>
           </div>
        </div>

        {/* Additional Info Cards Row 1 */}
        <div className="row gy-4 justify-content-center">
           {/* Card 5: Gift Voucher */}
           <div className="col-lg-4 col-md-6 col-sm-10">
             <div className="card h-100 rounded-4 border-0 shadow text-center">
               <img
                 src="https://images.unsplash.com/photo-1577042939454-8b29d442b402?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                 className="card-img-top rounded-4 rounded-bottom-0"
                 alt="Gift Voucher"
                 style={{ aspectRatio: '16/9', objectFit: 'cover' }}
               />
               <div className="card-body d-flex flex-column px-4 pb-4">
                 <h5 className="card-title">Gift Voucher</h5>
                 <p className="card-text mt-3">
                   Surprise your loved ones with the unforgettable gift of travel.
                 </p>
                 <a href="#" className="btn btn-outline-primary mt-auto">
                   Read More
                 </a>
               </div>
              </div>
           </div>
           {/* Card 6: Cancel */}
            <div className="col-lg-4 col-md-6 col-sm-10">
              <div className="card h-100 rounded-4 border-0 shadow text-center">
                <img
                  src="https://images.unsplash.com/photo-1542353436-312f0e1f67ff?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3"
                  className="card-img-top rounded-4 rounded-bottom-0"
                  alt="Cancel for any reason"
                  style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                 />
                 <div className="card-body d-flex flex-column px-4 pb-4">
                    <h5 className="card-title">Cancel for Any Reason</h5>
                   <p className="card-text mt-3">
                     Add flexibility to your plans. Cancel for a credit voucher, no questions asked.
                    </p>
                   <a href="#" className="btn btn-outline-primary mt-auto">
                     Read More
                   </a>
                 </div>
               </div>
            </div>
           {/* Card 7: Takeoff */}
           <div className="col-lg-4 col-md-6 col-sm-10">
             <div className="card h-100 rounded-4 border-0 shadow text-center">
               <img
                  src="https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                  className="card-img-top rounded-4 rounded-bottom-0"
                  alt="Get ready for takeoff"
                  style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                />
               <div className="card-body d-flex flex-column px-4 pb-4">
                 <h5 className="card-title">Get Ready for Takeoff</h5>
                 <p className="card-text mt-3">
                   Download our mobile app for seamless booking and travel management!
                  </p>
                 <a href="#" className="btn btn-outline-primary mt-auto">
                   Read More
                 </a>
               </div>
             </div>
           </div>
          </div>

        {/* Additional Info Cards Row 2 */}
        <div className="row gy-4 justify-content-center mt-4 mb-5">
          {/* Card 8: Inspiration */}
          <div className="col-lg-4 col-md-6 col-sm-10">
            <div className="card h-100 rounded-4 border-0 shadow text-center">
               <img
                 src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                 className="card-img-top rounded-4 rounded-bottom-0"
                 alt="Travel inspiration"
                 style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                />
               <div className="card-body d-flex flex-column px-4 pb-4">
                 <h5 className="card-title">
                    Looking for Travel Inspiration?
                  </h5>
                 <p className="card-text mt-3">
                   Explore our curated travel recommendations and guides.
                  </p>
                 <a href="#" className="btn btn-outline-primary mt-auto">
                   Read More
                 </a>
               </div>
             </div>
           </div>
          {/* Card 9: Sign up */}
          <div className="col-lg-4 col-md-6 col-sm-10">
            <div className="card h-100 rounded-4 border-0 shadow text-center">
               <img
                 src="https://images.unsplash.com/photo-1560439450-08c2a7979b15?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                 className="card-img-top rounded-4 rounded-bottom-0"
                 alt="Sign up"
                 style={{ aspectRatio: '16/9', objectFit: 'cover' }}
               />
               <div className="card-body d-flex flex-column px-4 pb-4">
                 <h5 className="card-title">Sign Up for xlr8 Deals</h5>
                 <p className="card-text mt-3">
                   Get the latest sales, exclusive deals, and travel news delivered to your inbox.
                  </p>
                 <a href="#" className="btn btn-outline-primary mt-auto">
                   Read More
                 </a>
               </div>
             </div>
           </div>
            {/* Card 10: Best Prices */}
          <div className="col-lg-4 col-md-6 col-sm-10">
            <div className="card h-100 rounded-4 border-0 shadow text-center">
               <img
                  src="https://t4.ftcdn.net/jpg/02/79/95/37/360_F_279953745_VjCCUq3EZDlNc4shp30ZrWbaHmcbDp9Y.jpg"
                  className="card-img-top rounded-4 rounded-bottom-0"
                  alt="Best Prices"
                  style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                />
               <div className="card-body d-flex flex-column px-4 pb-4">
                  <h5 className="card-title">Best Price Guarantee</h5>
                 <p className="card-text mt-3">
                   Find a better fare online? We'll beat it by 10%. Travel confidently with xlr8.
                  </p>
                 <a href="#" className="btn btn-outline-primary mt-auto">
                   Read More
                 </a>
               </div>
             </div>
           </div>
         </div>

      </div> {/* End container */}
    </>
  );
}