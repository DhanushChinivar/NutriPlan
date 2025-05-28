const mongoose = require('mongoose');

const nutritionEntrySchema = new mongoose.Schema({
    email: {type: String, required: true},
    date: { type: Date, required: true },
    foodItem: { type: String, required: true },
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 },
    fats: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('NutritionEntry', nutritionEntrySchema);