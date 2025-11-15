// components/Challenges.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AI_suggestion.css';

const Challenges = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ai-suggestions');
  const [userGoal, setUserGoal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [error, setError] = useState('');

  // Your FREE Gemini API Key - replace with your actual key
  const GEMINI_API_KEY = 'AIzaSyArV8_HDoS_YXL_4ysGWB0VjnP5S_nvHSE';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

  // NEW: Enhanced sample suggestions with more categories
  const enhancedSampleSuggestions = {
    "lose weight": [
      {
        id: 1,
        name: "Morning Walk",
        description: "30-minute brisk walk every morning to boost metabolism",
        duration: "30 minutes",
        frequency: "daily",
        category: "Health",
        difficulty: "Beginner",
        benefits: ["Burns calories", "Improves metabolism", "Reduces stress", "Boosts energy"],
        schedule: "Morning 7:00 AM",
        tips: ["Start with 15 minutes if you're new", "Use comfortable shoes", "Track your steps", "Listen to podcasts or music"]
      }
    ],
    "reduce stress": [
      {
        id: 1,
        name: "Meditation",
        description: "10-minute mindfulness meditation session",
        duration: "10 minutes",
        frequency: "daily",
        category: "Mental Health",
        difficulty: "Beginner",
        benefits: ["Reduces anxiety", "Improves focus", "Promotes relaxation", "Better sleep"],
        schedule: "Morning 7:30 AM",
        tips: ["Find quiet space", "Focus on breathing", "Use guided meditation apps", "Be consistent"]
      }
    ],
    "learn guitar": [ // NEW: Specific guitar learning habits
      {
        id: 1,
        name: "Daily Practice Session",
        description: "15-30 minutes of focused guitar practice",
        duration: "15-30 minutes",
        frequency: "daily",
        category: "Music",
        difficulty: "Beginner",
        benefits: ["Builds muscle memory", "Improves finger dexterity", "Develops rhythm", "Speeds up learning"],
        schedule: "Evening 7:00 PM",
        tips: ["Use a metronome", "Start with basic chords", "Practice slowly first", "Record your progress"]
      },
      {
        id: 2,
        name: "Chord Transition Practice",
        description: "Practice switching between basic chords smoothly",
        duration: "10 minutes",
        frequency: "daily",
        category: "Music",
        difficulty: "Beginner",
        benefits: ["Improves song playing ability", "Builds finger strength", "Develops muscle memory", "Makes playing easier"],
        schedule: "During practice session",
        tips: ["Start with 2 chords", "Use a slow tempo", "Focus on accuracy", "Gradually increase speed"]
      },
      {
        id: 3,
        name: "Learn One New Song Section",
        description: "Learn and practice one section of a song each week",
        duration: "15 minutes",
        frequency: "3 times/week",
        category: "Music",
        difficulty: "Beginner",
        benefits: ["Provides motivation", "Builds repertoire", "Improves technique", "Makes practice fun"],
        schedule: "Flexible",
        tips: ["Choose simple songs first", "Break into small sections", "Use online tutorials", "Practice with backing tracks"]
      }
    ],
    "learn new skill": [ // NEW: Generic skill learning habits
      {
        id: 1,
        name: "Focused Learning Time",
        description: "Dedicated time for skill development",
        duration: "25 minutes",
        frequency: "daily",
        category: "Learning",
        difficulty: "Beginner",
        benefits: ["Builds consistency", "Prevents overwhelm", "Improves retention", "Shows steady progress"],
        schedule: "Morning or Evening",
        tips: ["Remove distractions", "Set clear goals", "Take short breaks", "Review what you learned"]
      }
    ]
  };

  // AI-powered habit suggestion function
  const getAIHabitSuggestions = async (goal) => {
    try {
      const prompt = `As a habit formation expert, suggest 3-4 specific, actionable daily habits for someone who wants to: "${goal}".

      For each habit, provide this exact JSON format:
      {
        "habits": [
          {
            "name": "Habit name",
            "description": "Clear, specific description",
            "duration": "e.g., 15 minutes, 30 minutes",
            "frequency": "e.g., daily, 5 times/week",
            "category": "Health/Study/Work/Personal/Mental/Music/Skill",
            "difficulty": "Beginner/Intermediate/Advanced",
            "benefits": ["benefit1", "benefit2", "benefit3"],
            "schedule": "Suggested time e.g., Morning 7:00 AM, Evening 6:00 PM",
            "tips": ["tip1", "tip2", "tip3"]
          }
        ]
      }

      Make habits:
      - Specific and measurable
      - Beginner-friendly where possible
      - Practical for daily life
      - Focused on consistency over intensity
      - Include variety (different times/categories)

      IMPORTANT: Make the habits specifically relevant to the goal "${goal}"`;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the text response
      const responseText = data.candidates[0].content.parts[0].text;
      console.log('AI Response:', responseText); // Debug log
      
      // Try to parse JSON from the response
      try {
        // Extract JSON from the response (Gemini might wrap it in markdown)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          return parsedData.habits.map((habit, index) => ({
            id: index + 1,
            ...habit
          }));
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // If JSON parsing fails, use fallback
        return getFallbackSuggestions(goal);
      }
      
      return getFallbackSuggestions(goal);
      
    } catch (error) {
      console.error('AI API Error:', error);
      // Use fallback suggestions if API fails
      return getFallbackSuggestions(goal);
    }
  };

  // UPDATED: Better fallback suggestions with more specific matching
  const getFallbackSuggestions = (goal) => {
    const goalLower = goal.toLowerCase();
    
    // More specific matching first
    if (goalLower.includes('guitar') || goalLower.includes('instrument') || goalLower.includes('music')) {
      return enhancedSampleSuggestions["learn guitar"];
    } else if (goalLower.includes('weight') || goalLower.includes('fit') || goalLower.includes('exercise') || goalLower.includes('diet')) {
      return enhancedSampleSuggestions["lose weight"];
    } else if (goalLower.includes('stress') || goalLower.includes('anxiety') || goalLower.includes('relax') || goalLower.includes('meditation')) {
      return enhancedSampleSuggestions["reduce stress"];
    } else if ((goalLower.includes('study') && !goalLower.includes('learn')) || goalLower.includes('exam') || goalLower.includes('homework')) {
      // Only match "study" if it's not combined with "learn"
      return [
        {
          id: 1,
          name: "Pomodoro Technique",
          description: "25 minutes focused study + 5 minutes break",
          duration: "25 minutes",
          frequency: "multiple times daily",
          category: "Study",
          difficulty: "Beginner",
          benefits: ["Improves focus", "Prevents burnout", "Increases retention", "Better time management"],
          schedule: "Flexible throughout day",
          tips: ["Use a timer", "Eliminate distractions", "Review after each session", "Take proper breaks"]
        }
      ];
    } else if (goalLower.includes('learn') || goalLower.includes('skill') || goalLower.includes('new hobby')) {
      return enhancedSampleSuggestions["learn new skill"];
    } else {
      // Generic suggestions for any goal
      return [
        {
          id: 1,
          name: "Daily Progress Tracking",
          description: `Track your daily progress toward: ${goal}`,
          duration: "5 minutes",
          frequency: "daily",
          category: "Personal",
          difficulty: "Beginner",
          benefits: ["Builds consistency", "Provides motivation", "Shows progress", "Identifies patterns"],
          schedule: "Evening 8:00 PM",
          tips: ["Use a journal or app", "Be honest with tracking", "Celebrate small wins", "Review weekly progress"]
        },
        {
          id: 2,
          name: "Goal-Oriented Action",
          description: `Take one small action each day toward: ${goal}`,
          duration: "10-15 minutes",
          frequency: "daily",
          category: "Personal",
          difficulty: "Beginner",
          benefits: ["Builds momentum", "Creates consistency", "Makes progress visible", "Builds confidence"],
          schedule: "Morning or Evening",
          tips: ["Break goal into small steps", "Focus on one thing at a time", "Celebrate small wins", "Be consistent"]
        },
        {
          id: 3,
          name: "Learning & Research",
          description: `Spend time learning about ${goal}`,
          duration: "20 minutes",
          frequency: "3 times/week",
          category: "Learning",
          difficulty: "Beginner",
          benefits: ["Builds knowledge", "Provides inspiration", "Helps with planning", "Avoids mistakes"],
          schedule: "Flexible",
          tips: ["Read articles or books", "Watch tutorials", "Join online communities", "Take notes"]
        }
      ];
    }
  };

  const handleGetSuggestions = async () => {
    if (!userGoal.trim()) {
      setError("Please enter your goal first!");
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      let foundSuggestions = [];

      // Try AI first if API key is set and valid
      if (GEMINI_API_KEY ) {
        console.log('Using AI for suggestions...');
        foundSuggestions = await getAIHabitSuggestions(userGoal);
      } else {
        console.log('Using fallback suggestions...');
        // Use enhanced fallback if no API key
        foundSuggestions = getFallbackSuggestions(userGoal);
      }

      console.log('Found suggestions:', foundSuggestions);
      setSuggestions(foundSuggestions);
      
    } catch (err) {
      console.error('Error getting suggestions:', err);
      setError("Failed to get AI suggestions. Using enhanced recommendations.");
      // Use fallback suggestions
      const fallbackSuggestions = getFallbackSuggestions(userGoal);
      setSuggestions(fallbackSuggestions);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitSelection = (habit) => {
    setSelectedHabits(prev => {
      const isSelected = prev.find(h => h.id === habit.id);
      if (isSelected) {
        return prev.filter(h => h.id !== habit.id);
      } else {
        return [...prev, habit];
      }
    });
  };

  const handleImplementHabits = () => {
    if (selectedHabits.length === 0) {
      setError("Please select at least one habit to implement!");
      return;
    }
    
    // Store selected habits for the AddHabit component
    localStorage.setItem('aiSuggestedHabits', JSON.stringify(selectedHabits));
    
    // Navigate to dashboard where they can add these habits
    navigate('/dashboard', { 
      state: { 
        showAddHabit: true,
        aiHabits: selectedHabits 
      } 
    });
  };

  const quickGoals = [
    "I want to lose weight",
    "I want to reduce stress", 
    "I want to study more efficiently",
    "I want to learn guitar",
    "I want to exercise regularly",
    "I want to improve sleep quality",
    "I want to learn a new skill",
    "I want to be more productive"
  ];

  return (
    <div className="challenges-container">
      <div className="challenges-header">
        {/* <h1>AI Habit Challenges</h1> */}
        <p>Get personalized habit suggestions based on your life goals</p>
        
        {/* API Key Status */}
        <div className={`api-notice ${GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' ? 'api-success' : 'api-warning'}`}>
          <span className="notice-icon">
            {GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' ? '✅' : 'ℹ️'}
          </span>
          <span>
            {GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' 
              ? 'AI-powered suggestions enabled with Gemini API' 
              : 'Using enhanced fallback suggestions. Get free Gemini API key for AI-powered suggestions.'}
          </span>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      

      {activeTab === 'ai-suggestions' && (
        <div className="ai-suggestions-container">
          <div className="goal-input-section">
            <h2>What's Your Goal?</h2>
            <div className="goal-input-container">
              <input
                type="text"
                value={userGoal}
                onChange={(e) => {
                  setUserGoal(e.target.value);
                  setError('');
                }}
                placeholder="e.g., I want to learn guitar, I want to lose weight..."
                className="goal-input"
                onKeyPress={(e) => e.key === 'Enter' && handleGetSuggestions()}
              />
              <button 
                onClick={handleGetSuggestions}
                disabled={loading || !userGoal.trim()}
                className="suggest-button"
              >
                {loading ? '🔮 Generating...' : '✨ Get Suggestions'}
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="quick-goals">
              <p>Try these common goals:</p>
              <div className="quick-goals-buttons">
                {quickGoals.map((goal, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setUserGoal(goal);
                      setError('');
                    }}
                    className="quick-goal-btn"
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading && (
            <div className="loading-suggestions">
              <div className="spinner"></div>
              <p>AI is generating personalized habit suggestions...</p>
              <small>Powered by Google Gemini AI</small>
            </div>
          )}

          {suggestions.length > 0 && !loading && (
            <div className="suggestions-results">
              <div className="results-header">
                <h3>✨ Personalized Habit Suggestions</h3>
                <p>Based on: "{userGoal}"</p>
                
                {selectedHabits.length > 0 && (
                  <div className="selection-info">
                    <span>{selectedHabits.length} habit(s) selected</span>
                    <button 
                      onClick={handleImplementHabits}
                      className="implement-button"
                    >
                      🚀 Implement Selected Habits
                    </button>
                  </div>
                )}
              </div>

              <div className="suggestions-grid">
                {suggestions.map((habit) => (
                  <div 
                    key={habit.id} 
                    className={`habit-suggestion-card ${selectedHabits.find(h => h.id === habit.id) ? 'selected' : ''}`}
                    onClick={() => toggleHabitSelection(habit)}
                  >
                    <div className="habit-card-header">
                      <h4>{habit.name}</h4>
                      <span className={`difficulty-badge ${habit.difficulty.toLowerCase()}`}>
                        {habit.difficulty}
                      </span>
                    </div>
                    
                    <p className="habit-description">{habit.description}</p>
                    
                    <div className="habit-details">
                      <div className="detail-item">
                        <span className="label">⏱️ Duration:</span>
                        <span>{habit.duration}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">📅 Frequency:</span>
                        <span>{habit.frequency}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">🕒 Schedule:</span>
                        <span>{habit.schedule}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">📊 Category:</span>
                        <span>{habit.category}</span>
                      </div>
                    </div>

                    <div className="benefits-section">
                      <strong>Benefits:</strong>
                      <ul>
                        {habit.benefits.map((benefit, index) => (
                          <li key={index}>✓ {benefit}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="tips-section">
                      <strong>💡 Tips:</strong>
                      <p>{habit.tips.join(' • ')}</p>
                    </div>

                    <div className="selection-indicator">
                      {selectedHabits.find(h => h.id === habit.id) ? '✅ Selected' : '⬜ Click to select'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'community' && (
        <div className="community-challenges">
          <h2>Community Challenges</h2>
          <div className="coming-soon">
            <p>🚧 Community features coming soon!</p>
            <p>Join group challenges and compete with friends.</p>
          </div>
        </div>
      )}

      {activeTab === 'my-challenges' && (
        <div className="my-challenges">
          <h2>My Active Challenges</h2>
          <div className="coming-soon">
            <p>📝 No active challenges yet.</p>
            <p>Start by getting AI suggestions above!</p>
          </div>
        </div>
      )}
      {/* Rest of your component... */}
    </div>
  );
};

export default Challenges;