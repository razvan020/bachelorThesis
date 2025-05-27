"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  FaUser,
  FaCamera,
  FaLock,
  FaEdit,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaShieldAlt,
  FaSave,
  FaUserCircle,
  FaEnvelope,
  FaAt,
  FaCloudUploadAlt,
} from "react-icons/fa";

export default function ProfilePage() {
  const { fetchCartCount } = useAuth();
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [newPic, setNewPic] = useState(null);
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);

  const avatarObjectUrl = useRef(null);
  const fileInputRef = useRef(null);

  // Load profile + avatar on mount
  useEffect(() => {
    async function load() {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You need to be logged in to view this page");
          return;
        }

        const res = await fetch("/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to load profile");
        const profileData = await res.json();
        setProfile(profileData);
        setEditedProfile(profileData);

        try {
          const res2 = await fetch("/api/user/me/avatar", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res2.ok) {
            const blob = await res2.blob();
            if (avatarObjectUrl.current)
              URL.revokeObjectURL(avatarObjectUrl.current);
            avatarObjectUrl.current = URL.createObjectURL(blob);
            setAvatarUrl(avatarObjectUrl.current);
          }
        } catch {
          // no avatar
        }
      } catch (e) {
        setError(e.message);
      }
    }
    load();
    return () => {
      if (avatarObjectUrl.current) URL.revokeObjectURL(avatarObjectUrl.current);
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be less than 2MB");
        return;
      }
      setNewPic(file);
      setError("");
      setMsg("");

      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError("Please select a valid image file");
    }
  };

  const uploadPic = async () => {
    setIsLoading(true);
    setMsg("");
    setError("");

    if (!newPic) {
      setError("Select an image first.");
      setIsLoading(false);
      return;
    }
    if (newPic.size > 2 * 1024 * 1024) {
      setError("Max size 2 MB.");
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("file", newPic);

    try {
      const res = await fetch("/api/user/me/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) throw new Error("Upload failed");

      // refresh avatar
      const res2 = await fetch("/api/user/me/avatar", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res2.ok) {
        const blob = await res2.blob();
        if (avatarObjectUrl.current)
          URL.revokeObjectURL(avatarObjectUrl.current);
        avatarObjectUrl.current = URL.createObjectURL(blob);
        setAvatarUrl(avatarObjectUrl.current);
      }

      setMsg("Avatar updated!");
      setNewPic(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    setIsLoading(true);
    setMsg("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedProfile),
      });

      if (!res.ok) throw new Error("Profile update failed");

      setProfile(editedProfile);
      setIsEditing(false);
      setMsg("Profile updated successfully!");
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const changePwd = async () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setMsg("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/user/me/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!res.ok) throw new Error("Password change failed");
      setMsg("Password changed!");
      setOld("");
      setNew("");
      setConfirmPassword("");
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    const levels = [
      { strength: 0, label: "", color: "" },
      { strength: 1, label: "Very Weak", color: "#ef4444" },
      { strength: 2, label: "Weak", color: "#f97316" },
      { strength: 3, label: "Fair", color: "#eab308" },
      { strength: 4, label: "Good", color: "#22c55e" },
      { strength: 5, label: "Strong", color: "#16a34a" },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(newPassword);

  if (error && !profile) {
    return (
      <>
        <style jsx global>{`
          :root {
            --primary-orange: #ff6f00;
            --secondary-gold: #fbbf24;
            --success-green: #10b981;
            --error-red: #ef4444;
            --dark-bg: #000000;
            --darker-bg: #000000;
            --glass-bg: rgba(255, 255, 255, 0.02);
            --glass-border: rgba(255, 255, 255, 0.08);
            --text-primary: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.8);
            --text-muted: rgba(255, 255, 255, 0.5);
            --card-bg: rgba(255, 255, 255, 0.03);
            --hover-bg: rgba(255, 255, 255, 0.05);
          }
        `}</style>

        <div className="modern-profile-page">
          <div className="profile-container">
            <div className="error-state">
              <div className="error-icon">
                <FaTimes />
              </div>
              <h2>Access Denied</h2>
              <p>{error}</p>
              <button
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <style jsx global>{`
          :root {
            --primary-orange: #ff6f00;
            --secondary-gold: #fbbf24;
            --success-green: #10b981;
            --error-red: #ef4444;
            --dark-bg: #000000;
            --darker-bg: #000000;
            --glass-bg: rgba(255, 255, 255, 0.02);
            --glass-border: rgba(255, 255, 255, 0.08);
            --text-primary: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.8);
            --text-muted: rgba(255, 255, 255, 0.5);
            --card-bg: rgba(255, 255, 255, 0.03);
            --hover-bg: rgba(255, 255, 255, 0.05);
          }
        `}</style>

        <div className="modern-profile-page">
          <div className="loading-state">
            <div className="loading-animation">
              <div className="loading-circle"></div>
              <div className="loading-circle"></div>
              <div className="loading-circle"></div>
            </div>
            <h3>Loading your profile</h3>
            <p>Please wait while we fetch your information...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-orange: #ff6f00;
          --secondary-gold: #fbbf24;
          --success-green: #10b981;
          --error-red: #ef4444;
          --dark-bg: #000000;
          --darker-bg: #000000;
          --glass-bg: rgba(255, 255, 255, 0.02);
          --glass-border: rgba(255, 255, 255, 0.08);
          --text-primary: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.8);
          --text-muted: rgba(255, 255, 255, 0.5);
          --card-bg: rgba(255, 255, 255, 0.03);
          --hover-bg: rgba(255, 255, 255, 0.05);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark-bg);
          color: var(--text-primary);
          line-height: 1.6;
        }

        .modern-profile-page {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            var(--darker-bg) 0%,
            var(--dark-bg) 100%
          );
          padding: 3rem 0;
          position: relative;
          overflow-x: hidden;
        }

        .modern-profile-page::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
              circle at 20% 20%,
              rgba(255, 111, 0, 0.03) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 80%,
              rgba(251, 191, 36, 0.02) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 40% 60%,
              rgba(255, 111, 0, 0.01) 0%,
              transparent 50%
            );
          pointer-events: none;
          z-index: 0;
        }

        .profile-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 1;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          gap: 2rem;
        }

        .loading-animation {
          display: flex;
          gap: 0.5rem;
        }

        .loading-circle {
          width: 12px;
          height: 12px;
          background: var(--primary-orange);
          border-radius: 50%;
          animation: loadingBounce 1.4s ease-in-out infinite both;
        }

        .loading-circle:nth-child(1) {
          animation-delay: -0.32s;
        }
        .loading-circle:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes loadingBounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        .loading-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .loading-state p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        /* Error State */
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          gap: 2rem;
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 4rem 2rem;
        }

        .error-icon {
          width: 80px;
          height: 80px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--error-red);
          font-size: 2rem;
        }

        .error-state h2 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .error-state p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 400px;
        }

        .retry-btn {
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 16px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(255, 111, 0, 0.2);
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255, 111, 0, 0.3);
        }

        /* Header Section */
        .profile-header {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 32px;
          padding: 4rem 3rem 3rem;
          margin-bottom: 3rem;
          position: relative;
          overflow: hidden;
        }

        .profile-header::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(
            135deg,
            rgba(255, 111, 0, 0.05) 0%,
            rgba(251, 191, 36, 0.03) 100%
          );
          z-index: 0;
        }

        .profile-header-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 4rem;
        }

        /* Avatar Section */
        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .avatar-container {
          position: relative;
          transition: all 0.3s ease;
        }

        .avatar-container:hover {
          transform: translateY(-4px);
        }

        .avatar-wrapper {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid rgba(255, 255, 255, 0.1);
          position: relative;
          background: var(--glass-bg);
          transition: all 0.3s ease;
        }

        .avatar-wrapper:hover {
          border-color: var(--primary-orange);
          box-shadow: 0 0 0 8px rgba(255, 111, 0, 0.1);
        }

        .profile-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.3s ease;
        }

        .avatar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .avatar-wrapper:hover .avatar-overlay {
          opacity: 1;
        }

        .avatar-upload-btn {
          background: var(--primary-orange);
          border: none;
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.2rem;
          box-shadow: 0 4px 16px rgba(255, 111, 0, 0.3);
        }

        .avatar-upload-btn:hover {
          background: #e66400;
          transform: scale(1.1);
          box-shadow: 0 6px 24px rgba(255, 111, 0, 0.4);
        }

        .upload-area {
          background: var(--glass-bg);
          border: 2px dashed var(--glass-border);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          min-width: 280px;
        }

        .upload-area.drag-over {
          border-color: var(--primary-orange);
          background: rgba(255, 111, 0, 0.05);
          transform: scale(1.02);
        }

        .upload-area:hover {
          border-color: rgba(255, 111, 0, 0.5);
          background: var(--hover-bg);
        }

        .upload-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 111, 0, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: var(--primary-orange);
          font-size: 1.5rem;
        }

        .upload-text {
          color: var(--text-primary);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .upload-hint {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .upload-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .upload-confirm-btn {
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(255, 111, 0, 0.2);
          flex: 1;
        }

        .upload-confirm-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 111, 0, 0.3);
        }

        .upload-confirm-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Profile Info */
        .profile-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .profile-name-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .profile-name {
          font-size: 3rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
          margin: 0;
          background: linear-gradient(
            135deg,
            var(--text-primary),
            rgba(255, 255, 255, 0.8)
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .profile-username {
          font-size: 1.2rem;
          color: var(--primary-orange);
          font-weight: 500;
          margin: 0;
        }

        .profile-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .profile-detail-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--glass-bg);
          padding: 1rem 1.5rem;
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          transition: all 0.3s ease;
        }

        .profile-detail-item:hover {
          background: var(--hover-bg);
          border-color: rgba(255, 111, 0, 0.2);
        }

        .detail-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 111, 0, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-orange);
        }

        .detail-content {
          flex: 1;
        }

        .detail-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 1.1rem;
          color: var(--text-primary);
          font-weight: 600;
          margin-top: 0.25rem;
        }

        /* Alert Messages */
        .alert {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border: 1px solid;
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: slideIn 0.4s ease;
        }

        .alert-success {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.05);
        }

        .alert-error {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }

        .alert-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .alert-success .alert-icon {
          color: var(--success-green);
        }

        .alert-error .alert-icon {
          color: var(--error-red);
        }

        .alert-message {
          font-weight: 500;
          font-size: 1rem;
        }

        .alert-success .alert-message {
          color: var(--success-green);
        }

        .alert-error .alert-message {
          color: var(--error-red);
        }

        /* Main Content */
        .profile-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        .profile-card {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s ease;
          height: fit-content;
        }

        .profile-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 111, 0, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          padding: 2rem 2rem 1rem;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-title-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .card-icon {
          width: 50px;
          height: 50px;
          background: rgba(255, 111, 0, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-orange);
          font-size: 1.2rem;
        }

        .card-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .card-subtitle {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0.25rem 0 0 0;
        }

        .edit-toggle-btn {
          background: rgba(255, 111, 0, 0.1);
          border: 1px solid rgba(255, 111, 0, 0.3);
          color: var(--primary-orange);
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .edit-toggle-btn:hover:not(:disabled) {
          background: rgba(255, 111, 0, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(255, 111, 0, 0.2);
        }

        .edit-toggle-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .card-content {
          padding: 2rem;
        }

        /* Form Styles */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .security-form .form-group {
          margin-bottom: 2.5rem;
        }

        .security-form .form-group:last-of-type {
          margin-bottom: 1.5rem;
        }

        .form-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          background: var(--glass-bg);
          border: 2px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-orange);
          box-shadow: 0 0 0 4px rgba(255, 111, 0, 0.1);
          background: var(--hover-bg);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: var(--glass-bg);
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .form-input:hover:not(:disabled) {
          border-color: rgba(255, 111, 0, 0.3);
          background: var(--hover-bg);
        }

        /* Security Form Specific Styles */
        .security-form {
          display: flex;
          flex-direction: column;
        }

        /* Password Requirements */
        .password-requirements {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .requirements-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .requirements-title::before {
          content: "";
          width: 4px;
          height: 20px;
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          border-radius: 2px;
        }

        .requirements-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .requirement-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: var(--text-muted);
          transition: all 0.3s ease;
        }

        .requirement-item.met {
          color: var(--success-green);
        }

        .requirement-icon {
          width: 16px;
          height: 16px;
          opacity: 0.3;
          transition: all 0.3s ease;
        }

        .requirement-item.met .requirement-icon {
          opacity: 1;
          color: var(--success-green);
        }

        /* Password Input */
        .password-input-container {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .password-toggle:hover {
          color: var(--primary-orange);
          background: rgba(255, 111, 0, 0.1);
        }

        /* Password Strength */
        .password-strength {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.75rem;
        }

        .strength-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: all 0.4s ease;
          border-radius: 3px;
        }

        .strength-label {
          font-size: 0.85rem;
          font-weight: 600;
          min-width: 80px;
          text-align: right;
        }

        .password-mismatch {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--error-red);
          font-size: 0.9rem;
          margin-top: 0.5rem;
          font-weight: 500;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--glass-border);
        }

        .action-btn {
          padding: 1rem 2rem;
          border-radius: 16px;
          font-weight: 600;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          flex: 1;
          justify-content: center;
        }

        .primary-btn {
          background: linear-gradient(
            135deg,
            var(--primary-orange),
            var(--secondary-gold)
          );
          color: white;
          box-shadow: 0 8px 24px rgba(255, 111, 0, 0.2);
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255, 111, 0, 0.3);
        }

        .secondary-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--error-red);
        }

        .secondary-btn:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Button Spinner */
        .btn-spinner {
          width: 18px;
          height: 18px;
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

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .profile-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .modern-profile-page {
            padding: 2rem 0;
          }

          .profile-container {
            padding: 0 1rem;
          }

          .profile-header {
            padding: 2rem 1.5rem;
            margin-bottom: 2rem;
          }

          .profile-header-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 2rem;
          }

          .profile-name {
            font-size: 2.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .card-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1.5rem;
            padding: 1.5rem;
          }

          .card-content {
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .avatar-wrapper {
            width: 120px;
            height: 120px;
          }

          .upload-area {
            min-width: auto;
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .profile-header {
            padding: 1.5rem 1rem;
          }

          .profile-name {
            font-size: 2rem;
          }

          .card-content {
            padding: 1rem;
          }

          .form-input {
            padding: 1rem 1.25rem;
          }

          .action-btn {
            padding: 0.875rem 1.5rem;
            font-size: 0.95rem;
          }

          .upload-icon {
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
          }
        }

        /* Accessibility */
        .action-btn:focus,
        .edit-toggle-btn:focus,
        .password-toggle:focus,
        .upload-confirm-btn:focus,
        .avatar-upload-btn:focus {
          outline: 2px solid var(--primary-orange);
          outline-offset: 2px;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          :root {
            --glass-border: rgba(255, 255, 255, 0.3);
            --text-muted: rgba(255, 255, 255, 0.8);
          }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: var(--glass-bg);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 111, 0, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 111, 0, 0.5);
        }
      `}</style>

      <div className="modern-profile-page">
        <div className="profile-container">
          {/* Header Section */}
          <header className="profile-header">
            <div className="profile-header-content">
              <div className="avatar-section">
                <div className="avatar-container">
                  <div className="avatar-wrapper">
                    <img
                      src={avatarUrl || "/avatarSrc.png"}
                      alt="Profile Avatar"
                      className="profile-avatar"
                    />
                    <div
                      className="avatar-overlay"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <button
                        className="avatar-upload-btn"
                        disabled={isLoading}
                      >
                        <FaCamera />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={`upload-area ${isDragOver ? "drag-over" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="upload-icon">
                    <FaCloudUploadAlt />
                  </div>
                  <div className="upload-text">
                    {newPic ? newPic.name : "Upload new photo"}
                  </div>
                  <div className="upload-hint">
                    Drop files here or click to browse
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  style={{ display: "none" }}
                />

                {newPic && (
                  <div className="upload-actions">
                    <button
                      className="upload-confirm-btn"
                      onClick={uploadPic}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="btn-spinner"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FaUpload />
                          <span>Save Photo</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-info">
                <div className="profile-name-section">
                  <h1 className="profile-name">
                    {profile.firstname} {profile.lastname}
                  </h1>
                  <p className="profile-username">@{profile.username}</p>
                </div>

                <div className="profile-details">
                  <div className="profile-detail-item">
                    <div className="detail-icon">
                      <FaEnvelope />
                    </div>
                    <div className="detail-content">
                      <div className="detail-label">Email Address</div>
                      <div className="detail-value">{profile.email}</div>
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <div className="detail-icon">
                      <FaUserCircle />
                    </div>
                    <div className="detail-content">
                      <div className="detail-label">Account Status</div>
                      <div className="detail-value">Active Member</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Alert Messages */}
          {(msg || error) && (
            <div className={`alert ${error ? "alert-error" : "alert-success"}`}>
              <div className="alert-icon">
                {error ? <FaTimes /> : <FaCheck />}
              </div>
              <div className="alert-message">{msg || error}</div>
            </div>
          )}

          {/* Main Content */}
          <div className="profile-content">
            {/* Personal Information Card */}
            <div className="profile-card">
              <div className="card-header">
                <div className="card-title-section">
                  <div className="card-icon">
                    <FaUser />
                  </div>
                  <div>
                    <h3 className="card-title">Personal Information</h3>
                    <p className="card-subtitle">
                      Manage your personal details
                    </p>
                  </div>
                </div>
                <button
                  className="edit-toggle-btn"
                  onClick={() =>
                    isEditing ? saveProfile() : setIsEditing(true)
                  }
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="btn-spinner"></div>
                  ) : isEditing ? (
                    <FaSave />
                  ) : (
                    <FaEdit />
                  )}
                  <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
                </button>
              </div>

              <div className="card-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={
                        isEditing
                          ? editedProfile.firstname || ""
                          : profile.firstname || ""
                      }
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          firstname: e.target.value,
                        })
                      }
                      disabled={!isEditing || isLoading}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={
                        isEditing
                          ? editedProfile.lastname || ""
                          : profile.lastname || ""
                      }
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          lastname: e.target.value,
                        })
                      }
                      disabled={!isEditing || isLoading}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={
                        isEditing
                          ? editedProfile.username || ""
                          : profile.username || ""
                      }
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          username: e.target.value,
                        })
                      }
                      disabled={!isEditing || isLoading}
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={
                        isEditing
                          ? editedProfile.email || ""
                          : profile.email || ""
                      }
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          email: e.target.value,
                        })
                      }
                      disabled={!isEditing || isLoading}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <button
                      className="action-btn secondary-btn"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedProfile(profile);
                      }}
                      disabled={isLoading}
                    >
                      <FaTimes />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Security Card */}
            <div className="profile-card">
              <div className="card-header">
                <div className="card-title-section">
                  <div className="card-icon">
                    <FaShieldAlt />
                  </div>
                  <div>
                    <h3 className="card-title">Security Settings</h3>
                    <p className="card-subtitle">Update your password</p>
                  </div>
                </div>
              </div>

              <div className="card-content">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="password-input-container">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      className="form-input"
                      value={oldPassword}
                      onChange={(e) => setOld(e.target.value)}
                      placeholder="Enter your current password"
                      disabled={isLoading}
                    />
                    <button
                      className="password-toggle"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      type="button"
                    >
                      {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNew(e.target.value)}
                      placeholder="Enter your new password"
                      disabled={isLoading}
                    />
                    <button
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      type="button"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: `${(passwordStrength.strength / 5) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        ></div>
                      </div>
                      <span
                        className="strength-label"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      disabled={isLoading}
                    />
                    <button
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      type="button"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {confirmPassword && newPassword !== confirmPassword && (
                    <div className="password-mismatch">
                      <FaTimes />
                      <span>Passwords don't match</span>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    className="action-btn primary-btn"
                    onClick={changePwd}
                    disabled={
                      !oldPassword ||
                      !newPassword ||
                      newPassword !== confirmPassword ||
                      isLoading
                    }
                  >
                    {isLoading ? (
                      <>
                        <div className="btn-spinner"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <FaLock />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
