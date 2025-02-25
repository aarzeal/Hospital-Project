const { body } = require('express-validator');

exports.validateTax = [
    body('tax_name')
        .notEmpty().withMessage('Tax name is required')
        .isLength({ max: 50 }).withMessage('Tax name must be at most 50 characters'),

    body('tax_rate')
        .optional().isLength({ max: 50 }).withMessage('Tax rate must be at most 50 characters'),

    body('is_active')
        .isBoolean().withMessage('Is active must be a boolean'),

    body('HospitalIDR')
        .notEmpty().withMessage('Hospital ID is required'),
];
exports.validateTaxupdate = [
    body('tax_name')
        .notEmpty().withMessage('Tax name is required')
        .isLength({ max: 50 }).withMessage('Tax name must be at most 50 characters'),

    body('tax_rate')
        .optional().isLength({ max: 50 }).withMessage('Tax rate must be at most 50 characters'),

    body('is_active')
        .isBoolean().withMessage('Is active must be a boolean'),


];

exports.validateTaxDetails = [
    body('Tax_IDR')
        .optional().isInt().withMessage('Tax ID must be an integer'),

    body('From_Date')
        .notEmpty().withMessage('From Date is required')
        .isISO8601().withMessage('From Date must be a valid date'),

    body('To_Date')
        .notEmpty().withMessage('To Date is required')
        .isISO8601().withMessage('To Date must be a valid date'),

    body('Tax_Details_Leble')
        .optional().isLength({ max: 100 }).withMessage('Tax Details Label must be at most 100 characters'),

    body('Serial_Number')
        .optional().isLength({ max: 50 }).withMessage('Serial Number must be at most 50 characters'),

    body('Ledger_IDR')
        .optional().isInt().withMessage('Ledger ID must be an integer'),

    body('Is_Primary_Tax')
        .isBoolean().withMessage('Is Primary Tax must be a boolean'),

    body('tax_rate')
        .optional().isLength({ max: 50 }).withMessage('Tax rate must be at most 50 characters'),

    body('is_active')
        .isBoolean().withMessage('Is Active must be a boolean'),

    body('Calculate_On')
        .notEmpty().withMessage('Calculate On field is required'),

    body('Is_Current')
        .isInt().withMessage('Is Current must be an integer'),
];

exports.validateTaxDetailsupdate = [
    body('Tax_IDR')
        .optional().isInt().withMessage('Tax ID must be an integer'),

    body('From_Date')
        .notEmpty().withMessage('From Date is required')
        .isISO8601().withMessage('From Date must be a valid date'),

    body('To_Date')
        .notEmpty().withMessage('To Date is required')
        .isISO8601().withMessage('To Date must be a valid date'),

    body('Tax_Details_Leble')
        .optional().isLength({ max: 100 }).withMessage('Tax Details Label must be at most 100 characters'),

    body('Serial_Number')
        .optional().isLength({ max: 50 }).withMessage('Serial Number must be at most 50 characters'),

    body('Ledger_IDR')
        .optional().isInt().withMessage('Ledger ID must be an integer'),

    body('Is_Primary_Tax')
        .isBoolean().withMessage('Is Primary Tax must be a boolean'),

    body('tax_rate')
        .optional().isLength({ max: 50 }).withMessage('Tax rate must be at most 50 characters'),

    body('is_active')
        .isBoolean().withMessage('Is Active must be a boolean'),

    body('Calculate_On')
        .notEmpty().withMessage('Calculate On field is required'),

    body('Is_Current')
        .isInt().withMessage('Is Current must be an integer'),
];

exports.validateItem = [
    body('Item_name')
        .notEmpty().withMessage('Item name is required')
        .isLength({ max: 50 }).withMessage('Item name must be at most 50 characters'),

    body('Item_alias')
        .optional().isLength({ max: 50 }).withMessage('Item alias must be at most 50 characters'),

    body('Item_Description')
        .optional().isLength({ max: 250 }).withMessage('Item description must be at most 250 characters'),

    body('Item_Code')
        .optional().isLength({ max: 50 }).withMessage('Item code must be at most 50 characters'),

    body('Non_Active')
        .isBoolean().withMessage('Non Active must be a boolean'),

    body('HospitalGroupIDR')
        .notEmpty().withMessage('Hospital Group ID is required'),
];
exports.validateItemupdate = [
    body('Item_name')
        .notEmpty().withMessage('Item name is required')
        .isLength({ max: 50 }).withMessage('Item name must be at most 50 characters'),

    body('Item_alias')
        .optional().isLength({ max: 50 }).withMessage('Item alias must be at most 50 characters'),

    body('Item_Description')
        .optional().isLength({ max: 250 }).withMessage('Item description must be at most 250 characters'),

    body('Item_Code')
        .optional().isLength({ max: 50 }).withMessage('Item code must be at most 50 characters'),

    body('Non_Active')
        .isBoolean().withMessage('Non Active must be a boolean'),


];