"use client";
import Head from "next/head";
import React from "react";

export default function CartPage() {
  return (
    <>
      <Head>
        <title>Your Cart</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            
              body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #5DB4D0, #48A5C4);
                color: #fff;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                margin: 0;
              }
              
              /* The wrapper for this page’s content */
              .cart-background {
                flex: 1;
                display: flex;
                flex-direction: column;
              }
              
              /* Styling the container that holds the cart details */
              .cart-container {
                background-color: #ffffff;
                color: #333;
                border-radius: 8px;
                padding: 3rem;
                margin: 2rem auto;
                max-width: 1200px;
                box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
              }
              
              /* Table header styling */
              .table-dark {
                background-color: #0C5F84 !important;
              }
              
              /* Price tag styling */
              .price-tag {
                font-weight: bold;
                color: #28a745;
              }
              
              /* Button styles */
              .btn-primary {
                background-color: #5DB4D0;
                border-color: #5DB4D0;
              }
              .btn-primary:hover {
                background-color: #48A5C4;
                border-color: #48A5C4;
              }
              .btn-danger {
                background-color: #d9534f;
              }
              .btn-danger:hover {
                background-color: #c9302c;
              }
            `,
          }}
        />
      </Head>

      {/* 
         The outer wrapper "cart-background" uses flex so the background (gradient)
         covers the full available space. This matches the HTML file styling.
      */}
      <div className="cart-background">
        <header className="text-center py-5">
          <h1 className="display-4 text-uppercase">Your Flight Cart</h1>
          <p className="lead">Review your selected flights and proceed with checkout.</p>
        </header>

        <div className="cart-container">
          {/* If there are no cart items, display a placeholder */}
          <p className="text-muted text-center d-none">
            No flights in your cart yet!
          </p>

          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Flight Number</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Departure Time</th>
                  <th>Arrival Time</th>
                  <th>Departure Date</th>
                  <th>Arrival Date</th>
                  <th>Price</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Flight Number</td>
                  <td>Origin</td>
                  <td>Destination</td>
                  <td>Dep Time</td>
                  <td>Arr Time</td>
                  <td>Dep Date</td>
                  <td>Arr Date</td>
                  <td>
                    <span className="price-tag">$0.00</span>
                  </td>
                  <td>
                    <form method="post">
                      <button className="btn btn-danger btn-sm" type="submit">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <h4 className="text-dark">
              Total Price: <span className="text-primary">$0.00</span>
            </h4>
            <div>
              <button
                className="btn btn-primary me-2"
                onClick={() => (window.location.href = "/checkout")}
              >
                Proceed to Checkout
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => history.back()}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
