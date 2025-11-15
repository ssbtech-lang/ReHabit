// components/GroupProofs.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GroupProofs.css";

// Axios instance with dynamic token
const api = axios.create({
  baseURL: 'https://rehabit-0wfi.onrender.com/api',
});

// Add request interceptor to always use fresh token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function GroupProofs() {
  const [activeView, setActiveView] = useState("list");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showReactionViewer, setShowReactionViewer] = useState(null);
  
  const [currentUser, setCurrentUser] = useState(() => {
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

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    habit: "",
    proofType: "text",
    usernames: [""]
  });

  const [newPost, setNewPost] = useState({
    content: "",
    imageUrl: "",
    imageFile: null
  });

  const [newComment, setNewComment] = useState("");

  // Fetch groups on mount
  useEffect(() => {
    console.log('🚀 GroupProofs mounted, current user:', currentUser?.username);
    fetchGroups();
  }, []);

  // Fetch only groups where user is a member
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem("user"));
      
      console.log('🔄 Fetching groups for:', user?.username, 'ID:', user?.id);
      console.log('🔑 Token exists:', !!token);

      const response = await api.get('/groups');
      
      console.log('📦 Groups API Response - Total groups:', response.data.groups?.length);
      
      if (response.data.groups && Array.isArray(response.data.groups)) {
        console.log('👥 Groups found:', response.data.groups.length);
        response.data.groups.forEach((group, index) => {
          const memberNames = group.members?.map(m => m.user?.username || 'Unknown') || [];
          console.log(`   ${index + 1}. "${group.name}" - Members:`, memberNames);
        });
        setGroups(response.data.groups);
      } else {
        console.log('❌ No groups array in response');
        setGroups([]);
      }
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
      console.log('🔍 Error response:', error.response?.data);
      alert('Error loading groups: ' + (error.response?.data?.message || error.message));
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch details and posts for a single group
  const fetchGroupDetails = async (groupId) => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/${groupId}`);
      console.log('Group details loaded:', response.data.group?.name);
      setSelectedGroup(response.data.group);
      setPosts(response.data.posts || []);
      setActiveView("group");
    } catch (error) {
      console.error('Error fetching group details:', error);
      if (error.response?.status === 403) {
        alert('Access denied: You are not a member of this group.');
      } else {
        alert('Error loading group: ' + (error.response?.data?.message || error.message));
      }
      setActiveView("list");
      setSelectedGroup(null);
    } finally {
      setLoading(false);
    }
  };

  // Search users by username for group creation
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

  // Create a new group with selected members
  const createGroup = async () => {
    try {
      const filteredUsernames = newGroup.usernames.filter(username => username.trim() !== "");
      
      if (!newGroup.name.trim()) {
        alert("Group name is required.");
        return;
      }
      if (!newGroup.habit.trim()) {
        alert("Habit focus is required.");
        return;
      }
      if (filteredUsernames.length === 0) {
        alert("Please add at least one member.");
        return;
      }

      console.log('👥 Creating group with members:', {
        creator: currentUser?.username,
        addedMembers: filteredUsernames
      });

      const response = await api.post('/groups', {
        ...newGroup,
        usernames: filteredUsernames
      });

      console.log('✅ Group created successfully');
      
      setGroups(prev => [response.data.group, ...prev]);
      setShowCreateModal(false);
      resetCreateForm();
      alert('Group created successfully!');
    } catch (error) {
      console.error('❌ Error creating group:', error);
      alert(error.response?.data?.message || 'Error creating group');
    }
  };

  // Upload image for post
  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  // Handle image file selection for new post
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setNewPost(prev => ({
        ...prev,
        imageFile: file,
        imageUrl: URL.createObjectURL(file)
      }));
    }
  };

  // Create a post in group
  const createPost = async () => {
    try {
      if (!newPost.content.trim()) {
        alert("Please enter a message.");
        return;
      }

      let imageUrl = newPost.imageUrl;
      if (newPost.imageFile) {
        imageUrl = await uploadImage(newPost.imageFile);
      }

      const response = await api.post(`/groups/${selectedGroup._id}/posts`, {
        content: newPost.content,
        imageUrl
      });

      setPosts(prev => [response.data.post, ...prev]);
      setNewPost({ content: "", imageUrl: "", imageFile: null });
    } catch (error) {
      alert('Error posting message: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add reaction to post
  const addReaction = async (postId, emoji = "👍") => {
    try {
      const response = await api.post(`/posts/${postId}/reactions`, { emoji });
      
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, reactions: response.data.reactions }
          : post
      ));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  // Remove reaction from post
  const removeReaction = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/reactions`, { emoji: null });
      
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, reactions: response.data.reactions }
          : post
      ));
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  // Add comment to post
  const addComment = async (postId) => {
    try {
      if (!newComment.trim()) return;

      const response = await api.post(`/posts/${postId}/comments`, { 
        text: newComment 
      });

      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, comments: [...(post.comments || []), response.data.comment] }
          : post
      ));

      setNewComment("");
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Leave group
  const leaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    try {
      await api.delete(`/groups/${selectedGroup._id}/leave`);
      setGroups(prev => prev.filter(g => g._id !== selectedGroup._id));
      setActiveView("list");
      setSelectedGroup(null);
      alert('You have left the group.');
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Error leaving group: ' + (error.response?.data?.message || error.message));
    }
  };

  // Reset create group form
  const resetCreateForm = () => {
    setNewGroup({
      name: "",
      description: "",
      habit: "",
      proofType: "text",
      usernames: [""]
    });
    setSearchResults([]);
    setSearchQuery("");
  };

  // Add another member input field
  const addUsernameField = () => {
    setNewGroup(prev => ({
      ...prev,
      usernames: [...prev.usernames, ""]
    }));
  };

  // Update username input at index
  const updateUsername = (index, value) => {
    setNewGroup(prev => ({
      ...prev,
      usernames: prev.usernames.map((username, i) => 
        i === index ? value : username
      )
    }));
  };

  // Remove username input field at index
  const removeUsernameField = (index) => {
    setNewGroup(prev => ({
      ...prev,
      usernames: prev.usernames.filter((_, i) => i !== index)
    }));
  };

  // Helper functions for reactions and UI
  const getReactionCount = (post, emoji) => {
    return (post.reactions || []).filter(r => r.emoji === emoji).length;
  };

  const hasUserReacted = (post, emoji) => {
    return (post.reactions || []).some(r => 
      (r.userId?._id === currentUser?.id || r.userId === currentUser?.id) && r.emoji === emoji
    );
  };

  const getReactionUsers = (post, emoji) => {
    return (post.reactions || [])
      .filter(r => r.emoji === emoji)
      .map(r => r.userId?.username || 'Unknown');
  };

  const handleReactionClick = (post, emoji) => {
    if (hasUserReacted(post, emoji)) {
      removeReaction(post._id);
    } else {
      addReaction(post._id, emoji);
    }
  };

  const isCurrentUserPost = (post) => {
    return post.userId?._id === currentUser?.id || post.userId === currentUser?.id;
  };

  const getDisplayName = (post) => {
    return isCurrentUserPost(post) ? "You" : (post.userId?.username || 'Unknown');
  };

  const isCurrentUserComment = (comment) => {
    return comment.userId?._id === currentUser?.id || comment.userId === currentUser?.id;
  };

  // Reaction Viewer Component
  const ReactionViewer = ({ post, emoji, onClose }) => {
    const users = getReactionUsers(post, emoji);
    
    return (
      <div className="reaction-viewer-backdrop" onClick={onClose}>
        <div className="reaction-viewer-modal" onClick={(e) => e.stopPropagation()}>
          <div className="reaction-viewer-header">
            <h3>{emoji} Reactions</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="reaction-viewer-list">
            {users.length === 0 ? (
              <div className="no-reactions">No reactions yet</div>
            ) : (
              users.map((username, index) => (
                <div key={index} className="reaction-user">
                  <div className="user-avatar">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="username">{username}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Refresh groups function
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchGroups();
  };

  // Group List View
  if (activeView === "list") {
    return (
      <div className="group-proofs-scope">
        <div className="group-proofs-container">
          <div className="section-header">
            <h2>Group Accountability</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-secondary"
                onClick={handleRefresh}
                disabled={loading}
              >
                🔄 Refresh
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                + Create Group
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
            <strong>Current User:</strong> {currentUser?.username} | <strong>Groups:</strong> {groups.length}
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              Loading groups...
            </div>
          ) : groups.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No Groups Yet</h3>
              <p>You are not a member of any groups. Create your first group or ask to be added to existing ones!</p>
              <button 
                className="btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Group
              </button>
            </div>
          ) : (
            <div className="groups-grid">
              {groups.map(group => (
                <div 
                  key={group._id} 
                  className="group-card"
                  onClick={() => fetchGroupDetails(group._id)}
                >
                  <div className="group-card-header">
                    <div className="group-avatar">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="group-info">
                      <h3>{group.name}</h3>
                      <p className="group-members">
                        {group.members?.length || 0} members • {group.habit}
                      </p>
                      <p className="group-members-list">
                        Members: {group.members?.map(m => m.user?.username).join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="group-stats">
                    <div className="stat">
                      <span className="stat-value">{group.members?.length || 0}</span>
                      <span className="stat-label">Members</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">
                        {group.proofType === "image" ? "📸" : 
                         group.proofType === "audio" ? "🎵" : "📝"}
                      </span>
                      <span className="stat-label">Proofs</span>
                    </div>
                  </div>

                  <div className="group-actions">
                    <button className="btn-primary full-width">
                      Enter Group
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Group Modal */}
          {showCreateModal && (
            <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Create New Group</h3>
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
                    <label>Group Name *</label>
                    <input
                      type="text"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup(prev => ({
                        ...prev, name: e.target.value
                      }))}
                      placeholder="e.g., Fitness Warriors"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newGroup.description}
                      onChange={(e) => setNewGroup(prev => ({
                        ...prev, description: e.target.value
                      }))}
                      placeholder="What's this group about?"
                      rows="3"
                      className="form-textarea"
                    />
                  </div>

                  <div className="form-group">
                    <label>Habit Focus *</label>
                    <input
                      type="text"
                      value={newGroup.habit}
                      onChange={(e) => setNewGroup(prev => ({
                        ...prev, habit: e.target.value
                      }))}
                      placeholder="e.g., Daily Exercise, Reading, Meditation"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Proof Type</label>
                    <select
                      value={newGroup.proofType}
                      onChange={(e) => setNewGroup(prev => ({
                        ...prev, proofType: e.target.value
                      }))}
                      className="form-select"
                    >
                      <option value="text">📝 Text Update</option>
                      <option value="image">📸 Image Proof</option>
                      <option value="audio">🎵 Audio Note</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Add Members (by username) *</label>
                    <div className="search-container">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          searchUsers(e.target.value);
                        }}
                        placeholder="Search users..."
                        className="form-input"
                      />
                      {searchResults.length > 0 && (
                        <div className="search-results">
                          {searchResults.map(user => (
                            <div
                              key={user._id}
                              className="search-result-item"
                              onClick={() => {
                                if (!newGroup.usernames.includes(user.username)) {
                                  addUsernameField();
                                  updateUsername(newGroup.usernames.length - 1, user.username);
                                }
                                setSearchQuery("");
                                setSearchResults([]);
                              }}
                            >
                              {user.username}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {newGroup.usernames.map((username, index) => (
                      <div key={index} className="username-input-row">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => updateUsername(index, e.target.value)}
                          placeholder="Enter username"
                          className="form-input"
                        />
                        {newGroup.usernames.length > 1 && (
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => removeUsernameField(index)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={addUsernameField}
                    >
                      + Add Another Member
                    </button>
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
                    onClick={createGroup}
                    disabled={!newGroup.name.trim() || !newGroup.habit.trim()}
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Single Group View - WhatsApp Style
  if (activeView === "group" && selectedGroup) {
    return (
      <div className="whatsapp-chat-container">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <button 
              className="back-btn"
              onClick={() => setActiveView("list")}
            >
              ←
            </button>
            <div className="chat-info">
              <h3>{selectedGroup.name}</h3>
              <p>{selectedGroup.members?.length || 0} members</p>
            </div>
          </div>
          <button 
            className="leave-btn"
            onClick={leaveGroup}
          >
            Leave
          </button>
        </div>

        {/* Group Info Bar */}
        <div className="group-info-bar">
          <div className="habit-info">
            <strong>Habit:</strong> {selectedGroup.habit}
          </div>
          <div className="proof-info">
            <strong>Proof Type:</strong> 
            {selectedGroup.proofType === "image" ? " 📸 Image" : 
             selectedGroup.proofType === "audio" ? " 🎵 Audio" : " 📝 Text"}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {posts.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-icon">💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            posts.map(post => {
              const isMyPost = isCurrentUserPost(post);
              const displayName = getDisplayName(post);
              
              return (
                <div key={post._id} className={`message-container ${isMyPost ? 'my-message' : 'other-message'}`}>
                  <div className="message-bubble">
                    {/* Message Header */}
                    {!isMyPost && (
                      <div className="message-sender">
                        {displayName}
                      </div>
                    )}
                    
                    {/* Message Content */}
                    <div className="message-content">
                      {post.imageUrl && (
                        <div className="message-image">
                          <img src={post.imageUrl} alt="Proof" />
                        </div>
                      )}
                      <p>{post.content}</p>
                    </div>

                    {/* Message Time */}
                    <div className="message-time">
                      {new Date(post.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>

                    {/* Reactions */}
                    <div className="message-reactions">
                      {['👍', '❤', '🔥', '😄', '👏'].map(emoji => {
                        const count = getReactionCount(post, emoji);
                        if (count > 0) {
                          return (
                            <button
                              key={emoji}
                              className={`reaction-pill ${hasUserReacted(post, emoji) ? 'my-reaction' : ''}`}
                              onClick={() => handleReactionClick(post, emoji)}
                              onDoubleClick={() => setShowReactionViewer({ post, emoji })}
                            >
                              <span className="emoji">{emoji}</span>
                              <span className="count">{count}</span>
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Comments */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="message-comments">
                        {post.comments.map(comment => {
                          const isMyComment = isCurrentUserComment(comment);
                          const commentDisplayName = isMyComment ? "You" : (comment.userId?.username || 'Unknown');
                          
                          return (
                            <div key={comment._id} className={`comment-bubble ${isMyComment ? 'my-comment' : 'other-comment'}`}>
                              <div className="comment-sender">{commentDisplayName}</div>
                              <div className="comment-text">{comment.text}</div>
                              <div className="comment-time">
                                {new Date(comment.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="add-comment-section">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type a comment..."
                        className="comment-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newComment.trim()) {
                            addComment(post._id);
                          }
                        }}
                      />
                      <button
                        className="comment-send-btn"
                        onClick={() => addComment(post._id)}
                        disabled={!newComment.trim()}
                      >
                        ↑
                      </button>
                    </div>
                  </div>

                  {/* Reaction Viewer Modal */}
                  {showReactionViewer && showReactionViewer.post._id === post._id && (
                    <ReactionViewer
                      post={showReactionViewer.post}
                      emoji={showReactionViewer.emoji}
                      onClose={() => setShowReactionViewer(null)}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Message Input */}
        <div className="message-input-container">
          <div className="input-wrapper">
            {selectedGroup.proofType === "image" && (
              <button className="attach-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="image-upload-input"
                  id="image-upload"
                />
                <label htmlFor="image-upload">📷</label>
              </button>
            )}
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({
                ...prev, content: e.target.value
              }))}
              placeholder={`Message about ${selectedGroup.habit}...`}
              rows="1"
              className="message-input"
            />
            <button
              className="send-message-btn"
              onClick={createPost}
              disabled={!newPost.content.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div className="loading-state">Loading...</div>;
}