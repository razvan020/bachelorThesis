"use client";
import React from "react";

export default function NavBar() {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top"
      style={{ backgroundColor: "#5DB4D0" }}
    >
      <div className="container">
        {/* Brand / Logo */}
        <a
          className="navbar-brand fs-2"
          href="/"
          style={{ marginLeft: "5%" }}
        >
          <img
            src="/removedbg.png"
            width="100"
            height="100"
            className="align-top"
            alt="xlr8Travel logo"
          />
        </a>

        {/* Hamburger toggle (mobile) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar content */}
        <div
          className="collapse navbar-collapse justify-content-between"
          id="navbarNav"
        >
          {/* Main Navigation Links – centered */}
          <ul className="navbar-nav mx-auto text-uppercase align-items-center gap-3">
            <li className="nav-item">
              <a className="nav-link active" href="/">
                Home
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link active" href="#">
                Plan
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link active" href="/checkin/1">
                Check-in &amp; Booking
              </a>
            </li>
          </ul>

          {/* Auth Buttons – aligned to the end */}
          <ul className="navbar-nav ms-75 text-uppercase align-items-center gap-3">
            <li className="nav-item">
              <a className="nav-link active" href="/login">
                Login
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link active" href="/signup">
                Sign Up
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
