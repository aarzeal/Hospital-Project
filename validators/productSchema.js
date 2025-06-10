const Joi = require("joi");

exports.createProductSchema = Joi.object({
  Name: Joi.string()
    .min(3)
    .required()
    .messages({
      "string.base": "Product name must be a string",
      "string.empty": "Product name is required",
      "string.min": "Product name must be at least 3 characters long",
      "any.required": "Product name is required"
    }),

  product_price: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "Product price must be a number",
      "number.positive": "Product price must be a positive number",
      "any.required": "Product price is required"
    })
});
