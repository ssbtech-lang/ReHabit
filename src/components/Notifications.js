// components/Notifications.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Notifications.css"; // Add this import

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
  try {
    console.log('🔍 Fetching notifications for current user...');
    
    // Get current user info for debugging
    const currentUser = JSON.parse(localStorage.getItem('user'));
    console.log('👤 Current user:', currentUser);
    
    const response = await api.get('/notifications');
    console.log('📢 Notifications API Response:', response.data);
    
    if (response.data.success && response.data.notifications) {
      console.log('📋 Notifications found:', response.data.notifications.length);
      console.log('📝 Notifications details:', response.data.notifications);
      setNotifications(response.data.notifications);
    } else {
      console.log('❌ No notifications in response or API error');
      setNotifications([]);
    }
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    console.error('Error details:', error.response?.data);
    setNotifications([]);
  } finally {
    setLoading(false);
  }
};

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      alert('All notifications marked as read!');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'nudge': return '💌';
      case 'battle_invite': return '⚔️';
      case 'battle_result': return '🏆';
      default: return '🔔';
    }
  };

  // Refresh notifications
  const handleRefresh = () => {
    setLoading(true);
    fetchNotifications();
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleRefresh} className="btn-secondary">
            🔄 Refresh
          </button>
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllAsRead} className="btn-secondary">
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>No notifications yet</h3>
          <p>You'll see notifications here when someone nudges you or invites you to battles.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              onClick={() => !notification.isRead && markAsRead(notification._id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                {notification.fromUser && (
                  <div className="notification-sender" style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                    From: {notification.fromUser.username}
                  </div>
                )}
                <div className="notification-time">
                  {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString()}
                </div>
              </div>
              {!notification.isRead && (
                <div className="unread-dot"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}