"use client";
import React, { useState } from "react";
import { FaGoogle, FaFacebookF, FaSun, FaMoon } from "react-icons/fa";

export default function LoginPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleTheme = () => setDarkMode(!darkMode);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // login logic
    }, 2000);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background: darkMode
          ? "linear-gradient(135deg, #1a1a1a, #333)"
          : "linear-gradient(135deg,rgb(44, 44, 44),rgb(85, 85, 85))",
      }}
    >
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="mx-auto" style={{ maxWidth: "1000px", width: "100%" }}>
            <div
              className={`card flex-lg-row shadow-lg border-0 rounded-4 overflow-hidden ${
                darkMode ? "bg-dark text-light" : "bg-white"
              }`}
            >
              {/* Left side - Form */}
              <div className="p-4 p-md-5 flex-grow-1 position-relative">
                <button
                  onClick={handleToggleTheme}
                  className="btn btn-sm btn-light position-absolute top-0 end-0 m-3 border rounded-circle"
                  title="Toggle Theme"
                >
                  {darkMode ? <FaSun /> : <FaMoon />}
                </button>

                <h2
                  className="fw-bold mb-4 text-center"
                  style={{ color: darkMode ? "#ffffff" : "#000000" }}
                >
                  Welcome Back
                </h2>

                {/* Social Buttons */}
                <div className="d-flex justify-content-between gap-3 mb-4">
                  <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2">
                    <FaGoogle /> Google
                  </button>
                  <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2">
                    <FaFacebookF /> Facebook
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="username"
                      placeholder="Email"
                      required
                      autoFocus
                    />
                    <label htmlFor="email">Email address</label>
                  </div>

                  <div className="form-floating mb-4">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      placeholder="Password"
                      required
                    />
                    <label htmlFor="password">Password</label>
                  </div>

                  <div className="text-end mb-3">
                    <a
                      href="#"
                      style={{ color: darkMode ? "#ffffff" : "#FF6F00" }}
                    >
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
                        pointerEvents: isLoading ? "none" : "auto",
                      }}
                    >
                      {isLoading && (
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                      )}
                      {isLoading ? "Logging in..." : "Log In"}
                    </button>
                  </div>
                </form>

                <p className="text-center mb-0"
                  style={{ color: darkMode ? "#ffffff" : "#000000" }}
                >
                  Don’t have an account?{" "}
                  <a
                    href="/signup"
                    style={{ color: darkMode ? "#ffffff" : "#FF6F00" }}
                  >
                    Sign Up
                  </a>
                </p>
              </div>

              {/* Right side - Image */}
              <div
                className="d-none d-lg-block"
                style={{
                  flex: "0 0 40%",
                  maxWidth: "40%",
                }}
              >
                <div
                  style={{
                    minHeight: "500px",
                    height: "100%",
                    width: "100%",
                    backgroundImage: "url('/login3.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
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
