"use client";
import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import { FaTrashAlt, FaUserPlus } from "react-icons/fa";

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
    const userData = { username, email, password, firstname, lastname };
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || `Error: ${response.status}`);
      // reset form
      setUsername("");
      setEmail("");
      setPassword("");
      setFirstname("");
      setLastname("");
      onUserAdded(data);
    } catch (err) {
      setError(err.message || "Failed to add user.");
    } finally {
      setIsLoading(false);
    }
  };

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
              <Form.Group controlId="addFirstName" className="mb-3">
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
              <Form.Group controlId="addLastName" className="mb-3">
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
              <Form.Group controlId="addUsername" className="mb-3">
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
              <Form.Group controlId="addEmail" className="mb-3">
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

          <Form.Group controlId="addPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </Form.Group>

          <Button variant="success" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" /> Adding…
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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users", {
        //comment
        //comments 2
        credentials: "include", // ← include session cookie
      });
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || errorMsg;
        } catch {}
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
    setDeleteError(null);
    setSuccessMessage("");
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteError(null);
  };
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
        credentials: "include", // ← include session cookie
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
        } catch {}
        throw new Error(errorMsg);
      }
      setUsers((cur) => cur.filter((u) => u.id !== userToDelete.id));
      setSuccessMessage(
        `User "${userToDelete.username}" deleted successfully!`
      );
      handleCloseDeleteModal();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete user.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUserAdded = (newUser) => {
    setSuccessMessage(`User "${newUser.username}" added successfully!`);
    fetchUsers();
  };

  return (
    <Container className="py-4 py-md-5">
      <Row className="mb-4 align-items-center justify-content-between">
        <Col xs="auto">
          <h1 className="h2 text-uppercase mb-0 fw-bold">Manage Users</h1>
        </Col>
      </Row>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p className="mt-2">Loading Users...</p>
        </div>
      )}

      {!loading && error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {successMessage && (
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
          {users.length > 0 ? (
            <Table responsive hover className="align-middle">
              <thead>
                <tr className="border-bottom border-2">
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Roles</th>
                  <th className="text-end">Actions</th>
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
                    <td>
                      {user.roles?.join(", ").replace("ROLE_", "") || "N/A"}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-1 text-decoration-none text-danger"
                        onClick={() => handleDeleteClick(user)}
                        disabled={deleteLoading && userToDelete?.id === user.id}
                        title="Delete User"
                      >
                        {deleteLoading && userToDelete?.id === user.id ? (
                          <Spinner as="span" animation="border" size="sm" />
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
              No users found in the database. Use the form below to add one.
            </div>
          )}
        </div>
      )}

      {!loading && <AddUserForm onUserAdded={handleUserAdded} />}

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                <Spinner size="sm" /> Deleting…
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
