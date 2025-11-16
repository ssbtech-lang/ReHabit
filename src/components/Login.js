// components/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForms.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Reset state when component mounts
  useEffect(() => {
    setError('');
    setFormData({
      username: '',
      password: ''
    });
    setShowPassword(false);
    setIsLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
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

  const handleSignupRedirect = () => {
    navigate('/signup');
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
              <p>Continue your habit-building journey</p>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">📈</span>
                <span>Track Progress</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚔️</span>
                <span>Streak Battles</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span>Community Groups</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Welcome Back</h2>
              <p className="form-subtitle">Sign in to continue your journey</p>
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

              <button 
                type="submit" 
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Signing in...
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
                  onClick={handleSignupRedirect}
                  disabled={isLoading}
                  type="button"
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