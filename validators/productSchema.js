const Joi = require('joi');

exports.createProductSchema = Joi.object({
  Name: Joi.string().min(3).required(),
  product_price: Joi.number().positive().required()
});

