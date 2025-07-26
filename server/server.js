require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: 'https://ecotrack19.netlify.app',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entries');
const profileRoutes = require('./routes/profile');
const analyticsRoutes = require('./routes/analytics');
const leaderboardRoutes = require('./routes/leaderboard');
const suggestionRoutes = require('./routes/suggestions');
const dashboardRoutes = require('./routes/dashboard');


app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/suggestions', suggestionRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'EcoTrack API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message,
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// MongoDB connection and server start
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sunidhi:Sunidhi13591@cluster0.sis4et8.mongodb.net/ecotrack';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Server URL: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Check your .env file or MongoDB service');
    process.exit(1);
  }
};

const migrateExistingUsers = async () => {
  try {
    const User = require('./models/user');
    
    // Add streak fields to existing users who don't have them
    const result = await User.updateMany(
      { currentStreak: { $exists: false } },
      { 
        $set: { 
          currentStreak: 0,
          lastEntryDate: null 
        }
      }
    );

    console.log(`🔄 Migration completed: Updated ${result.modifiedCount} users with streak fields`);
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
};


// Start the server
connectDB();

module.exports = app;




