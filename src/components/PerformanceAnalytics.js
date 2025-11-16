import React from "react";

function PerformanceAnalytics({ habits, selectedDate }) {
  // Calculate performance metrics
  const calculatePerformance = () => {
    const selected = new Date(selectedDate);
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(selected);
      date.setDate(selected.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyStats = last7Days.map(date => {
      const dayHabits = habits.filter(habit => new Date(date) >= new Date(habit.startDate || habit.createdAt));
      const completed = dayHabits.filter(h => h.history?.[date] === "done").length;
      const total = dayHabits.length;
      return { date, completed, total, completionRate: total > 0 ? (completed / total) * 100 : 0 };
    });

    const currentAvg = dailyStats.slice(-3).reduce((sum, day) => sum + day.completionRate, 0) / 3;
    const previousAvg = dailyStats.slice(-6, -3).reduce((sum, day) => sum + day.completionRate, 0) / 3;
    const todayStats = dailyStats[dailyStats.length - 1];
    const streak = [...dailyStats].reverse().reduce((str, stat) => stat.completionRate > 0 ? str + 1 : str, 0);

    return { todayStats, streak, trend: currentAvg - previousAvg, totalCompletionRate: dailyStats.reduce((sum, day) => sum + day.completionRate, 0) / 7 };
  };

  // Generate motivational message
  const generateMessage = (performance) => {
    const { trend, todayStats, streak, totalCompletionRate } = performance;
    const templates = {
      excellent: [`🏆 Phenomenal! ${todayStats.completed}/${todayStats.total} today, ${streak}-day streak!`, `✨ Elite performance! ${totalCompletionRate.toFixed(0)}% weekly average!`],
      great: [`💪 Powerful! ${todayStats.completed}/${todayStats.total} completed, ${streak}-day streak!`, `🚀 Amazing! ${totalCompletionRate.toFixed(0)}% weekly rate!`],
      good: [`📈 Solid! ${todayStats.completed}/${todayStats.total} done, building momentum!`, `🎯 Strong! ${totalCompletionRate.toFixed(0)}% consistency this week!`],
      moderate: [`🔄 Opportunity! ${todayStats.completed}/${todayStats.total} today - you've got this!`, `🌱 Growing! ${totalCompletionRate.toFixed(0)}% week - keep going!`],
      needs_improvement: [`🌅 Fresh start! Complete ${Math.min(2, todayStats.total)} habits to build momentum!`, `💥 Breakthrough time! Your ${totalCompletionRate.toFixed(0)}% week has huge potential!`]
    };

    const level = totalCompletionRate >= 90 ? "excellent" : totalCompletionRate >= 75 ? "great" : totalCompletionRate >= 60 ? "good" : totalCompletionRate >= 40 ? "moderate" : "needs_improvement";
    const selectedTemplates = templates[level];
    return selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
  };

  const performance = calculatePerformance();
  const message = generateMessage(performance);

  return (
    <div className="performance-marquee-container">
      <div className="marquee-content">
        <div className="marquee-text">
          <span className="motivational-message">{message}</span>
          <span className="stat-separator"> • </span>
          <span className="performance-stat">Today: {performance.todayStats.completed}/{performance.todayStats.total}</span>
          <span className="stat-separator"> • </span>
          <span className="performance-stat">Streak: {performance.streak}d</span>
          <span className="stat-separator"> • </span>
          <span className="performance-stat">Week: {performance.totalCompletionRate.toFixed(0)}%</span>
          <span className="stat-separator"> • </span>
          <span className="performance-stat">Trend: {performance.trend > 0 ? '📈' : '📉'} {Math.abs(performance.trend).toFixed(0)}%</span>
          <span className="stat-separator"> • </span>
          <span className="performance-stat">Total Habits: {habits.length}</span>
        </div>
      </div>
    </div>
  );
}

export default PerformanceAnalytics;