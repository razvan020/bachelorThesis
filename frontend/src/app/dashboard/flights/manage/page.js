"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";

// Helper function (keep as is)
const formatDateOnly = (isoStringOrDate) => {
  if (!isoStringOrDate) return "N/A";
  try {
    const date = new Date(isoStringOrDate);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
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
    // ... fetch logic ...
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage("");
      try {
        const response = await fetch("/api/flights");
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
        setFlights(data || []);
      } catch (err) {
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
    /* ... (delete logic) ... */
    if (!flightToDelete) return;
    setDeleteLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/flights/${flightToDelete.id}`, {
        method: "DELETE",
      });
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
      setError(`Failed to delete: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Container className="py-4 py-md-5">
        {/* Header Row */}
        <Row className="mb-4 align-items-center justify-content-between mt-5">
          {/* ... Title and Add Button ... */}
          <Col xs="auto">
            <h1 className="h2 text-uppercase mb-0 fw-bold">Manage Flights</h1>
          </Col>
          <Col xs="auto">
            <Button as={Link} href="/dashboard/flights/add" variant="success">
              <FaPlus className="me-1" /> Add Flight
            </Button>
          </Col>
        </Row>

        {/* Loading, Error, Success States */}
        {loading && (
          <div className="text-center my-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading...</p>
          </div>
        )}
        {error && !loading && !showDeleteModal && (
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

        {/* Table Area */}
        {!loading && !error && (
          <div className="mt-4">
            {flights.length > 0 ? (
              // --- FIXED: Ensure no whitespace between Table and thead/tbody ---
              <Table responsive hover className="align-middle">
                <thead>
                  {/* No space/newline after <Table> */}
                  <tr className="border-bottom border-2">
                    <th className="py-3">ID</th>
                    <th className="py-3">Flight Name</th>
                    <th className="py-3">Origin</th>
                    <th className="py-3">Destination</th>
                    <th className="py-3">Departure</th>
                    <th className="py-3">Arrival</th>
                    <th className="py-3">Price</th>
                    <th className="py-3 text-end">Actions</th>
                  </tr>
                </thead>
                {/* No space/newline after </thead> */}
                <tbody>
                  {/* No space/newline after <tbody> */}
                  {flights.map((flight) => (
                    <tr key={flight.id} className="border-bottom">
                      <td>{flight.id}</td>
                      <td>{flight.name}</td>
                      <td>{flight.origin}</td>
                      <td>{flight.destination}</td>
                      <td>{formatDateOnly(flight.departureDate)}</td>
                      <td>{formatDateOnly(flight.arrivalDate)}</td>
                      <td>${flight.price?.toFixed(2) ?? "N/A"}</td>
                      <td className="text-end">
                        <Button
                          as={Link}
                          href={`/flights/edit/${flight.id}`}
                          variant="link"
                          size="lg"
                          className="p-1 text-decoration-none text-secondary me-2"
                          title="Edit"
                        >
                          <FaEdit size="1.2em" />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-1 text-decoration-none text-danger"
                          onClick={() => handleDeleteClick(flight)}
                          disabled={
                            deleteLoading && flightToDelete?.id === flight.id
                          }
                          title="Delete"
                        >
                          {deleteLoading && flightToDelete?.id === flight.id ? (
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                            <FaTrashAlt size="1.1em" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* No space/newline after </tbody> */}
              </Table> // No space/newline before </Table>
            ) : (
              <div className="text-center text-muted p-5 border rounded">
                No flights found. Add one using the button above!
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
          {/* ... Modal content ... */}
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && showDeleteModal && (
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
