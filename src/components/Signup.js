// components/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import './AuthForms.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Add this hook

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

    // Basic validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://rehabit-0wfi.onrender.com/api/signup', {
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
        
        console.log('Signup successful:', data);
        // Redirect to dashboard after successful signup
        navigate('/dashboard');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to login page
  const handleLoginRedirect = () => {
    navigate('/login');
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
              <h2>Start Your Journey!</h2>
              <p>Join our community and build better habits together</p>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🎮</span>
                <span>Gamified Progress</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤝</span>
                <span>Community Support</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Smart Analytics</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Join our habit-building community</p>
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
                    placeholder="Username"
                    required
                    className="form-input"
                    disabled={isLoading}
                    minLength="3"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-container">
                  <i className="input-icon">📧</i>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
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
                    minLength="6"
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

              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  <input type="checkbox" required disabled={isLoading} />
                  <span className="checkmark"></span>
                  I agree to the <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>
                </label>
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="form-footer">
              <p>
                Already have an account?{' '}
                <button 
                  className="link-btn" 
                  onClick={handleLoginRedirect} // Use the navigation function
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;