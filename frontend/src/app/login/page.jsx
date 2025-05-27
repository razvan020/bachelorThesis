"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaGoogle,
  FaFacebookF,
  FaSun,
  FaMoon,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaShieldAlt,
  FaPlane,
  FaGlobe,
  FaUser,
  FaSignInAlt,
} from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";

export default function LoginPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const recaptchaRef = useRef(null);
  const router = useRouter();
  const auth = useAuth();

  // Check for OAuth completion parameter in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthParam = urlParams.get("oauth");

    // After OAuth redirect, check if we need to fetch tokens from session
    const checkOAuthLogin = async () => {
      try {
        console.log(
          "OAuth success detected, retrieving tokens from session..."
        );

        // Make request to get tokens from session
        const response = await fetch("/api/oauth/complete", {
          method: "POST",
          credentials: "include", // Important: include session cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to retrieve OAuth tokens from session");
        }

        const data = await response.json();

        // Store tokens in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("username", data.username);

        // Update auth context
        await auth.handleOAuthLogin(data.token, data.refreshToken);

        // Redirect to home page after successful login
        router.push("/");

        console.log("OAuth login successful, session tokens processed");
      } catch (err) {
        console.error("Error checking OAuth login:", err);
        setError("Failed to complete login. Please try again.");
      }
    };

    if (oauthParam === "success") {
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      checkOAuthLogin();
    } else if (oauthParam === "complete") {
      // For backward compatibility
      window.history.replaceState({}, document.title, window.location.pathname);
      auth
        .handleOAuthLogin()
        .then(() => router.push("/"))
        .catch((err) => {
          console.error("Error with legacy OAuth login:", err);
          setError("Failed to complete login. Please try again.");
        });
    }
  }, [auth, router]);

  const handleToggleTheme = () => setDarkMode(!darkMode);

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA verification");
      return;
    }

    setIsLoading(true);
    try {
      // Use the existing auth.login function with recaptcha token
      await auth.login(email, password, recaptchaToken);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      // Reset reCAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setRecaptchaToken("");
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

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-orange: #ff6f00;
          --secondary-gold: #fbbf24;
          --success-green: #10b981;
          --error-red: #ef4444;
          --dark-bg: rgb(0, 0, 0);
          --darker-bg: rgb(0, 0, 0);
          --glass-bg: rgba(255, 255, 255, 0.05);
          --glass-border: rgba(255, 255, 255, 0.1);
          --text-primary: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.8);
          --text-muted: rgba(255, 255, 255, 0.6);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--darker-bg);
          color: var(--text-primary);
          overflow-x: hidden;
        }

        .modern-login-page {
          min-height: 100vh;
          position: relative;
          background: linear-gradient(
            135deg,
            var(--darker-bg) 0%,
            var(--dark-bg) 50%,
            var(--darker-bg) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        /* Animated Background */
        .login-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .bg-particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          opacity: 0.1;
          animation: float 20s ease-in-out infinite;
        }

        .particle-1 {
          width: 400px;
          height: 400px;
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .particle-2 {
          width: 300px;
          height: 300px;
          top: 50%;
          right: -150px;
          animation-delay: 7s;
        }

        .particle-3 {
          width: 250px;
          height: 250px;
          bottom: -125px;
          left: 50%;
          animation-delay: 14s;
        }

        .particle-4 {
          width: 150px;
          height: 150px;
          top: 20%;
          left: 80%;
          animation-delay: 3s;
        }

        .particle-5 {
          width: 200px;
          height: 200px;
          bottom: 30%;
          left: 10%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1) rotate(0deg);
            opacity: 0.1;
          }
          33% {
            transform: translateY(-30px) scale(1.1) rotate(120deg);
            opacity: 0.2;
          }
          66% {
            transform: translateY(20px) scale(0.9) rotate(240deg);
            opacity: 0.15;
          }
        }

        .floating-elements {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .floating-icon {
          position: absolute;
          color: var(--primary-orange);
          font-size: 2rem;
          opacity: 0.1;
          animation: floatIcon 15s ease-in-out infinite;
        }

        .icon-1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
        .icon-2 {
          top: 20%;
          right: 15%;
          animation-delay: 3s;
        }
        .icon-3 {
          bottom: 20%;
          left: 20%;
          animation-delay: 6s;
        }
        .icon-4 {
          bottom: 30%;
          right: 10%;
          animation-delay: 9s;
        }
        .icon-5 {
          top: 60%;
          left: 5%;
          animation-delay: 12s;
        }

        @keyframes floatIcon {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.3;
          }
        }

        /* Main Container */
        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1200px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 700px;
        }

        /* Left Panel - Form */
        .form-panel {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .theme-toggle {
          position: absolute;
          top: 2rem;
          right: 2rem;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .theme-toggle:hover {
          background: var(--primary-orange);
          border-color: var(--primary-orange);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 111, 0, 0.3);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          color: white;
          padding: 0.5rem 1.2rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 15px rgba(255, 111, 0, 0.3);
        }

        .login-title {
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .title-highlight {
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        /* Alert Messages */
        .alert {
          padding: 1rem 1.5rem;
          border-radius: 16px;
          margin-bottom: 1.5rem;
          border: 1px solid;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
          animation: slideIn 0.3s ease-out;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Social Buttons */
        .social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .social-btn {
          padding: 1rem;
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 0.95rem;
        }

        .social-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary-orange);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .social-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .social-btn-google:hover:not(:disabled) {
          border-color: #ff6f00;
          box-shadow: 0 8px 25px rgba(255, 111, 0, 0.3);
        }

        .social-btn-facebook:hover:not(:disabled) {
          border-color: #1877f2;
          box-shadow: 0 8px 25px rgba(24, 119, 242, 0.3);
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          margin: 2rem 0;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--glass-border),
            transparent
          );
        }

        .divider span {
          padding: 0 1.5rem;
          background: var(--glass-bg);
          border-radius: 20px;
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(10px);
        }

        /* Form Styles */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          position: relative;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-input {
          width: 100%;
          padding: 1.2rem 1.5rem 1.2rem 3.5rem;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 2px solid var(--glass-border);
          border-radius: 16px;
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .form-input:focus {
          border-color: var(--primary-orange);
          box-shadow: 0 0 0 4px rgba(255, 111, 0, 0.1);
          background: rgba(255, 255, 255, 0.08);
        }

        .input-icon {
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 1.1rem;
          z-index: 2;
          transition: color 0.3s ease;
        }

        .form-input:focus + .input-icon {
          color: var(--primary-orange);
        }

        .password-toggle {
          position: absolute;
          right: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .password-toggle:hover {
          color: var(--primary-orange);
          background: rgba(255, 111, 0, 0.1);
        }

        /* Forgot Password */
        .forgot-password {
          text-align: right;
          margin-bottom: 1rem;
        }

        .forgot-password a {
          color: var(--primary-orange);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .forgot-password a:hover {
          color: var(--secondary-gold);
        }

        /* reCAPTCHA Container */
        .recaptcha-container {
          display: flex;
          justify-content: center;
          margin: 1.5rem 0;
        }

        /* Submit Button */
        .submit-btn {
          padding: 1.2rem 2rem;
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          border: none;
          border-radius: 16px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 111, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 111, 0, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Signup Link */
        .signup-link {
          text-align: center;
          margin-top: 2rem;
          color: var(--text-secondary);
        }

        .signup-link a {
          color: var(--primary-orange);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .signup-link a:hover {
          color: var(--secondary-gold);
        }

        /* Right Panel - Visual */
        .visual-panel {
          background: linear-gradient(
            135deg,
            rgba(255, 111, 0, 0.1) 0%,
            rgba(251, 191, 36, 0.1) 100%
          );
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .visual-content {
          text-align: center;
          z-index: 2;
          padding: 2rem;
        }

        .visual-icon {
          width: 120px;
          height: 120px;
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          font-size: 3rem;
          color: white;
          box-shadow: 0 20px 40px rgba(255, 111, 0, 0.3);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .visual-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .visual-subtitle {
          font-size: 1.2rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: left;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--success-green), #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1rem;
        }

        .feature-text {
          font-weight: 500;
          color: var(--text-primary);
        }

        /* Decorative Elements */
        .visual-decoration {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0.1;
        }

        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          animation: decorationFloat 20s ease-in-out infinite;
        }

        .decoration-1 {
          width: 200px;
          height: 200px;
          top: -100px;
          right: -100px;
          animation-delay: 0s;
        }

        .decoration-2 {
          width: 150px;
          height: 150px;
          bottom: -75px;
          left: -75px;
          animation-delay: 10s;
        }

        .decoration-3 {
          width: 100px;
          height: 100px;
          top: 50%;
          left: 20%;
          animation-delay: 5s;
        }

        @keyframes decorationFloat {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .login-container {
            grid-template-columns: 1fr;
            margin: 1rem;
          }

          .visual-panel {
            order: -1;
            min-height: 300px;
          }

          .form-panel {
            padding: 2rem 1.5rem;
          }

          .theme-toggle {
            top: 1rem;
            right: 1rem;
            width: 45px;
            height: 45px;
          }

          .social-buttons {
            grid-template-columns: 1fr;
          }

          .visual-title {
            font-size: 1.8rem;
          }

          .visual-subtitle {
            font-size: 1rem;
          }

          .visual-icon {
            width: 80px;
            height: 80px;
            font-size: 2rem;
            margin-bottom: 1rem;
          }

          .features-list {
            gap: 0.75rem;
          }

          .feature-item {
            padding: 0.75rem;
          }

          .feature-icon {
            width: 35px;
            height: 35px;
          }
        }

        @media (max-width: 480px) {
          .login-title {
            font-size: 1.8rem;
          }

          .form-input {
            padding: 1rem 1.2rem 1rem 3rem;
          }

          .input-icon {
            left: 1rem;
          }

          .password-toggle {
            right: 1rem;
          }

          .submit-btn {
            padding: 1rem 1.5rem;
            font-size: 1rem;
          }
        }

        /* Light mode styles (if needed) */
        .light-mode {
          --dark-bg: #f8fafc;
          --darker-bg: #ffffff;
          --glass-bg: rgba(0, 0, 0, 0.02);
          --glass-border: rgba(0, 0, 0, 0.1);
          --text-primary: #1e293b;
          --text-secondary: rgba(30, 41, 59, 0.8);
          --text-muted: rgba(30, 41, 59, 0.6);
        }
      `}</style>

      <div className={`modern-login-page ${darkMode ? "" : "light-mode"}`}>
        {/* Animated Background */}
        <div className="login-background">
          <div className="bg-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
          </div>

          <div className="floating-elements">
            <FaPlane className="floating-icon icon-1" />
            <FaGlobe className="floating-icon icon-2" />
            <FaUser className="floating-icon icon-3" />
            <FaShieldAlt className="floating-icon icon-4" />
            <FaCheckCircle className="floating-icon icon-5" />
          </div>
        </div>

        {/* Main Container */}
        <div className="login-container">
          {/* Left Panel - Form */}
          <div className="form-panel">
            <button className="theme-toggle" onClick={handleToggleTheme}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <div className="login-header">
              <div className="welcome-badge">
                <FaSignInAlt />
                Welcome Back
              </div>
              <h1 className="login-title">
                Sign In To
                <span className="title-highlight"> Your Account</span>
              </h1>
              <p className="login-subtitle">
                Continue your journey and explore amazing destinations
              </p>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="alert alert-error">
                <FaShieldAlt />
                {error}
              </div>
            )}

            {/* Social Login Buttons */}
            <div className="social-buttons">
              <button
                className="social-btn social-btn-google"
                onClick={handleGoogleLogin}
                disabled={oauthLoading || isLoading}
              >
                <FaGoogle />
                Google
              </button>
              <button
                className="social-btn social-btn-facebook"
                onClick={handleFacebookLogin}
                disabled={oauthLoading || isLoading}
              >
                <FaFacebookF />
                Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="divider">
              <span>or continue with email</span>
            </div>

            {/* Login Form */}
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField("")}
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                  <FaEnvelope className="input-icon" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField("")}
                    required
                    disabled={isLoading}
                  />
                  <FaLock className="input-icon" />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="forgot-password">
                <a href="#">Forgot your password?</a>
              </div>

              {/* reCAPTCHA */}
              <div className="recaptcha-container">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={
                    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
                    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  }
                  onChange={handleRecaptchaChange}
                  theme={darkMode ? "dark" : "light"}
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading || !email || !password || !recaptchaToken}
              >
                {isLoading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <FaSignInAlt />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="signup-link">
              Don't have an account? <Link href="/signup">Create one here</Link>
            </div>
          </div>

          {/* Right Panel - Visual */}
          <div className="visual-panel">
            <div className="visual-decoration">
              <div className="decoration-circle decoration-1"></div>
              <div className="decoration-circle decoration-2"></div>
              <div className="decoration-circle decoration-3"></div>
            </div>

            <div className="visual-content">
              <div className="visual-icon">
                <FaPlane />
              </div>

              <h2 className="visual-title">
                Welcome Back
                <br />
                Explorer
              </h2>

              <p className="visual-subtitle">
                Sign in to access your bookings, manage your trips, and discover
                new adventures around the world.
              </p>

              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon">
                    <FaCheckCircle />
                  </div>
                  <span className="feature-text">Manage Your Bookings</span>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <FaShieldAlt />
                  </div>
                  <span className="feature-text">Secure Account Access</span>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <FaGlobe />
                  </div>
                  <span className="feature-text">
                    Personalized Recommendations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
