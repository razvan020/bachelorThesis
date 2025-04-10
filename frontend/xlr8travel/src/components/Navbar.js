"use client";
import Link from "next/link";
import React from "react";

export default function NavBar() {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top"
      style={{ backgroundColor: "#5DB4D0" }}
    >
      <div className="container">
        {/* Brand / Logo */}
        <Link
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
        </Link>

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
              <Link className="nav-link active" href="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" href="#">
                Plan
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" href="/checkin/1">
                Check-in &amp; Booking
              </Link>
            </li>
          </ul>

          {/* Auth Buttons – aligned to the end */}
          <ul className="navbar-nav ms-75 text-uppercase align-items-center gap-3">
            <li className="nav-item">
              <Link className="nav-link active" href="/login">
                Log in
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" href="/signup">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
