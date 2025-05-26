const express = require('express');
const router = express.Router();
const WeeklyMealPlan = require('../models/weeklyMealPlan');

router.get('/grocery-list', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const mealPlan = await WeeklyMealPlan.findOne({ userEmail: email })
      .sort({ createdAt: -1 })
      .lean();

    if (!mealPlan || !mealPlan.dailyPlans) {
      return res.status(404).json({ message: "No meal plan found." });
    }

    const quantities = {};

    const perMealQuantity = {
      default: 100,                 // for grains & general items (g)
      veggie: 75,                   // for vegetables (g)
      fruit: 120,                   // for fruits (g)
      eggs: 2,                      // per meal (pcs)
      liquid: 15,                   // for oils/sauces (ml)
    };

    const categoryMap = {
      // Protein
      tofu: 'protein',
      eggs: 'protein',
      chickpeas: 'protein',
      lentils: 'protein',
      hummus: 'protein',
      yogurt: 'protein',
      'feta cheese': 'protein',
      'cheddar cheese': 'protein',

      // Carbs
      'brown rice': 'carbs',
      'basmati rice': 'carbs',
      oats: 'carbs',
      quinoa: 'carbs',
      banana: 'carbs',
      'whole grain bread': 'carbs',
      'whole wheat wrap': 'carbs',

      // Fats
      'olive oil': 'fats',
      'coconut milk': 'fats',
      'cheddar cheese': 'fats',
      'feta cheese': 'fats',

      // Fiber
      broccoli: 'fiber',
      carrots: 'fiber',
      celery: 'fiber',
      onions: 'fiber',
      tomatoes: 'fiber',
      spinach: 'fiber',
      zucchini: 'fiber',
      mushrooms: 'fiber',
      'bell peppers': 'fiber',
      'lemon juice': 'fiber'
    };

    const liquidItems = ['soy sauce', 'olive oil', 'lemon juice', 'coconut milk'];

    mealPlan.dailyPlans.forEach(day => {
      day.meals.forEach(meal => {
        meal.ingredients.forEach(rawItem => {
          const item = rawItem.toLowerCase();
          if (!quantities[item]) quantities[item] = 0;

          const category = categoryMap[item];

          // Apply 1-serving logic based on type
          if (item === 'eggs') {
            quantities[item] += perMealQuantity.eggs;
          } else if (item === 'banana') {
            quantities[item] += perMealQuantity.fruit;
          } else if (liquidItems.includes(item)) {
            quantities[item] += perMealQuantity.liquid;
          } else if (category === 'fiber') {
            quantities[item] += perMealQuantity.veggie;
          } else {
            quantities[item] += perMealQuantity.default;
          }
        });
      });
    });

    const groceryList = {
      protein: [],
      carbs: [],
      fats: [],
      fiber: [],
      uncategorized: []
    };

    for (const [item, amount] of Object.entries(quantities)) {
      let quantity = '';
      let unit = 'g';

      if (liquidItems.includes(item)) {
        quantity = `${(amount / 1000).toFixed(2)} liters`;
      } else if (item === 'eggs') {
        quantity = `${amount} pcs`;
      } else if (item === 'banana') {
        quantity = `${(amount / 1000).toFixed(2)} kg (~${Math.round(amount / 120)} bananas)`;
      } else {
        quantity = `${(amount / 1000).toFixed(2)} kg`;
      }

      const category = categoryMap[item] || 'uncategorized';
      groceryList[category].push({ item, quantity });
    }

    res.json({
      userEmail: email,
      createdAt: mealPlan.createdAt,
      groceryList
    });

  } catch (err) {
    console.error('Error generating grocery list:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
