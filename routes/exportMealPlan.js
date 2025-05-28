const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const WeeklyMealPlan = require('../models/weeklyMealPlan');

// GET /api/mealplan/export?email=user@example.com
router.get('/export', async (req, res) => {
  const userEmail = req.query.email;

  if (!userEmail) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const mealPlan = await WeeklyMealPlan.findOne({ userEmail })
      .sort({ createdAt: -1 })
      .lean();

    if (!mealPlan) {
      return res.status(404).json({ error: 'No meal plan found for this email' });
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Disposition', 'attachment; filename=WeeklyMealPlan.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(20).text(`Weekly Meal Plan for ${userEmail}`, { underline: true });
    doc.moveDown();

    mealPlan.dailyPlans.forEach(dayPlan => {
      doc.fontSize(16).fillColor('#333').text(`${dayPlan.day}`, { underline: true });
      doc.fontSize(12).fillColor('black');
      doc.text(`Total Calories: ${dayPlan.totalCalories}`);
      doc.text(`Total Nutrients: Protein: ${dayPlan.totalNutrients.protein}, Fat: ${dayPlan.totalNutrients.fat}, Carbs: ${dayPlan.totalNutrients.carbs}`);
      doc.moveDown(0.5);

      dayPlan.meals.forEach(meal => {
        doc.font('Helvetica-Bold').text(`Meal: ${meal.name}`);
        doc.font('Helvetica').text(`Diet: ${meal.diet}`);
        doc.text(`Calories: ${meal.calories}`);
        doc.text(`Nutrients: Protein: ${meal.nutrients.protein}, Fat: ${meal.nutrients.fat}, Carbs: ${meal.nutrients.carbs}`);
        doc.text(`Ingredients: ${meal.ingredients.join(', ')}`);
        doc.text(`Instructions: ${meal.instructions}`);
        doc.moveDown();
      });

      doc.addPage();
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while generating PDF' });
  }
});

module.exports = router;
