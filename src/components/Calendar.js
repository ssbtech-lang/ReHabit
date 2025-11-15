// components/Calendar.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Calendar.css";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const api = axios.create({
    baseURL: 'https://rehabit-0wfi.onrender.com/api',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user]);

  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchHabits = () => {
    api.get('/habits')
      .then(response => {
        setHabits(response.data);
        calculateDailyProgress(response.data);
      })
      .catch(error => {
        console.error("Error fetching habits: ", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      });
  };

  // Check if a habit is active on a specific date
  const isHabitActiveOnDate = (habit, date) => {
    const dateKey = getDateKey(date);
    const startDate = habit.startDate;
    const endDate = habit.endDate;
    
    // If no start date, habit is always active
    if (!startDate) return true;
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    const current = new Date(dateKey);
    
    // Check if current date is after or equal to start date
    if (current < start) return false;
    
    // If there's an end date, check if current date is before or equal to end date
    if (end && current > end) return false;
    
    return true;
  };

  // Get active habits for a specific date
  const getActiveHabitsOnDate = (date) => {
    return habits.filter(habit => isHabitActiveOnDate(habit, date));
  };

  const calculateDailyProgress = (habits) => {
    const progress = {};
    
    // Get all unique dates from all habits' history
    const allDates = new Set();
    habits.forEach(habit => {
      Object.keys(habit.history || {}).forEach(date => {
        allDates.add(date);
      });
    });
    
    // For each date, calculate progress considering ALL habits (ORIGINAL LOGIC)
    allDates.forEach(date => {
      progress[date] = {
        total: habits.length, // Count ALL habits (ORIGINAL)
        done: 0,
        habits: []
      };
      
      habits.forEach(habit => {
        const status = habit.history?.[date];
        if (status === 'done') {
          progress[date].done++;
        }
        progress[date].habits.push({
          id: habit._id,
          name: habit.habitName,
          status: status || 'undone',
          category: habit.category,
          startDate: habit.startDate,
          endDate: habit.endDate
        });
      });
    });
    
    // Also calculate for today and selected date to ensure they're always available
    const todayKey = getDateKey(new Date());
    const selectedKey = getDateKey(selectedDate);
    
    if (!progress[todayKey]) {
      progress[todayKey] = {
        total: habits.length,
        done: 0,
        habits: habits.map(habit => ({
          id: habit._id,
          name: habit.habitName,
          status: habit.history?.[todayKey] || 'undone',
          category: habit.category,
          startDate: habit.startDate,
          endDate: habit.endDate
        }))
      };
      // Count done habits for today
      progress[todayKey].done = habits.filter(habit => 
        habit.history?.[todayKey] === 'done'
      ).length;
    }
    
    if (!progress[selectedKey] && selectedKey !== todayKey) {
      progress[selectedKey] = {
        total: habits.length,
        done: 0,
        habits: habits.map(habit => ({
          id: habit._id,
          name: habit.habitName,
          status: habit.history?.[selectedKey] || 'undone',
          category: habit.category,
          startDate: habit.startDate,
          endDate: habit.endDate
        }))
      };
      // Count done habits for selected date
      progress[selectedKey].done = habits.filter(habit => 
        habit.history?.[selectedKey] === 'done'
      ).length;
    }
    
    setDailyProgress(progress);
  };

  const markHabitAsDone = (habitId, date) => {
    const dateKey = getDateKey(date);
    
    const habit = habits.find(h => h._id === habitId);
    if (habit?.history?.[dateKey] === 'done') {
      return;
    }

    api.put(`/habits/${habitId}`, { 
      history: { 
        ...(habit?.history || {}),
        [dateKey]: 'done'
      }
    })
    .then(response => {
      const updatedHabits = habits.map(h => 
        h._id === habitId ? response.data : h
      );
      setHabits(updatedHabits);
      calculateDailyProgress(updatedHabits);
    })
    .catch(error => {
      console.error("Error marking habit as done:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    });
  };

  // Check if a date is in the future
  const isFutureDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date) => {
    const today = new Date();
    return getDateKey(date) === getDateKey(today);
  };

  const isSelected = (date) => {
    return getDateKey(date) === getDateKey(selectedDate);
  };

  const getProgressForDate = (date) => {
  const dateKey = getDateKey(date);
  // Filter only active habits on this date
  const activeHabits = getActiveHabitsOnDate(date);
  return {
    total: activeHabits.length,
    done: activeHabits.filter(habit => habit.history?.[dateKey] === 'done').length,
    habits: activeHabits.map(habit => ({
      id: habit._id,
      name: habit.habitName,
      status: habit.history?.[dateKey] || 'undone',
      category: habit.category,
      startDate: habit.startDate,
      endDate: habit.endDate
    }))
  };
};

  const getProgressPercentage = (date) => {
    const progress = getProgressForDate(date);
    return progress.total > 0 ? (progress.done / progress.total) * 100 : 0;
  };

  const getProgressColor = (percentage) => {
    if (percentage === 0) return '#e5e7eb';
    if (percentage < 33) return '#fca5a5';
    if (percentage < 66) return '#fcd34d';
    if (percentage < 100) return '#86efac';
    return '#4ade80';
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const handleDateClick = (date) => {
    if (isFutureDate(date)) {
      return; // Don't allow clicking future dates
    }
    setSelectedDate(date);
  };

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const calendar = [];

    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i);
      calendar.push({ date, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      calendar.push({ date, isCurrentMonth: true });
    }

    const totalCells = 42;
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    
    for (let i = 1; calendar.length < totalCells; i++) {
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
      calendar.push({ date, isCurrentMonth: false });
    }

    return calendar;
  };

  const getWeeklyProgress = () => {
    const weekDays = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const progress = getProgressForDate(date);
      const percentage = progress.total > 0 ? (progress.done / progress.total) * 100 : 0;
      
      weekDays.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: getDateKey(date),
        percentage: percentage,
        done: progress.done,
        total: progress.total
      });
    }
    
    return weekDays;
  };

  const calendar = generateCalendar();
  const selectedDateProgress = getProgressForDate(selectedDate);
  const selectedDateKey = getDateKey(selectedDate);
  const weeklyProgress = getWeeklyProgress();

  // Filter habits for display only (not for counting)
  const displayHabits = selectedDateProgress.habits.filter(habit => 
    isHabitActiveOnDate(habit, selectedDate)
  );

  // Calculate active habits count for display (ONLY FOR DISPLAY)
  const activeHabitsCount = getActiveHabitsOnDate(selectedDate).length;

  if (!user) {
    return (
      <div className="calendar-loading">
        <p>Please log in to view your calendar</p>
      </div>
    );
  }

  return (
    <div className="calendar-dashboard">
      <div className="calendar-container">
        {/* Header */}
        <header className="calendar-header">
          <div className="header-content">
            <div>
              <h1>Calendar</h1>
              <p className="header-subtitle">Track your habit progress</p>
            </div>
            <div className="header-actions">
              <div className="date-display">
                {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
              </div>
            </div>
          </div>
        </header>

        <main className="calendar-main">
          <div className="calendar-layout">
            {/* Calendar Grid */}
            <section className="calendar-section">
              <div className="calendar-controls">
                <button onClick={() => navigateMonth(-1)} className="nav-button">
                  ←
                </button>
                <button onClick={() => navigateMonth(1)} className="nav-button">
                  →
                </button>
              </div>

              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="weekday-header">
                    {day}
                  </div>
                ))}
                
                {calendar.map(({ date, isCurrentMonth }, index) => {
                  const progress = getProgressForDate(date);
                  const percentage = getProgressPercentage(date);
                  const progressColor = getProgressColor(percentage);
                  const isDateToday = isToday(date);
                  const isDateSelected = isSelected(date);
                  const isFuture = isFutureDate(date);
                  
                  // Calculate active habits for this date (FOR DISPLAY ONLY)
                  const activeHabitsForDate = getActiveHabitsOnDate(date);
                  const activeDoneCount = activeHabitsForDate.filter(habit => 
                    habit.history?.[getDateKey(date)] === 'done'
                  ).length;
                  
                  return (
                    <div
                      key={index}
                      className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${
                        isDateToday ? 'today' : ''
                      } ${isDateSelected ? 'selected' : ''} ${
                        isFuture ? 'future-date' : ''
                      }`}
                      onClick={() => handleDateClick(date)}
                    >
                      <div className="day-number">{date.getDate()}</div>
                      {isFuture && <div className="future-overlay">🔒</div>}
                      {!isFuture && activeHabitsForDate.length > 0 && (
                        <div className="progress-indicator">
                          <div 
                            className="progress-bar"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: progressColor
                            }}
                          />
                          <div className="progress-text">
                            {activeDoneCount}/{activeHabitsForDate.length}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Sidebar */}
            <aside className="calendar-sidebar">
              <div className="sidebar-section">
                <h3>Selected Date</h3>
                <div className="selected-date-info">
                  <div className="date-title">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  {isToday(selectedDate) && (
                    <div className="today-badge">Today</div>
                  )}
                  {isFutureDate(selectedDate) && (
                    <div className="future-badge">Future Date</div>
                  )}
                </div>
              </div>

              <div className="sidebar-section">
                <h3>Progress</h3>
                <div className="progress-stats">
                  <div className="stat">
                    <div className="stat-value">{activeHabitsCount}</div>
                    <div className="stat-label">Active Habits</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{selectedDateProgress.done}</div>
                    <div className="stat-label">Completed</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      {activeHabitsCount > 0 
                        ? Math.round((selectedDateProgress.done / activeHabitsCount) * 100)
                        : 0
                      }%
                    </div>
                    <div className="stat-label">Completion</div>
                  </div>
                </div>
              </div>

              <div className="sidebar-section">
                <h3>Weekly Overview</h3>
                <div className="weekly-chart">
                  {weeklyProgress.map((day, index) => (
                    <div key={index} className="chart-day">
                      <div className="day-label">{day.date}</div>
                      <div className="chart-bar-container">
                        <div 
                          className="chart-bar"
                          style={{ 
                            height: `${day.percentage}%`,
                            backgroundColor: getProgressColor(day.percentage)
                          }}
                        />
                      </div>
                      <div className="day-count">{day.done}/{day.total}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sidebar-section">
                <h3>
                  {isFutureDate(selectedDate) ? "Future Date" : 
                   displayHabits.length === 0 ? "No Active Habits" : "Today's Habits"}
                </h3>
                <div className="habits-list">
                  {isFutureDate(selectedDate) ? (
                    <div className="empty-state">
                      <p>Future dates cannot be tracked</p>
                    </div>
                  ) : displayHabits.length === 0 ? (
                    <div className="empty-state">
                      <p>No active habits for this date</p>
                    </div>
                  ) : (
                    displayHabits.map(habit => {
                      const habitStatus = habit.status || 'undone';
                      const isDone = habitStatus === 'done';
                      const canMarkDone = !isDone && isToday(selectedDate);
                      
                      return (
                        <div key={habit.id} className="habit-item">
                          <div className="habit-info">
                            <div className="habit-name">{habit.name}</div>
                            <div className="habit-category">{habit.category}</div>
                          </div>
                          <div className="habit-status">
                            {isDone ? (
                              <span className="status-done">Completed</span>
                            ) : canMarkDone ? (
                              <button 
                                className="mark-done-btn"
                                onClick={() => markHabitAsDone(habit.id, selectedDate)}
                              >
                                Mark Done
                              </button>
                            ) : (
                              <span className="status-pending">
                                {isToday(selectedDate) ? "Pending" : "Not Done"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Calendar;