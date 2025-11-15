// components/BottomNavHybrid.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNavHybrid() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav">
      <div 
        className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
        onClick={() => navigate('/dashboard')}
      >
        <span className="icon">🏠</span>
        <span className="label">Home</span>
      </div>
      <div 
        className={`nav-item ${isActive('/calendar') ? 'active' : ''}`}
        onClick={() => navigate('/calendar')}
      >
        <span className="icon">📅</span>
        <span className="label">Calendar</span>
      </div>
      <div 
        className={`nav-item ${isActive('/streak') ? 'active' : ''}`}
        onClick={() => navigate('/streak')}
      >
        <span className="icon">🔥</span>
        <span className="label">Streak</span>
      </div>
      <div 
        className={`nav-item ${isActive('/challenges') ? 'active' : ''}`}
        onClick={() => navigate('/challenges')}
      >
        <span className="icon">🏆</span>
        <span className="label">Challenges</span>
      </div>
      <div 
        className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
      >
        <span className="icon">👤</span>
        <span className="label">Profile</span>
      </div>
    </nav>
  );
}