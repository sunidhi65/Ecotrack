// Updated entries.js (Express route)

const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');
const User = require('../models/user');
const streakUtils = require('../utils/streakUtils');
const PointsManager = require('../utils/pointsSystem');

// GET all entries for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 Fetching entries for user:', req.user.userId);
    const entries = await Entry.find({ userId: req.user.userId }).sort({ date: -1 });
    console.log('✅ Found entries:', entries.length);
    res.json(entries);
  } catch (error) {
    console.error('❌ Error fetching entries:', error);
    res.status(500).json({ message: 'Error fetching entries', error: error.message });
  }
});

// POST create new entry
router.post('/', auth, async (req, res) => {
  try {
    const { type, activity, amount, date } = req.body;
    if (!type || !activity || !amount || !date) {
      return res.status(400).json({ message: 'Missing required fields: type, activity, amount, date' });
    }

    const entry = new Entry({
      userId: req.user.userId,
      type,
      activity,
      amount: parseFloat(amount),
      date: new Date(date),
      description: req.body.description || '',
      originalAmount: req.body.originalAmount ? parseFloat(req.body.originalAmount) : null,
      unit: req.body.unit || ''
    });

    const savedEntry = await entry.save();
    const newStreak = await streakUtils.updateStreak(req.user.userId, savedEntry.date);
    res.status(201).json({ ...savedEntry.toObject(), currentStreak: newStreak });
  } catch (error) {
    console.error('❌ Error creating entry:', error);
    res.status(500).json({ message: 'Error creating entry', error: error.message });
  }
});

// GET single entry by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    console.error('❌ Error fetching entry:', error);
    res.status(500).json({ message: 'Error fetching entry', error: error.message });
  }
});

// PUT update entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { type, activity, amount, date, description, originalAmount, unit } = req.body;
    const updatedEntry = await Entry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        type,
        activity,
        amount: parseFloat(amount),
        date: new Date(date),
        description: description || '',
        originalAmount: originalAmount ? parseFloat(originalAmount) : null,
        unit: unit || ''
      },
      { new: true, runValidators: true }
    );
    if (!updatedEntry) return res.status(404).json({ message: 'Entry not found' });
    res.json(updatedEntry);
  } catch (error) {
    console.error('❌ Error updating entry:', error);
    res.status(500).json({ message: 'Error updating entry', error: error.message });
  }
});

// DELETE entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedEntry = await Entry.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deletedEntry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting entry:', error);
    res.status(500).json({ message: 'Error deleting entry', error: error.message });
  }
});

// GET entry statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.userId });
    const user = await User.findById(req.user.userId);

    const stats = {
      totalEntries: entries.length,
      totalEmissions: entries.reduce((sum, e) => sum + e.amount, 0),
      currentStreak: user?.currentStreak || 0,
      lastEntryDate: user?.lastEntryDate || null,
      byType: {},
      recentEntries: entries.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    };

    entries.forEach(entry => {
      if (!stats.byType[entry.type]) stats.byType[entry.type] = { count: 0, total: 0 };
      stats.byType[entry.type].count++;
      stats.byType[entry.type].total += entry.amount;
    });

    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// GET streak only
router.get('/streak/current', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ currentStreak: user.currentStreak || 0, lastEntryDate: user.lastEntryDate || null });
  } catch (error) {
    console.error('❌ Error fetching streak:', error);
    res.status(500).json({ message: 'Error fetching streak', error: error.message });
  }
});

module.exports = router;

