const { body } = require('express-validator');

exports.validateService = [
    body('service_code')
        .notEmpty().withMessage('Service code is required')
        .isLength({ max: 50 }).withMessage('Service code must be at most 50 characters'),

    body('service_name')
        .notEmpty().withMessage('Service name is required')
        .isLength({ max: 100 }).withMessage('Service name must be at most 100 characters'),

    body('service_type')
        .notEmpty().withMessage('Service type is required'),
        

    body('service_category_IDR')
        .optional().isInt().withMessage('Service category ID must be an integer'),

    body('service_charge_applicable')
        .isBoolean().withMessage('Service charge applicable must be a boolean'),

    body('service_tax_applicable')
        .isBoolean().withMessage('Service tax applicable must be a boolean'),

    body('non_active')
        .isBoolean().withMessage('Non-active must be a boolean'),

    body('ledger_IDR')
        .optional().isInt().withMessage('Ledger ID must be an integer'),

    body('HospitalGroupIDR')
        .notEmpty().withMessage('Hospital Group ID is required'),
];
exports.validateServiceUpdate = [
    body('service_code')
        .notEmpty().withMessage('Service code is required')
        .isLength({ max: 50 }).withMessage('Service code must be at most 50 characters'),

    body('service_name')
        .notEmpty().withMessage('Service name is required')
        .isLength({ max: 100 }).withMessage('Service name must be at most 100 characters'),

    body('service_type')
        .notEmpty().withMessage('Service type is required')
       ,

    body('service_category_IDR')
        .optional().isInt().withMessage('Service category ID must be an integer'),

    body('service_charge_applicable')
        .isBoolean().withMessage('Service charge applicable must be a boolean'),

    body('service_tax_applicable')
        .isBoolean().withMessage('Service tax applicable must be a boolean'),

    body('non_active')
        .isBoolean().withMessage('Non-active must be a boolean'),

    body('ledger_IDR')
        .optional().isInt().withMessage('Ledger ID must be an integer'),

];
exports.validateServiceCategory = [
    body('servicecategoryname')
        .notEmpty().withMessage('Service category name is required')
        .isLength({ max: 100 }).withMessage('Service category name must be at most 100 characters'),

    body('HospitalGroupIDR')
        .notEmpty().withMessage('Hospital Group ID is required'),
];
exports.validateServiceCategoryupdate = [
    body('servicecategoryname')
        .notEmpty().withMessage('Service category name is required')
        .isLength({ max: 100 }).withMessage('Service category name must be at most 100 characters'),

    
];
exports.validateAccLedger = [
    body('ledger_name')
        .notEmpty().withMessage('Ledger name is required')
        .isLength({ max: 50 }).withMessage('Ledger name must be at most 50 characters'),

    body('ledger_alias')
        .optional().isLength({ max: 50 }).withMessage('Ledger alias must be at most 50 characters'),

    body('ledger_cheque')
        .optional().isLength({ max: 50 }).withMessage('Ledger cheque must be at most 50 characters'),

    body('maintain_bill_wise')
        .isBoolean().withMessage('Maintain bill wise must be a boolean'),

    body('isdiscount_ledger')
        .isBoolean().withMessage('Is discount ledger must be a boolean'),

    body('remark')
        .optional().isLength({ max: 50 }).withMessage('Remark must be at most 50 characters'),

    body('is_tax_aplicable')
        .isBoolean().withMessage('Is tax applicable must be a boolean'),

    body('taxplan_IDR')
        .optional().isInt().withMessage('Tax plan ID must be an integer'),

    body('creditperied')
        .optional().isLength({ max: 50 }).withMessage('Credit period must be at most 50 characters'),

    body('HospitalGroupIDR')
        .notEmpty().withMessage('Hospital Group ID is required'),
];
exports.validateAccLedgerUpdate = [
    body('ledger_name')
        .notEmpty().withMessage('Ledger name is required')
        .isLength({ max: 50 }).withMessage('Ledger name must be at most 50 characters'),

    body('ledger_alias')
        .optional().isLength({ max: 50 }).withMessage('Ledger alias must be at most 50 characters'),

    body('ledger_cheque')
        .optional().isLength({ max: 50 }).withMessage('Ledger cheque must be at most 50 characters'),

    body('maintain_bill_wise')
        .isBoolean().withMessage('Maintain bill wise must be a boolean'),

    body('isdiscount_ledger')
        .isBoolean().withMessage('Is discount ledger must be a boolean'),

    body('remark')
        .optional().isLength({ max: 50 }).withMessage('Remark must be at most 50 characters'),

    body('is_tax_aplicable')
        .isBoolean().withMessage('Is tax applicable must be a boolean'),

    body('taxplan_IDR')
        .optional().isInt().withMessage('Tax plan ID must be an integer'),

    body('creditperied')
        .optional().isLength({ max: 50 }).withMessage('Credit period must be at most 50 characters'),

    
];
exports.validateServicePriceList = [
    body('service_IDR')
        .notEmpty().withMessage('Service ID is required')
        .isInt().withMessage('Service ID must be an integer'),

    body('First_Emergency_Rate')
        .notEmpty().withMessage('First Emergency Rate is required')
        .isInt().withMessage('First Emergency Rate must be an integer'),

    body('Second_Emergency_Rate')
        .notEmpty().withMessage('Second Emergency Rate is required')
        .isInt().withMessage('Second Emergency Rate must be an integer'),

    body('From_Date')
        .optional().isISO8601().withMessage('From Date must be a valid date'),

    body('To_Date')
        .optional().isISO8601().withMessage('To Date must be a valid date'),

    body('is_current_Format')
        .optional().isLength({ max: 50 }).withMessage('Current Format must be at most 50 characters'),

    body('hospitalIDR')
        .notEmpty().withMessage('Hospital ID is required')
        .isInt().withMessage('Hospital ID must be an integer'),
];
exports.validateServicePriceListUpdate = [
    body('service_IDR')
        .notEmpty().withMessage('Service ID is required')
        .isInt().withMessage('Service ID must be an integer'),

    body('First_Emergency_Rate')
        .notEmpty().withMessage('First Emergency Rate is required')
        .isInt().withMessage('First Emergency Rate must be an integer'),

    body('Second_Emergency_Rate')
        .notEmpty().withMessage('Second Emergency Rate is required')
        .isInt().withMessage('Second Emergency Rate must be an integer'),

    body('From_Date')
        .optional().isISO8601().withMessage('From Date must be a valid date'),

    body('To_Date')
        .optional().isISO8601().withMessage('To Date must be a valid date'),

    body('is_current_Format')
        .optional().isLength({ max: 50 }).withMessage('Current Format must be at most 50 characters'),


];
exports.validateFinYear = [
    body('fin_year')
        .notEmpty().withMessage('fin_yearis required')
        

];

exports.validateFinYearDetails = [
    body('fin_code_IDR')
        .notEmpty().withMessage('Financial Code ID is required')
        .isInt().withMessage('Financial Code ID must be an integer'),

    body('startMonth')
        .notEmpty().withMessage('Start Month is required')
        .isISO8601().withMessage('Start Month must be a valid date'),

    body('endMonth')
        .notEmpty().withMessage('End Month is required')
        .isISO8601().withMessage('End Month must be a valid date'),

    body('lock')
        .notEmpty().withMessage('Lock status is required')
        .isLength({ max: 50 }).withMessage('Lock status must be at most 50 characters'),

    body('is_Active')
        .isBoolean().withMessage('Is Active must be a boolean'),

    body('hospitalIDR')
        .notEmpty().withMessage('Hospital ID is required')
        .isInt().withMessage('Hospital ID must be an integer'),

    body('hospitalGroupIDR')
        .notEmpty().withMessage('Hospital Group ID is required')
        .isInt().withMessage('Hospital Group ID must be an integer'),
];
exports.validateFinYearDetailsupdate = [
    body('fin_code_IDR')
        .notEmpty().withMessage('Financial Code ID is required')
        .isInt().withMessage('Financial Code ID must be an integer'),

    body('startMonth')
        .notEmpty().withMessage('Start Month is required')
        .isISO8601().withMessage('Start Month must be a valid date'),

    body('endMonth')
        .notEmpty().withMessage('End Month is required')
        .isISO8601().withMessage('End Month must be a valid date'),

    body('lock')
        .notEmpty().withMessage('Lock status is required')
        .isLength({ max: 50 }).withMessage('Lock status must be at most 50 characters'),

    body('is_Active')
        .isBoolean().withMessage('Is Active must be a boolean'),

   
];