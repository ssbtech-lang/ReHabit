// components/BottomNavHybrid.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNavHybrid({ onProfileClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav">
      
      {/* Home */}
      <div
        className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
        onClick={() => navigate("/dashboard")}
      >
        <span className="icon">🏠</span>
        <span className="label">Home</span>
      </div>

      {/* Calendar */}
      <div
        className={`nav-item ${isActive("/calendar") ? "active" : ""}`}
        onClick={() => navigate("/calendar")}
      >
        <span className="icon">📅</span>
        <span className="label">Calendar</span>
      </div>

      {/* Streak Battles */}
      {/* <div
        className={`nav-item ${isActive("/streak-battles") ? "active" : ""}`}
        onClick={() => navigate("/streak-battles")}
      >
        <span className="icon">⚔️</span>
        <span className="label">Battles</span>
      </div> */}

      {/* Challenges */}
      <div
        className={`nav-item ${isActive("/challenges") ? "active" : ""}`}
        onClick={() => navigate("/challenges")}
      >
        <span className="icon">🏆</span>
        <span className="label">Challenges</span>
      </div>

      {/* Notifications */}
      <div
        className={`nav-item ${isActive("/notifications") ? "active" : ""}`}
        onClick={() => navigate("/notifications")}
      >
        <span className="icon">🔔</span>
        <span className="label">Alerts</span>
      </div>

      {/* Profile — NOW OPENS SLIDE PANEL */}
      <div
        className="nav-item"
        onClick={() => onProfileClick()}
      >
        <span className="icon">👤</span>
        <span className="label">Profile</span>
      </div>

    </nav>
  );
}