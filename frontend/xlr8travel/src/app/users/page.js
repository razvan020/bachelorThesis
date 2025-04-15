"use client";
import React, { useState, useEffect } from "react";
// No need for Link here unless adding Edit links
// import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card"; // Keep Card for the Add form
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import { FaTrashAlt, FaUserPlus, FaEdit } from "react-icons/fa"; // Added FaEdit

// --- Add User Form Sub-Component (Keep as previously defined) ---
const AddUserForm = ({ onUserAdded }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    // Basic validation (e.g., password length) can be added here
    const userData = { username, email, password, firstname, lastname };
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const response = await fetch(`${backendUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || `Error: ${response.status}`);
      setUsername("");
      setEmail("");
      setPassword("");
      setFirstname("");
      setLastname("");
      onUserAdded(data); // Notify parent
    } catch (err) {
      setError(err.message || "Failed to add user.");
    } finally {
      setIsLoading(false);
    }
  };

  // Keep the AddUserForm JSX structure as before
  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header as="h5">Add New User</Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        <Form onSubmit={handleAddUserSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="addFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="addLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="addUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="addEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="addPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </Form.Group>
          <Button variant="success" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" /> Adding...
              </>
            ) : (
              <>
                <FaUserPlus className="me-1" /> Add User
              </>
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

// --- Main Page Component ---
export default function UsersPage() {
  // State hooks (keep as is)
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For fetch/delete errors shown at top
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null); // Separate error for modal

  // Fetch users function (keep as is)
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    // setSuccessMessage(''); // Clear success on refetch
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const response = await fetch(`${backendUrl}/api/users`);
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
      setUsers(data || []);
    } catch (err) {
      setError(`Failed to load user data: ${err.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect for fetching (keep as is)
  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Delete Logic ---
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
    setDeleteError(null); // Clear modal-specific error when opening
    setSuccessMessage("");
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteError(null); // Clear modal error on close
  };
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const response = await fetch(
        `${backendUrl}/api/users/${userToDelete.id}`,
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
      setUsers((currentUsers) =>
        currentUsers.filter((u) => u.id !== userToDelete.id)
      );
      setSuccessMessage(
        `User "${userToDelete.username}" (ID: ${userToDelete.id}) deleted successfully!`
      );
      handleCloseDeleteModal();
    } catch (err) {
      console.error("Failed to delete user:", err);
      setDeleteError(err.message || "Failed to delete user. Please try again."); // Set modal-specific error
    } finally {
      setDeleteLoading(false);
    }
  };
  // --- End Delete Logic ---

  // --- Add User Logic ---
  const handleUserAdded = (newUserDTO) => {
    setSuccessMessage(`User "${newUserDTO.username}" added successfully!`);
    fetchUsers(); // Refetch the list to include the new user
    // Or optimistically add: setUsers(currentUsers => [...currentUsers, newUserDTO]);
  };

  return (
    <Container className="py-4 py-md-5">
      {/* Header Row */}
      <Row className="mb-4 align-items-center justify-content-between">
        <Col xs="auto">
          <h1 className="h2 text-uppercase mb-0 fw-bold">Manage Users</h1>
        </Col>
        {/* Add User Button could go here, or keep form below */}
      </Row>

      {/* Loading State */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p className="mt-2">Loading Users...</p>
        </div>
      )}

      {/* General Error Alert (for fetch errors) */}
      {!loading && error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Success Alert (for add/delete) */}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {/* User List Table - No Card Wrapper */}
      {!loading && !error && (
        <div className="mt-4">
          {" "}
          {/* Wrapper for margin */}
          {users.length > 0 ? (
            // Apply styling similar to Manage Flights table
            <Table responsive hover className="align-middle">
              {/* Simple header without dark background */}
              <thead>
                <tr className="border-bottom border-2">
                  <th className="py-3">ID</th>
                  <th className="py-3">Username</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">First Name</th>
                  <th className="py-3">Last Name</th>
                  <th className="py-3">Roles</th>
                  <th className="py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-bottom">
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.firstname || "-"}</td>
                    <td>{user.lastname || "-"}</td>
                    {/* Display roles nicely */}
                    <td>
                      {user.roles?.join(", ").replace("ROLE_", "") || "N/A"}
                    </td>
                    <td className="text-end">
                      {/* Placeholder Edit Button */}
                      {/* <Button variant="link" size="sm" className="p-1 text-decoration-none text-secondary me-2" title="Edit">
                                                <FaEdit size="1.2em"/>
                                            </Button> */}
                      {/* Delete Button */}
                      {/* Optional: Prevent deleting the current admin user or specific users */}
                      {user.username !== "user2" && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-1 text-decoration-none text-danger"
                          onClick={() => handleDeleteClick(user)}
                          disabled={
                            deleteLoading && userToDelete?.id === user.id
                          }
                          title="Delete User"
                        >
                          {deleteLoading && userToDelete?.id === user.id ? (
                            <Spinner as="span" animation="border" size="sm" />
                          ) : (
                            <FaTrashAlt size="1.1em" />
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted p-5 border rounded">
              No users found in the database. Use the form below to add one.
            </div>
          )}
        </div>
      )}

      {/* Add User Form */}
      {!loading && <AddUserForm onUserAdded={handleUserAdded} />}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Show delete-specific error inside modal */}
          {deleteError && <Alert variant="danger">Error: {deleteError}</Alert>}
          Are you sure you want to delete user{" "}
          <strong>
            {userToDelete?.username} (ID: {userToDelete?.id})
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
              "Delete User"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
