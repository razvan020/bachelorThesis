"use client"; 
import Link from "next/link";
import React from "react";

export default function ManageFlightsPage() {
  return (
    <>
      {/* We keep your original <html> and <head> code as comments or embedded for reference:
      
      <!DOCTYPE html>
      <html xmlns:th="http://www.thymeleaf.org" xmlns:sec="http://www.thymeleaf.org/thymeleaf-extras-springsecurity6">
      
      */}
      <head>
        <title>Manage Flights</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />

        {/* Original <link rel="stylesheet" th:href="@{/css/styles.css}"/> 
            is removed or replaced if you have a custom CSS. 
         */}
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
              }
              .table-container {
                  background-color: #ffffff;
                  color: #333;
                  border-radius: 8px;
                  padding: 2rem;
                  margin: 2rem auto;
                  max-width: 1200px;
                  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
              }
              .navbar {
                  background-color: #5DB4D0;
              }
              .navbar-brand {
                  font-size: 1.5rem;
                  font-weight: bold;
                  color: #fff;
              }
              footer {
                  background-color: #0C5F84;
                  color: #fff;
                  padding: 1rem 0;
                  margin-top: auto;
              }
              .footer-links img {
                  margin: 0 0.5rem;
                  width: 30px;
                  height: 30px;
              }
              .btn-primary {
                  background-color: #5DB4D0;
                  border-color: #5DB4D0;
              }
              .btn-primary:hover {
                  background-color: #48A5C4;
                  border-color: #48A5C4;
              }
              .btn-danger:hover {
                  background-color: #d9534f;
              }
            `,
          }}
        />
      </head>



      <header className="text-center py-5">
        <h1 className="display-4 text-uppercase">Manage Flights</h1>
      </header>

      <div className="table-container container">
        {/* Original thymeleaf success message: th:if="${successMessage != null}" */}
        <div className="alert alert-success mt-3 d-none">
          {/* th:text="${successMessage}" */}
          Flight updated successfully!
        </div>

        {/* Flights Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Flight Name</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Original thymeleaf loop: th:each="flight : ${flights}" 
                  We'll just keep a placeholder row or remove the thymeleaf attributes. 
              */}
              <tr>
                <td>1</td>
                <td>Example Flight</td>
                <td>ABC</td>
                <td>XYZ</td>
                <td>
                  <span>2025-05-10</span> <span>08:00</span>
                </td>
                <td>
                  <span>2025-05-10</span> <span>12:00</span>
                </td>
                <td>$120</td>
                <td>
                  <a /* th:href="@{/flights/edit/{id}(id=${flight.id})}" */
                    href="#"
                    className="btn btn-primary btn-sm me-2"
                  >
                    Edit
                  </a>
                  <form
                    /* th:action="@{/flights/delete/{id}(id=${flight.id})}" */
                    method="post"
                    style={{ display: "inline" }}
                    onSubmit={() => {
                      return window.confirm(
                        "Are you sure you want to delete this flight?"
                      );
                    }}
                  >
                    <button
                      type="submit"
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        // Extra confirm check
                        return window.confirm(
                          "Are you sure you want to delete this flight?"
                        );
                      }}
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
              {/* 
                If you had multiple flights, you'd replicate more rows or dynamically render them in React:
                flights.map(...) ...
              */}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4">
          <Link /* th:href="@{/}" */ href="/" className="btn btn-secondary">
            Back to Home
          </Link>
          <Link /* th:href="@{/flights/add}" */ href="#" className="btn btn-success">
            Add New Flight
          </Link>
        </div>
      </div>

    </>
  );
}
