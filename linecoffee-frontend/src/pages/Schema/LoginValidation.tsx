import Joi from "joi"

export const loginSchema = Joi.object({
    email: Joi.string()
           .pattern(/^[a-zA-Z0-9._%+-]+@(gmail|yahoo)\.com$/)
           .required()
           .messages({
               "string.pattern.base": "Email must be a valid Gmail or Yahoo ending with .com",
               "any.required": "Email is required",
           }),
       password: Joi.string().min(3).required().messages({
           "string.min": "Password must be at least 6 characters",
           "any.required": "Password is required",
       }),
});