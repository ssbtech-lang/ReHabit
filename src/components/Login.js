// components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForms.css';

const Login = ({ onFormSwitch }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://rehabit-0wfi.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Save token to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Login successful:', data);
        
        // Navigate to About page
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-background">
    <div className="auth-container">
      <div className="welcome-section">
        <div className="background-animation">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
        </div>

        <div className="welcome-content">
          <div className="logo-container">
            <div className="logo">
              <span className="logo-emoji">🔥</span>
              <div className="logo-text">
                <h1>ReHabit</h1>
                <span>Build Better Habits</span>
              </div>
            </div>
          </div>

          <div className="welcome-text">
            <h2>Welcome Back!</h2>
            <p>Continue your journey to better habits with community support</p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span>Track Progress</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <span>Community Support</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span>Achievement System</span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Sign In</h2>
            <p className="form-subtitle">Welcome back to your habit journey</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <div className="input-container">
                <i className="input-icon">👤</i>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username or Email"
                  required
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-container">
                <i className="input-icon">🔒</i>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="form-input"
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" disabled={isLoading} />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#forgot" className="forgot-link">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="btn-spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="form-footer">
            <p>
              Don't have an account?{' '}
              <button 
                className="link-btn" 
                onClick={() => onFormSwitch('signup')}
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;