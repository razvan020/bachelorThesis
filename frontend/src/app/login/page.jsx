"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebookF, FaSun, FaMoon } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  // Check for OAuth tokens in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const refreshToken = urlParams.get("refreshToken");

    if (token && refreshToken) {
      // Store tokens in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      // Remove tokens from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect to home page or fetch user data
      auth.handleOAuthLogin(token, refreshToken).then(() => router.push("/"));
    }
  }, []);

  const handleOAuthSuccess = async (token, refreshToken) => {
    try {
      // Store tokens and update auth state
      await auth.handleOAuthLogin(token, refreshToken);

      // Remove tokens from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect to home page
      router.push("/");
    } catch (err) {
      console.error("OAuth login error:", err);
      setError("Failed to complete OAuth login");
    }
  };

  const handleToggleTheme = () => setDarkMode((m) => !m);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      // Use the existing auth.login function
      await auth.login(email, password);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setOauthLoading(true);
    // Redirect to Google OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL_GOOGLE}/oauth2/authorization/google`;
  };

  const handleFacebookLogin = () => {
    setOauthLoading(true);
    // Redirect to Facebook OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL_GOOGLE}/oauth2/authorization/facebook`;
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
          <div
            className="mx-auto"
            style={{ maxWidth: "1000px", width: "100%" }}
          >
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

                {/* Social Buttons (now functional) */}
                <div className="d-flex justify-content-between gap-3 mb-4">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={oauthLoading}
                    className={`btn ${
                      darkMode ? "btn-outline-light" : "btn-outline-secondary"
                    } w-100 d-flex align-items-center justify-content-center gap-2`}
                  >
                    <FaGoogle /> Google
                  </button>
                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={oauthLoading}
                    className={`btn ${
                      darkMode ? "btn-outline-light" : "btn-outline-secondary"
                    } w-100 d-flex align-items-center justify-content-center gap-2`}
                  >
                    <FaFacebookF /> Facebook
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div
                    className={`form-floating mb-3 ${
                      darkMode ? "text-dark" : ""
                    }`}
                  >
                    <input
                      type="email"
                      className={`form-control ${
                        darkMode ? "form-control-dark" : ""
                      }`}
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

                  <div
                    className={`form-floating mb-4 ${
                      darkMode ? "text-dark" : ""
                    }`}
                  >
                    <input
                      type="password"
                      className={`form-control ${
                        darkMode ? "form-control-dark" : ""
                      }`}
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
                  Don't have an account?{" "}
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
