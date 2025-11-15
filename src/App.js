// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import About from './components/About';
import Landing from './components/LandingPage';
import Calendar from './components/Calendar';
import HybridDashboard from './components/HybridDashboard';
import Streak from './components/Streak';
import StreakBattles from './components/StreakBattles'; // Add this import
import Notification from "./components/Notifications";
import './App.css';
import Challenges from './components/Challenges';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route shows Landing page */}
          <Route path="/" element={<Landing />} />
          <Route path="/notifications" element={<Notification />}/>
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/streak-battles" element={<StreakBattles />} /> {/* Add this route */}
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Other routes */}
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<HybridDashboard />} />
          
          {/* Redirect any unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/streak" element={<Streak />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;