import React, { useState } from "react";
import { CheckCircle, TrendingUp, Target, Zap, Menu, X, PlusCircle, BarChart3, Award } from "lucide-react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    {
      title: "Smart Tracking",
      description: "Track habits with an intuitive interface and daily progress markers.",
      icon: CheckCircle
    },
    {
      title: "Streak Power",
      description: "Build momentum with visual streaks that keep you motivated.",
      icon: Zap
    },
    {
      title: "Growth Insights",
      description: "Understand patterns with charts and optimize your routine.",
      icon: TrendingUp
    },
    {
      title: "Goal Achievement",
      description: "Set targets and watch small actions create lasting change.",
      icon: Target
    },
  ];

  return (
    <div className="landing">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body, html {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          background: #0a0a0a;
          color: #ffffff;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }

        .landing {
          width: 100%;
          position: relative;
          min-height: 100vh;
        }

        /* Animated Gradient Background */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(circle at 20% 50%, rgba(255, 77, 94, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255, 138, 148, 0.06) 0%, transparent 50%),
                      #0a0a0a;
        }

        .bubble {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255, 77, 94, 0.2), rgba(255, 138, 148, 0.1));
          filter: blur(60px);
          animation: float-bubble 30s infinite ease-in-out;
        }

        .bubble::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid rgba(255, 77, 94, 0.2);
          transform: translate(-50%, -50%);
          animation: ripple 4s infinite ease-out;
        }

        @keyframes ripple {
          0% {
            width: 100%;
            height: 100%;
            opacity: 1;
          }
          100% {
            width: 250%;
            height: 250%;
            opacity: 0;
          }
        }

        .bubble:nth-child(1) {
          width: 400px;
          height: 400px;
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .bubble:nth-child(2) {
          width: 350px;
          height: 350px;
          top: 40%;
          right: -100px;
          animation-delay: 8s;
        }

        .bubble:nth-child(3) {
          width: 450px;
          height: 450px;
          bottom: -200px;
          left: 20%;
          animation-delay: 16s;
        }

        @keyframes float-bubble {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(60px, -60px) scale(1.1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-40px, 40px) scale(0.9);
            opacity: 0.4;
          }
          75% {
            transform: translate(50px, 20px) scale(1.05);
            opacity: 0.45;
          }
        }

        /* Navbar */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(10, 10, 10, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ff4d5e, #ff8a94);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        .nav-links {
          display: flex;
          gap: 40px;
          align-items: center;
        }

        .nav-links a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.3s;
        }

        .nav-links a:hover {
          color: #ff6b7a;
        }

        .nav-cta {
          padding: 10px 24px;
          background: linear-gradient(135deg, #ff4d5e, #ff8a94);
          color: white;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s;
        }

        .nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 77, 94, 0.4);
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 280px;
          background: rgba(20, 20, 20, 0.98);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          z-index: 101;
        }

        .mobile-menu.open {
          transform: translateX(0);
        }

        .mobile-menu a {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-weight: 500;
          font-size: 1.1rem;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .close-menu {
          align-self: flex-end;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          margin-bottom: 16px;
        }

        /* ----------- ENHANCED HERO SECTION ------------ */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 160px 32px 120px;
          position: relative;
          z-index: 10;
          background: 
            radial-gradient(circle at 50% 50%, rgba(255, 77, 94, 0.08) 0%, transparent 70%),
            linear-gradient(180deg, rgba(26, 26, 29, 0.6) 0%, rgba(10, 10, 10, 0.95) 100%);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          background: linear-gradient(135deg, rgba(255, 77, 94, 0.25), rgba(255, 138, 148, 0.2));
          border: 2px solid rgba(255, 77, 94, 0.5);
          border-radius: 100px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 40px;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 8px 32px rgba(255, 77, 94, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: badge-glow 3s ease-in-out infinite;
        }

        @keyframes badge-glow {
          0%, 100% {
            box-shadow: 
              0 8px 32px rgba(255, 77, 94, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 
              0 8px 40px rgba(255, 77, 94, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
          }
        }

        .hero-badge-dot {
          width: 10px;
          height: 10px;
          background: #ff4d5e;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(255, 77, 94, 1);
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
            box-shadow: 0 0 12px rgba(255, 77, 94, 1), 0 0 0 0 rgba(255, 77, 94, 0.7); 
          }
          50% { 
            opacity: 0.9; 
            transform: scale(1.4); 
            box-shadow: 0 0 20px rgba(255, 77, 94, 1), 0 0 0 15px rgba(255, 77, 94, 0); 
          }
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          max-width: 1200px;
          margin-bottom: 32px;
          color: #ffffff;
          text-shadow: 
            0 2px 40px rgba(255, 77, 94, 0.4),
            0 0 80px rgba(255, 77, 94, 0.2);
          animation: title-appear 1s ease-out;
        }

        @keyframes title-appear {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-title span {
          background: linear-gradient(135deg, #ff4d5e 0%, #ff8a94 50%, #ffc4c8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: gradient-shift 3s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
        }

        .hero-subtitle {
          font-size: clamp(1.2rem, 2.5vw, 1.65rem);
          font-weight: 400;
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.9);
          max-width: 750px;
          margin: 0 auto 50px;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
          letter-spacing: -0.01em;
        }

        .hero-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 22px 52px;
          font-size: 1.15rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ff4d5e 0%, #ff8a94 100%);
          color: #ffffff;
          border: none;
          border-radius: 16px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 12px 40px rgba(255, 77, 94, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .hero-cta-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .hero-cta-primary:hover::before {
          left: 100%;
        }

        .hero-cta-primary:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 
            0 16px 50px rgba(255, 77, 94, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .hero-cta-primary:active {
          transform: translateY(-2px) scale(0.98);
        }

        /* Stats Section */
        .stats {
          padding: 80px 24px;
          position: relative;
          z-index: 1;
        }

        .stats-container {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .stat-item {
          text-align: center;
          padding: 32px 24px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          backdrop-filter: blur(10px);
          transition: all 0.4s ease;
        }

        .stat-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 77, 94, 0.5);
          transform: translateY(-8px);
        }

        .stat-item h3 {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(135deg, #ff4d5e, #ff8a94);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 12px;
          line-height: 1;
        }

        .stat-item p {
          color: rgba(255, 255, 255, 0.75);
          font-size: 1rem;
          font-weight: 500;
        }

        /* Features Section */
        .features {
          padding: 100px 24px;
          position: relative;
          z-index: 1;
        }

        .features-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 70px;
        }

        .section-label {
          display: inline-block;
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ff6b7a;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: clamp(2.25rem, 5vw, 3.5rem);
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .section-description {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.7);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 40px 28px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          text-align: center;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 0%, rgba(255, 77, 94, 0.15), transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 77, 94, 0.5);
          transform: translateY(-8px);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(255, 77, 94, 0.25), rgba(255, 138, 148, 0.2));
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          position: relative;
          z-index: 1;
        }

        .feature-card:hover .feature-icon {
          animation: icon-bounce 0.6s ease;
        }

        @keyframes icon-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .feature-card h3 {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
          color: #ffffff;
        }

        .feature-card p {
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.6;
          position: relative;
          z-index: 1;
          font-size: 0.95rem;
        }

        /* How It Works Section */
        .how-it-works {
          padding: 100px 24px;
          position: relative;
          z-index: 1;
        }

        .how-it-works-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-bottom: 60px;
        }

        .step-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 48px 32px;
          text-align: center;
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .step-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 0%, rgba(255, 77, 94, 0.15), transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
          border-radius: 24px;
        }

        .step-card:hover::before {
          opacity: 1;
        }

        .step-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 77, 94, 0.5);
          transform: translateY(-8px);
        }

        .step-number {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, rgba(255, 77, 94, 0.25), rgba(255, 138, 148, 0.2));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 900;
          color: #ff4d5e;
        }

        .step-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(255, 77, 94, 0.25), rgba(255, 138, 148, 0.2));
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          position: relative;
          z-index: 1;
        }

        .step-card:hover .step-icon {
          animation: icon-bounce 0.6s ease;
        }

        .step-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: #ffffff;
          position: relative;
          z-index: 1;
        }

        .step-card p {
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.7;
          font-size: 1rem;
          position: relative;
          z-index: 1;
        }

        .success-banner {
          background: linear-gradient(135deg, rgba(255, 77, 94, 0.15), rgba(255, 138, 148, 0.1));
          border: 1px solid rgba(255, 77, 94, 0.3);
          border-radius: 24px;
          padding: 40px 48px;
          display: flex;
          align-items: center;
          gap: 32px;
          backdrop-filter: blur(10px);
          max-width: 900px;
          margin: 0 auto;
        }

        .success-banner h4 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .success-banner p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          font-size: 1rem;
        }

        /* CTA Section */
        .cta {
          padding: 120px 24px 140px;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .cta-content {
          max-width: 750px;
          margin: 0 auto;
        }

        .cta h2 {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 900;
          line-height: 1.15;
          margin-bottom: 28px;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .cta p {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 48px;
          line-height: 1.7;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 22px 52px;
          font-size: 1.2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ff4d5e 0%, #ff8a94 100%);
          color: #ffffff;
          border: none;
          border-radius: 16px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 12px 40px rgba(255, 77, 94, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .cta-button:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 
            0 16px 50px rgba(255, 77, 94, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .menu-toggle {
            display: block;
          }
          .hero {
            padding: 120px 20px 80px;
          }
          .hero-title {
            font-size: 2.5rem;
            margin-bottom: 24px;
          }
          .hero-subtitle {
            font-size: 1.1rem;
            margin-bottom: 36px;
          }
          .hero-cta-primary {
            padding: 18px 40px;
            font-size: 1rem;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .stats-container {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .stat-item h3 {
            font-size: 2.5rem;
          }
          .steps-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .success-banner {
            flex-direction: column;
            text-align: center;
            padding: 32px 24px;
            gap: 20px;
          }
        }
      `}</style>

      {/* Animated Background with Bubbles */}
      <div className="animated-bg">
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">HabitSync</div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#pricing">Pricing</a>
            <a href="/signup" className="nav-cta">Get Started</a>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <button className="close-menu" onClick={() => setMenuOpen(false)}>
          <X size={24} />
        </button>
        <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
        <button className="hero-cta-primary" onClick={() => navigate('/signup')}>Get Started</button>
      </div>

      {/* ENHANCED HERO SECTION */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          <span>Transform Your Life, One Habit at a Time</span>
        </div>
        <h1 className="hero-title">
          Build Better Habits with <span>HabitSync</span>
        </h1>
        <p className="hero-subtitle">
          Track your daily habits, build powerful streaks, and gain insights that help you achieve your goals with ease and consistency.
        </p>
        {/* <a href="/signup" className="hero-cta-primary">
          <span>Start Free Today</span>
        </a> */}
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <h3>10K+</h3>
            <p>Active Users</p>
          </div>
          <div className="stat-item">
            <h3>2M+</h3>
            <p>Habits Completed</p>
          </div>
          <div className="stat-item">
            <h3>89%</h3>
            <p>Success Rate</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="features-container">
          <div className="section-header">
            <div className="section-label">Features</div>
            <h2 className="section-title">Everything You Need to Succeed</h2>
            <p className="section-description">
              Powerful tools designed to help you build lasting habits
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="feature-card"
                >
                  <div className="feature-icon">
                    <Icon size={32} color="#ff4d5e" strokeWidth={2.5} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="how-it-works-container">
          <div className="section-header">
            <div className="section-label">How It Works</div>
            <h2 className="section-title">Get Started in 3 Simple Steps</h2>
            <p className="section-description">
              Building better habits has never been easier
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <PlusCircle size={36} color="#ff4d5e" strokeWidth={2.5} />
              </div>
              <h3>Create Your Habits</h3>
              <p>Add the habits you want to build with custom goals and reminders</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <CheckCircle size={36} color="#ff4d5e" strokeWidth={2.5} />
              </div>
              <h3>Track Daily Progress</h3>
              <p>Check off habits each day and watch your streaks grow stronger</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <BarChart3 size={36} color="#ff4d5e" strokeWidth={2.5} />
              </div>
              <h3>Analyze & Improve</h3>
              <p>Review insights and charts to optimize your routine for success</p>
            </div>
          </div>
          <div className="success-banner">
            <Award size={32} color="#ff4d5e" strokeWidth={2.5} />
            <div>
              <h4>Achieve Your Goals</h4>
              <p>Celebrate milestones and unlock achievements as you build lasting habits</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Build Better Habits?</h2>
          <p>Join thousands who transformed their lives through consistent action. Start your journey with HabitSync today — completely free.</p>
          <button className="cta-button" onClick={() => navigate('/signup')}>Get Started Now</button>
        </div>
      </section>
    </div>
  );
}