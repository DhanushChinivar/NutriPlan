const express = require('express');
const router = express.Router();
const nutritionEntry = require('../models/nutritionEntry');

// POST /api/nutrition - Create a new nutrition entry
router.post('/save', async (req, res) => {
  try {
    const { email, date, foodItem, calories, protein, carbs, fats } = req.body;
    if (!email || !date || !foodItem || calories == null || protein == null || carbs == null || fats == null) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newEntry = new nutritionEntry({ email, date, foodItem, calories, protein, carbs, fats });
    await newEntry.save();
    res.status(201).json({ message: 'Nutrition entry created', entry: newEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/nutrition - Get nutrition entries for a specific user
router.get('/list', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email query parameter is required' });
  }

  try {
    const entries = await nutritionEntry.find({ email }).sort({ date: -1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching nutrition entries:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;