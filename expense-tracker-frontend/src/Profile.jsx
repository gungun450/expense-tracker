import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  const uid = authUser?.uid;
  const email = authUser?.email || "—";

  const [categoryCount, setCategoryCount] = useState(0);

  // ── Fetch category count ──────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:8080/categories/${uid}`, {
          credentials: "include",
        });
        const data = await res.json();
        setCategoryCount(
          Array.isArray(data) ? data.length : data.categories?.length || 0,
        );
      } catch (e) {
        /* ignore */
      }
    })();
  }, [uid]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get initials from email (e.g. "john@..." → "J")
  const getInitials = () =>
    email && email !== "—" ? email[0].toUpperCase() : "U";

  return (
    <div className="profile-root">
      {/* Top bar */}
      <header className="profile-topbar">
        <h1 className="profile-page-title">Profile</h1>
      </header>

      <div className="profile-content">
        {/* ── Avatar + identity card ───────────────────────── */}
        <div className="profile-card profile-hero">
          <div className="profile-avatar">{getInitials()}</div>
          <div className="profile-hero-info">
            <h2 className="profile-hero-name">{email}</h2>
            <p className="profile-hero-uid">
              User ID: <strong>#{uid}</strong>
            </p>
            <span className="profile-badge badge-active">● Active</span>
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────────── */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-label">User ID</div>
            <div className="stat-value" style={{ fontSize: "22px" }}>
              #{uid}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Categories</div>
            <div className="stat-value">{categoryCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Account</div>
            <div
              className="stat-value"
              style={{ fontSize: "16px", paddingTop: "6px" }}
            >
              ✅ Active
            </div>
          </div>
        </div>

        {/* ── Account details (read-only, only email available) ── */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Account Details</h3>
            <span className="profile-info-hint">
              More details available once profile endpoint is added
            </span>
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <label>Email</label>
              <span>{email}</span>
            </div>
            <div className="profile-field">
              <label>User ID</label>
              <span>#{uid}</span>
            </div>
            <div className="profile-field profile-field-locked">
              <label>Full Name</label>
              <span className="profile-locked">
                — <em>not available yet</em>
              </span>
            </div>
            <div className="profile-field profile-field-locked">
              <label>Phone Number</label>
              <span className="profile-locked">
                — <em>not available yet</em>
              </span>
            </div>
          </div>
        </div>

        {/* ── Change password ─────────────────────────────────── */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div>
              <h3 className="profile-card-title">Password</h3>
              <p className="profile-card-subtitle">
                Reset your account password via email
              </p>
            </div>
            <button
              className="btn btn-outline-purple"
              onClick={() => navigate("/forgot-password")}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* ── Account actions ─────────────────────────────────── */}
        <div className="profile-card profile-danger-card">
          <h3 className="profile-card-title">Account Actions</h3>
          <div className="profile-danger-row">
            <button className="btn btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
