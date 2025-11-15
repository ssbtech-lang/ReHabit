import React from "react";

function PerformanceAnalytics({ habits, selectedDate }) {
  
  // Function to calculate performance metrics
  const calculatePerformance = () => {
    const selected = new Date(selectedDate);
    const last7Days = [];
    
    // Get 7 days ENDING at selected date (not today)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(selected);
      date.setDate(selected.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      last7Days.push(dateKey);
    }

    // Calculate completion rates for each day
    const dailyStats = last7Days.map(date => {
      const dayHabits = habits.filter(habit => {
        const habitStartDate = habit.startDate || habit.createdAt;
        return new Date(date) >= new Date(habitStartDate);
      });
      
      const completed = dayHabits.filter(h => h.history?.[date] === "done").length;
      const total = dayHabits.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      
      return {
        date,
        completed,
        total,
        completionRate,
        hasCompletion: completed > 0 // Track if ANY habits were completed
      };
    });

    // Calculate trends properly
    const currentPeriod = dailyStats.slice(-3); // Most recent 3 days
    const previousPeriod = dailyStats.slice(-6, -3); // Previous 3 days (fair comparison)
    
    const currentAvg = currentPeriod.length > 0 ? 
      currentPeriod.reduce((sum, day) => sum + day.completionRate, 0) / currentPeriod.length : 0;
    
    const previousAvg = previousPeriod.length > 0 ? 
      previousPeriod.reduce((sum, day) => sum + day.completionRate, 0) / previousPeriod.length : 0;
    
    const todayStats = dailyStats[dailyStats.length - 1];
    const yesterdayStats = dailyStats[dailyStats.length - 2];

    return {
      dailyStats,
      currentAvg,
      previousAvg,
      todayStats,
      yesterdayStats,
      trend: currentAvg - previousAvg,
      streak: calculateStreak(dailyStats),
      totalCompletionRate: dailyStats.reduce((sum, day) => sum + day.completionRate, 0) / dailyStats.length
    };
  };

  // Calculate actual consecutive day streak
  const calculateStreak = (dailyStats) => {
    let streak = 0;
    const reversedStats = [...dailyStats].reverse();
    
    for (let stat of reversedStats) {
      if (stat.hasCompletion) {
        streak++;
      } else {
        break; // Streak ends when we find a day with no completions
      }
    }
    return streak;
  };

  const getPerformanceLevel = (avg) => {
    if (avg >= 90) return "excellent";
    if (avg >= 75) return "great";
    if (avg >= 60) return "good";
    if (avg >= 40) return "moderate";
    return "needs_improvement";
  };

  const getMoodIndicator = (trend, streak) => {
    if (trend > 15 && streak >= 3) return "ecstatic";
    if (trend > 10) return "excited";
    if (streak >= 5) return "consistent";
    if (trend < -15) return "challenged";
    if (trend < -5) return "reflective";
    return "steady";
  };

  const getNotableAchievements = (dailyStats) => {
    const achievements = [];
    const perfectDays = dailyStats.filter(day => day.completionRate === 100).length;
    const zeroDays = dailyStats.filter(day => day.completionRate === 0 && day.total > 0).length;
    
    if (perfectDays > 0) achievements.push(`${perfectDays} perfect day${perfectDays > 1 ? 's' : ''}`);
    if (zeroDays === 0) achievements.push("no missed days");
    
    return achievements;
  };

  // AI-powered message generator
  const generateAIMotivationalMessage = (performance) => {
    const { trend, todayStats, streak, totalCompletionRate, dailyStats } = performance;
    
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    const isToday = selectedDateObj.toDateString() === today.toDateString();
    
    // Build context for AI-like message generation
    const context = {
      trend,
      streak,
      todayCompleted: todayStats.completed,
      todayTotal: todayStats.total,
      weekAvg: totalCompletionRate,
      isToday,
      dayName: selectedDateObj.toLocaleDateString('en', { weekday: 'long' }),
      performanceLevel: getPerformanceLevel(totalCompletionRate),
      mood: getMoodIndicator(trend, streak),
      achievements: getNotableAchievements(dailyStats)
    };

    return generateDynamicMessage(context);
  };

  const generateDynamicMessage = (context) => {
    const {
      trend,
      streak,
      todayCompleted,
      todayTotal,
      weekAvg,
      isToday,
      dayName,
      performanceLevel,
      mood,
      achievements
    } = context;

    // Message templates with dynamic placeholders
    const messageTemplates = {
      excellent: [
        `🏆 Absolutely phenomenal! You've maintained a ${weekAvg.toFixed(0)}% completion rate this week. ${achievements.length ? `With ${achievements.join(' and ')}, you're` : "You're"} setting new standards for consistency!`,
        `✨ Masterful execution! ${todayCompleted}/${todayTotal} habits done today, and a ${streak}-day streak shows incredible discipline. The results speak for themselves!`,
        `🌟 You're operating at an elite level! ${weekAvg.toFixed(0)}% weekly average proves you've built rock-solid habits. This is how champions are made!`
      ],
      great: [
        `📊 Outstanding week! You're hitting ${weekAvg.toFixed(0)}% of your goals consistently. ${trend > 0 ? `The ${trend.toFixed(1)}% upward trend shows you're gaining momentum!` : "Maintain this pace and you'll reach new heights!"}`,
        `💪 Powerful consistency! ${streak > 1 ? `That ${streak}-day streak is building incredible momentum. ` : ""}You've completed ${todayCompleted}/${todayTotal} today - that's how progress compounds!`,
        `🚀 You're building remarkable habits! ${weekAvg.toFixed(0)}% weekly completion shows serious commitment. ${achievements.length ? `Especially impressive: ${achievements.join(' and ')}.` : ""}`
      ],
      good: [
        `📈 Solid progress this week! ${weekAvg.toFixed(0)}% completion rate shows you're on the right track. ${trend > 5 ? `That ${trend.toFixed(1)}% improvement is exactly what growth looks like!` : "Small, consistent steps lead to big transformations."}`,
        `🎯 You're developing strong habit foundations! ${todayCompleted}/${todayTotal} completed today contributes to your ${weekAvg.toFixed(0)}% weekly average. That's how lasting change happens!`,
        `💫 Good work maintaining ${weekAvg.toFixed(0)}% consistency! ${streak > 2 ? `Your ${streak}-day streak proves you're building resilience. ` : ""}Remember: it's about progress, not perfection!`
      ],
      moderate: [
        `🔄 This ${dayName} is your opportunity! You're at ${weekAvg.toFixed(0)}% for the week - one strong day can significantly boost your momentum. You've got this!`,
        `🌱 Growth opportunity ahead! ${weekAvg.toFixed(0)}% weekly rate means there's room to level up. ${todayCompleted > 0 ? `Today's ${todayCompleted} completion${todayCompleted > 1 ? 's' : ''} is a great start!` : "What's one habit you can crush today?"}`,
        `⚡ Time to ignite your potential! At ${weekAvg.toFixed(0)}% weekly completion, you're building the foundation. ${trend > 0 ? `That ${trend.toFixed(1)}% trend shows you're moving in the right direction!` : "Every completed habit builds momentum!"}`
      ],
      needs_improvement: [
        `🌅 Fresh start energy! This ${dayName} is perfect for resetting. Your ${weekAvg.toFixed(0)}% week means there's huge potential waiting to be unlocked. Let's begin!`,
        `💥 Breakthrough moment! With ${weekAvg.toFixed(0)}% weekly completion, you're at the perfect point for a transformation. ${todayTotal > 0 ? `Focus on just completing ${Math.min(2, todayTotal)} habits today - you'll build momentum fast!` : ""}`,
        `🚀 Ready for takeoff? Your ${weekAvg.toFixed(0)}% week is the launchpad. ${streak > 0 ? `That ${streak}-day streak shows you can do this! ` : ""}Today's the day to prove to yourself what you're capable of!`
      ]
    };

    // Select template based on performance level
    const templates = messageTemplates[performanceLevel] || messageTemplates.moderate;
    
    // Add mood-specific variations
    const moodEnhancers = {
      ecstatic: ["The energy is contagious! ", "You're inspiring! ", "This is next-level! "],
      excited: ["The momentum is building! ", "You're on fire! ", "Great energy! "],
      consistent: ["The consistency is impressive! ", "Steady as she goes! ", "Reliable and strong! "],
      challenged: ["Every champion faces challenges! ", "This is where growth happens! ", "You're building resilience! "],
      reflective: ["Learning and growing! ", "Every experience teaches! ", "Building wisdom! "],
      steady: ["Solid foundation! ", "Steady progress! ", "Building brick by brick! "]
    };

    const baseMessage = templates[Math.floor(Math.random() * templates.length)];
    const moodEnhancer = moodEnhancers[mood] ? moodEnhancers[mood][Math.floor(Math.random() * moodEnhancers[mood].length)] : "";
    
    return moodEnhancer + baseMessage;
  };

  const performance = calculatePerformance();
  const message = generateAIMotivationalMessage(performance);

  return (
    <div className="performance-marquee">
      <div className="marquee-content">
        <span className="motivational-text">{message}</span>
        
        <div className="performance-stats">
          <span className="stat-badge">📊 {performance.todayStats.completed}/{performance.todayStats.total}</span>
          {performance.streak > 1 && <span className="stat-badge">🔥 {performance.streak}d</span>}
          {performance.trend > 2 && <span className="stat-badge trend-up">📈 +{performance.trend.toFixed(0)}%</span>}
          {performance.trend < -2 && <span className="stat-badge trend-down">📉 {performance.trend.toFixed(0)}%</span>}
          <span className="stat-badge">⭐ {performance.totalCompletionRate.toFixed(0)}% week</span>
        </div>
      </div>
    </div>
  );
}

export default PerformanceAnalytics;