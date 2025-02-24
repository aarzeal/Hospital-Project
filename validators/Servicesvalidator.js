const { body } = require('express-validator');

exports.validateService = [
    body('service_code')
        .notEmpty().withMessage('Service code is required')
        .isLength({ max: 50 }).withMessage('Service code must be at most 50 characters'),

    body('service_name')
        .notEmpty().withMessage('Service name is required')
        .isLength({ max: 100 }).withMessage('Service name must be at most 100 characters'),

    body('service_type')
        .notEmpty().withMessage('Service type is required')
        .isLength({ max: 50 }).withMessage('Service type must be at most 50 characters'),

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
        .isLength({ max: 50 }).withMessage('Service type must be at most 50 characters'),

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
