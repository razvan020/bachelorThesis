"use client";

import { useState, useEffect } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";

export default function FlightForm({ mode, flight, onCancel, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    origin: "",
    destination: "",
    departureDate: "",
    arrivalDate: "",
    price: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-populate when editing
  useEffect(() => {
    if (mode === "edit" && flight) {
      setForm({
        name: flight.name,
        origin: flight.origin,
        destination: flight.destination,
        departureDate: flight.departureDate?.slice(0, 16) || "",
        arrivalDate: flight.arrivalDate?.slice(0, 16) || "",
        price: flight.price?.toString() || "",
      });
    }
  }, [mode, flight]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = mode === "add" ? "/api/flights" : `/api/flights/${flight.id}`;
      const method = mode === "add" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
      }
      const data = await res.json();
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2>{mode === "add" ? "Add Flight" : `Edit Flight: ${flight.name}`}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        {/* Flight Name */}
        <Form.Group className="mb-3">
          <Form.Label>Flight Name</Form.Label>
          <Form.Control
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Origin & Destination */}
        <Form.Group className="mb-3">
          <Form.Label>Origin</Form.Label>
          <Form.Control
            name="origin"
            value={form.origin}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Destination</Form.Label>
          <Form.Control
            name="destination"
            value={form.destination}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Dates */}
        <Form.Group className="mb-3">
          <Form.Label>Departure</Form.Label>
          <Form.Control
            type="datetime-local"
            name="departureDate"
            value={form.departureDate}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Arrival</Form.Label>
          <Form.Control
            type="datetime-local"
            name="arrivalDate"
            value={form.arrivalDate}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Price */}
        <Form.Group className="mb-3">
          <Form.Label>Price (EUR)</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Actions */}
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <Spinner size="sm" />
            ) : mode === "add" ? (
              "Create"
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
