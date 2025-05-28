const Joi = require('joi');

const userPreferenceSchema = Joi.object({
    email: Joi.string().email().required(),
    age: Joi.number().integer().min(0).required(),
    height: Joi.number().positive().required(),
    weight: Joi.number().positive().required(),
    gender: Joi.string().valid('male', 'female').required(),
    dietType: Joi.string().required(),
    allergies: Joi.array().items(Joi.string()).required(),
    mealsPerDay: Joi.number().integer().min(2).max(4).required(),
    goal: Joi.string().required(),
    activityLevel: Joi.string().valid('low', 'moderate', 'high').required()
});

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required()
});

const generateMealSchema = Joi.object({
    email: Joi.string().email().required(),
})

module.exports = {
    userPreferenceSchema,
    registerSchema,
    generateMealSchema
}