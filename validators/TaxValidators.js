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

exports.validateTaxMap = [
    body('item_IDR')
        .notEmpty().withMessage('Item ID is required')
        .isInt().withMessage('Item ID must be an integer'),

    body('tax_IDR')
        .notEmpty().withMessage('Tax ID is required')
        .isInt().withMessage('Tax ID must be an integer'),

    body('hospital_IDR')
        .optional().isInt().withMessage('Hospital ID must be an integer'),

    body('type')
        .optional().isLength({ max: 50 }).withMessage('Type must be at most 50 characters'),
];
exports.validateTaxMapupdate = [
    body('item_IDR')
        .notEmpty().withMessage('Item ID is required')
        .isInt().withMessage('Item ID must be an integer'),

    body('tax_IDR')
        .notEmpty().withMessage('Tax ID is required')
        .isInt().withMessage('Tax ID must be an integer'),


    body('type')
        .optional().isLength({ max: 50 }).withMessage('Type must be at most 50 characters'),
];




exports.validateItemCategory = [
    body("item_Category_name")
        .notEmpty().withMessage("Item category name is required")
        .isLength({ max: 50 }).withMessage("Item category name must be at most 50 characters"),

    body("item_Category_Code")
        .optional().isLength({ max: 50 }).withMessage("Item category code must be at most 50 characters"),

    body("is_PharamaItem")
        .optional().isBoolean().withMessage("Is Pharma Item must be a boolean"),

    body("is_LabItem")
        .optional().isBoolean().withMessage("Is Lab Item must be a boolean"),

    body("purches_ledger_IDR")
        .notEmpty().withMessage("Purchase ledger ID is required")
        .isInt().withMessage("Purchase ledger ID must be an integer"),

    body("sale_ledger_IDR")
        .notEmpty().withMessage("Sale ledger ID is required")
        .isInt().withMessage("Sale ledger ID must be an integer"),

    body("discount_Allowed")
        .notEmpty().withMessage("Discount allowed is required")
        .isBoolean().withMessage("Discount allowed must be a boolean"),

    body("hospital_IDR")
        .notEmpty().withMessage("Hospital ID is required")
        .isInt().withMessage("Hospital ID must be an integer"),

    body("hospitalGroup_IDR")
        .optional().isInt().withMessage("Hospital Group ID must be an integer"),

    body("createdBy")
        .optional().isString().withMessage("Created by must be a string"),

    body("updatedBy")
        .optional().isString().withMessage("Updated by must be a string"),
];

exports.validateItemCategoryUpdate = [
    body("item_Category_name")
        .optional().isLength({ max: 50 }).withMessage("Item category name must be at most 50 characters"),

    body("item_Category_Code")
        .optional().isLength({ max: 50 }).withMessage("Item category code must be at most 50 characters"),

    body("is_PharamaItem")
        .optional().isBoolean().withMessage("Is Pharma Item must be a boolean"),

    body("is_LabItem")
        .optional().isBoolean().withMessage("Is Lab Item must be a boolean"),

    body("purches_ledger_IDR")
        .optional().isInt().withMessage("Purchase ledger ID must be an integer"),

    body("sale_ledger_IDR")
        .optional().isInt().withMessage("Sale ledger ID must be an integer"),

    body("discount_Allowed")
        .optional().isBoolean().withMessage("Discount allowed must be a boolean"),

    body("hospital_IDR")
        .optional().isInt().withMessage("Hospital ID must be an integer"),

    body("hospitalGroup_IDR")
        .optional().isInt().withMessage("Hospital Group ID must be an integer"),

    body("createdBy")
        .optional().isString().withMessage("Created by must be a string"),

    body("updatedBy")
        .optional().isString().withMessage("Updated by must be a string"),
];



exports.validateItemGroup = [
    body("group_name")
        .notEmpty().withMessage("Group name is required")
        .isLength({ max: 50 }).withMessage("Group name must be at most 50 characters"),

    body("parent_groupIDR")
        .optional().isInt().withMessage("Parent group ID must be an integer"),

    body("hospitalIDR")
        .optional().isInt().withMessage("Hospital ID must be an integer"),

    body("Non_Active")
        .notEmpty().withMessage("Non Active status is required")
        .isBoolean().withMessage("Non Active must be a boolean"),

    body("HospitalGroupIDR")
        .notEmpty().withMessage("Hospital Group ID is required")
        .isInt().withMessage("Hospital Group ID must be an integer"),

    body("createdBy")
        .notEmpty().withMessage("Created by is required")
        .isString().withMessage("Created by must be a string"),

    body("updatedBy")
        .notEmpty().withMessage("Updated by is required")
        .isString().withMessage("Updated by must be a string"),
];

exports.validateItemContent = [
    body("ItemContentName")
        .notEmpty().withMessage("Item content is required")
        .isLength({ max: 50 }).withMessage("Item content must be at most 50 characters"),

    body("HospitalIDF")
        .optional().isInt().withMessage("Hospital ID must be an integer"),

    body("NonActive")
        .optional()
        .isBoolean().withMessage("Non Active must be a boolean"),
    body("hospitalIDR")
        .optional().isInt().withMessage("Hospital ID must be an integer"),

    body("HospitalGroupIDF")
        .notEmpty().withMessage("Hospital Group ID is required")
        .isInt().withMessage("Hospital Group ID must be an integer"),

    body("CreatedBy")
        .notEmpty().withMessage("Created by is required")
        .isString().withMessage("Created by must be a string"),

    body("UpdatedBy")
        .notEmpty().withMessage("Updated by is required")
        .isString().withMessage("Updated by must be a string"),
];

exports.validateItemContentUpdate = [
    body("ItemContentName")
        .optional()
        .isLength({ max: 50 }).withMessage("Item content must be at most 50 characters"),
    body("HospitalIDF")
        .optional().isInt().withMessage("Hospital ID must be an integer"),
    body("NonActive")
        .optional()
        .isBoolean().withMessage("Non Active must be a boolean"),
    body("hospitalIDR")
        .optional().isInt().withMessage("Hospital ID must be an integer"),
    body("HospitalGroupIDF")
        .optional()
        .isInt().withMessage("Hospital Group ID must be an integer"),
    body("CreatedBy")
        .optional()
        .isString().withMessage("Created by must be a string"),
    body("UpdatedBy")
        .optional()
        .isString().withMessage("Updated by must be a string"),
];

exports.validateItemGroupUpdate = [
    body("group_name")
        .optional().isLength({ max: 50 }).withMessage("Group name must be at most 50 characters"),

    body("parent_groupIDR")
        .optional().isInt().withMessage("Parent group ID must be an integer"),

    body("hospitalIDR")
        .optional().isInt().withMessage("Hospital ID must be an integer"),

    body("Non_Active")
        .optional().isBoolean().withMessage("Non Active must be a boolean"),

    body("HospitalGroupIDR")
        .optional().isInt().withMessage("Hospital Group ID must be an integer"),

    body("createdBy")
        .optional().isString().withMessage("Created by must be a string"),

    body("updatedBy")
        .optional().isString().withMessage("Updated by must be a string"),
];




exports.validateSupplier = [
    body("supplier_name")
        .notEmpty().withMessage("Supplier name is required")
        .isLength({ max: 50 }).withMessage("Supplier name must be at most 50 characters"),

    body("supplier_Code")
        .notEmpty().withMessage("Supplier code is required")
        .isLength({ max: 50 }).withMessage("Supplier code must be at most 50 characters"),

    body("contact_Person")
        .optional().isLength({ max: 50 }).withMessage("Contact person name must be at most 50 characters"),

    body("contact_Person2")
        .optional().isLength({ max: 50 }).withMessage("Contact person 2 name must be at most 50 characters"),

    body("Remarks")
        .optional().isLength({ max: 250 }).withMessage("Remarks must be at most 250 characters"),

    body("GST_Number")
        .optional().isLength({ max: 50 }).withMessage("GST number must be at most 50 characters"),

    body("TIN_Number")
        .optional().isLength({ max: 50 }).withMessage("TIN number must be at most 50 characters"),

    body("CST_Number")
        .optional().isLength({ max: 50 }).withMessage("CST number must be at most 50 characters"),

    body("service_Tax_Number")
        .optional().isLength({ max: 50 }).withMessage("Service tax number must be at most 50 characters"),

    body("pan_Number")
        .optional().isLength({ max: 50 }).withMessage("PAN number must be at most 50 characters"),

    body("VAT_Number")
        .optional().isLength({ max: 50 }).withMessage("VAT number must be at most 50 characters"),

    body("web_site")
        .optional().isURL().withMessage("Website must be a valid URL")
        .isLength({ max: 250 }).withMessage("Website URL must be at most 250 characters"),

    body("ledger_IDR")
        .notEmpty().withMessage("Ledger ID is required")
        .isInt().withMessage("Ledger ID must be an integer"),

    body("is_PurchesInvoice_SMS")
        .optional().isBoolean().withMessage("Purchase invoice SMS must be a boolean"),

    body("billPass_SMS")
        .optional().isBoolean().withMessage("Bill pass SMS must be a boolean"),

    body("update_onWhatapp")
        .optional().isBoolean().withMessage("Update on WhatsApp must be a boolean"),

    body("address1")
        .optional().isLength({ max: 255 }).withMessage("Address 1 must be at most 255 characters"),

    body("address2")
        .optional().isLength({ max: 255 }).withMessage("Address 2 must be at most 255 characters"),

    body("city")
        .optional().isInt().withMessage("City must be an integer"),

    body("state")
        .optional().isInt().withMessage("State must be an integer"),

    body("country")
        .optional().isInt().withMessage("Country must be an integer"),

    body("zip")
        .optional().isInt().withMessage("Zip code must be an integer"),

    body("phone1")
        .optional().isLength({ max: 20 }).withMessage("Phone 1 must be at most 20 characters"),

    body("phone2")
        .optional().isLength({ max: 20 }).withMessage("Phone 2 must be at most 20 characters"),

    body("Mobile")
        .optional().isLength({ max: 20 }).withMessage("Mobile number must be at most 20 characters"),

    body("whatapp_Number")
        .optional().isLength({ max: 20 }).withMessage("WhatsApp number must be at most 20 characters"),

    body("email")
        .optional().isEmail().withMessage("Email must be a valid email address"),

    body("hospital_IDR")
        .notEmpty().withMessage("Hospital ID is required")
        .isInt().withMessage("Hospital ID must be an integer"),

    body("hospitalGroup_IDR")
        .optional().isInt().withMessage("Hospital Group ID must be an integer"),

    body("createdBy")
        .optional().isString().withMessage("Created by must be a string"),

    body("updatedBy")
        .optional().isString().withMessage("Updated by must be a string"),

    body("Non_Active")
        .optional().isBoolean().withMessage("Non Active must be a boolean"),

    body("UpdatedAt")
        .optional().isISO8601().toDate().withMessage("UpdatedAt must be a valid date"),

    body("CreatedAt")
        .optional().isISO8601().toDate().withMessage("CreatedAt must be a valid date"),
];

exports.validateSupplierUpdate = [
    body("supplier_name")
        .optional().isLength({ max: 50 }).withMessage("Supplier name must be at most 50 characters"),

    body("supplier_Code")
        .optional().isLength({ max: 50 }).withMessage("Supplier code must be at most 50 characters"),

    body("ledger_IDR")
        .optional().isInt().withMessage("Ledger ID must be an integer"),

    body("is_PurchesInvoice_SMS")
        .optional().isBoolean().withMessage("Purchase invoice SMS must be a boolean"),

    body("billPass_SMS")
        .optional().isBoolean().withMessage("Bill pass SMS must be a boolean"),

    body("update_onWhatapp")
        .optional().isBoolean().withMessage("Update on WhatsApp must be a boolean"),

    body("hospital_IDR")
        .optional().isInt().withMessage("Hospital ID must be an integer"),

    body("hospitalGroup_IDR")
        .optional().isInt().withMessage("Hospital Group ID must be an integer"),

    body("updatedBy")
        .optional().isString().withMessage("Updated by must be a string"),

    body("Non_Active")
        .optional().isBoolean().withMessage("Non Active must be a boolean"),

    body("UpdatedAt")
        .optional().isISO8601().toDate().withMessage("UpdatedAt must be a valid date"),
];