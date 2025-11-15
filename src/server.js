require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware - CORS for all origins
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json());

// MongoDB Atlas Connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log('🔗 Attempting to connect to MongoDB...');

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log('📊 Database:', mongoose.connection.name);
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Please check your MONGODB_URI in the .env file');
});

// User Schema - Updated with phone field
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: String,
        trim: true,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Habit Schema - Updated to include user reference
const HabitSchema = new mongoose.Schema({
  habitName: { type: String, required: true },
  description: String,
  startDate: String,
  endDate: String,
  frequency: { type: String, required: true },
  category: String,
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  history: {
    type: Map,
    of: String,
    default: {}
  },
  notes: {
    type: Map,
    of: String,
    default: {}
  },
  color: {
    type: String,
    default: "#da746f"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Habit = mongoose.model('Habit', HabitSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'rehabit-super-secret-key-2024';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Test Route
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true,
        message: '✅ ReHabit Backend is running!',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'OK', 
        message: 'ReHabit Backend is running smoothly',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// Signup Route
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        console.log('📝 Signup attempt:', { username, email });

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone
            }
        });

    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('🔐 Login attempt:', { username });

        // Find user by username or email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ============================================
// USER PROFILE ROUTES (NEW)
// ============================================

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, phone } = req.body;
    const userId = req.user.userId;

    // Check if username or email is already taken by another user
    const existingUser = await User.findOne({
      _id: { $ne: userId },
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already taken by another user'
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        username, 
        email, 
        phone 
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Profile updated:', { username, email });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone
      }
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user statistics (streak and habit count)
app.get('/api/user/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Count total habits for the user
    const habitsCount = await Habit.countDocuments({ userId });

    // Calculate streak (consecutive days with completed habits)
    const habits = await Habit.find({ userId });
    let streak = 0;

    if (habits.length > 0) {
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Check streak going backwards from today
      while (true) {
        const dateKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Check if any habit was completed on this date
        const hasCompletionOnDate = habits.some(habit => {
          const historyValue = habit.history.get(dateKey);
          return historyValue === 'completed' || historyValue === 'done';
        });

        if (!hasCompletionOnDate) {
          // If today has no completions but we haven't started counting yet, skip today
          if (streak === 0 && currentDate.toDateString() === new Date().toDateString()) {
            currentDate.setDate(currentDate.getDate() - 1);
            continue;
          }
          break;
        }

        streak++;
        currentDate.setDate(currentDate.getDate() - 1);

        // Safety limit to prevent infinite loops
        if (streak > 1000) break;
      }
    }

    res.json({
      success: true,
      streak,
      habits: habitsCount
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ============================================
// HABIT API ROUTES (Protected with authentication)
// ============================================

// Create a new habit for the authenticated user
app.post('/api/habits', authenticateToken, async (req, res) => {
  try {
    const habit = new Habit({
      ...req.body,
      userId: req.user.userId
    });
    await habit.save();
    console.log('✅ Habit created:', habit.habitName);
    res.status(201).json(habit);
  } catch (err) {
    console.error('❌ Error creating habit:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get all habits for the authenticated user
app.get('/api/habits', authenticateToken, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.userId });
    res.json(habits);
  } catch (err) {
    console.error('❌ Error fetching habits:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a habit (only if it belongs to the authenticated user)
// Update habit and also update linked streak battle
app.put('/api/habits/:id', authenticateToken, async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Store old history to detect changes
    const oldHistory = new Map(habit.history);
    
    // Update habit with new data
    Object.assign(habit, req.body);
    await habit.save();

    // ⭐ CRITICAL: If this habit is linked to a streak battle, update the battle too
    if (habit.streakBattleId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayKey = today.toISOString().split('T')[0];
      
      // Check if today's completion status changed
      const oldTodayStatus = oldHistory.get(todayKey);
      const newTodayStatus = habit.history.get(todayKey);
      
      if (oldTodayStatus !== newTodayStatus) {
        // Update the streak battle
        const battle = await StreakBattle.findById(habit.streakBattleId);
        if (battle) {
          const participant = battle.participants.find(p => 
            p.user.toString() === req.user.userId
          );
          
          if (participant) {
            const lastUpdate = participant.lastUpdate ? new Date(participant.lastUpdate) : null;
            
            // Only update if not already updated today
            if (!lastUpdate || lastUpdate.toDateString() !== today.toDateString()) {
              const completed = newTodayStatus === 'completed' || newTodayStatus === 'done';
              
              if (completed) {
                participant.currentStreak += 1;
                participant.totalPoints += 10;
              } else {
                participant.currentStreak = 0;
              }
              
              participant.lastUpdate = new Date();
              participant.streakHistory.push({
                date: new Date(),
                completed: completed
              });
              
              await battle.save();
              console.log(`✅ Updated streak battle for habit: ${habit.habitName}`);
            }
          }
        }
      }
    }

    console.log('✅ Habit updated:', habit.habitName);
    res.json(habit);
  } catch (err) {
    console.error('❌ Error updating habit:', err);
    res.status(400).json({ error: err.message });
  }
});
// Sync battle streak from habit update (called from frontend when habit is marked done)
app.post('/api/streak-battles/:battleId/sync-from-habit', authenticateToken, async (req, res) => {
  try {
    const { battleId } = req.params;
    const { completed } = req.body;
    const userId = req.user.userId;

    const battle = await StreakBattle.findById(battleId);
    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Find participant
    const participant = battle.participants.find(p => 
      p.user.toString() === userId
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this battle'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already updated today
    const lastUpdate = participant.lastUpdate ? new Date(participant.lastUpdate) : null;
    if (lastUpdate && lastUpdate.toDateString() === today.toDateString()) {
      return res.status(400).json({
        success: false,
        message: 'Streak already updated for today'
      });
    }

    // Update streak
    if (completed) {
      participant.currentStreak += 1;
      participant.totalPoints += 10;
    } else {
      participant.currentStreak = 0;
    }

    participant.lastUpdate = new Date();
    participant.streakHistory.push({
      date: new Date(),
      completed: completed
    });

    await battle.save();

    // Populate and return updated battle
    const updatedBattle = await StreakBattle.findById(battleId)
      .populate('participants.user', 'username')
      .populate('createdBy', 'username');

    res.json({
      success: true,
      message: 'Battle streak synced from habit',
      battle: updatedBattle
    });

  } catch (error) {
    console.error('❌ Error syncing battle from habit:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add these near the top with other requires
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// ============================================
// GROUP PROOFS ROUTES
// ============================================

// Group Schema
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  habit: {
    type: String,
    required: true
  },
  proofType: {
    type: String,
    enum: ['image', 'text', 'audio'],
    default: 'text'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Post Schema
const postSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  proofType: {
    type: String,
    enum: ['image', 'text', 'audio'],
    default: 'text'
  },
  imageUrl: String,
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      default: '👍'
    },
    reactedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Group = mongoose.model('Group', groupSchema);
const Post = mongoose.model('Post', postSchema);

// Create a new group
app.post('/api/groups', authenticateToken, async (req, res) => {
  try {
    const { name, description, habit, proofType, usernames } = req.body;
    const userId = req.user.userId;

    // Find users by usernames
    const usersToAdd = await User.find({ 
      username: { $in: usernames } 
    });

    if (usersToAdd.length !== usernames.length) {
      return res.status(400).json({
        success: false,
        message: 'Some users were not found'
      });
    }

    // Create group with creator as first member
    const group = new Group({
      name,
      description,
      habit,
      proofType,
      createdBy: userId,
      members: [
        {
          user: userId,
          joinedAt: new Date()
        },
        ...usersToAdd.map(user => ({
          user: user._id,
          joinedAt: new Date()
        }))
      ]
    });

    await group.save();
    
    // Populate the created group with member details
    const populatedGroup = await Group.findById(group._id)
      .populate('members.user', 'username')
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group: populatedGroup
    });

  } catch (error) {
    console.error('❌ Error creating group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all groups for user
app.get('/api/groups', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const groups = await Group.find({
      'members.user': userId
    })
    .populate('members.user', 'username')
    .populate('createdBy', 'username')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      groups
    });

  } catch (error) {
    console.error('❌ Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single group with posts
// Get single group with posts - ENHANCED SECURITY
app.get('/api/groups/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    console.log('🔍 Accessing group:', groupId, 'by user:', userId);

    // Check if user is member of the group with proper ObjectId comparison
    const group = await Group.findOne({
      _id: groupId,
      'members.user': mongoose.Types.ObjectId.createFromHexString(userId)
    })
    .populate('members.user', 'username email')
    .populate('createdBy', 'username');

    if (!group) {
      console.log('❌ Access denied: User not in group or group not found');
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this group'
      });
    }

    console.log('✅ Group access granted:', group.name);

    // Get posts for this group
    const posts = await Post.find({ groupId })
      .populate('userId', 'username')
      .populate('reactions.userId', 'username')
      .populate('comments.userId', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      group,
      posts
    });

  } catch (error) {
    console.error('❌ Error fetching group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload image for post
app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image'
    });
  }
});

// Create a post in group
app.post('/api/groups/:groupId/posts', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, proofType, imageUrl } = req.body;
    const userId = req.user.userId;

    // Check if user is member of the group
    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId
    });

    if (!group) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    const post = new Post({
      groupId,
      userId,
      content,
      proofType: proofType || group.proofType,
      imageUrl
    });

    await post.save();

    // Populate the post with user info
    const populatedPost = await Post.findById(post._id)
      .populate('userId', 'username')
      .populate('reactions.userId', 'username')
      .populate('comments.userId', 'username');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: populatedPost
    });

  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add reaction to post
app.post('/api/posts/:postId/reactions', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Remove existing reaction from this user
    post.reactions = post.reactions.filter(
      reaction => !reaction.userId.equals(userId)
    );

    // Add new reaction
    post.reactions.push({
      userId,
      emoji: emoji || '👍'
    });

    await post.save();

    // Populate reactions
    await post.populate('reactions.userId', 'username');

    res.json({
      success: true,
      message: 'Reaction added',
      reactions: post.reactions
    });

  } catch (error) {
    console.error('❌ Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add comment to post
app.post('/api/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      userId,
      text
    });

    await post.save();

    // Populate the new comment
    await post.populate('comments.userId', 'username');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added',
      comment: newComment
    });

  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Leave group
app.delete('/api/groups/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Remove user from members
    group.members = group.members.filter(
      member => !member.user.equals(userId)
    );

    // If no members left, delete the group
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      await Post.deleteMany({ groupId });
    } else {
      await group.save();
    }

    res.json({
      success: true,
      message: 'Left group successfully'
    });

  } catch (error) {
    console.error('❌ Error leaving group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Search users for adding to group
app.get('/api/users/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.userId;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        users: []
      });
    }

    const users = await User.find({
      _id: { $ne: userId }, // Exclude current user
      username: { $regex: query, $options: 'i' }
    }).select('username').limit(10);

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('❌ Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
// Get all groups for user - FIXED VERSION
// Get all groups for user - FIXED VERSION
app.get('/api/groups', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('🔍 Fetching groups for user ID:', userId);

    // FIXED: Use proper ObjectId comparison and better query
    const groups = await Group.find({
      'members.user': mongoose.Types.ObjectId.createFromHexString(userId)
    })
    .populate('members.user', 'username email')
    .populate('createdBy', 'username')
    .sort({ createdAt: -1 });

    console.log('✅ Groups found for user:', groups.length);
    
    // Log group details for debugging
    groups.forEach(group => {
      console.log(`📦 Group: ${group.name}, Members:`, 
        group.members.map(m => m.user?.username || 'Unknown')
      );
    });

    res.json({
      success: true,
      groups
    });

  } catch (error) {
    console.error('❌ Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
// Update the create battle route to automatically create habits
app.post('/api/streak-battles', authenticateToken, async (req, res) => {
  try {
    const { opponentUsername, habit, duration, stake } = req.body;
    const userId = req.user.userId;

    // Find opponent user
    const opponent = await User.findOne({ username: opponentUsername });
    if (!opponent) {
      return res.status(400).json({
        success: false,
        message: 'Opponent user not found'
      });
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    // Create battle
    const battle = new StreakBattle({
      habit,
      duration,
      stake,
      participants: [
        {
          user: userId,
          currentStreak: 0,
          totalPoints: 0
        },
        {
          user: opponent._id,
          currentStreak: 0,
          totalPoints: 0
        }
      ],
      createdBy: userId,
      endDate
    });

    await battle.save();

    // ⭐ CRITICAL: Create habits for both users
    const today = new Date().toISOString().split('T')[0];
    const battleEndDate = endDate.toISOString().split('T')[0];

    // Create habit for current user
    const userHabit = new Habit({
      habitName: `${habit} (vs ${opponent.username})`,
      description: `Streak battle with ${opponent.username}. Compete to maintain your daily streak!`,
      startDate: today,
      endDate: battleEndDate,
      frequency: "daily",
      category: "Fitness",
      userId: userId,
      streakBattleId: battle._id, // Link habit to battle
      color: "#d6304c" // Red color for battles
    });

    // Create habit for opponent
    const opponentHabit = new Habit({
      habitName: `${habit} (vs ${req.user.username})`,
      description: `Streak battle with ${req.user.username}. Compete to maintain your daily streak!`,
      startDate: today,
      endDate: battleEndDate,
      frequency: "daily",
      category: "Fitness",
      userId: opponent._id,
      streakBattleId: battle._id, // Link habit to battle
      color: "#d6304c" // Red color for battles
    });

    await Promise.all([userHabit.save(), opponentHabit.save()]);

    // Populate the battle
    const populatedBattle = await StreakBattle.findById(battle._id)
      .populate('participants.user', 'username')
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Streak battle created successfully',
      battle: populatedBattle,
      habitsCreated: true
    });

  } catch (error) {
    console.error('❌ Error creating streak battle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update streak update route to also update habits
app.post('/api/streak-battles/:battleId/streak', authenticateToken, async (req, res) => {
  try {
    const { battleId } = req.params;
    const { completed } = req.body;
    const userId = req.user.userId;

    const battle = await StreakBattle.findById(battleId);
    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Find participant
    const participant = battle.participants.find(p => 
      p.user.toString() === userId
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this battle'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already updated today
    const lastUpdate = participant.lastUpdate ? new Date(participant.lastUpdate) : null;
    if (lastUpdate && lastUpdate.toDateString() === today.toDateString()) {
      return res.status(400).json({
        success: false,
        message: 'Streak already updated for today'
      });
    }

    // Update streak
    if (completed) {
      participant.currentStreak += 1;
      participant.totalPoints += 10; // Award points for completion
    } else {
      participant.currentStreak = 0;
    }

    participant.lastUpdate = new Date();
    participant.streakHistory.push({
      date: new Date(),
      completed: completed
    });

    await battle.save();

    // ⭐ CRITICAL: Also update the linked habit
    const todayKey = today.toISOString().split('T')[0];
    
    // Find and update the habit linked to this battle
    const userHabit = await Habit.findOne({
      userId: userId,
      streakBattleId: battleId
    });

    if (userHabit) {
      userHabit.history.set(todayKey, completed ? 'completed' : 'skipped');
      await userHabit.save();
    }

    // Populate and return updated battle
    const updatedBattle = await StreakBattle.findById(battleId)
      .populate('participants.user', 'username')
      .populate('createdBy', 'username');

    res.json({
      success: true,
      message: 'Streak updated successfully',
      battle: updatedBattle
    });

  } catch (error) {
    console.error('❌ Error updating streak:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's habits including battle habits
app.get('/api/habits', authenticateToken, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.userId });
    res.json(habits);
  } catch (err) {
    console.error('❌ Error fetching habits:', err);
    res.status(500).json({ error: err.message });
  }
});
// Streak Battle Schema
const streakBattleSchema = new mongoose.Schema({
  habit: {
    type: String,
    required: true,
    trim: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    lastUpdate: Date,
    streakHistory: [{
      date: Date,
      completed: Boolean
    }]
  }],
  duration: {
    type: Number,
    default: 7
  },
  stake: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const StreakBattle = mongoose.model('StreakBattle', streakBattleSchema);

// Update Habit Schema to include streakBattleId
// Add this field to your existing HabitSchema
// streakBattleId: {  
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'StreakBattle',
//   default: null
// },

// Get all battles for user
app.get('/api/streak-battles', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const battles = await StreakBattle.find({
      'participants.user': new mongoose.Types.ObjectId(userId),
      status: 'active'
    })
    .populate('participants.user', 'username')
    .populate('createdBy', 'username')
    .sort({ startDate: -1 });

    res.json({
      success: true,
      battles
    });

  } catch (error) {
    console.error('❌ Error fetching streak battles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Send nudge to opponent
app.post('/api/streak-battles/:battleId/nudge', authenticateToken, async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.userId;

    const battle = await StreakBattle.findById(battleId)
      .populate('participants.user', 'username');

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Find opponent
    const opponent = battle.participants.find(p => 
      p.user._id.toString() !== userId
    );

    if (!opponent) {
      return res.status(400).json({
        success: false,
        message: 'Opponent not found'
      });
    }

    // Here you would typically send a notification
    console.log(`💌 Nudge sent to ${opponent.user.username} for battle: ${battle.habit}`);

    res.json({
      success: true,
      message: 'Nudge sent successfully'
    });

  } catch (error) {
    console.error('❌ Error sending nudge:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
// Add this route to your server.js file

// Sync battle streak from habit update (called from frontend when habit is marked done)
app.post('/api/streak-battles/:battleId/sync-from-habit', authenticateToken, async (req, res) => {
  try {
    const { battleId } = req.params;
    const { completed } = req.body;
    const userId = req.user.userId;

    console.log('🔄 Syncing battle from habit:', { battleId, userId, completed });

    const battle = await StreakBattle.findById(battleId);
    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Find participant
    const participant = battle.participants.find(p => 
      p.user.toString() === userId
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this battle'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already updated today
    const lastUpdate = participant.lastUpdate ? new Date(participant.lastUpdate) : null;
    if (lastUpdate && lastUpdate.toDateString() === today.toDateString()) {
      console.log('ℹ️ Streak already updated for today, updating completion status only');
      
      // Even if already updated, we might want to update the completion status
      // Find today's streak history entry
      const todayHistory = participant.streakHistory.find(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.toDateString() === today.toDateString();
      });
      
      if (todayHistory) {
        todayHistory.completed = completed;
      }
      
      // Update points based on completion
      if (completed && !todayHistory?.completed) {
        participant.totalPoints += 10; // Add points if newly completed
      }
    } else {
      // New update for today
      if (completed) {
        participant.currentStreak += 1;
        participant.totalPoints += 10;
      } else {
        participant.currentStreak = 0;
      }

      participant.lastUpdate = new Date();
      participant.streakHistory.push({
        date: new Date(),
        completed: completed
      });
    }

    await battle.save();

    // Populate and return updated battle
    const updatedBattle = await StreakBattle.findById(battleId)
      .populate('participants.user', 'username')
      .populate('createdBy', 'username');

    console.log('✅ Battle synced successfully:', {
      battleId,
      userId, 
      completed,
      newStreak: participant.currentStreak,
      totalPoints: participant.totalPoints
    });

    res.json({
      success: true,
      message: 'Battle streak synced from habit',
      battle: updatedBattle
    });

  } catch (error) {
    console.error('❌ Error syncing battle from habit:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 ReHabit Backend Server running on port ${PORT}`);
    console.log(`📍 Endpoints:`);
    console.log(`   http://localhost:${PORT}/api/test`);
    console.log(`   http://localhost:${PORT}/api/health`);
    console.log(`   http://localhost:${PORT}/api/signup`);
    console.log(`   http://localhost:${PORT}/api/login`);
    console.log(`   http://localhost:${PORT}/api/user/profile (GET/PUT)`);
    console.log(`   http://localhost:${PORT}/api/user/stats (GET)`);
    console.log(`   http://localhost:${PORT}/api/habits`);
});