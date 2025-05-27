"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import {
  FaShoppingCart,
  FaUser,
  FaLock,
  FaGoogle,
  FaMoon,
  FaSun,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaSpinner,
  FaChevronDown,
} from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";

export default function NavBarComponent() {
  const pathname = usePathname();
  const { 
    user, 
    isAuthenticated, 
    logout, 
    cartItemCount, 
    login, 
    showLoginDropdown: contextShowLoginDropdown,
    loginDropdownMessage,
    hideLogin
  } = useAuth();
  const isAdmin = isAuthenticated && user?.username === "user2";
  const [avatarUrl, setAvatarUrl] = useState("/avatarSrc.png");

  // Login dropdown state
  const [localShowLoginDropdown, setLocalShowLoginDropdown] = useState(false);

  // Combined state for dropdown visibility
  const showLoginDropdown = contextShowLoginDropdown || localShowLoginDropdown;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const loginDropdownRef = useRef(null);
  const recaptchaRef = useRef(null);

  // Handle reCAPTCHA change
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  // Handle Google login
  const handleGoogleLogin = () => {
    setOauthLoading(true);
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL_GOOGLE}/oauth2/authorization/google`;
  };

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted!", {
      email,
      password: password.length,
      recaptchaToken: !!recaptchaToken,
    });

    setLoginError("");

    if (!recaptchaToken) {
      setLoginError("Please complete the reCAPTCHA verification");
      return;
    }

    if (!email || !password) {
      setLoginError("Please enter both email and password");
      return;
    }

    setIsLoggingIn(true);

    try {
      await login(email, password, recaptchaToken);
      setEmail("");
      setPassword("");
      setRecaptchaToken("");
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setLocalShowLoginDropdown(false);
      if (contextShowLoginDropdown) {
        hideLogin();
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError(err.message || "Login failed. Try the full login page.");
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setRecaptchaToken("");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle button click
  const handleButtonClick = (e) => {
    console.log("Button clicked!");
    // Don't prevent default - let the form handle submission
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        loginDropdownRef.current &&
        !loginDropdownRef.current.contains(event.target)
      ) {
        if (contextShowLoginDropdown) {
          hideLogin();
        } else {
          setLocalShowLoginDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hideLogin, contextShowLoginDropdown]);

  // Base links
  const baseLinks = [
    { href: "/", label: "Home" },
    { href: "/plan", label: "Plan" },
    { href: "/check-in", label: "Check-in & Booking" },
    { href: "/boarding-passes", label: "Boarding Passes" },
  ];
  if (isAdmin) {
    baseLinks.push({ href: "/dashboard", label: "Dashboard" });
  }

  const getAvatarSrc = async () => {
    if (!isAuthenticated) {
      return "/avatarSrc.png";
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/me/avatar", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load avatar");
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error loading avatar:", error);
      return "/avatarSrc.png";
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getAvatarSrc().then((src) => {
        setAvatarUrl(src);
      });
    } else {
      setAvatarUrl("/avatarSrc.png");
    }

    return () => {
      if (avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [isAuthenticated]);

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        .modern-login-dropdown {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          position: absolute;
          right: 0;
          top: calc(100% + 12px);
          width: 380px;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.18),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 9999;
          overflow: hidden;
          transform-origin: top right;
          animation: modernDropdownOpen 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modernDropdownOpen {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modern-login-header {
          background: linear-gradient(
            135deg,
            rgba(24, 13, 6, 0.1) 0%,
            rgba(255, 143, 0, 0.05) 100%
          );
          padding: 24px 24px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
        }

        .modern-login-header::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
        }

        .modern-login-title {
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }

        .modern-login-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 400;
          margin: 4px 0 0 0;
          letter-spacing: -0.005em;
        }

        .modern-login-body {
          padding: 24px;
        }

        .modern-social-section {
          margin-bottom: 24px;
        }

        .modern-social-grid {
          display: block;
          margin-bottom: 24px;
        }

        .modern-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .modern-social-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.5s;
        }

        .modern-social-btn:hover::before {
          left: 100%;
        }

        .modern-social-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.3);
        }

        .modern-social-btn:active {
          transform: translateY(0);
        }

        .modern-divider {
          position: relative;
          text-align: center;
          margin: 0 0 24px 0;
        }

        .modern-divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
        }

        .modern-divider-text {
          background: rgba(0, 0, 0, 0.95);
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          font-weight: 500;
          padding: 0 16px;
          position: relative;
          z-index: 1;
        }

        .modern-form-group {
          margin-bottom: 20px;
        }

        .modern-form-label {
          display: block;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          letter-spacing: -0.005em;
        }

        .modern-input-wrapper {
          position: relative;
          display: block;
          width: 100%;
        }

        .modern-input {
          width: 100%;
          padding: 14px 16px 14px 60px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.5;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          box-sizing: border-box;
          display: block;
        }

        .modern-input.password-input {
          padding-right: 60px;
        }

        .modern-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .modern-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: #ff6f00;
          box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.15);
        }

        .modern-input:hover:not(:focus) {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .modern-input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
          z-index: 2;
          transition: color 0.2s ease;
          pointer-events: none;
        }

        .modern-input-wrapper:focus-within .modern-input-icon {
          color: #ff6f00;
        }

        .modern-password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        .modern-password-toggle:hover {
          color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.1);
        }

        .modern-recaptcha-wrapper {
          display: flex;
          justify-content: center;
          margin: 20px 0;
          transform: scale(0.9);
          transform-origin: center;
        }

        .modern-submit-btn {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%);
          border: none;
          border-radius: 12px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(255, 111, 0, 0.3);
          display: block;
        }

        .modern-submit-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .modern-submit-btn:hover::before {
          left: 100%;
        }

        .modern-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(255, 111, 0, 0.4);
        }

        .modern-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .modern-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .modern-error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 20px;
          color: #fca5a5;
          font-size: 14px;
          line-height: 1.4;
          animation: errorShake 0.5s ease-in-out;
        }

        @keyframes errorShake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-3px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(3px);
          }
        }

        .modern-footer-links {
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
        }

        .modern-forgot-link {
          display: inline-block;
          color: #ff6f00;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          margin-bottom: 16px;
          transition: all 0.2s ease;
        }

        .modern-forgot-link:hover {
          color: #ff8f00;
          text-decoration: underline;
        }

        .modern-signup-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin: 0;
        }

        .modern-signup-link {
          color: #ff6f00;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .modern-signup-link:hover {
          color: #ff8f00;
        }

        .modern-login-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
          position: relative;
        }

        .modern-login-trigger:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .modern-login-trigger.active {
          background: rgba(255, 111, 0, 0.1);
          color: #ff6f00;
        }

        .modern-trigger-icon {
          font-size: 12px;
          transition: transform 0.2s ease;
        }

        .modern-login-trigger.active .modern-trigger-icon {
          transform: rotate(180deg);
        }

        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .modern-login-dropdown {
            width: 340px;
            right: -20px;
          }

          .modern-social-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
        <Container fluid="lg">
          <Navbar.Brand as={Link} href="/">
            <Image src="/removedbg.png" fluid alt="xlr8Travel logo" />
          </Navbar.Brand>

          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-between">
            {/* Left / Center Links */}
            <Nav className="mx-auto">
              {baseLinks.map((link) => (
                <Nav.Link
                  key={link.href}
                  as={Link}
                  href={link.href}
                  active={pathname === link.href}
                  className="text-uppercase mx-lg-2"
                >
                  <span className="nav-link-text-underline">{link.label}</span>
                </Nav.Link>
              ))}
            </Nav>

            {/* Right Auth Section */}
            <Nav className="align-items-center">
              {isAuthenticated ? (
                <>
                  {/* Shopping cart for non-admins */}
                  {!isAdmin && (
                    <Nav.Link
                      as={Link}
                      href="/cart"
                      active={pathname === "/cart"}
                      className="position-relative me-3"
                      aria-label="Shopping Cart"
                    >
                      <FaShoppingCart size="1.3em" className="me-2" />
                      <span className="nav-link-text-underline">My Cart</span>
                      {cartItemCount > 0 && (
                        <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                          {cartItemCount}
                        </span>
                      )}
                    </Nav.Link>
                  )}

                  {/* Profile avatar */}
                  <Nav.Link
                    as={Link}
                    href="/profile"
                    className="d-flex align-items-center me-3"
                  >
                    <Image
                      src={avatarUrl}
                      onError={(e) => {
                        e.currentTarget.src = "/avatarSrc.png";
                      }}
                      roundedCircle
                      width={30}
                      height={30}
                      alt={`${user?.username || "Your"} profile`}
                    />
                  </Nav.Link>

                  {/* Logout button */}
                  <Button variant="outline-light" size="sm" onClick={logout}>
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <div ref={loginDropdownRef} className="position-relative">
                    <button
                      className={`modern-login-trigger ${
                        showLoginDropdown ? "active" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (contextShowLoginDropdown) {
                          hideLogin();
                        } else {
                          setLocalShowLoginDropdown(!localShowLoginDropdown);
                        }
                      }}
                      style={{ background: "none", border: "none" }}
                    >
                      <span>Log In</span>
                      <FaChevronDown className="modern-trigger-icon" />
                    </button>

                    {showLoginDropdown && (
                      <div className="modern-login-dropdown">
                        <div className="modern-login-header">
                          <h3 className="modern-login-title">Welcome back</h3>
                          <p className="modern-login-subtitle">
                            {loginDropdownMessage || "Sign in to your account"}
                          </p>
                        </div>

                        <div className="modern-login-body">
                          {loginError && (
                            <div className="modern-error-alert" role="alert">
                              {loginError}
                            </div>
                          )}

                          <div className="modern-social-section">
                            <div className="modern-social-grid">
                              <button
                                className="modern-social-btn"
                                onClick={handleGoogleLogin}
                                disabled={oauthLoading || isLoggingIn}
                                type="button"
                              >
                                <FaGoogle />
                                Continue with Google
                              </button>
                            </div>

                            <div className="modern-divider">
                              <span className="modern-divider-text">
                                or continue with email
                              </span>
                            </div>
                          </div>

                          <form onSubmit={handleLoginSubmit}>
                            <div className="modern-form-group">
                              <label
                                htmlFor="email"
                                className="modern-form-label"
                              >
                                Email address
                              </label>
                              <div className="modern-input-wrapper">
                                <input
                                  id="email"
                                  type="email"
                                  className="modern-input"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="Enter your email"
                                  required
                                  disabled={isLoggingIn}
                                  autoComplete="email"
                                />
                              </div>
                            </div>

                            <div className="modern-form-group">
                              <label
                                htmlFor="password"
                                className="modern-form-label"
                              >
                                Password
                              </label>
                              <div className="modern-input-wrapper">
                                <input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  className="modern-input password-input"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="Enter your password"
                                  required
                                  disabled={isLoggingIn}
                                  autoComplete="current-password"
                                />
                                <button
                                  type="button"
                                  className="modern-password-toggle"
                                  onClick={() => setShowPassword(!showPassword)}
                                  disabled={isLoggingIn}
                                  aria-label={
                                    showPassword
                                      ? "Hide password"
                                      : "Show password"
                                  }
                                >
                                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                              </div>
                            </div>

                            <div className="modern-recaptcha-wrapper">
                              <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={
                                  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
                                }
                                onChange={handleRecaptchaChange}
                                theme="dark"
                              />
                            </div>

                            <button
                              type="submit"
                              className="modern-submit-btn"
                              disabled={isLoggingIn}
                              onClick={handleButtonClick}
                            >
                              {isLoggingIn ? (
                                <>
                                  <span className="loading-spinner me-2"></span>
                                  Signing in...
                                </>
                              ) : (
                                "Sign in"
                              )}
                            </button>

                            <div className="modern-footer-links">
                              <a href="#" className="modern-forgot-link">
                                Forgot your password?
                              </a>
                              <p className="modern-signup-text">
                                Don't have an account?{" "}
                                <Link
                                  href="/signup"
                                  className="modern-signup-link"
                                  onClick={() => {
                                    setLocalShowLoginDropdown(false);
                                    if (contextShowLoginDropdown) {
                                      hideLogin();
                                    }
                                  }}
                                >
                                  Sign up
                                </Link>
                              </p>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>

                  <Nav.Link
                    as={Link}
                    href="/signup"
                    active={pathname === "/signup"}
                  >
                    <span className="nav-link-text-underline">Sign Up</span>
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
