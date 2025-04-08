import React from 'react'

export default function Navbar() {
  return (
    <nav
        className="navbar navbar-expand-lg navbar-dark sticky-top text-center"
        style={{ backgroundColor: "#33a1bc" }}
      >
        <a className="navbar-brand fs-2" href="#" style={{ marginLeft: "10%" }}>
          xlr8 Travel
          <img
            src="/image-removebg-preview.png"
            width="50"
            height="50"
            className="align-top"
            alt=""
          />
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse text-uppercase"
          id="navbarNav"
          style={{ marginRight: "10%" }}
        >
          <ul className="navbar-nav ms-auto">
            <li className="nav-item me-4">
              <a className="nav-link active" href="#">
                Home
              </a>
            </li>
            <li className="nav-item me-4">
              <a className="nav-link active" href="#">
                Plan
              </a>
            </li>
            <li className="nav-item me-4">
              <a className="nav-link active" href="#">
                Check-in & Booking
              </a>
            </li>
          </ul>
        </div>
</nav>
  )
}


