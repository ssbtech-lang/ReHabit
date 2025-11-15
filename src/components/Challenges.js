import React, { useState, useEffect } from "react";
import "./Challenges.css";
import GroupProofs from "./GroupProofs";
import AI_suggestions from "./AI_suggestion"; // Import the AI_suggestions component
import StreakBattles from "./StreakBattles";
export default function Challenges() {
  const [activeTab, setActiveTab] = useState("battles");
  const [streakBattles, setStreakBattles] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  useEffect(() => {
    // Mock data for other tabs
    setStreakBattles([
      {
        id: 1,
        opponent: { name: "Alex", avatar: "👨‍💻" },
        habit: "Morning Run",
        myStreak: 7,
        opponentStreak: 5,
        endDate: "2024-01-20",
        status: "active"
      },
      {
        id: 2,
        opponent: { name: "Sam", avatar: "👩‍🎨" },
        habit: "Meditation",
        myStreak: 3,
        opponentStreak: 3,
        endDate: "2024-01-25",
        status: "active"
      }
    ]);

    setAiSuggestions([
      {
        id: 1,
        goal: "Lose Weight",
        habits: ["Morning Walk", "Drink Water", "Healthy Lunch"],
        difficulty: "Beginner",
        duration: "4 weeks"
      },
      {
        id: 2,
        goal: "Reduce Stress",
        habits: ["Meditation", "Digital Detox", "Gratitude Journal"],
        difficulty: "Easy",
        duration: "3 weeks"
      }
    ]);
  }, []);

  const startNewBattle = () => {
    console.log("Start new streak battle");
  };

  const applyAiSuggestion = (suggestionId) => {
    console.log("Apply AI suggestion:", suggestionId);
  };

  const sendNudge = (battleId) => {
    alert(`Nudge sent! Your friend will be encouraged to keep their streak! 🔥`);
  };

  return (
    <div className="challenges-container">
      <div className="challenges-header">
        <h1>Challenges & Battles</h1>
        <p>Compete, collaborate, and grow with friends</p>
      </div>

      {/* Tab Navigation */}
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
            <AI_suggestions /> {/* Replace the existing content with the AI_suggestions component */}
          </div>
        )}
      </div>
    </div>
  );
}