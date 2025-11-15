import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StreakBattles.css";

// Axios instance with dynamic token
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add request interceptor to always use fresh token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function StreakBattles() {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [currentUser] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      if (!u) return null;
      return {
        ...u,
        _id: u.id || u._id
      };
    } catch (error) {
      console.error('Error parsing user:', error);
      return null;
    }
  });

  const [newBattle, setNewBattle] = useState({
    opponentUsername: "",
    habit: "",
    duration: 7, // Default 7 days
    stake: 0 // Points stake
  });

  // Fetch battles on mount and set up auto-refresh
  useEffect(() => {
    fetchBattles();
    
    // Set up interval to auto-refresh battles every 30 seconds
    const interval = setInterval(() => {
      fetchBattles();
    }, 30000);
    
    // Enhanced event listeners for habit updates from dashboard
    const handleHabitUpdate = () => {
      console.log('🔄 Habit update event received');
      setTimeout(fetchBattles, 1000);
    };
    
    const handleHabitMarkedDone = (event) => {
      console.log('✅ Habit marked done event received:', event.detail);
      // Force immediate sync when habit is marked done
      setTimeout(() => {
        fetchBattles();
        syncAllBattles();
      }, 1000);
    };
    
    window.addEventListener('habitUpdated', handleHabitUpdate);
    window.addEventListener('habitMarkedDone', handleHabitMarkedDone);
    
    // Expose sync function to window for dashboard access
    window.syncStreakBattles = syncAllBattles;
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('habitUpdated', handleHabitUpdate);
      window.removeEventListener('habitMarkedDone', handleHabitMarkedDone);
      delete window.syncStreakBattles;
    };
  }, []);

  // Fetch only battles where user is involved
  const fetchBattles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/streak-battles');
      
      if (response.data.battles && Array.isArray(response.data.battles)) {
        console.log('⚔️ Battles found:', response.data.battles.length);
        setBattles(response.data.battles);
      } else {
        setBattles([]);
      }
    } catch (error) {
      console.error('❌ Error fetching battles:', error);
      setBattles([]);
    } finally {
      setLoading(false);
    }
  };

  // Search users for battle creation
  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await api.get(`/users/search?query=${query}`);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    }
  };

  // Create a new battle
  const createBattle = async () => {
    try {
      if (!newBattle.opponentUsername.trim()) {
        alert("Please select an opponent.");
        return;
      }
      if (!newBattle.habit.trim()) {
        alert("Please enter a habit.");
        return;
      }

      console.log('⚔️ Creating battle with:', newBattle.opponentUsername);

      const response = await api.post('/streak-battles', newBattle);

      console.log('✅ Battle created successfully');
      
      setBattles(prev => [response.data.battle, ...prev]);
      setShowCreateModal(false);
      resetCreateForm();
      
      // Show success message with habit creation info
      if (response.data.habitsCreated) {
        alert(`🎉 Battle created! The habit "${newBattle.habit}" has been automatically added to both players' habit lists!`);
      } else {
        alert('Battle challenge sent successfully!');
      }
      
      // Refresh habits in parent component if needed
      if (window.refreshHabits) {
        window.refreshHabits();
      }
      
    } catch (error) {
      console.error('❌ Error creating battle:', error);
      alert(error.response?.data?.message || 'Error creating battle');
    }
  };

  // Send nudge to opponent
  const sendNudge = async (battleId) => {
    try {
      await api.post(`/streak-battles/${battleId}/nudge`);
      alert('💌 Nudge sent! Your opponent will be encouraged to keep their streak!');
    } catch (error) {
      console.error('Error sending nudge:', error);
      alert('Error sending nudge: ' + (error.response?.data?.message || error.message));
    }
  };

  // Update streak for today
  const updateStreak = async (battleId, completed) => {
    try {
      const response = await api.post(`/streak-battles/${battleId}/streak`, {
        completed: completed
      });

      // Update local state
      setBattles(prev => prev.map(battle => 
        battle._id === battleId ? response.data.battle : battle
      ));

      if (completed) {
        alert('✅ Streak updated! Great job maintaining your habit!');
      } else {
        alert('❌ Streak missed. Better luck tomorrow!');
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      alert('Error updating streak: ' + (error.response?.data?.message || error.message));
    }
  };

  // Manual sync from habits (for when habits are updated in dashboard)
  const syncFromHabits = async (battleId = null) => {
    try {
      console.log('🔄 Syncing battles from habits...');
      
      if (battleId) {
        // Sync specific battle
        const response = await api.post(`/streak-battles/${battleId}/sync-from-habit`, {
          completed: true,
          force: true
        });
        
        // Update local state
        setBattles(prev => prev.map(battle => 
          battle._id === battleId ? response.data.battle : battle
        ));
        
        console.log('✅ Battle synced:', battleId);
      } else {
        // Sync all battles by refetching
        await fetchBattles();
        console.log('✅ All battles synced from habits');
      }
    } catch (error) {
      console.error('Error syncing from habits:', error);
      // Don't show alert for sync errors as they might be expected
    }
  };

  // Reset create battle form
  const resetCreateForm = () => {
    setNewBattle({
      opponentUsername: "",
      habit: "",
      duration: 7,
      stake: 0
    });
    setSearchResults([]);
    setSearchQuery("");
  };

  // Helper functions
  const getMyStreak = (battle) => {
    return battle.participants.find(p => p.user._id === currentUser?._id)?.currentStreak || 0;
  };

  const getOpponentStreak = (battle) => {
    return battle.participants.find(p => p.user._id !== currentUser?._id)?.currentStreak || 0;
  };

  const getMyPoints = (battle) => {
    return battle.participants.find(p => p.user._id === currentUser?._id)?.totalPoints || 0;
  };

  const getOpponentPoints = (battle) => {
    return battle.participants.find(p => p.user._id !== currentUser?._id)?.totalPoints || 0;
  };

  const getOpponent = (battle) => {
    return battle.participants.find(p => p.user._id !== currentUser?._id)?.user;
  };

  const hasUserCompletedToday = (battle) => {
    const myParticipant = battle.participants.find(p => p.user._id === currentUser?._id);
    if (!myParticipant || !myParticipant.lastUpdate) return false;
    
    const lastUpdate = new Date(myParticipant.lastUpdate);
    const today = new Date();
    return lastUpdate.toDateString() === today.toDateString();
  };

  const hasOpponentCompletedToday = (battle) => {
    const opponentParticipant = battle.participants.find(p => p.user._id !== currentUser?._id);
    if (!opponentParticipant || !opponentParticipant.lastUpdate) return false;
    
    const lastUpdate = new Date(opponentParticipant.lastUpdate);
    const today = new Date();
    return lastUpdate.toDateString() === today.toDateString();
  };

  const getBattleStatus = (battle) => {
    const today = new Date();
    const endDate = new Date(battle.endDate);
    
    if (today > endDate) return 'completed';
    return 'active';
  };

  const getDaysRemaining = (battle) => {
    const today = new Date();
    const endDate = new Date(battle.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Calculate bonus points when opponent misses streak
  const calculateBonusPoints = (battle) => {
    const myCompleted = hasUserCompletedToday(battle);
    const opponentCompleted = hasOpponentCompletedToday(battle);
    
    // You get bonus points if you complete and opponent doesn't
    if (myCompleted && !opponentCompleted) {
      return 5; // Bonus points for being consistent when opponent fails
    }
    return 0;
  };

  // Refresh battles function
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchBattles();
  };

  // Auto-sync all battles from habits
  const syncAllBattles = async () => {
    try {
      console.log('🔄 Syncing all battles from habits...');
      await fetchBattles();
      console.log('✅ All battles synced with latest habit progress!');
    } catch (error) {
      console.error('Error syncing all battles:', error);
    }
  };

  return (
    <div className="streak-battles-container">
      <div className="section-header">
        <h2>Active Streak Battles</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <button 
            className="btn-secondary"
            onClick={syncAllBattles}
            disabled={loading}
          >
            🔄 Sync from Habits
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + New Battle
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
        <strong>Current User:</strong> {currentUser?.username} | <strong>Active Battles:</strong> {battles.length}
        <br />
        <small>Battles auto-sync every 30 seconds and when habits are updated in dashboard</small>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          Loading battles...
        </div>
      ) : battles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚔️</div>
          <h3>No Active Battles</h3>
          <p>Challenge a friend to a streak battle and compete to maintain your habits!</p>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Start Your First Battle
          </button>
        </div>
      ) : (
        <div className="battles-grid">
          {battles.map(battle => {
            const myStreak = getMyStreak(battle);
            const opponentStreak = getOpponentStreak(battle);
            const myPoints = getMyPoints(battle);
            const opponentPoints = getOpponentPoints(battle);
            const opponent = getOpponent(battle);
            const status = getBattleStatus(battle);
            const daysRemaining = getDaysRemaining(battle);
            const completedToday = hasUserCompletedToday(battle);
            const opponentCompletedToday = hasOpponentCompletedToday(battle);
            const bonusPoints = calculateBonusPoints(battle);
            
            return (
              <div key={battle._id} className="battle-card">
                <div className="battle-header">
                  <div className="opponent-info">
                    <span className="avatar">{opponent?.username?.charAt(0)?.toUpperCase() || '?'}</span>
                    <span className="name">vs {opponent?.username || 'Unknown'}</span>
                  </div>
                  <div className={`status ${status}`}>
                    {status === 'active' ? `${daysRemaining}d left` : 'Completed'}
                  </div>
                </div>
                
                <div className="battle-habit">{battle.habit}</div>
                
                <div className="streak-comparison">
                  <div className="streak-item">
                    <div className="streak-value">{myStreak}</div>
                    <div className="streak-label">Your Streak</div>
                    <div className="points-badge">{myPoints} pts</div>
                  </div>
                  <div className="vs">🔥</div>
                  <div className="streak-item">
                    <div className="streak-value">{opponentStreak}</div>
                    <div className="streak-label">Opponent</div>
                    <div className="points-badge">{opponentPoints} pts</div>
                  </div>
                </div>

                {/* Bonus Points Display */}
                {bonusPoints > 0 && (
                  <div className="bonus-points">
                    🎉 +{bonusPoints} bonus points! You maintained your streak while opponent missed today!
                  </div>
                )}

                {/* Today's Status */}
                <div className="today-status">
                  <div className="status-item">
                    <span className="status-label">You:</span>
                    <span className={`status-value ${completedToday ? 'completed' : 'pending'}`}>
                      {completedToday ? '✅ Completed' : '⏳ Pending'}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Opponent:</span>
                    <span className={`status-value ${opponentCompletedToday ? 'completed' : 'pending'}`}>
                      {opponentCompletedToday ? '✅ Completed' : '⏳ Pending'}
                    </span>
                  </div>
                </div>

                <div className="battle-meta">
                  <div className="meta-item">
                    <span className="meta-label">Duration:</span>
                    <span className="meta-value">{battle.duration} days</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Stake:</span>
                    <span className="meta-value">{battle.stake} points</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Bonus:</span>
                    <span className="meta-value">+5 pts when opponent misses</span>
                  </div>
                </div>

                {status === 'active' && (
                  <div className="streak-actions">
                    {!completedToday ? (
                      <div className="streak-buttons">
                        <button 
                          className="btn-success"
                          onClick={() => updateStreak(battle._id, true)}
                        >
                          ✅ Mark Done (+10 pts)
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => updateStreak(battle._id, false)}
                        >
                          ❌ Skip Today
                        </button>
                      </div>
                    ) : (
                      <div className="completed-today">
                        ✅ You completed today's habit! (+10 points)
                        {!opponentCompletedToday && (
                          <div className="bonus-notice">
                            🎉 Opponent hasn't completed yet - you'll get +5 bonus points if they miss!
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Manual sync button for battle habits */}
                    <div className="sync-section">
                      <button 
                        className="btn-sync"
                        onClick={() => syncFromHabits(battle._id)}
                        title="Sync battle progress from habit completion"
                      >
                        🔄 Sync from Habit
                      </button>
                      <small>Use this if you marked the habit done in dashboard</small>
                    </div>
                  </div>
                )}

                <div className="battle-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => sendNudge(battle._id)}
                    disabled={opponentCompletedToday}
                  >
                    {opponentCompletedToday ? '✅ Opponent Completed' : '💌 Send Nudge'}
                  </button>
                  <button className="btn-primary">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Battle Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Challenge to Streak Battle</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Opponent Username *</label>
                <div className="search-container">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchUsers(e.target.value);
                    }}
                    placeholder="Search users by username..."
                    className="form-input"
                  />
                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map(user => (
                        <div
                          key={user._id}
                          className="search-result-item"
                          onClick={() => {
                            setNewBattle(prev => ({
                              ...prev,
                              opponentUsername: user.username
                            }));
                            setSearchQuery(user.username);
                            setSearchResults([]);
                          }}
                        >
                          {user.username}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Habit to Track *</label>
                <input
                  type="text"
                  value={newBattle.habit}
                  onChange={(e) => setNewBattle(prev => ({
                    ...prev, habit: e.target.value
                  }))}
                  placeholder="e.g., Morning Run, Meditation, Reading"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Battle Duration (days)</label>
                <select
                  value={newBattle.duration}
                  onChange={(e) => setNewBattle(prev => ({
                    ...prev, duration: parseInt(e.target.value)
                  }))}
                  className="form-select"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={21}>21 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>

              <div className="form-group">
                <label>Points Stake (optional)</label>
                <input
                  type="number"
                  value={newBattle.stake}
                  onChange={(e) => setNewBattle(prev => ({
                    ...prev, stake: parseInt(e.target.value) || 0
                  }))}
                  placeholder="0"
                  min="0"
                  max="1000"
                  className="form-input"
                />
                <small>The winner gets these bonus points at the end of the battle</small>
              </div>

              <div className="points-info">
                <h4>Points System:</h4>
                <ul>
                  <li>✅ Complete habit: <strong>+10 points</strong></li>
                  <li>🎉 Opponent misses while you complete: <strong>+5 bonus points</strong></li>
                  <li>❌ Skip habit: <strong>Reset streak to 0</strong></li>
                  <li>🏆 Winner gets stake points at the end</li>
                </ul>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={createBattle}
                disabled={!newBattle.opponentUsername.trim() || !newBattle.habit.trim()}
              >
                Send Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}