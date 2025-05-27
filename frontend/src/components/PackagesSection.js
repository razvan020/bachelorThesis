// components/PackagesSection.jsx
import React from 'react';

// A reusable card component (optional, but good practice)
const PackageCard = ({ title, description, imageUrl, link = "#" }) => (
  <div className="col-lg-3 col-md-6 col-sm-10"> {/* Responsive column sizing */}
    <div className="card h-100 border-0 shadow">
      <img
        src={imageUrl}
        className="card-img-top" // Keep existing class
        alt={title}
        style={{ aspectRatio: '4/3', objectFit: 'cover' }} // Keep existing style
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">
          {description}
        </p>
        <a href={link} className="btn btn-primary mt-auto"> {/* Use btn-primary or your preferred style */}
          Explore Package
        </a>
      </div>
    </div>
  </div>
);

// Main section component that takes package data as a prop
export default function PackagesSection({ packages = [] }) { // Default to empty array

  // Handle case where no packages are provided (optional)
  if (!packages || packages.length === 0) {
     // return <div>No packages to display.</div>; // Or return null
     return null;
  }

  return (
    <div className="container py-5">
      {/* Very Cool Packages Section Title */}
      <div className="row mb-4">
        <div className="col-12 text-center">
          <h2 className="fw-semibold">Very Cool Packages</h2>
        </div>
      </div>

      {/* Packages Card Row - Dynamically generated */}
      <div className="row gy-4 justify-content-center">
        {packages.map(pkg => (
          <PackageCard
            key={pkg.id || pkg.title} // Use a unique key
            title={pkg.title}
            description={pkg.description}
            imageUrl={pkg.imageUrl}
            link={pkg.link}
          />
        ))}
      </div>

      {/* View All Packages Button */}
      <div className="row mt-5 mb-5">
        <div className="col-12 text-center">
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4 py-2 fw-medium"
              style={{ fontSize: '1.1rem' }}
              // Optional: Handle click via prop if needed: onClick={onViewAllClick}
            >
              View All Packages
            </button>
          </div>
      </div>
    </div>
  );
}
