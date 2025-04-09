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

  // EVERYTHING BELOW is your original HTML structure, minus thymeleaf & security attributes
  return (
    <>
      {/* Replace the carousel with a video */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 px-0">
            <video
              className="d-block w-100 absolute"
              autoPlay
              loop
              muted
              playsInline
              // Optional: add a poster image for when the video is not ready
              poster="/background.jpg"
            >
              <source src="/video2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* SEARCH SECTION */}
        <div className="row z-1 position-relative" style={{ marginTop: "-5%" }}>
          <div className="col-10 col-md-9 col-sm-9 bg-light py-2 px-5 shadow col-lg-10 custom-margin">
            <div className="row">
              <div className="col-12 col-sm-12 col-lg-12">
                <div className="d-flex flex-row align-items-center mt-3 flex-wrap gap-3">
                  <form
                    id="flightSearchForm"
                    method="get"
                    className="d-flex flex-row align-items-center flex-wrap gap-3"
                    onSubmit={handleSearchSubmit}
                  >
                    {/* Origin & Destination */}
                    <div className="d-flex flex-row gap-2">
                      <input
                        id="origin"
                        name="origin"
                        placeholder="Origin"
                        className="form-control bg-light px-3 rounded-0 text-center"
                        required
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                      />
                      <input
                        id="destination"
                        name="destination"
                        placeholder="Destination"
                        className="form-control bg-light px-3 rounded-0 text-center"
                        required
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>

                    {/* Departure & Return Dates */}
                    <div className="d-flex flex-row gap-2">
                      <input
                        type="date"
                        id="departureDate"
                        name="departureDate"
                        className="form-control bg-light px-3 rounded-0 text-center"
                        placeholder="Departure"
                        required
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                      />
                      <input
                        type="date"
                        id="arrivalDate"
                        name="arrivalDate"
                        className="form-control bg-light px-3 rounded-0 text-center"
                        placeholder="Return"
                        required
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                      />
                    </div>

                    {/* Passengers Dropdown */}
                    <div className="dropdown">
                      <button
                        className="dropdown-btn"
                        id="dropdownBtn"
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                      >
                        Passengers:{" "}
                        <span id="totalPassengers">{totalPassengersText()}</span>
                      </button>
                      <div
                        className="dropdown-content"
                        id="dropdownContent"
                        style={{
                          display: showDropdown ? "block" : "none",
                        }}
                      >
                        <div className="passenger-type">
                          <label>Adults (14+)</label>
                          <button
                            type="button"
                            className="minus-btn"
                            onClick={() => decrement("adults")}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            id="adults"
                            value={adults}
                            min="1"
                            readOnly
                          />
                          <button
                            type="button"
                            className="plus-btn"
                            onClick={() => increment("adults")}
                          >
                            +
                          </button>
                        </div>
                        <div className="passenger-type">
                          <label>Children (2-14)</label>
                          <button
                            type="button"
                            className="minus-btn"
                            onClick={() => decrement("children")}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            id="children"
                            value={children}
                            min="0"
                            readOnly
                          />
                          <button
                            type="button"
                            className="plus-btn"
                            onClick={() => increment("children")}
                          >
                            +
                          </button>
                        </div>
                        <div className="passenger-type">
                          <label>Infants (0-2)</label>
                          <button
                            type="button"
                            className="minus-btn"
                            onClick={() => decrement("infants")}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            id="infants"
                            value={infants}
                            min="0"
                            readOnly
                          />
                          <button
                            type="button"
                            className="plus-btn"
                            onClick={() => increment("infants")}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Search Button */}
                    <button type="submit" className="btn search-btn">
                      Search
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Very Cool Packages Section */}
        <div className="row mt-5 mb-2">
          <div className="col-12 text-center fs-3 fw-semibold">
            Very Cool Packages
          </div>
        </div>

        <div className="row gy-3 gy-sm-4 gy-md-4 ms-0 me-0">
          <div className="col-lg-3 col-md-6 col-12">
            <div className="card h-100 mx-auto w-85 border-0 shadow">
              <img
                src="https://images.unsplash.com/photo-1574080344876-1f4089ba07fe?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3"
                className="card-img-top h-50"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title">Bali</h5>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
                <a href="#" className="btn btn-primary">
                  Go somewhere
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-12">
            <div className="card h-100 mx-auto w-85 border-0 shadow">
              <img
                src="/delta.jpg"
                className="card-img-top h-50"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title">Delta Dunarii</h5>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
                <a href="#" className="btn btn-primary">
                  Go somewhere
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-12">
            <div className="card h-100 mx-auto w-85 border-0 shadow">
              <img
                src="https://images.unsplash.com/photo-1602427384420-71c70e2b2a2f?q=80&w=2006&auto=format&fit=crop&ixlib=rb-4.0.3"
                className="card-img-top h-50"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title">Malaysia</h5>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
                <a href="#" className="btn btn-primary">
                  Go somewhere
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-12">
            <div className="card h-100 mx-auto w-85 border-0 shadow">
              <img
                src="https://images.unsplash.com/photo-1575527048208-6475b441e0a0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3"
                className="card-img-top h-50"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title">Grand Canyon</h5>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
                <a href="#" className="btn btn-primary">
                  Go somewhere
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-5 mb-5">
          <div className="col-12 text-center">
            <div
              type="button"
              className="btn rounded-5 px-3 "
              style={{ backgroundColor: "#5DB4D0", color: "white" }}
            >
              View all packages
            </div>
          </div>
        </div>

        {/* Additional sections with cards */}
        <div className="row gy-3 gy-sm-4 gy-md-4 justify-content-evenly">
          <div className="col-lg-3 col-md-6 col-12">
            <div className="card h-100 mx-auto rounded-4 border-0 shadow w-100 text-center">
              <img
                src="https://images.unsplash.com/photo-1577042939454-8b29d442b402?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                className="card-img-top rounded-4 rounded-bottom-0 h-50"
                alt="..."
              />
              <div className="card-body ">
                <h5 className="card-title">Gift Voucher</h5>
                <p className="card-text mt-5">
                  Surprise your loved ones with the gift of travel
                </p>
                <a href="#" className="btn btn-primary mt-4">
                  Read More
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-12">
            <div className="card h-100 mx-auto rounded-4 border-0 shadow w-100 text-center">
              <img
                src="https://images.unsplash.com/photo-1542353436-312f0e1f67ff?q=80&w=2142&auto=format&fit=crop&ixlib=rb-4.0.3"
                className="card-img-top rounded-4 rounded-bottom-0 h-50"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title">Cancel for any reason</h5>
                <p className="card-text mt-5">
                  Our services allow you to cancel your booking for a credit
                  voucher
                </p>
                <a href="#" className="btn btn-primary mt-4">
                  Read More
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-12">
            <div className="card h-100 mx-auto rounded-4 border-0 shadow w-100 text-center">
              <img
                src="https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                className="card-img-top rounded-4 rounded-bottom-0 h-50"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title">Get ready for takeoff</h5>
                <p className="card-text mt-5">
                  Make sure to download our mobile app to make booking easier!
                </p>
                <a href="#" className="btn btn-primary mt-4">
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="row gy-3 gy-sm-4 gy-md-4 justify-content-evenly mt-3">
          <div className="col-lg-3 col-md-6 col-12">
            <div className="card h-100 mx-auto rounded-4 border-0 shadow w-100 text-center">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                className="card-img-top rounded-4 rounded-bottom-0 h-50"
                alt="..."
              />
              <div className="card-body ">
                <h5 className="card-title">
                  Looking for travel inspiration?
                </h5>
                <p className="card-text mt-5">
                  Check out our traveling recommendations here!
                </p>
                <a href="#" className="btn btn-primary mt-5">
                  Read More
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-12">
            <div className="card h-100 mx-auto rounded-4 border-0 shadow w-100 text-center">
              <img
                src="https://images.unsplash.com/photo-1560439450-08c2a7979b15?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                className="card-img-top rounded-4 rounded-bottom-0 h-50"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title">Sign up for xlr8</h5>
                <p className="card-text mt-5">
                  Be holiday-ready! Sign-up to get the latest xlr8 sales, deals
                  and news to your inbox
                </p>
                <a href="#" className="btn btn-primary mt-5">
                  Read More
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-12">
            <div className="card h-100 mx-auto rounded-4 border-0 shadow w-100 text-center">
              <img
                src="https://t4.ftcdn.net/jpg/02/79/95/37/360_F_279953745_VjCCUq3EZDlNc4shp30ZrWbaHmcbDp9Y.jpg"
                className="card-img-top rounded-4 rounded-bottom-0 h-50"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title">Best Prices</h5>
                <p className="card-text mt-5">
                  We always make sure you get the best deals and prices on the
                  market. If you find a better fare online, we&apos;ll beat it by
                  10%
                </p>
                <a href="#" className="btn btn-primary mt-5">
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
