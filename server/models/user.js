const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: { 
    type: String, 
    required: true, 
    unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    default: 'user'
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bio: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String, // store URL or base64 string
    default: ''
  },
  goal: {
  type: Number, // in kg CO₂
  default: 0
  },
  goalType: {
  type: String,
  enum: ['weekly', 'monthly'],
  default: 'weekly'
},
  badges: {
    type: [String], // e.g., ['first_entry', 'goal_achiever']
    default: []
},
  currentStreak: {
    type: Number,
    default: 0
  },
  lastEntryDate: {
    type: Date,
    default: null
  },
  totalPoints: { 
    type: Number, 
    default: 0 
  },
  weeklyPoints: { 
    type: Number, 
    default: 0 
  },
  monthlyPoints: { 
    type: Number, 
    default: 0 
  },
  currentStreak: { 
    type: Number, 
    default: 0 
  },
  longestStreak: { 
    type: Number, 
    default: 0 
  }

});


// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔍 Compare entered password with hashed password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Check if user is active
userSchema.methods.isUserActive = function () {
  return this.isActive;
};

// ⏱️ Update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
