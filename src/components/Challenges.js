import React, { useState, useEffect } from "react";
import "./Challenges.css";
import GroupProofs from "./GroupProofs";
import AI_suggestions from "./AI_suggestion";
import StreakBattles from "./StreakBattles";

export default function Challenges() {
  const [activeTab, setActiveTab] = useState("battles");
  const [isMobile, setIsMobile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const tabLabels = {
    battles: "⚔️ Streak Battles",
    groups: "👥 Group Proofs", 
    ai: "🤖 AI Suggestions"
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="challenges-container">
      <div className="challenges-header">
        <h1>Challenges & Battles</h1>
        <p>Compete, collaborate, and grow with friends</p>
      </div>

      {/* Tab Navigation - Toggle for mobile, tabs for desktop */}
      {isMobile ? (
        <div className="challenges-dropdown">
          <button 
            className="dropdown-toggle"
            onClick={toggleDropdown}
          >
            {tabLabels[activeTab]} ▼
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <button 
                className={`dropdown-item ${activeTab === "battles" ? "active" : ""}`}
                onClick={() => handleTabChange("battles")}
              >
                ⚔️ Streak Battles
              </button>
              <button 
                className={`dropdown-item ${activeTab === "groups" ? "active" : ""}`}
                onClick={() => handleTabChange("groups")}
              >
                👥 Group Proofs
              </button>
              <button 
                className={`dropdown-item ${activeTab === "ai" ? "active" : ""}`}
                onClick={() => handleTabChange("ai")}
              >
                🤖 AI Suggestions
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="challenges-tabs">
          <button 
            className={`tab ${activeTab === "battles" ? "active" : ""}`}
            onClick={() => setActiveTab("battles")}
          >
            ⚔️ Streak Battles
          </button>
          <button 
            className={`tab ${activeTab === "groups" ? "active" : ""}`}
            onClick={() => setActiveTab("groups")}
          >
            👥 Group Proofs
          </button>
          <button 
            className={`tab ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            🤖 AI Suggestions
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="challenges-content">
        {/* Streak Battles Tab */}
        {activeTab === "battles" && (
          <div className="tab-content">
            <StreakBattles />
          </div>
        )}

        {/* Group Proofs Tab */}
        {activeTab === "groups" && (
          <div className="tab-content">
            <GroupProofs />
          </div>
        )}

        {/* AI Suggestions Tab */}
        {activeTab === "ai" && (
          <div className="tab-content">
            <AI_suggestions />
          </div>
        )}
      </div>
    </div>
  );
}