// components/InfoCardsSection.jsx
import React from 'react';

// This component renders the two rows of informational cards.
// Content is hardcoded as requested.
export default function InfoCardsSection() {
  return (
    <>
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
    </>
  );
}