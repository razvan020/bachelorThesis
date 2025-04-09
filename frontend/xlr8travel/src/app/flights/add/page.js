"use client"; // Allows client-side JS in Next.js 13
import React from "react";

export default function AddFlightPage() {
  return (
    <>
      
      <header className="text-center mt-5">
        <h1 className="display-4 text-uppercase">Add a New Flight</h1>
      </header>

      <div className="form-container">
        {/* Success Message (removed thymeleaf conditions) */}
        <div className="alert alert-success mt-3 d-none">
          Flight added successfully!
        </div>

        {/* Original thymeleaf form: th:action="@{/flights/add}" th:object="${flight}" */}
        <form action="/flights/add" method="post">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Flight Name/Number:
            </label>
            {/* th:field="*{name}" => removed */}
            <input type="text" id="name" className="form-control" required />
          </div>

          <div className="mb-3">
            <label htmlFor="origin" className="form-label">
              Origin:
            </label>
            <input type="text" id="origin" className="form-control" required />
          </div>

          <div className="mb-3">
            <label htmlFor="destination" className="form-label">
              Destination:
            </label>
            <input
              type="text"
              id="destination"
              className="form-control"
              required
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="departureDate" className="form-label">
                Departure Date:
              </label>
              <input
                type="date"
                id="departureDate"
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="departureTime" className="form-label">
                Departure Time:
              </label>
              <input
                type="time"
                id="departureTime"
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="arrivalDate" className="form-label">
                Arrival Date:
              </label>
              <input
                type="date"
                id="arrivalDate"
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="arrivalTime" className="form-label">
                Arrival Time:
              </label>
              <input
                type="time"
                id="arrivalTime"
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="price" className="form-label">
              Price:
            </label>
            <input
              type="number"
              id="price"
              className="form-control"
              step="0.01"
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <button type="submit" className="btn btn-primary">
              Save Flight
            </button>
            <a /* th:href="@{/}" */ href="/" className="btn btn-secondary">
              Back to Home
            </a>
          </div>
        </form>
      </div>


    </>
  );
}
