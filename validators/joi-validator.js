const Joi = require("joi");

exports.labtestmethodcreateSchema = Joi.object({
    labTestMethodName: Joi.string()
        .max(50)
        .required()
        .messages({
            "string.base": "Lab Test Method Name must be a string",
            "string.empty": "Lab Test Method Name is required",
            "string.max": "Lab Test Method Name must not exceed 50 characters",
            "any.required": "Lab Test Method Name is required"
        }),

    labTestMethodCode: Joi.string()
        .max(50)
        .required()
        .messages({
            "string.base": "Lab Test Method Code must be a string",
            "string.empty": "Lab Test Method Code is required",
            "string.max": "Lab Test Method Code must not exceed 50 characters",
            "any.required": "Lab Test Method Code is required"
        }),

    Remark: Joi.string()
        .allow("")
        .optional()
        .messages({
            "string.base": "Lab Test Method Remark must be a string"
        }),

    isActive: Joi.boolean()
        .required()
        .messages({
            "boolean.base": "Is Active must be a boolean",
            "any.required": "Is Active is required"
        }),

    hospitalIDR: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": "Hospital ID must be an integer",
            "number.integer": "Hospital ID must be an integer",
            "number.empty": "Hospital ID is required",
            "any.required": "Hospital ID is required"
        }),

    hospitalGroupIDR: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": "Hospital Group ID must be an integer",
            "number.integer": "Hospital Group ID must be an integer",
            "number.empty": "Hospital Group ID is required",
            "any.required": "Hospital Group ID is required"
        }),

    createdBy: Joi.string()
        .optional()
        .messages({
            "string.base": "Created by must be a string"
        }),

    updatedBy: Joi.string()
        .optional()
        .messages({
            "string.base": "Updated by must be a string"
        })
});
