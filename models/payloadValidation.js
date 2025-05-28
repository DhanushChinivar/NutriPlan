const Joi = require('joi');

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
    registerSchema,
    generateMealSchema
}