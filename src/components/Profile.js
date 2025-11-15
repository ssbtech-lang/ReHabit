// components/Profile.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: ""
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setFormData({
        name: userObj.name || "",
        email: userObj.email || "",
        phone: userObj.phone || "",
        bio: userObj.bio || "Focused on building better habits every day. 💪"
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // Update user data in localStorage
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    
    // Here you would typically make an API call to update the user profile
    console.log("Profile updated:", formData);
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <header className="profile-header">
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            ← Back
          </button>
          <h1>Profile</h1>
          <div className="header-actions">
            {isEditing ? (
              <button className="save-button" onClick={handleSave}>
                Save
              </button>
            ) : (
              <button className="edit-button" onClick={handleEditToggle}>
                Edit
              </button>
            )}
          </div>
        </header>

        <main className="profile-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="avatar-section">
              <div className="avatar">
                {getInitials(user.name)}
              </div>
              <div className="user-info">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="edit-input name-input"
                    placeholder="Your Name"
                  />
                ) : (
                  <h2 className="user-name">{user.name}</h2>
                )}
                <p className="user-email">{user.email}</p>
                <div className="member-since">
                  Member since {new Date().getFullYear()}
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview">
              <div className="stat-item">
                <div className="stat-value">12</div>
                <div className="stat-label">Current Streak</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">45</div>
                <div className="stat-label">Total Habits</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">78%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="details-section">
            <div className="section-header">
              <h3>Personal Information</h3>
            </div>

            <div className="detail-group">
              <label>Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <div className="detail-value">{user.email}</div>
              )}
            </div>

            <div className="detail-group">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="edit-input"
                  placeholder="Add phone number"
                />
              ) : (
                <div className="detail-value">
                  {user.phone || "Not provided"}
                </div>
              )}
            </div>

            <div className="detail-group">
              <label>Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="edit-textarea"
                  placeholder="Tell us about yourself..."
                  rows="3"
                />
              ) : (
                <div className="detail-value bio">
                  {user.bio || "Focused on building better habits every day. 💪"}
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="preferences-section">
            <div className="section-header">
              <h3>Preferences</h3>
            </div>
            
            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Daily Reminders</span>
                <span className="preference-description">Get notified about your daily habits</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Weekly Reports</span>
                <span className="preference-description">Receive weekly progress summaries</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Achievement Notifications</span>
                <span className="preference-description">Celebrate your milestones</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="actions-section">
            <button className="action-button secondary">
              Export Data
            </button>
            <button className="action-button secondary">
              Change Password
            </button>
            <button 
              className="action-button logout-button"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;