// components/ManageFlightsPage.jsx
"use client";
import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
// Helper to format ISO dates
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
    console.error(e);
    return "Format Error";
  }
};

export default function ManageFlightsPage() {
  const router = useRouter();
  // --- LIST & DELETE STATE (unchanged) ---
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function fetchFlights() {
      setLoading(true);
      setError(null);
      setSuccessMessage("");
      try {
        const res = await fetch("/api/flights");
        if (!res.ok) {
          let msg = `HTTP error! status: ${res.status}`;
          try {
            const err = await res.json();
            msg = err.message || err.error || msg;
          } catch {}
          throw new Error(msg);
        }
        const data = await res.json();
        setFlights(data || []);
      } catch (err) {
        setError(`Failed to load flight data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchFlights();
  }, []);

  const handleDeleteClick = (f) => {
    setFlightToDelete(f);
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
      const res = await fetch(`/api/flights/${flightToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let msg = `HTTP error! status: ${res.status}`;
        try {
          const err = await res.json();
          msg = err.message || err.error || msg;
        } catch {}
        throw new Error(msg);
      }
      setFlights((cur) => cur.filter((x) => x.id !== flightToDelete.id));
      setSuccessMessage(
        `Flight "${flightToDelete.name}" (ID: ${flightToDelete.id}) deleted successfully!`
      );
      handleCloseDeleteModal();
    } catch (err) {
      console.error(err);
      setError(`Failed to delete: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- SPA STATE FOR SWITCHING VIEWS ---
  const [isAdding, setIsAdding] = useState(false);

  // --- ADD FORM HANDLERS & STATE ---
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [price, setPrice] = useState("");
  const [terminal, setTerminal] = useState("");
  const [gate, setGate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  const resetAddForm = () => {
    setName("");
    setOrigin("");
    setDestination("");
    setDepartureDate("");
    setDepartureTime("");
    setArrivalDate("");
    setArrivalTime("");
    setPrice("");
    setTerminal("");
    setGate("");
    setAddError(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAddError(null);
    // validation
    const depISO = `${departureDate}T${departureTime || "00:00"}:00`;
    const arrISO = `${arrivalDate}T${arrivalTime || "00:00"}:00`;
    if (new Date(arrISO) <= new Date(depISO)) {
      setAddError("Arrival must be after departure.");
      setIsLoading(false);
      return;
    }
    const payload = {
      name,
      origin,
      destination,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      price: parseFloat(price) || 0,
      terminal,
      gate,
    };
    try {
      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = `Error: ${res.status}`;
        try {
          const err = await res.json();
          msg = err.message || err.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const created = await res.json();
      // insert into list and flip back
      setFlights((cur) => [created, ...cur]);
      setSuccessMessage(`Flight "${created.name}" added!`);
      resetAddForm();
      setIsAdding(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setAddError(err.message || "Failed to add flight");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 1) ADD VIEW ---
  if (isAdding) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-sm">
              <Card.Header
                as="h1"
                className="text-center text-uppercase h4 py-3"
              >
                Add a New Flight
              </Card.Header>
              <Card.Body className="p-4 p-md-5">
                {addError && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setAddError(null)}
                  >
                    {addError}
                  </Alert>
                )}
                <Form onSubmit={handleAddSubmit}>
                  {/* Flight Name */}
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Flight Name/Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., XT101"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Form.Group>

                  {/* Origin */}
                  <Form.Group className="mb-3" controlId="origin">
                    <Form.Label>Origin</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., OTP"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Form.Group>

                  {/* Destination */}
                  <Form.Group className="mb-3" controlId="destination">
                    <Form.Label>Destination</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., LHR"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Form.Group>

                  {/* Departure Date/Time */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="departureDate">
                        <Form.Label>Departure Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={departureDate}
                          onChange={(e) => setDepartureDate(e.target.value)}
                          required
                          disabled={isLoading}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="departureTime">
                        <Form.Label>Departure Time</Form.Label>
                        <Form.Control
                          type="time"
                          value={departureTime}
                          onChange={(e) => setDepartureTime(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Arrival Date/Time */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="arrivalDate">
                        <Form.Label>Arrival Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={arrivalDate}
                          onChange={(e) => setArrivalDate(e.target.value)}
                          required
                          disabled={isLoading}
                          min={departureDate}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="arrivalTime">
                        <Form.Label>Arrival Time</Form.Label>
                        <Form.Control
                          type="time"
                          value={arrivalTime}
                          onChange={(e) => setArrivalTime(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Terminal & Gate */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="terminal">
                        <Form.Label>Terminal</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., A"
                          value={terminal}
                          onChange={(e) => setTerminal(e.target.value)}
                          disabled={isLoading}
                        />
                        <Form.Text className="text-muted">Optional</Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="gate">
                        <Form.Label>Gate</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., 10"
                          value={gate}
                          onChange={(e) => setGate(e.target.value)}
                          disabled={isLoading}
                        />
                        <Form.Text className="text-muted">Optional</Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Price */}
                  <Form.Group className="mb-4" controlId="price">
                    <Form.Label>Price ($)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 199.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      step="0.01"
                      min="0"
                      required
                      disabled={isLoading}
                    />
                  </Form.Group>

                  {/* Buttons */}
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <Button
                      variant="success"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />{" "}
                          Saving...
                        </>
                      ) : (
                        "Save Flight"
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsAdding(false)}
                    >
                      Cancel / Back to List
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // --- 2) LIST & DELETE VIEW ---
  return (
    <>
      <Container className="py-4 py-md-5">
        <Row className="mb-4 align-items-center justify-content-between mt-5">
          <Col xs="auto">
            <h1 className="h2 text-uppercase mb-0 fw-bold">Manage Flights</h1>
          </Col>
          <Col xs="auto">
            <Button
              variant="success"
              onClick={() => {
                setError(null);
                setSuccessMessage("");
                setIsAdding(true);
              }}
            >
              <FaPlus className="me-1" /> Add Flight
            </Button>
          </Col>
        </Row>

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

        {!loading && !error && (
          <div className="mt-4">
            {flights.length > 0 ? (
              <Table responsive hover className="align-middle">
                <thead>
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
                <tbody>
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
                          variant="link"
                          size="lg"
                          className="p-1 text-decoration-none text-secondary me-2"
                          title="Edit"
                          onClick={() => {
                            /* TBD: wire up edit mode here */
                          }}
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
              </Table>
            ) : (
              <div className="text-center text-muted p-5 border rounded">
                No flights found. Add one using the button above!
              </div>
            )}
          </div>
        )}

        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
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
