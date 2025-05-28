const Meal = require('../models/meals');
const User = require('../models/user');
const WeeklyMealPlan = require('../models/weeklyMealPlan');
const { calculateBMR, adjustCalories } = require('../utils/calculation');

function sumNutrients(meals) {
  let totalProtein = 0, totalFat = 0, totalCarbs = 0;

  meals.forEach(meal => {
    const parseGrams = val => parseFloat(val.replace('g', '').trim()) || 0;
    totalProtein += parseGrams(meal.nutrients?.protein || "0g");
    totalFat += parseGrams(meal.nutrients?.fat || "0g");
    totalCarbs += parseGrams(meal.nutrients?.carbs || "0g");
  });

  return {
    protein: `${totalProtein}g`,
    fat: `${totalFat}g`,
    carbs: `${totalCarbs}g`
  };
}

async function createWeeklyPlan(user, excludeMealIds = [], daysCount = 7) {
  const bmr = calculateBMR(user);
  const targetCalories = adjustCalories(bmr, user.goal, user.activityLevel);
  const dailyCalorieTarget = targetCalories / user.mealsPerDay;
  const baseMargin = 150;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const sortedDays = [...daysOfWeek.slice(todayIndex), ...daysOfWeek.slice(0, todayIndex)];

  const weeklyPlan = [];
  const recentDaysMeals = []; // Store meal IDs from previous 2 days

  for (let i = 0; i < daysCount; i++) {
    const day = sortedDays[i];

    // Exclude meals used in the last 2 days + those passed into the function
    const exclusionList = [...recentDaysMeals.flat(), ...excludeMealIds];

    let query = {
      diet: user.dietType,
      allergies: { $nin: user.allergies },
      calories: {
        $lte: dailyCalorieTarget + baseMargin,
        $gte: dailyCalorieTarget - baseMargin
      },
      _id: { $nin: exclusionList }
    };

    let meals = await Meal.find(query).limit(user.mealsPerDay);

    // Fallback if not enough meals found
    if (meals.length < user.mealsPerDay) {
      const fallbackQuery = {
        diet: user.dietType,
        calories: {
          $lte: dailyCalorieTarget + 200,
          $gte: dailyCalorieTarget - 200
        },
        _id: { $nin: exclusionList }
      };
      meals = await Meal.find(fallbackQuery).limit(user.mealsPerDay);
    }

    const todaysMealIds = meals.map(meal => meal._id.toString());

    // Update rolling 2-day memory
    recentDaysMeals.push(todaysMealIds);
    if (recentDaysMeals.length > 2) {
      recentDaysMeals.shift();
    }

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalNutrients = sumNutrients(meals);

    weeklyPlan.push({
      day,
      meals,
      totalCalories,
      totalNutrients
    });
  }

  return { weeklyPlan, targetCalories };
}

exports.generateMealPlan = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { weeklyPlan, targetCalories } = await createWeeklyPlan(user);

    const savedPlan = new WeeklyMealPlan({
      userEmail: user.email,
      dailyPlans: weeklyPlan,
      totalCaloriesPerDay: targetCalories
    });

    await savedPlan.save();
    res.json({ message: 'Weekly meal plan generated', weeklyMealPlan: savedPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate weekly meal plan', error: error.message });
  }
};

exports.regenerateMealPlan = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const previousPlan = await WeeklyMealPlan.findOne({ userEmail: user.email });
    const previousMealIds = previousPlan ? previousPlan.dailyPlans.flatMap(day => day.meals.map(m => m._id.toString())) : [];

    await WeeklyMealPlan.deleteMany({ userEmail: user.email });

    const { weeklyPlan, targetCalories } = await createWeeklyPlan(user, previousMealIds);

    const savedPlan = new WeeklyMealPlan({
      userEmail: user.email,
      dailyPlans: weeklyPlan,
      totalCaloriesPerDay: targetCalories
    });

    await savedPlan.save();
    res.json({ message: 'Weekly meal plan regenerated', weeklyMealPlan: savedPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to regenerate meal plan', error: error.message });
  }
};

exports.getWeeklyPlan = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email query parameter is required" });

    // Find the latest saved weekly meal plan for this user
    const plan = await WeeklyMealPlan.findOne({ userEmail: email }).sort({ createdAt: -1 }).exec();

    if (!plan) {
      return res.status(404).json({ message: "No meal plan found for this user" });
    }

    res.json({
      message: "Weekly meal plan retrieved successfully",
      weeklyMealPlan: plan,
      exists: true
    });
  } catch (error) {
    console.error("Error retrieving weekly meal plan:", error);
    res.status(500).json({ message: "Failed to retrieve meal plan", error: error.message });
  }
};

