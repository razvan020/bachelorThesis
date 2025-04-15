"use client";

import React, { useState } from "react";
import Link from "next/link"; // Import Link for navigation
import { useRouter } from "next/navigation"; // Import for potential redirect
import { FaGoogle, FaFacebookF, FaSun, FaMoon } from "react-icons/fa";
// import { signIn } from "next-auth/react"; // Only needed if using NextAuth for social

// Optional: Import React-Bootstrap Alert/Spinner
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

export default function SignupPage() {
  // Form State
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter(); // Hook for navigation

  const handleToggleTheme = () => setDarkMode(!darkMode);

  // Handle Form Submission (API Call)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent standard form submission
    setError(""); // Clear previous messages
    setSuccessMessage("");

    // Client-side validation
    if (password !== verifyPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      // Example length check
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true); // Show loading indicator

    // Data to send to the backend (matches UserSignupDTO)
    const signupData = {
      fullname,
      email,
      password,
    };

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const response = await fetch(`${backendUrl}/api/signup`, {
        // Call the API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await response.json(); // Try to parse response body

      if (response.ok) {
        // Status 2xx (usually 201 Created)
        setSuccessMessage(
          data.message || "Signup successful! Redirecting to login..."
        );
        // Clear form
        setFullname("");
        setEmail("");
        setPassword("");
        setVerifyPassword("");
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 2000); // Delay in ms
      } else {
        // Status 4xx or 5xx
        setError(data.error || `Signup failed: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Signup fetch error:", err);
      setError(
        "Cannot connect to server or an error occurred. Please try again later."
      );
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  // Placeholder for Google Sign In (requires NextAuth or similar setup)
  const handleGoogleSignIn = async () => {
    alert("Google Sign-In not implemented yet.");
    // await signIn("google"); // If using NextAuth
  };

  // Theme variables (as before)
  const cardBg = darkMode ? "bg-dark" : "bg-white";
  const textColor = darkMode ? "text-light" : "text-dark";
  const linkColor = darkMode ? "#ffffff" : "#FF6F00";
  const titleColor = darkMode ? "#ffffff" : "#000000";
  const gradientBg = darkMode
    ? "linear-gradient(135deg, #1a1a1a, #333)"
    : "linear-gradient(135deg, rgb(44, 44, 44), rgb(85, 85, 85))";

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: gradientBg }}
    >
      <div className="container" style={{ maxWidth: "1000px", width: "100%" }}>
        <div
          className={`card flex-lg-row shadow-lg border-0 rounded-4 overflow-hidden ${cardBg} ${textColor}`}
        >
          {/* Left Panel - Form */}
          <div className="p-4 p-md-5 flex-grow-1 position-relative">
            <button
              onClick={handleToggleTheme}
              className={`btn btn-sm position-absolute top-0 end-0 m-3 border rounded-circle ${
                darkMode ? "btn-outline-light" : "btn-outline-dark"
              }`}
              title="Toggle Theme"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <h2
              className="fw-bold mb-4 text-center"
              style={{ color: titleColor }}
            >
              Create an Account
            </h2>

            {/* Error & Success Messages */}
            {error && (
              <Alert variant="danger" onClose={() => setError("")} dismissible>
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert variant="success">{successMessage}</Alert>
            )}

            {/* Social Buttons */}
            <div className="d-flex justify-content-between gap-3 mb-4">
              <button
                className={`btn ${
                  darkMode ? "btn-outline-light" : "btn-outline-secondary"
                } w-100 d-flex align-items-center justify-content-center gap-2`}
                onClick={handleGoogleSignIn}
              >
                <FaGoogle /> Google
              </button>
              <button
                className={`btn ${
                  darkMode ? "btn-outline-light" : "btn-outline-secondary"
                } w-100 d-flex align-items-center justify-content-center gap-2`}
                disabled
              >
                <FaFacebookF /> Facebook
              </button>
            </div>

            {/* Removed action/method, added onSubmit */}
            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div
                className={`form-floating mb-3 ${darkMode ? "text-dark" : ""}`}
              >
                <input
                  type="text"
                  className={`form-control ${
                    darkMode ? "form-control-dark" : ""
                  }`}
                  id="floatingFullName"
                  name="fullname"
                  placeholder="Full Name"
                  required
                  autoFocus
                  disabled={isLoading}
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
                <label htmlFor="floatingFullName">Full Name</label>
              </div>

              {/* Email */}
              <div
                className={`form-floating mb-3 ${darkMode ? "text-dark" : ""}`}
              >
                <input
                  type="email"
                  className={`form-control ${
                    darkMode ? "form-control-dark" : ""
                  }`}
                  id="exampleInputEmail1"
                  name="email"
                  placeholder="Email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="exampleInputEmail1">Email address</label>
              </div>

              {/* Password */}
              <div
                className={`form-floating mb-3 ${darkMode ? "text-dark" : ""}`}
              >
                <input
                  type="password"
                  className={`form-control ${
                    darkMode ? "form-control-dark" : ""
                  }`}
                  id="exampleInputPassword1"
                  name="password"
                  placeholder="Password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="exampleInputPassword1">Password</label>
              </div>

              {/* Verify Password */}
              <div
                className={`form-floating mb-4 ${darkMode ? "text-dark" : ""}`}
              >
                <input
                  type="password"
                  className={`form-control ${
                    darkMode ? "form-control-dark" : ""
                  }`}
                  id="verifyInputPassword1"
                  placeholder="Verify Password"
                  required
                  disabled={isLoading}
                  value={verifyPassword}
                  onChange={(e) => setVerifyPassword(e.target.value)}
                />
                <label htmlFor="verifyInputPassword1">Verify Password</label>
              </div>

              {/* Submit Button */}
              <div className="d-grid mb-3">
                <button
                  type="submit"
                  className="btn btn-lg rounded-pill"
                  style={{
                    backgroundColor: "#000000",
                    color: "white",
                    border: "none",
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />{" "}
                      Signing Up...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </div>

              {/* Login Link */}
              <p className="text-center mb-0">
                Already have an account?{" "}
                <Link href="/login" style={{ color: linkColor }}>
                  Log In
                </Link>
              </p>
            </form>
          </div>

          {/* Right Panel - Image */}
          <div
            className="d-none d-lg-block"
            style={{
              flex: "0 0 40%",
              maxWidth: "40%",
              backgroundImage: "url('/login.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderTopRightRadius: "1rem",
              borderBottomRightRadius: "1rem",
            }}
          />
        </div>
      </div>
    </div>
  );
}
