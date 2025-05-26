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
      <div className="modern-profile-page">
        <div className="profile-container">
          <div className="alert alert-error">
            <div className="alert-content">
              <FaTimes />
              <span>{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="modern-profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-profile-page">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="header-background">
            <div className="header-gradient"></div>
            <div className="header-pattern"></div>
          </div>

          <div className="profile-header-content">
            <div className="profile-avatar-section">
              {/* Avatar Upload Area */}
              <div
                className={`avatar-upload-container ${
                  isDragOver ? "drag-over" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="avatar-wrapper">
                  <img
                    src={avatarUrl || "/avatarSrc.png"}
                    alt="Profile Avatar"
                    className="profile-avatar"
                  />
                  <div className="avatar-overlay">
                    <button
                      className="avatar-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <FaCamera />
                    </button>
                  </div>
                </div>

                <div className="upload-hint">
                  <p>Click to upload or drag & drop</p>
                  <span>PNG, JPG up to 2MB</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  style={{ display: "none" }}
                />
              </div>

              {newPic && (
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
              )}
            </div>

            <div className="profile-info">
              <div className="profile-name">
                <h1>
                  {profile.firstname} {profile.lastname}
                </h1>
                <p className="profile-username">@{profile.username}</p>
              </div>
              <div className="profile-email">
                <span>{profile.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {(msg || error) && (
          <div className={`alert ${error ? "alert-error" : "alert-success"}`}>
            <div className="alert-content">
              {error ? <FaTimes /> : <FaCheck />}
              <span>{msg || error}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="profile-content">
          <div className="profile-cards">
            {/* Personal Information Card */}
            <div className="profile-card">
              <div className="card-header">
                <div className="card-title">
                  <FaUser className="card-icon" />
                  <h3>Personal Information</h3>
                </div>
                <button
                  className="edit-btn"
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
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      className="modern-input"
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
                    <label>Last Name</label>
                    <input
                      type="text"
                      className="modern-input"
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

                <div className="form-row">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      className="modern-input"
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
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="modern-input"
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
                      className="cancel-btn"
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
                <div className="card-title">
                  <FaShieldAlt className="card-icon" />
                  <h3>Security Settings</h3>
                </div>
              </div>

              <div className="card-content">
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      className="modern-input"
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
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="modern-input"
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
                  <label>Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="modern-input"
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
                    className="update-password-btn"
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

      <style jsx>{`
        .modern-profile-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          padding: 2rem 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
            sans-serif;
        }

        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .profile-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: white;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 111, 0, 0.3);
          border-top: 3px solid #ff6f00;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        /* Header Section */
        .profile-header {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 120px;
          overflow: hidden;
        }

        .header-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%);
          opacity: 0.8;
        }

        .header-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: radial-gradient(
              circle at 20% 20%,
              rgba(255, 255, 255, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 80%,
              rgba(255, 255, 255, 0.05) 0%,
              transparent 50%
            );
        }

        .profile-header-content {
          position: relative;
          display: flex;
          align-items: end;
          padding: 2rem;
          gap: 2rem;
          z-index: 2;
        }

        /* Avatar Section */
        .profile-avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .avatar-upload-container {
          position: relative;
          border-radius: 20px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 2px dashed rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .avatar-upload-container.drag-over {
          border-color: #ff6f00;
          background: rgba(255, 111, 0, 0.1);
          transform: scale(1.02);
        }

        .avatar-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .avatar-wrapper:hover {
          transform: scale(1.05);
          border-color: #ff6f00;
        }

        .profile-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .avatar-wrapper:hover .avatar-overlay {
          opacity: 1;
        }

        .avatar-upload-btn {
          background: #ff6f00;
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .avatar-upload-btn:hover {
          background: #e66400;
          transform: scale(1.1);
        }

        .upload-hint {
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
        }

        .upload-hint p {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .upload-hint span {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .upload-confirm-btn {
          background: linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(255, 111, 0, 0.3);
        }

        .upload-confirm-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 111, 0, 0.4);
        }

        .upload-confirm-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Profile Info */
        .profile-info {
          flex: 1;
          color: white;
        }

        .profile-name h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .profile-username {
          font-size: 1.1rem;
          opacity: 0.8;
          margin: 0 0 1rem 0;
          font-weight: 500;
        }

        .profile-email {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 0.75rem 1rem;
          border-radius: 12px;
          display: inline-block;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .profile-email span {
          font-size: 0.95rem;
          opacity: 0.9;
        }

        /* Alert Messages */
        .alert {
          margin-bottom: 2rem;
          padding: 1rem 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(20px);
          border: 1px solid;
          animation: slideIn 0.3s ease;
        }

        .alert-success {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }

        /* Profile Content */
        .profile-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-cards {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .profile-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .profile-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 111, 0, 0.3);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
        }

        .card-icon {
          color: #ff6f00;
          font-size: 1.2rem;
        }

        .card-title h3 {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .edit-btn {
          background: rgba(255, 111, 0, 0.1);
          border: 1px solid rgba(255, 111, 0, 0.3);
          color: #ff6f00;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .edit-btn:hover:not(:disabled) {
          background: rgba(255, 111, 0, 0.2);
          transform: translateY(-1px);
        }

        .edit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .card-content {
          padding: 2rem;
        }

        /* Form Styles */
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .modern-input {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .modern-input:focus {
          outline: none;
          border-color: #ff6f00;
          box-shadow: 0 0 0 4px rgba(255, 111, 0, 0.1);
          background: rgba(255, 255, 255, 0.08);
        }

        .modern-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .modern-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        /* Password Input */
        .password-input-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .password-toggle:hover {
          color: #ff6f00;
          background: rgba(255, 111, 0, 0.1);
        }

        /* Password Strength */
        .password-strength {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .strength-label {
          font-size: 0.8rem;
          font-weight: 500;
        }

        .password-mismatch {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cancel-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }

        .update-password-btn {
          background: linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(255, 111, 0, 0.3);
          flex: 1;
          justify-content: center;
        }

        .update-password-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #e66400 0%, #ff6f00 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 111, 0, 0.4);
        }

        .update-password-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 4px 16px rgba(255, 111, 0, 0.2);
        }

        /* Button Spinner */
        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Animations */
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modern-profile-page {
            padding: 1rem 0;
          }

          .profile-container {
            padding: 0 0.5rem;
          }

          .profile-header-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1.5rem;
            padding: 1.5rem;
          }

          .profile-name h1 {
            font-size: 2rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .card-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
            padding: 1.5rem;
          }

          .card-content {
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .avatar-wrapper {
            width: 100px;
            height: 100px;
          }
        }

        @media (max-width: 480px) {
          .profile-header-content {
            padding: 1rem;
          }

          .profile-name h1 {
            font-size: 1.75rem;
          }

          .card-content {
            padding: 1rem;
          }

          .modern-input {
            padding: 0.875rem;
          }

          .upload-confirm-btn {
            padding: 0.625rem 1.25rem;
            font-size: 0.9rem;
          }
        }

        /* Dark mode enhancements */
        @media (prefers-color-scheme: dark) {
          .modern-profile-page {
            background: linear-gradient(135deg, #000000 0%, #0f0f0f 100%);
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .profile-card {
            border: 2px solid rgba(255, 255, 255, 0.3);
          }

          .modern-input {
            border: 2px solid rgba(255, 255, 255, 0.3);
          }

          .modern-input:focus {
            border: 2px solid #ff6f00;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Focus styles for accessibility */
        .edit-btn:focus,
        .cancel-btn:focus,
        .update-password-btn:focus,
        .upload-confirm-btn:focus,
        .avatar-upload-btn:focus,
        .password-toggle:focus {
          outline: 2px solid #ff6f00;
          outline-offset: 2px;
        }

        /* Hover effects for better UX */
        .profile-card {
          animation: fadeIn 0.6s ease;
        }

        .profile-card:nth-child(1) {
          animation-delay: 0.1s;
        }

        .profile-card:nth-child(2) {
          animation-delay: 0.2s;
        }

        /* Loading states */
        .form-group.loading .modern-input {
          background: rgba(255, 255, 255, 0.02);
          pointer-events: none;
        }

        /* Success states */
        .modern-input.success {
          border-color: #22c55e;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
        }

        /* Error states */
        .modern-input.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }

        /* Glassmorphism enhancement */
        .profile-header::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
              circle at 20% 20%,
              rgba(255, 111, 0, 0.05) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 80%,
              rgba(255, 143, 0, 0.03) 0%,
              transparent 50%
            );
          pointer-events: none;
          z-index: 1;
        }

        /* Enhanced shadows */
        .profile-card {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1),
            0 8px 32px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .update-password-btn {
          box-shadow: 0 4px 16px rgba(255, 111, 0, 0.3),
            0 8px 32px rgba(255, 111, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* Micro-interactions */
        .modern-input:hover:not(:disabled) {
          border-color: rgba(255, 111, 0, 0.5);
          background: rgba(255, 255, 255, 0.07);
        }

        .profile-avatar {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .avatar-wrapper:hover .profile-avatar {
          transform: scale(1.1);
        }

        /* Custom scrollbar for better aesthetics */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
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
    </div>
  );
}
