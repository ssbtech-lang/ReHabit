// components/AddHabit.js (Fully Updated)
import React, { useState, useEffect } from "react";
import "./AddHabit.css";

function AddHabit({ onAddHabit, onClose, edit, isAISuggestion, currentAIIndex, totalAISuggestions }) {
  const [habitName, setHabitName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [category, setCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⭐ Add today's date (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  // ⭐ CRITICAL FIX: Reset form when edit prop changes (for AI habits)
  useEffect(() => {
    if (edit) {
      setHabitName(edit.habitName || "");
      setDescription(edit.description || "");
      setStartDate(edit.startDate || today);
      setEndDate(edit.endDate || "");
      setFrequency(edit.frequency || "daily");
      setCategory(edit.category || "General");
    } else {
      // Reset form for new habit
      setHabitName("");
      setDescription("");
      setStartDate(today);
      setEndDate("");
      setFrequency("daily");
      setCategory("General");
    }
    setError("");
    setSuccessMessage("");
    setIsSubmitting(false);
  }, [edit, today]); // ⭐ This dependency ensures form updates when edit prop changes

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    if (!habitName.trim()) {
      setError("Habit Name is required");
      setIsSubmitting(false);
      return;
    }
    if (startDate && isNaN(Date.parse(startDate))) {
      setError("Start Date is invalid");
      setIsSubmitting(false);
      return;
    }
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      setError("End Date cannot be before Start Date");
      setIsSubmitting(false);
      return;
    }

    const newHabit = {
      habitName,
      description,
      startDate: startDate || today,
      endDate,
      frequency,
      category,
    };

    setTimeout(() => {
      onAddHabit(newHabit);
      setSuccessMessage("Habit added successfully!");
      
      // ⭐ Don't reset form for AI suggestions - let parent component handle the flow
      if (!isAISuggestion) {
        setTimeout(() => {
          setHabitName("");
          setDescription("");
          setStartDate(today);
          setEndDate("");
          setFrequency("daily");
          setCategory("General");
          setIsSubmitting(false);
        }, 1000);
      } else {
        setIsSubmitting(false);
      }
    }, 500);
  };

  const handleSkip = () => {
    onAddHabit({ skip: true });
  };

  const habitTips = [
    "Start small and be consistent",
    "Track your progress daily",
    "Set realistic goals",
    "Celebrate small wins",
    "Pair habits with existing routines"
  ];

  return (
    <div className="add-habit-modal">
      <div className="addHabitFormHybrid">
        <div className="addHabitLeft">
          <div className="leftContent">
            <div className="headerSection">
              <div className="habitIcon">
                <svg width="80" height="80" fill="none" viewBox="0 0 80 80">
                  <rect x="16" y="18" width="48" height="44" rx="8" fill="#fff6f5" stroke="#d6304c" strokeWidth="2"/>
                  <rect x="22" y="24" width="36" height="32" rx="6" fill="#fffafe" stroke="#da746f" strokeWidth="1.5"/>
                  <path d="M40 42 l5 7-8-2-8 2 5-7-5-7 8 2 8-2-5 7z" fill="#fffafe" stroke="#d6304c" strokeWidth="1.5"/>
                  <rect x="28" y="14" width="5" height="10" rx="2.5" fill="#da746f"/>
                  <rect x="47" y="14" width="5" height="10" rx="2.5" fill="#da746f"/>
                </svg>
              </div>
              
              {/* ⭐ AI Progress Indicator */}
              {isAISuggestion && totalAISuggestions > 1 && (
                <div className="ai-progress-indicator">
                  <div className="ai-progress-text">
                    Adding AI Habits ({currentAIIndex + 1}/{totalAISuggestions})
                  </div>
                  <div className="ai-progress-bar">
                    <div 
                      className="ai-progress-fill"
                      style={{ width: `${((currentAIIndex + 1) / totalAISuggestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <h2 className="title">
                {edit ? "Edit Habit" : 
                 isAISuggestion ? "Add AI Suggested Habit" : "Add New Habit"}
              </h2>
              
              {isAISuggestion && (
                <p className="ai-habit-description">
                  {edit?.description || "AI-suggested habit based on your goals"}
                </p>
              )}
            </div>

            <div className="mainContent">
              <div className="habitTips">
                <h3 className="tipsTitle">
                  <span className="tipsIcon">💡</span>
                  Habit Tips
                </h3>
                <ul className="tipsList">
                  {habitTips.map((tip, index) => (
                    <li key={index} className="tipItem">
                      <span className="tipBullet"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="motivationQuote">
                <div className="quoteIcon">✨</div>
                <p className="quoteText">
                  {isAISuggestion 
                    ? "This habit was suggested by AI to help you reach your goals!" 
                    : '"Small daily improvements lead to stunning results"'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="addHabitRight">
          <button className="closeButton" onClick={onClose} title="Close" type="button" aria-label="Close dialog">
            &times;
          </button>
          
          <form onSubmit={handleSubmit} className="formHybrid" noValidate>
            {error && (
              <p className="error" role="alert" aria-live="polite">{error}</p>
            )}
            {successMessage && (
              <p className="success" role="status" aria-live="polite">
                {successMessage}
                {isAISuggestion && currentAIIndex < totalAISuggestions - 1 && (
                  <span className="next-habit-notice">
                    <br />Preparing next habit...
                  </span>
                )}
              </p>
            )}

            <div className="formSection">
              <div className="formGroup">
                <label htmlFor="habitName" className="label">
                  <span className="required">Habit Name*</span>
                </label>
                <input
                  id="habitName"
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="Enter habit name"
                  className="input"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="formGroup">
                <label htmlFor="description" className="label">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description about this habit"
                  className="textarea"
                  disabled={isSubmitting}
                  rows="3"
                />
              </div>
            </div>

            <div className="formSection">
              <div className="rowDateGroup">
                <div className="formGroup dateGroup">
                  <label htmlFor="startDate" className="label">Start Date</label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input"
                    min={today}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="formGroup dateGroup">
                  <label htmlFor="endDate" className="label">End Date (Optional)</label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input"
                    min={startDate || today}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="formSection">
              <div className="formGroup">
                <label htmlFor="frequency" className="label">Frequency</label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="input"
                  disabled={isSubmitting}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="formGroup">
                <label htmlFor="category" className="label">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input"
                  disabled={isSubmitting}
                >
                  <option value="General">General</option>
                  <option value="Health">Health</option>
                  <option value="Study">Study</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Music">Music</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Mental">Mental Health</option>
                </select>
              </div>
            </div>

            

<div className="formActions">
  <button 
    type="submit" 
    className="button primaryButton"
    disabled={isSubmitting}
  >
    {isSubmitting ? "Adding..." : 
     edit ? "Update Habit" : 
     isAISuggestion && currentAIIndex < totalAISuggestions - 1 
       ? `Add Habit (${currentAIIndex + 1}/${totalAISuggestions})` 
       : "Add Habit"}
  </button>
  
  {/* ⭐ FIXED: Skip button shows for ALL AI habits except the last one */}
  {isAISuggestion && currentAIIndex < totalAISuggestions - 1 && (
    <button 
      type="button" 
      className="button skipButton"
      onClick={handleSkip}
      disabled={isSubmitting}
    >
      Skip This Habit
    </button>
  )}
</div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddHabit;