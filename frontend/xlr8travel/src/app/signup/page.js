"use client";

import React, { useState } from "react";
import { FaGoogle, FaFacebookF, FaSun, FaMoon } from "react-icons/fa";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const password = document.getElementById("exampleInputPassword1").value;
    const verify = document.getElementById("verifyInputPassword1").value;

    if (password !== verify) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      document.querySelector("form").submit();
    }, 1500);
  };

  const handleGoogleSignIn = async () => {
    await signIn("google");
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
      <div className="container" style={{ maxWidth: "1000px", width: "100%" }}>
        <div className="card flex-lg-row shadow-lg border-0 rounded-4 overflow-hidden">
          {/* Left Panel - Form */}
          <div className={`p-4 p-md-5 flex-grow-1 ${darkMode ? "bg-dark text-light" : "bg-white"}`}>
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="btn btn-sm btn-light border rounded-circle position-absolute top-0 end-0 m-3"
              title="Toggle Theme"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <h2
              className="fw-bold mb-4 text-center"
              style={{ color: darkMode ? "#ffffff" : "#000000" }}
            >
              Create an Account
            </h2>

            {/* Social Buttons */}
            <div className="d-flex justify-content-between gap-3 mb-4">
              <button
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleGoogleSignIn}
              >
                <FaGoogle /> Google
              </button>
              <button
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                disabled
              >
                <FaFacebookF /> Facebook
              </button>
            </div>

            <form action="/signup" method="post" onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="floatingFullName"
                  name="fullname"
                  placeholder="Full Name"
                  required
                  autoFocus
                />
                <label htmlFor="floatingFullName">Full Name</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="exampleInputEmail1"
                  name="email"
                  placeholder="Email"
                  required
                />
                <label htmlFor="exampleInputEmail1">Email address</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="exampleInputPassword1"
                  name="password"
                  placeholder="Password"
                  required
                />
                <label htmlFor="exampleInputPassword1">Password</label>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="password"
                  className="form-control"
                  id="verifyInputPassword1"
                  placeholder="Verify Password"
                  required
                />
                <label htmlFor="verifyInputPassword1">Verify Password</label>
              </div>

              <div className="d-grid mb-3">
                <button
                  type="submit"
                  className="btn btn-lg rounded-pill"
                  style={{
                    backgroundColor: "#000000",
                    color: "white",
                    pointerEvents: isLoading ? "none" : "auto",
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Signing Up...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </div>

              <p className="text-center mb-0">
                Already have an account?{" "}
                <a href="/login" style={{ color: darkMode ? "#ffffff" : "#FF6F00" }}>
                  Log In
                </a>
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
