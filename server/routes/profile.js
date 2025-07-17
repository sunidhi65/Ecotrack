const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

// ✅ Get current user's profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return goal info along with profile
    const { name, email, bio, profilePicture, goal, goalType } = user;
    res.json({ name, email, bio, profilePicture, goal, goalType });
  } catch (error) {
    console.error('❌ Error loading profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const updates = (({ name, bio, profilePicture }) => ({ name, bio, profilePicture }))(req.body);
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name: updatedName, email, bio: updatedBio, profilePicture: updatedPic } = user;
    res.json({ name: updatedName, email, bio: updatedBio, profilePicture: updatedPic });
  } catch (error) {
    console.error('❌ Error updating profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update user goal
router.put('/goal', auth, async (req, res) => {
  try {
    const { goal, goalType } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { goal, goalType },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Goal updated', goal: user.goal, goalType: user.goalType });
  } catch (err) {
    console.error('❌ Failed to update goal:', err.message);
    res.status(500).json({ message: 'Failed to update goal' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/update', auth, async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If changing password
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // If changing username
    if (username) user.username = username;

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;




