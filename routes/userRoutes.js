const express = require('express');
const { userPreferenceSchema } = require('../models/payloadValidation');
const User = require('../models/user');
const WeeklyMealPlan = require('../models/weeklyMealPlan');

const router = express.Router();

//Save user preferences with Joi validation
router.post('/save', async (req, res) => {
  try {
    const { error, value } = userPreferenceSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    const { email, age, height, weight, gender, dietType, allergies, mealsPerDay, goal, activityLevel } = value;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Update preference fields
    user.age = age;
    user.height = height;
    user.weight = weight;
    user.gender = gender;
    user.dietType = dietType;
    user.allergies = allergies;
    user.mealsPerDay = mealsPerDay;
    user.goal = goal;
    user.activityLevel = activityLevel;

    await user.save();
    res.status(200).json({ message: 'Preferences saved successfully' });
  } catch (err) {
    console.error('SAVE error:', err);
    res.status(500).json({ message: 'Failed to save preferences' });
  }
});

// ✅ Get whether preferences are filled + latest meal plan
router.get('/get', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email query parameter is required' });
  }

  try {
    const user = await User.findOne({ email }).lean();
    if (!user) return res.json({ exists: false });

    const hasPreferences = (
      user.age && user.height && user.weight && user.gender &&
      user.dietType && user.mealsPerDay && user.goal && user.activityLevel
    );

    const plan = await WeeklyMealPlan.findOne({ userEmail: email })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      exists: !!hasPreferences,
      user,
      plan
    });
  } catch (err) {
    console.error('Error checking user or fetching plan:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;