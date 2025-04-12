"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { FaGoogle, FaFacebookF, FaSun, FaMoon } from "react-icons/fa";
import { useAuth } from '@/contexts/AuthContext'; // Make sure path is correct

// Optional: Import React-Bootstrap Alert/Spinner if preferred
// import Alert from 'react-bootstrap/Alert';
// import Spinner from 'react-bootstrap/Spinner';

export default function LoginPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const router = useRouter(); // Only needed if redirecting from here
  const auth = useAuth(); // Get the auth context methods

  const handleToggleTheme = () => setDarkMode(!darkMode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: password }),
        // credentials: 'include', // Uncomment if using sessions/CORS allows it
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        const userDataForContext = {
          username: data.username || email,
          // Add other relevant data if available
        };

        console.log('Data being passed to auth.login:', userDataForContext);
        
        auth.login(userDataForContext); // Update global state (will handle redirect)

      } else {
        setError(data.error || `Login failed: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError('Cannot connect to server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Define theme variables BEFORE return ---
  const cardBg = darkMode ? "bg-dark" : "bg-white";
  const textColor = darkMode ? "text-light" : "text-dark";
  const linkColor = darkMode ? "#ffffff" : "#FF6F00";
  const titleColor = darkMode ? "#ffffff" : "#000000";
  // Define gradientBg based on darkMode state
  const gradientBg = darkMode
    ? "linear-gradient(135deg, #1a1a1a, #333)"
    : "linear-gradient(135deg, rgb(44, 44, 44), rgb(85, 85, 85))";
  // --- End theme variables ---

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      // Use the defined gradientBg variable here
      style={{ minHeight: "100vh", background: gradientBg }}
    >
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="mx-auto" style={{ maxWidth: "1000px", width: "100%" }}>
            <div
              // Use defined cardBg and textColor
              className={`card flex-lg-row shadow-lg border-0 rounded-4 overflow-hidden ${cardBg} ${textColor}`}
            >
              {/* Left side - Form */}
              <div className="p-4 p-md-5 flex-grow-1 position-relative">
                <button
                  onClick={handleToggleTheme}
                  className={`btn btn-sm position-absolute top-0 end-0 m-3 border rounded-circle ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
                  title="Toggle Theme"
                >
                  {darkMode ? <FaSun /> : <FaMoon />}
                </button>

                <h2 className="fw-bold mb-4 text-center" style={{ color: titleColor }}>
                  Welcome Back
                </h2>

                {/* Display Login Error */}
                {error && (
                    <div className={`alert alert-danger`} role="alert">
                         {error}
                    </div>
                 )}

                {/* Social Buttons */}
                <div className="d-flex justify-content-between gap-3 mb-4">
                  <button className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'} w-100 d-flex align-items-center justify-content-center gap-2`}>
                    <FaGoogle /> Google
                  </button>
                  <button className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'} w-100 d-flex align-items-center justify-content-center gap-2`}>
                    <FaFacebookF /> Facebook
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className={`form-floating mb-3 ${darkMode ? 'text-dark' : ''}`}>
                    <input
                      type="email"
                      className={`form-control ${darkMode ? 'form-control-dark' : ''}`}
                      id="email"
                      name="username"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      autoFocus
                    />
                    <label htmlFor="email">Email address</label>
                  </div>

                  <div className={`form-floating mb-4 ${darkMode ? 'text-dark' : ''}`}>
                    <input
                      type="password"
                      className={`form-control ${darkMode ? 'form-control-dark' : ''}`}
                      id="password"
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <label htmlFor="password">Password</label>
                  </div>

                  <div className="text-end mb-3">
                    {/* Use defined linkColor */}
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
                        border: 'none'
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
                  {/* Use defined linkColor */}
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
                    minHeight: "500px", height: "100%", width: "100%",
                    backgroundImage: "url('/login3.png')",
                    backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat",
                    borderTopRightRadius: "1rem", borderBottomRightRadius: "1rem",
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

/* Optional: Add CSS for form-control-dark if needed */
/* ... */