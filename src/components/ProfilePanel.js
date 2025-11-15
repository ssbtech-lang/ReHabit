import React, { useState, useEffect } from "react";
import "./profilePanel.css";

export default function ProfilePanel({ user, onClose, onUserUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [stats, setStats] = useState({ streak: 0, habits: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditedUser(user);
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://rehabit-0wfi.onrender.com/api/user/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) handleSave();
    else setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://rehabit-0wfi.onrender.com/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedUser),
      });

      if (response.ok) {
        const data = await response.json();

        // Save ONLY the updated user
        localStorage.setItem("user", JSON.stringify(data.user));

        // Update parent state (crucial fix)
        if (onUserUpdate) {
          onUserUpdate(data.user);
        }

        setIsEditing(false);
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  if (!user) return null;

  return (
    <div className="profile-panel-overlay" onClick={onClose}>
      <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
        
        <div className="pp-header">
          <h2>PROFILE</h2>
          <button className="pp-close" onClick={onClose}>×</button>
        </div>

        <div className="pp-avatar">
          {user.username?.[0]?.toUpperCase() || "U"}
        </div>

        <div className="pp-info">
          <h3 className="pp-username">{user.username?.toUpperCase()}</h3>
          <p className="pp-email">{user.email}</p>
        </div>

        <button
          className="pp-edit-btn"
          onClick={handleEditToggle}
          disabled={loading}
        >
          {isEditing ? "💾 Save Changes" : "✏️ Edit Profile"}
        </button>

        <div className="pp-section">
          <h4>ACCOUNT DETAILS</h4>

          <div className="pp-field">
            <span className="pp-label">Email:</span>
            {isEditing ? (
              <input
                type="email"
                className="pp-input"
                value={editedUser.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            ) : (
              <span className="pp-value">{user.email}</span>
            )}
          </div>

          <div className="pp-field">
            <span className="pp-label">Username:</span>
            {isEditing ? (
              <input
                type="text"
                className="pp-input"
                value={editedUser.username}
                onChange={(e) => handleChange("username", e.target.value)}
              />
            ) : (
              <span className="pp-value">{user.username}</span>
            )}
          </div>

          <div className="pp-field">
            <span className="pp-label">Phone:</span>
            {isEditing ? (
              <input
                type="tel"
                className="pp-input"
                value={editedUser.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone"
              />
            ) : (
              <span className="pp-value">{user.phone || "Not provided"}</span>
            )}
          </div>
        </div>

        <div className="pp-stats">
          {/* <div className="pp-stat">
            <div className="pp-stat-value">{stats.streak || 0}</div>
            <div className="pp-stat-label">Streak</div>
          </div> */}

          <div className="pp-stat">
            <div className="pp-stat-value">{stats.habits || 0}</div>
            <div className="pp-stat-label">Habits</div>
          </div>
        </div>

        <button
          className="pp-logout"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
