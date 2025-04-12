"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";

// Helper function (ensure this handles potential null/undefined date strings)
const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Invalid Date"; // Check parsing
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (e) {
    return "Format Error";
  }
};

export default function ManageFlightsPage() {
  // State hooks (keep as is)
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // useEffect for fetching (keep as is)
  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage("");
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        console.log(`Workspaceing flights from ${backendUrl}/api/flights`);
        const response = await fetch(`${backendUrl}/api/flights`);
        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errData = await response.json();
            errorMsg = errData.message || errData.error || errorMsg;
          } catch (parseError) {
            /* Ignore */
          }
          throw new Error(errorMsg);
        }
        const data = await response.json();
        console.log("Fetched flights data:", data);
        setFlights(data || []);
      } catch (err) {
        console.error("Failed to fetch flights:", err);
        setError(`Failed to load flight data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, []);

  // Delete handlers (keep as is)
  const handleDeleteClick = (flight) => {
    setFlightToDelete(flight);
    setShowDeleteModal(true);
    setError(null);
    setSuccessMessage("");
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setFlightToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!flightToDelete) return;
    setDeleteLoading(true);
    setError(null);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      console.log(`Deleting flight ID: ${flightToDelete.id}`);
      const response = await fetch(
        `${backendUrl}/api/flights/${flightToDelete.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          if (
            response.headers.get("content-type")?.includes("application/json")
          ) {
            const errData = await response.json();
            errorMsg = errData.message || errData.error || errorMsg;
          } else {
            errorMsg = `Delete failed: ${
              response.statusText || response.status
            }`;
          }
        } catch (parseError) {
          errorMsg = `Delete failed: ${response.statusText || response.status}`;
        }
        throw new Error(errorMsg);
      }
      setFlights((currentFlights) =>
        currentFlights.filter((f) => f.id !== flightToDelete.id)
      );
      setSuccessMessage(
        `Flight "${flightToDelete.name}" (ID: ${flightToDelete.id}) deleted successfully!`
      );
      handleCloseDeleteModal();
    } catch (err) {
      console.error("Failed to delete flight:", err);
      setError(err.message || "Failed to delete flight. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Return JSX ---
  return (
    <>
      <Container fluid className="py-4">
        {/* Header Row */}
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="h3 text-uppercase">Manage Flights</h1>
          </Col>
          <Col xs="auto">
            <Button as={Link} href="/flights/add" variant="success" size="sm">
              <FaPlus className="me-1" /> Add New Flight
            </Button>
          </Col>
        </Row>

        {/* Loading, Error, Success States */}
        {loading && (
          <div className="text-center my-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading...</p>
          </div>
        )}
        {error && !loading && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <strong>Error:</strong> {error}
          </Alert>
        )}
        {successMessage && !error && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        {/* Content Card */}
        {!loading && !error && (
          <Card className="shadow-sm">
            <Card.Body>
              {flights.length > 0 ? (
                <Table
                  responsive
                  striped
                  bordered
                  hover
                  className="align-middle mb-0"
                >
                  <thead className="table-dark">
                    {/* --- Strict formatting for thead row --- */}
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
                    {/* --- Strict formatting for tbody rows --- */}
                    {flights.map((flight) => (
                      // Place each TD immediately after the previous one or the opening TR
                      <tr key={flight.id}>
                        <td>{flight.id}</td>
                        <td>{flight.name}</td>
                        <td>{flight.origin}</td>
                        <td>{flight.destination}</td>
                        <td>{formatDateTime(flight.departureDate)}</td>
                        <td>{formatDateTime(flight.arrivalDate)}</td>
                        <td>${flight.price?.toFixed(2) ?? "N/A"}</td>
                        <td>
                          <Button
                            as={Link}
                            href={`/flights/edit/${flight.id}`}
                            variant="primary"
                            size="sm"
                            className="me-2"
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteClick(flight)}
                            disabled={
                              deleteLoading && flightToDelete?.id === flight.id
                            }
                            title="Delete"
                          >
                            {deleteLoading &&
                            flightToDelete?.id === flight.id ? (
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                              />
                            ) : (
                              <FaTrashAlt />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center text-muted p-4">
                  No flights found. Add one using the button above!
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
          {/* ... Modal Content ... */}
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="mb-3">
                Error: {error}
              </Alert>
            )}
            Are you sure you want to delete flight{" "}
            <strong>
              {flightToDelete?.name} (ID: {flightToDelete?.id})
            </strong>
            ? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseDeleteModal}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Spinner size="sm" /> Deleting...
                </>
              ) : (
                "Delete Flight"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}
