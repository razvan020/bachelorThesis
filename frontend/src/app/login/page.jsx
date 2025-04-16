// src/contexts/AuthContext.js
// — make sure you’ve already replaced your AuthContext with the version that exposes:
//    async login(username, password) { …fetch('/api/login', { credentials:'include' })… }
//    …and that next.config.mjs rewrites '/api/*' to your Spring backend.

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebookF, FaSun, FaMoon } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();

  const handleToggleTheme = () => setDarkMode((m) => !m);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      // auth.login does the POST /api/login with credentials: 'include',
      // sets up user state and then router.push('/') on success.
      await auth.login(email, password);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // theme helpers
  const cardBg = darkMode ? "bg-dark" : "bg-white";
  const textColor = darkMode ? "text-light" : "text-dark";
  const linkColor = darkMode ? "#ffffff" : "#FF6F00";
  const titleColor = darkMode ? "#ffffff" : "#000000";
  const gradientBg = darkMode
    ? "linear-gradient(135deg, #1a1a1a, #333)"
    : "linear-gradient(135deg, rgb(44,44,44), rgb(85,85,85))";

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: gradientBg }}
    >
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="mx-auto" style={{ maxWidth: "1000px", width: "100%" }}>
            <div
              className={`card flex-lg-row shadow-lg border-0 rounded-4 overflow-hidden ${cardBg} ${textColor}`}
            >
              {/* Left side - Form */}
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
                  Welcome Back
                </h2>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {/* Social Buttons (no-op) */}
                <div className="d-flex justify-content-between gap-3 mb-4">
                  <button
                    type="button"
                    className={`btn ${
                      darkMode ? "btn-outline-light" : "btn-outline-secondary"
                    } w-100 d-flex align-items-center justify-content-center gap-2`}
                  >
                    <FaGoogle /> Google
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      darkMode ? "btn-outline-light" : "btn-outline-secondary"
                    } w-100 d-flex align-items-center justify-content-center gap-2`}
                  >
                    <FaFacebookF /> Facebook
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className={`form-floating mb-3 ${darkMode ? "text-dark" : ""}`}>
                    <input
                      type="email"
                      className={`form-control ${darkMode ? "form-control-dark" : ""}`}
                      id="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      autoFocus
                    />
                    <label htmlFor="email">Email address</label>
                  </div>

                  <div className={`form-floating mb-4 ${darkMode ? "text-dark" : ""}`}>
                    <input
                      type="password"
                      className={`form-control ${darkMode ? "form-control-dark" : ""}`}
                      id="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <label htmlFor="password">Password</label>
                  </div>

                  <div className="text-end mb-3">
                    <a href="#" style={{ color: linkColor }}>
                      Forgot password?
                    </a>
                  </div>

                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-lg rounded-pill position-relative"
                      style={{
                        backgroundColor: "#000000",
                        color: "white",
                        border: "none",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                      )}
                      {isLoading ? "Logging in..." : "Log In"}
                    </button>
                  </div>
                </form>

                <p className="text-center mb-0">
                  Don’t have an account?{" "}
                  <a href="/signup" style={{ color: linkColor }}>
                    Sign Up
                  </a>
                </p>
              </div>

              {/* Right side - Image */}
              <div
                className="d-none d-lg-block"
                style={{ flex: "0 0 40%", maxWidth: "40%" }}
              >
                <div
                  style={{
                    minHeight: "500px",
                    height: "100%",
                    width: "100%",
                    backgroundImage: "url('/login3.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderTopRightRadius: "1rem",
                    borderBottomRightRadius: "1rem",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
