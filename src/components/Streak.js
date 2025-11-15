// components/Streak.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Streak.css";

function Streak() {
  const [habits, setHabits] = useState([]);
  const [streakData, setStreakData] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const api = axios.create({
    baseURL: "https://rehabit-0wfi.onrender.com/api",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user, selectedYear]);

  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchHabits = () => {
    api
      .get("/habits")
      .then((response) => {
        setHabits(response.data);
        calculateStreakData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching habits: ", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      });
  };

  const calculateStreakData = (habits) => {
    const today = new Date();
    const startDate = new Date(selectedYear, 0, 1); // Jan 1
    const endDate = new Date(selectedYear, 11, 31); // Dec 31

    const streakMap = {};
    let currentStreakCount = 0;
    let longestStreakCount = 0;
    let tempStreak = 0;

    // Initialize year dates
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = getDateKey(new Date(d));
      streakMap[dateKey] = { completed: false, intensity: 0 };
    }

    // Mark completed days and intensities
    habits.forEach((habit) => {
      Object.keys(habit.history || {}).forEach((dateKey) => {
        if (habit.history[dateKey] === "done" && streakMap[dateKey]) {
          streakMap[dateKey].completed = true;
          streakMap[dateKey].intensity++;
        }
      });
    });

    // Current streak (consecutive days up to today)
    let checkDate = new Date(today);
    while (checkDate >= new Date(selectedYear, 0, 1)) {
      const key = getDateKey(checkDate);
      if (streakMap[key] && streakMap[key].completed) {
        currentStreakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Longest streak in year
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const key = getDateKey(new Date(d));
      if (streakMap[key] && streakMap[key].completed) {
        tempStreak++;
        longestStreakCount = Math.max(longestStreakCount, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    setStreakData(streakMap);
    setCurrentStreak(currentStreakCount);
    setLongestStreak(longestStreakCount);
  };

  // ------------------ MONTH-WISE HEATMAP (LEETCODE STYLE) ------------------
  const generateMonthWiseHeatmap = () => {
    const months = [];
    const today = new Date();

    for (let month = 0; month < 12; month++) {
      const start = new Date(selectedYear, month, 1);
      const end = new Date(selectedYear, month + 1, 0);

      // Prepare 7 rows (Mon–Sun)
      const rows = [[], [], [], [], [], [], []]; // 0–6 = Mon–Sun

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = (d.getDay() + 6) % 7; // Monday-first fix (0=Mon, 6=Sun)
        const dateKey = getDateKey(d);
        const dayData = streakData[dateKey] || { completed: false, intensity: 0 };

        let intensityClass = 'empty';
        if (dayData.completed) {
          if (dayData.intensity >= 3) intensityClass = 'high';
          else if (dayData.intensity >= 2) intensityClass = 'medium';
          else intensityClass = 'low';
        }

        const isToday = getDateKey(d) === getDateKey(today);
        const isFuture = d > today;

        rows[dayOfWeek].push(
          <div
            key={dateKey}
            className={`streak-box ${intensityClass} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}`}
            title={`${d.toLocaleDateString()}: ${dayData.completed ? `${dayData.intensity} habit(s) completed` : 'No habits completed'}`}
          />
        );
      }

      // Build month column
      months.push(
        <div className="month-block" key={month}>
          <div className="month-grid">
            {rows.map((row, i) => (
              <div className="month-row" key={i}>{row}</div>
            ))}
          </div>
          <div className="month-label">{start.toLocaleString("en-US", { month: "short" })}</div>
        </div>
      );
    }

    return months;
  };

  const getTotalCompletedDays = () => {
    return Object.values(streakData).filter((day) => day.completed).length;
  };

  if (!user) {
    return (
      <div className="streak-loading">
        <p>Please log in to view your streak</p>
      </div>
    );
  }

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 2; year--) {
    yearOptions.push(year);
  }

  return (
    <div className="streak-dashboard">
      <div className="streak-container">
        {/* Header */}
        <header className="streak-header">
          <div className="header-content">
            <div>
              <h1>Habit Streak</h1>
              <p className="header-subtitle">Your consistency journey</p>
            </div>
            <div className="year-selector">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="year-dropdown"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <main className="streak-main">
          {/* Stats */}
          <section className="streak-stats">
            <div className="stat-card">
              <div className="stat-value">{currentStreak}</div>
              <div className="stat-label">Current Streak</div>
              <div className="stat-icon">🔥</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{longestStreak}</div>
              <div className="stat-label">Longest Streak</div>
              <div className="stat-icon">🏆</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{getTotalCompletedDays()}</div>
              <div className="stat-label">Total Days</div>
              <div className="stat-icon">📅</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {Object.values(streakData).length > 0
                  ? Math.round((getTotalCompletedDays() / Object.values(streakData).length) * 100)
                  : 0}
                %
              </div>
              <div className="stat-label">Completion Rate</div>
              <div className="stat-icon">📊</div>
            </div>
          </section>

          {/* Heatmap Section */}
          <section className="heatmap-section">
            <div className="heatmap-header">
              <h2>{selectedYear} Heatmap</h2>
              <div className="heatmap-legend">
                <div className="legend-item">
                  <div className="legend-color empty"></div>
                  <span>No activity</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color low"></div>
                  <span>1 habit</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color medium"></div>
                  <span>2 habits</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color high"></div>
                  <span>3+ habits</span>
                </div>
              </div>
            </div>

            <div className="heatmap-wrapper">
              <div className="month-wise-heatmap">
                {generateMonthWiseHeatmap()}
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {habits.length === 0 ? (
                <div className="empty-state">
                  <p>No habits tracked yet. Start building your streak!</p>
                </div>
              ) : (
                habits.slice(0, 5).map((habit) => (
                  <div key={habit._id} className="activity-item">
                    <div className="activity-habit">{habit.habitName}</div>
                    <div className="activity-stats">
                      <span className="activity-count">
                        {Object.values(habit.history || {}).filter((s) => s === "done").length} days
                      </span>
                      <span className="activity-category">{habit.category}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Streak;