// components/HybridDashboard.js (Updated)
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderHybrid from "./HeaderHybrid";
import BottomNavHybrid from "./BottomNavHybrid";
import AddHabit from "./AddHabit";
import "./hybrid.css";
import ProfilePanel from "./ProfilePanel";

function uid(prefix = "id") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

// Helper function to check if habit exists on a given date
function habitExistsOnDate(habit, selectedDate) {
  const habitStartDate = habit.startDate || habit.createdAt;

  // If selectedDate is before start date → hide
  if (new Date(selectedDate) < new Date(habitStartDate)) {
    return false;
  }

  // ⭐ NEW: If habit has an end date and selectedDate is after end date → hide
  if (habit.endDate && new Date(selectedDate) > new Date(habit.endDate)) {
    return false;
  }

  return true;
}

export default function HybridDashboard() {
  const [habits, setHabits] = useState([]);
  const [xp, setXp] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [user, setUser] = useState(null);
  const isTodaySelected = selectedDate === todayKey();
  const [showProfile, setShowProfile] = useState(false);
  
  // AI Suggestion States
  const [aiHabitsToAdd, setAiHabitsToAdd] = useState([]);
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Handle AI suggestions from Challenges page - FIXED
  useEffect(() => {
    // Check if we're coming from Challenges with AI habits
    if (location.state?.showAddHabit && location.state?.aiHabits) {
      setAiHabitsToAdd(location.state.aiHabits);
      setShowModal(true);
      setCurrentHabitIndex(0);
      
      // ⭐ FIX: Clear the navigation state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
    
    // Also check localStorage for AI habits
    const storedHabits = localStorage.getItem('aiSuggestedHabits');
    if (storedHabits && !location.state?.aiHabits) {
      setAiHabitsToAdd(JSON.parse(storedHabits));
      setShowModal(true);
      setCurrentHabitIndex(0);
      localStorage.removeItem('aiSuggestedHabits');
    }
  }, [location]);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user]);

  const fetchHabits = () => {
    api.get('/habits')
      .then(response => setHabits(response.data))
      .catch(error => {
        console.error("Error fetching habits: ", error);
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      });
  };

  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showModal]);

// In your HybridDashboard.js, update the addHabit function and AI handling:

const addHabit = (newHabit) => {
  // Add startDate to new habit
  const habitWithDate = {
    ...newHabit,
    startDate: newHabit.startDate || todayKey()
  };
  
  api.post('/habits', habitWithDate)
    .then(response => {
      setHabits(prev => [...prev, response.data]);
      
      if (aiHabitsToAdd.length > 0) {
        if (currentHabitIndex < aiHabitsToAdd.length - 1) {
          // Move to next habit automatically after a short delay
          setTimeout(() => {
            setCurrentHabitIndex(prev => prev + 1);
            console.log('Moving to next habit:', currentHabitIndex + 1); // Debug
          }, 800); // Small delay to show success message
        } else {
          // All AI habits added
          setTimeout(() => {
            setShowModal(false);
            setAiHabitsToAdd([]);
            setCurrentHabitIndex(0);
            console.log('All AI habits added'); // Debug
          }, 800);
        }
      } else {
        setShowModal(false);
      }
    })
    .catch(error => {
      alert("Error adding habit!");
      console.error(error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    });
};

// ⭐ NEW: Function to handle closing modal during AI habit addition
const handleCloseModal = () => {
  if (aiHabitsToAdd.length > 0 && currentHabitIndex < aiHabitsToAdd.length - 1) {
    // If there are still habits to add, ask for confirmation
    const confirmClose = window.confirm(
      `You have ${aiHabitsToAdd.length - currentHabitIndex} more habits to add. Are you sure you want to cancel?`
    );
    if (!confirmClose) return;
  }
  
  setShowModal(false);
  setEditing(null);
  setAiHabitsToAdd([]);
  setCurrentHabitIndex(0);
};

const handleSkipHabit = () => {
  if (aiHabitsToAdd.length > 0 && currentHabitIndex < aiHabitsToAdd.length - 1) {
    // Move to next habit
    setCurrentHabitIndex(prev => prev + 1);
  } else {
    // No more habits to add
    setShowModal(false);
    setAiHabitsToAdd([]);
    setCurrentHabitIndex(0);
  }
};

  const updateHabit = (id, updates) => {
    api.put(`/habits/${id}`, updates)
      .then(response => {
        setHabits(prev => prev.map(h => h._id === id ? response.data : h));
        setShowModal(false);
        setEditing(null);
      })
      .catch(error => {
        alert("Error updating habit!");
        console.error(error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      });
  };

  const removeHabit = (id) => {
    api.delete(`/habits/${id}`)
      .then(() => {
        setHabits(prev => prev.filter(h => h._id !== id));
      })
      .catch(error => {
        alert("Error deleting habit!");
        console.error(error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      });
  };

  useEffect(() => {
  // This will ensure the form updates when we move to the next habit
  if (showModal && aiHabitsToAdd.length > 0) {
    // Force re-render of AddHabit with new data
    // The edit prop will automatically get the latest data from getCurrentHabitData()
  }
}, [currentHabitIndex, showModal, aiHabitsToAdd]);

  const markHabit = (habitId, date, status) => {
    const habit = habits.find(h => h._id === habitId);
    if (!habit) return;

    const updatedHabit = {
      ...habit,
      history: {
        ...habit.history,
        [date]: status
      }
    };

    api.put(`/habits/${habitId}`, { history: updatedHabit.history })
      .then(response => {
        setHabits(prev => prev.map(h => h._id === habitId ? response.data : h));
      })
      .catch(error => {
        console.error("Error updating habit status:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      });
  };

  const addNote = (habitId, date, text) => {
    const habit = habits.find(h => h._id === habitId);
    if (!habit) return;

    const updatedHabit = {
      ...habit,
      notes: {
        ...habit.notes,
        [date]: text
      }
    };

    api.put(`/habits/${habitId}`, { notes: updatedHabit.notes })
      .then(response => {
        setHabits(prev => prev.map(h => h._id === habitId ? response.data : h));
      })
      .catch(error => {
        console.error("Error updating habit note:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      });
  };

  // In HybridDashboard.js, update the getCurrentHabitData function:

// Get current AI habit data for pre-filling the form
const getCurrentHabitData = () => {
  if (aiHabitsToAdd.length > 0 && currentHabitIndex < aiHabitsToAdd.length) {
    const habit = aiHabitsToAdd[currentHabitIndex];
    console.log('Loading AI habit:', currentHabitIndex, habit); // Debug log
    return {
      habitName: habit.name,
      description: habit.description,
      frequency: habit.frequency.includes('daily') ? 'daily' : 
                habit.frequency.includes('weekly') ? 'weekly' : 'monthly',
      category: habit.category,
      startDate: new Date().toISOString().split('T')[0]
    };
  }
  return null;
};

  function HabitCardHybrid({ habit, date, onMark, onAddNote, onEdit, onRemove }) {
    const [note, setNote] = useState(habit.notes?.[date] || "");
    const status = habit.history?.[date] || "";
    const completedCount = Object.values(habit.history || {}).filter(v => v === "done").length;
    const progressPct = Math.min(100, (completedCount / Math.max(1, 21)) * 100);

    return (
      <article className="habit-card">
        <div className="card-head">
          <div className="chip" style={{ background: habit.color || "#da746f" }} />
          <div className="card-title">
            <div className="hname">{habit.title || habit.habitName}</div>
            <div className="hmeta">{habit.category || "General"}</div>
          </div>
          <div className="card-actions">
            <button className="small ghost" onClick={onEdit}>Edit</button>
            <button className="small ghost danger" onClick={onRemove}>Del</button>
          </div>
        </div>
        <div className="card-body">
          <div className="controls">
            <button className={`btn ${status === "done" ? "done" : ""}`} onClick={() => onMark(date, "done")}>Done</button>
            <button className={`btn ${status === "partial" ? "partial" : ""}`} onClick={() => onMark(date, "partial")}>Partial</button>
            <button className={`btn ${status === "skipped" ? "skipped" : ""}`} onClick={() => onMark(date, "skipped")}>Skip</button>
          </div>
          <div className="progress-row">
            <div className="progress-bar-shell">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="progress-text">{completedCount} completions</div>
          </div>
          <div className="note-row">
            <input
              className="note-input"
              placeholder="Add note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => onAddNote(date, note)}
            />
          </div>
        </div>
      </article>
    );
  }

  function HabitSummaryCard({ habit, date }) {
    const status = habit.history?.[date] || "";
    const habitStartDate = habit.startDate || habit.createdAt;
    const isHabitStarted = new Date(date) >= new Date(habitStartDate);

    if (!isHabitStarted) {
      return (
        <div className="habit-summary-card not-started">
          <div className="summary-header">
            <div className="summary-title">{habit.title || habit.habitName}</div>
            <div className="summary-indicator not-started-indicator">Not Started</div>
          </div>
          <div className="summary-meta">
            <span className="category-tag">{habit.category || "General"}</span>
            <span className="start-date">Starts: {new Date(habitStartDate).toLocaleDateString()}</span>
          </div>
          <div className="summary-status not-started-status">
            This habit wasn't created yet on this date
          </div>
        </div>
      );
    }

    return (
      <div className="habit-summary-card">
        <div className="summary-header">
          <div className="summary-title">{habit.title || habit.habitName}</div>
          <div className={`summary-indicator ${status ? 'has-entry' : 'no-entry'}`}>
            {status ? 'Tracked' : 'No Entry'}
          </div>
        </div>
        <div className="summary-meta">
          <span className="category-tag">{habit.category || "General"}</span>
        </div>
        <div className={`summary-status ${status || 'no-entry'}`}>
          {status === "done" && (
            <div className="status-item done-status">
              <span className="status-icon">✔</span>
              <span className="status-text">Done</span>
            </div>
          )}
          {status === "partial" && (
            <div className="status-item partial-status">
              <span className="status-icon">⏳</span>
              <span className="status-text">Partial</span>
            </div>
          )}
          {status === "skipped" && (
            <div className="status-item skipped-status">
              <span className="status-icon">❌</span>
              <span className="status-text">Skipped</span>
            </div>
          )}
          {!status && (
            <div className="status-item no-entry-status">
              <span className="status-icon">—</span>
              <span className="status-text">Not Done</span>
            </div>
          )}
        </div>
        {habit.notes?.[date] && (
          <div className="summary-note">
            <div className="note-label">Note:</div>
            <div className="note-text">{habit.notes[date]}</div>
          </div>
        )}
      </div>
    );
  }
  
  // Filter habits based on selected date
  const filteredHabits = habits.filter(habit => 
    habitExistsOnDate(habit, selectedDate)
  );

  // Redirect to login if no user
  if (!user) {
    return (
      <div className="loading-container">
        <p>Please log in to view your dashboard</p>
      </div>
    );
  }

  const total = filteredHabits.length;
  const doneToday = filteredHabits.filter(h => h.history?.[selectedDate] === "done").length;

  return (
    <div className="hybrid-dashboard">
      <div className="hybrid-root">
        <HeaderHybrid
          total={total}
          doneToday={doneToday}
          xp={xp}
          username={user.username}
          onDateSelect={(dateKey) => setSelectedDate(dateKey)}
          selectedDate={selectedDate}
        />

        <main className="hybrid-main">
          <section className="habits-column">
            {filteredHabits.length === 0 ? (
              <div className="empty-card">
                <div className="mascot">📅</div>
                <p>
                  {habits.length === 0 
                    ? `Welcome, ${user.username}! Tap the + button to add your first habit.`
                    : `No habits to track for ${new Date(selectedDate).toLocaleDateString()}. 
                       ${selectedDate < todayKey() ? 'This date is before your habits were created.' : 'Add a habit to get started!'}`
                  }
                </p>
              </div>
            ) : (
              <div className="cards-grid">
                {filteredHabits.map(habit =>
                  isTodaySelected ? (
                    <HabitCardHybrid
                      key={habit._id}
                      habit={habit}
                      date={selectedDate}
                      onMark={(date, status) => markHabit(habit._id, date, status)}
                      onAddNote={(date, txt) => addNote(habit._id, date, txt)}
                      onEdit={() => { setEditing(habit); setShowModal(true); }}
                      onRemove={() => removeHabit(habit._id)}
                    />
                  ) : (
                    <HabitSummaryCard
                      key={habit._id}
                      habit={habit}
                      date={selectedDate}
                    />
                  )
                )}
              </div>
            )}
          </section>
        </main>
        <button className="fab" onClick={() => { setEditing(null); setShowModal(true); }}>+</button>
        <BottomNavHybrid onProfileClick={() => setShowProfile(true)} />
          {showProfile && (
          <ProfilePanel
            user={user}
            onUserUpdate={setUser}
            onClose={() => setShowProfile(false)}
          />
        )}
        
        {/* Progress indicator when adding multiple AI habits */}
        {showModal && aiHabitsToAdd.length > 0 && (
          <div className="ai-habit-progress">
            <p>
              Adding AI Suggestions ({currentHabitIndex + 1}/{aiHabitsToAdd.length})
            </p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentHabitIndex + 1) / aiHabitsToAdd.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}


{showModal && (
  <div className="modal-backdrop" tabIndex="-1">
    <div className="modal-card">
      <AddHabit
        onAddHabit={(payload) => {
          if (editing) updateHabit(editing._id, payload);
          else addHabit(payload);
        }}
        onClose={handleCloseModal} // ⭐ Use the new close handler
        edit={editing || getCurrentHabitData()}
        isAISuggestion={aiHabitsToAdd.length > 0} // ⭐ NEW: Pass this prop
        currentAIIndex={currentHabitIndex} // ⭐ NEW: Pass current index
        totalAISuggestions={aiHabitsToAdd.length} // ⭐ NEW: Pass total count
      />
    </div>
  </div>
)}
      </div>
    </div>
  );
}