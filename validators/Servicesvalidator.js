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
    body("ledger_name")
        .notEmpty().withMessage("Ledger name is required")
        .isLength({ max: 50 }).withMessage("Ledger name must be at most 50 characters"),

    body("ledger_alias")
        .optional().isLength({ max: 50 }).withMessage("Ledger alias must be at most 50 characters"),

    body("ledger_cheque")
        .optional().isLength({ max: 50 }).withMessage("Ledger cheque must be at most 50 characters"),

    body("maintain_bill_wise")
        .optional().isBoolean().withMessage("Maintain bill wise must be a boolean"),

    body("isdiscount_ledger")
        .optional().isBoolean().withMessage("Is discount ledger must be a boolean"),

    body("remark")
        .optional().isLength({ max: 50 }).withMessage("Remark must be at most 50 characters"),

    body("is_tax_applicable")
        .optional().isBoolean().withMessage("Is tax applicable must be a boolean"),

    body("taxplan_IDR")
        .optional().isInt().withMessage("Tax plan ID must be an integer"),

    body("credit_period")
        .optional().isLength({ max: 50 }).withMessage("Credit period must be at most 50 characters"),

    body("HospitalGroupIDR")
        .notEmpty().withMessage("Hospital Group ID is required")
        .isInt().withMessage("Hospital Group ID must be an integer"),
];

exports.validateAccLedgerUpdate = [
    body("ledger_name")
        .optional().isLength({ max: 50 }).withMessage("Ledger name must be at most 50 characters"),

    body("ledger_alias")
        .optional().isLength({ max: 50 }).withMessage("Ledger alias must be at most 50 characters"),

    body("ledger_cheque")
        .optional().isLength({ max: 50 }).withMessage("Ledger cheque must be at most 50 characters"),

    body("maintain_bill_wise")
        .optional().isBoolean().withMessage("Maintain bill wise must be a boolean"),

    body("isdiscount_ledger")
        .optional().isBoolean().withMessage("Is discount ledger must be a boolean"),

    body("remark")
        .optional().isLength({ max: 50 }).withMessage("Remark must be at most 50 characters"),

    body("is_tax_applicable")
        .optional().isBoolean().withMessage("Is tax applicable must be a boolean"),

    body("taxplan_IDR")
        .optional().isInt().withMessage("Tax plan ID must be an integer"),

    body("credit_period")
        .optional().isLength({ max: 50 }).withMessage("Credit period must be at most 50 characters"),
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
exports. finGroupValidationRules = [
    body("fin_group_name")
      .isString()
      .notEmpty()
      .withMessage("Financial group name is required and must be a string.")
      .isLength({ max: 250 })
      .withMessage("Financial group name must not exceed 250 characters."),
  
    body("group_category")
      .isInt()
      .withMessage("Group category must be an integer."),
  
    body("types_of_group")
      .isInt()
      .withMessage("Types of group must be an integer."),
  
    body("is_primary_group")
    .isBoolean()
      .withMessage("Primary group must be 0 or 1."),
  
    body("under_group_IDR")
      .isInt()
      .withMessage("Under group IDR must be an integer."),
  
    body("master_group_IDR")
      .optional({ nullable: true })
      .isInt()
      .withMessage("Master group IDR must be an integer if provided."),
  
    body("group_level")
      .isBoolean()
      .withMessage("Group level must be a boolean value."),
  
    body("is_system_group")
      .isBoolean()
      .withMessage("Is system group must be a boolean value."),
  
    body("for_jv_settelment")
      .isBoolean()
      .withMessage("For JV settlement must be a boolean value."),
  
    body("remark")
      .isString()
      .notEmpty()
      .withMessage("Remark is required and must be a string.")
      .isLength({ max: 250 })
      .withMessage("Remark must not exceed 250 characters."),
  
    body("hospitalIDR")
      .isInt()
      .withMessage("Hospital IDR must be an integer."),
  
    body("hospitalGroupIDR")
      .isInt()
      .withMessage("Hospital Group IDR must be an integer."),
  ];
exports. finGroupUpdateValidationRules = [
    body("fin_group_name")
      .isString()
      .notEmpty()
      .withMessage("Financial group name is required and must be a string.")
      .isLength({ max: 250 })
      .withMessage("Financial group name must not exceed 250 characters."),
  
    body("group_category")
      .isInt()
      .withMessage("Group category must be an integer."),
  
    body("types_of_group")
      .isInt()
      .withMessage("Types of group must be an integer."),
  
    body("is_primary_group")
    .isBoolean()
      .withMessage("Primary group must be 0 or 1."),
  
    body("under_group_IDR")
      .isInt()
      .withMessage("Under group IDR must be an integer."),
  
    body("master_group_IDR")
      .optional({ nullable: true })
      .isInt()
      .withMessage("Master group IDR must be an integer if provided."),
  
    body("group_level")
      .isBoolean()
      .withMessage("Group level must be a boolean value."),
  
    body("is_system_group")
      .isBoolean()
      .withMessage("Is system group must be a boolean value."),
  
    body("for_jv_settelment")
      .isBoolean()
      .withMessage("For JV settlement must be a boolean value."),
  
    body("remark")
      .isString()
      .notEmpty()
      .withMessage("Remark is required and must be a string.")
      .isLength({ max: 250 })
      .withMessage("Remark must not exceed 250 characters."),
  
 

  ];
  exports.validateBillingClass = [
    body("billing_Class_name")
        .notEmpty().withMessage("Billing Class Name is required")
        .isString().withMessage("Billing Class Name must be a string")
        .isLength({ max: 50 }).withMessage("Billing Class Name should not exceed 50 characters"),

    body("billing_Class_Code")
        .optional()
        .isString().withMessage("Billing Class Code must be a string")
        .isLength({ max: 50 }).withMessage("Billing Class Code should not exceed 50 characters"),

    body("contact_Person")
        .optional()
        .isString().withMessage("Contact Person must be a string"),

    body("billing_Class_Category")
        .notEmpty().withMessage("Billing Class Category is required")
        .isString().withMessage("Billing Class Category must be a string"),

    body("ledger_IDR")
        .notEmpty().withMessage("Ledger ID is required")
        .isInt().withMessage("Ledger ID must be an integer"),

    body("is_Cashless").optional().isBoolean().withMessage("is_Cashless must be a boolean"),
    body("Cost_Base").notEmpty().isBoolean().withMessage("Cost Base must be a boolean"),
    body("is_Reimbursement").optional().isBoolean().withMessage("is_Reimbursement must be a boolean"),
    body("is_Pharamcy_Cash_Allowed").optional().isBoolean().withMessage("is_Pharamcy_Cash_Allowed must be a boolean"),
    body("is_Pharamcy_Cashless_Allowed").optional().isBoolean().withMessage("is_Pharamcy_Cashless_Allowed must be a boolean"),

    body("cashless_Applicable_On").optional(),

    body("issTax_Applicable").optional().isBoolean().withMessage("issTax_Applicable must be a boolean"),
    body("sTax_On_Billtype").notEmpty().isBoolean().withMessage("sTax_On_Billtype must be a boolean"),
    body("sTax_On_OPD").optional().isBoolean().withMessage("sTax_On_OPD must be a boolean"),
    body("sTax_On_IPD").optional().isBoolean().withMessage("sTax_On_IPD must be a boolean"),
    body("sTax_On_CheckUp").optional().isBoolean().withMessage("sTax_On_CheckUp must be a boolean"),

    body("is_Copay_AllowedOn_OPD").notEmpty().isBoolean().withMessage("is_Copay_AllowedOn_OPD must be a boolean"),
    body("is_Copay_AllowedOn_IPD").optional().isBoolean().withMessage("is_Copay_AllowedOn_IPD must be a boolean"),
    body("is_Copay_AllowedOn_Pharamcy").notEmpty().isBoolean().withMessage("is_Copay_AllowedOn_Pharamcy must be a boolean"),

    body("address1").optional().isString().withMessage("Address1 must be a string"),
    body("address2").optional().isString().withMessage("Address2 must be a string"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("country").optional(),

    body("zip")
        .notEmpty().withMessage("Zip is required")
        .isInt().withMessage("Zip must be an integer"),

    body("phone1").optional().isInt().withMessage("Phone1 must be a number"),
    body("phone2").optional().isInt().withMessage("Phone2 must be a number"),
    body("Mobile").notEmpty().isInt().withMessage("Mobile must be a number"),
    body("whatapp_Number").notEmpty().isInt().withMessage("WhatsApp Number must be a number"),

    body("email").optional().isEmail().withMessage("Invalid email format"),

    body("hospital_IDR").notEmpty().isInt().withMessage("Hospital ID is required and must be an integer"),
    body("hospitalGroup_IDR").optional().isInt().withMessage("Hospital Group ID must be an integer"),

    body("currancy").optional().isString().withMessage("Currency must be a string"),
    body("rate_baseOn").notEmpty().isString().withMessage("Rate Base On is required and must be a string"),
];
  exports.validateBillingClassUpdate = [
    body("billing_Class_name")
        .notEmpty().withMessage("Billing Class Name is required")
        .isString().withMessage("Billing Class Name must be a string")
        .isLength({ max: 50 }).withMessage("Billing Class Name should not exceed 50 characters"),

    body("billing_Class_Code")
        .optional()
        .isString().withMessage("Billing Class Code must be a string")
        .isLength({ max: 50 }).withMessage("Billing Class Code should not exceed 50 characters"),

    body("contact_Person")
        .optional()
        .isString().withMessage("Contact Person must be a string"),

    body("billing_Class_Category")
        .notEmpty().withMessage("Billing Class Category is required")
        .isString().withMessage("Billing Class Category must be a string"),

    body("ledger_IDR")
        .notEmpty().withMessage("Ledger ID is required")
        .isInt().withMessage("Ledger ID must be an integer"),

    body("is_Cashless").optional().isBoolean().withMessage("is_Cashless must be a boolean"),
    body("Cost_Base").notEmpty().isBoolean().withMessage("Cost Base must be a boolean"),
    body("is_Reimbursement").optional().isBoolean().withMessage("is_Reimbursement must be a boolean"),
    body("is_Pharamcy_Cash_Allowed").optional().isBoolean().withMessage("is_Pharamcy_Cash_Allowed must be a boolean"),
    body("is_Pharamcy_Cashless_Allowed").optional().isBoolean().withMessage("is_Pharamcy_Cashless_Allowed must be a boolean"),

    body("cashless_Applicable_On").optional(),

    body("issTax_Applicable").optional().isBoolean().withMessage("issTax_Applicable must be a boolean"),
    body("sTax_On_Billtype").notEmpty().isBoolean().withMessage("sTax_On_Billtype must be a boolean"),
    body("sTax_On_OPD").optional().isBoolean().withMessage("sTax_On_OPD must be a boolean"),
    body("sTax_On_IPD").optional().isBoolean().withMessage("sTax_On_IPD must be a boolean"),
    body("sTax_On_CheckUp").optional().isBoolean().withMessage("sTax_On_CheckUp must be a boolean"),

    body("is_Copay_AllowedOn_OPD").notEmpty().isBoolean().withMessage("is_Copay_AllowedOn_OPD must be a boolean"),
    body("is_Copay_AllowedOn_IPD").optional().isBoolean().withMessage("is_Copay_AllowedOn_IPD must be a boolean"),
    body("is_Copay_AllowedOn_Pharamcy").notEmpty().isBoolean().withMessage("is_Copay_AllowedOn_Pharamcy must be a boolean"),

    body("address1").optional().isString().withMessage("Address1 must be a string"),
    body("address2").optional().isString().withMessage("Address2 must be a string"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("country").optional(),

    body("zip")
        .notEmpty().withMessage("Zip is required")
        .isInt().withMessage("Zip must be an integer"),

    body("phone1").optional().isInt().withMessage("Phone1 must be a number"),
    body("phone2").optional().isInt().withMessage("Phone2 must be a number"),
    body("Mobile").notEmpty().isInt().withMessage("Mobile must be a number"),
    body("whatapp_Number").notEmpty().isInt().withMessage("WhatsApp Number must be a number"),

    body("email").optional().isEmail().withMessage("Invalid email format"),

    body("hospital_IDR").notEmpty().isInt().withMessage("Hospital ID is required and must be an integer"),
    body("hospitalGroup_IDR").optional().isInt().withMessage("Hospital Group ID must be an integer"),

    body("currancy").optional().isString().withMessage("Currency must be a string"),
    body("rate_baseOn").notEmpty().isString().withMessage("Rate Base On is required and must be a string"),
];


exports.validateUnit = [
    body("unit_name")
        .notEmpty().withMessage("Unit Name is required")
        .isString().withMessage("Unit Name must be a string")
        .isLength({ max: 50 }).withMessage("Unit Name should not exceed 50 characters"),

    body("decimal")
        .optional()
        .isInt({ min: 0 }).withMessage("Decimal must be a non-negative integer"),

    body("remarks")
        .optional()
        .isString().withMessage("Remarks must be a string"),

    body("hospitalIDR")
        .notEmpty().withMessage("Hospital ID is required")
        .isInt().withMessage("Hospital ID must be an integer"),

    body("hospitalGroupIDR")
        .notEmpty().withMessage("Hospital Group ID is required")
        .isInt().withMessage("Hospital Group ID must be an integer"),

    body("createdBy")
        .optional()
        .isString().withMessage("Created By must be a string"),
];
exports.validateUnitUpdate = [
    body("unit_name")
        .notEmpty().withMessage("Unit Name is required")
        .isString().withMessage("Unit Name must be a string")
        .isLength({ max: 50 }).withMessage("Unit Name should not exceed 50 characters"),

    body("decimal")
        .optional()
        .isInt({ min: 0 }).withMessage("Decimal must be a non-negative integer"),

    body("remarks")
        .optional()
        .isString().withMessage("Remarks must be a string"),

    body("hospitalIDR")
        .notEmpty().withMessage("Hospital ID is required")
        .isInt().withMessage("Hospital ID must be an integer"),

    body("hospitalGroupIDR")
        .notEmpty().withMessage("Hospital Group ID is required")
        .isInt().withMessage("Hospital Group ID must be an integer"),

    body("createdBy")
        .optional()
        .isString().withMessage("Created By must be a string"),
];