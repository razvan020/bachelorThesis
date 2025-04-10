"use client"; // Required for interactive components (useState)

import React, { useState } from "react";

export default function HomePage() {
  // State for passenger counts
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  // Toggle for passenger dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  // Input fields for flight search
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");

  // Helper functions for increment/decrement
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

  // Returns the "1 adult, 2 children..." text
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

  // Handle the "Search" form submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // Construct URL parameters or handle them as needed
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
    // Optionally redirect or do a fetch
    // window.location.href = `/getAvailableFlights?${params.toString()}`;
  };

  return (
    <>
      {/* Hero Section: Video and Text side-by-side */}
      <div
        className="container-fluid px-0"
        style={{ backgroundColor: "#000000" }}
      >
        <div
          className="row g-0 align-items-center"
          style={{ minHeight: "75vh" }}
        >
          {" "}
          {/* Adjust minHeight as needed */}
          {/* Video Column (adjust col sizes as needed) */}
          <div className="col-lg-8 col-md-7">
            <video
              className="d-block w-100" // Use w-100 to fill column
              autoPlay
              loop
              muted
              playsInline
              poster="/background.jpg"
            >
              <source src="/video2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {/* Text Column (adjust col sizes as needed) */}
          <div className="col-lg-4 col-md-5 d-flex flex-column justify-content-center ps-md-4 pe-3 py-5 py-md-0 text-white z-1">
            {" "}
            {/* Added semi-transparent background */}
            {/* Removed absolute positioning styles */}
            <h1
              className="fw-bold mb-3"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}
            >
              {" "}
              {/* Responsive font size */}
              Your Next Adventure Awaits
            </h1>
            <p
              className="mb-4"
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                lineHeight: "1.5",
              }}
            >
              {" "}
              {/* Responsive font size */}
              Experience lightning-fast bookings, unbeatable deals, and the
              freedom to travel anywhere. Let us handle your flights, so you can
              focus on the journey.
            </p>
            <a
              href="#"
              className="btn btn-lg rounded-pill fw-semibold"
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#FF6F00",
                color: "white",
              }} // Keeps button aligned left
            >
              Book Now
            </a>
          </div>
        </div>
      </div>
      {/* SEARCH SECTION - Now in normal flow */}
      <div className="container-fluid bg-light py-4">
        {" "}
        {/* Added background and padding */}
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-11">
            {" "}
            {/* Control overall width */}
            <div className="shadow p-3 rounded">
              {" "}
              {/* Added padding and rounded corners */}
              <form
                id="flightSearchForm"
                method="get"
                className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-3" // Stack vertically on small, row on large
                onSubmit={handleSearchSubmit}
              >
                {/* Input Group 1: Origin/Destination */}
                <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1">
                  <input
                    id="origin"
                    name="origin"
                    placeholder="Origin"
                    className="form-control rounded-0 text-center" // Removed bg-light (already on parent)
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                  <input
                    id="destination"
                    name="destination"
                    placeholder="Destination"
                    className="form-control rounded-0 text-center"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                {/* Input Group 2: Dates */}
                <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1">
                  <input
                    type="date"
                    id="departureDate"
                    name="departureDate"
                    className="form-control rounded-0 text-center"
                    placeholder="Departure"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                  />
                  <input
                    type="date"
                    id="arrivalDate"
                    name="arrivalDate"
                    className="form-control rounded-0 text-center"
                    placeholder="Return"
                    required
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                  />
                </div>

                {/* Input Group 3: Passengers */}
                <div className="dropdown position-relative">
                  {" "}
                  {/* Ensure dropdown position context */}
                  <button
                    className="btn btn-outline-secondary dropdown-btn w-100 text-start" // Bootstrap button styling
                    id="dropdownBtn"
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{ minWidth: "220px" }} // Adjust min-width as needed
                  >
                    Passengers:{" "}
                    <span id="totalPassengers">{totalPassengersText()}</span>
                  </button>
                  <div
                    className="dropdown-content position-absolute bg-white border shadow p-3 rounded mt-1" // Bootstrap dropdown styling
                    id="dropdownContent"
                    style={{
                      display: showDropdown ? "block" : "none",
                      zIndex: 1050, // High z-index for dropdowns
                      minWidth: "250px", // Ensure dropdown is wide enough
                      right: 0, // Align to the right if needed, or remove for default left alignment
                      left: 0, // Align to the left edge of the button
                    }}
                  >
                    {/* Passenger Type Rows */}
                    <div className="passenger-type d-flex justify-content-between align-items-center mb-2">
                      <label className="me-3">Adults (14+)</label>
                      <div
                        className="input-group input-group-sm"
                        style={{ width: "120px" }}
                      >
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => decrement("adults")}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={adults}
                          readOnly
                          className="form-control text-center"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => increment("adults")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="passenger-type d-flex justify-content-between align-items-center mb-2">
                      <label className="me-3">Children (2-14)</label>
                      <div
                        className="input-group input-group-sm"
                        style={{ width: "120px" }}
                      >
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => decrement("children")}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={children}
                          readOnly
                          className="form-control text-center"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => increment("children")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="passenger-type d-flex justify-content-between align-items-center">
                      <label className="me-3">Infants (0-2)</label>
                      <div
                        className="input-group input-group-sm"
                        style={{ width: "120px" }}
                      >
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => decrement("infants")}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={infants}
                          readOnly
                          className="form-control text-center"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => increment("infants")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="btn rounded-pill search-btn fw-bold px-4 py-2"
                  style={{ backgroundColor: "#FF6F00", color: "white" }}
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* --- Content Sections Start Here --- */}
      <div className="container py-5">
        {/* Very Cool Packages Section */}
        <div className="row mb-4">
          {" "}
          {/* Added bottom margin */}
          <div className="col-12 text-center">
            <h2 className="fw-semibold">Very Cool Packages</h2>{" "}
            {/* Use h2 for semantics */}
          </div>
        </div>

        {/* Packages Card Row 1 */}
        <div className="row gy-4 justify-content-center">
          {/* Card 1: Bali */}
          <div className="col-lg-3 col-md-6 col-sm-10">
            <div className="card h-100 border-0 shadow">
              <img
                src="https://images.unsplash.com/photo-1574080344876-1f4089ba07fe?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3" // Adjusted width query
                className="card-img-top"
                alt="Bali"
                style={{ aspectRatio: "4/3", objectFit: "cover" }} // Maintain aspect ratio
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Bali</h5>
                <p className="card-text">
                  Discover the magic of Balis temples, beaches, and lush rice
                  paddies.
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
                src="/delta.jpg" // Assuming this image exists in your public folder
                className="card-img-top"
                alt="Delta Dunarii"
                style={{ aspectRatio: "4/3", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Delta Dunarii</h5>
                <p className="card-text">
                  Experience the unique biodiversity and tranquility of the
                  Danube Delta.
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
                style={{ aspectRatio: "4/3", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Malaysia</h5>
                <p className="card-text">
                  Explore vibrant cities, stunning islands, and diverse cultures
                  in Malaysia.
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
                style={{ aspectRatio: "4/3", objectFit: "cover" }}
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
            {/* Use an actual button or link */}
            <button
              type="button"
              className="btn rounded-pill px-4 py-2 text-white fw-medium" // Rounded-pill, more padding, white text
              style={{ backgroundColor: "#5DB4D0", fontSize: "1.1rem" }}
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
                style={{ aspectRatio: "16/9", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column px-4 pb-4">
                {" "}
                {/* Added padding */}
                <h5 className="card-title">Gift Voucher</h5>
                <p className="card-text mt-3">
                  Surprise your loved ones with the unforgettable gift of
                  travel.
                </p>
                <a href="#" className="btn btn-outline-primary mt-auto">
                  {" "}
                  {/* Changed style */}
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
                style={{ aspectRatio: "16/9", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column px-4 pb-4">
                <h5 className="card-title">Cancel for Any Reason</h5>
                <p className="card-text mt-3">
                  Add flexibility to your plans. Cancel for a credit voucher, no
                  questions asked.
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
                style={{ aspectRatio: "16/9", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column px-4 pb-4">
                <h5 className="card-title">Get Ready for Takeoff</h5>
                <p className="card-text mt-3">
                  Download our mobile app for seamless booking and travel
                  management!
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
          {" "}
          {/* Added margin */}
          {/* Card 8: Inspiration */}
          <div className="col-lg-4 col-md-6 col-sm-10">
            <div className="card h-100 rounded-4 border-0 shadow text-center">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                className="card-img-top rounded-4 rounded-bottom-0"
                alt="Travel inspiration"
                style={{ aspectRatio: "16/9", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column px-4 pb-4">
                <h5 className="card-title">Looking for Travel Inspiration?</h5>
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
                style={{ aspectRatio: "16/9", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column px-4 pb-4">
                <h5 className="card-title">Sign Up for xlr8 Deals</h5>
                <p className="card-text mt-3">
                  Get the latest sales, exclusive deals, and travel news
                  delivered to your inbox.
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
                src="https://t4.ftcdn.net/jpg/02/79/95/37/360_F_279953745_VjCCUq3EZDlNc4shp30ZrWbaHmcbDp9Y.jpg" // Consider finding a higher-res image
                className="card-img-top rounded-4 rounded-bottom-0"
                alt="Best Prices"
                style={{ aspectRatio: "16/9", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column px-4 pb-4">
                <h5 className="card-title">Best Price Guarantee</h5>
                <p className="card-text mt-3">
                  Find a better fare online? We will beat it by 10%. Travel
                  confidently with xlr8.
                </p>
                <a href="#" className="btn btn-outline-primary mt-auto">
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* End container */}
    </>
  );
}
