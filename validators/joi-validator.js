const Joi = require("joi");

exports.labtestmethodcreateSchema = Joi.object({
  labTestMethodName: Joi.string().max(200).required().messages({
    "string.base": "Lab Test Method Name must be a string",
    "string.empty": "Lab Test Method Name is required",
    "string.max": "Lab Test Method Name must not exceed 200 characters",
    "any.required": "Lab Test Method Name is required",
  }),

  labTestMethodCode: Joi.string().max(50).required().messages({
    "string.base": "Lab Test Method Code must be a string",
    "string.empty": "Lab Test Method Code is required",
    "string.max": "Lab Test Method Code must not exceed 50 characters",
    "any.required": "Lab Test Method Code is required",
  }),

  Remark: Joi.string().allow("").optional().messages({
    "string.base": "Lab Test Method Remark must be a string",
  }),

  isActive: Joi.boolean().required().messages({
    "boolean.base": "Is Active must be a boolean",
    "any.required": "Is Active is required",
  }),

  hospitalIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital ID must be an integer",
    "number.integer": "Hospital ID must be an integer",
    "number.empty": "Hospital ID is required",
    "any.required": "Hospital ID is required",
  }),

  hospitalGroupIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital Group ID must be an integer",
    "number.integer": "Hospital Group ID must be an integer",
    "number.empty": "Hospital Group ID is required",
    "any.required": "Hospital Group ID is required",
  }),

  createdBy: Joi.string().optional().messages({
    "string.base": "Created by must be a string",
  }),

  updatedBy: Joi.string().optional().messages({
    "string.base": "Updated by must be a string",
  }),
});

exports.agegroupschema = Joi.object({
  ageGroupName: Joi.string().max(100).required().messages({
    "string.base": "Age Group Name must be a string",
    "string.empty": "Age Group Name is required",
    "string.max": "Age Group Name must not exceed 100 characters",
    "any.required": "Age Group Name is required",
  }),
  fromAge: Joi.number().integer().required().messages({
    "number.base": "From Age must be an integer",
    "number.integer": "From Age must be an integer",
    "number.empty": "From Age is required",
    "any.required": "From Age is required",
  }),
  toAge: Joi.number().integer().required().messages({
    "number.base": "To Age must be an integer",
    "number.integer": "To Age must be an integer",
    "number.empty": "To Age is required",
    "any.required": "To Age is required",
  }),
  ageFromType: Joi.string().max(50).required().messages({
    "string.base": "Age From Type must be a string",
    "string.empty": "Age From Type is required",
    "string.max": "Age From Type must not exceed 50 characters",
    "any.required": "Age From Type is required",
  }),
  isActive: Joi.boolean().required().messages({
    "boolean.base": "Is Active must be a boolean",
    "any.required": "Is Active is required",
  }),
  isAnyAgeGroup: Joi.boolean().required().messages({
    "boolean.base": "Is Any Age Group must be a boolean",
    "any.required": "Is Any Age Group is required",
  }),
  hospitalIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital ID must be an integer",
    "number.integer": "Hospital ID must be an integer",
    "number.empty": "Hospital ID is required",
    "any.required": "Hospital ID is required",
  }),

  hospitalGroupIDR: Joi.number().integer().messages({
    "number.base": "Hospital Group ID must be an integer",
    "number.integer": "Hospital Group ID must be an integer",
  }),

  createdBy: Joi.string().optional().messages({
    "string.base": "Created by must be a string",
  }),

  updatedBy: Joi.string().optional().messages({
    "string.base": "Updated by must be a string",
  }),
});

exports.labFacultySchema = Joi.object({
  labFacultyName: Joi.string().max(100).required().messages({
    "string.base": "Lab Faculty Name must be a string",
    "string.empty": "Lab Faculty Name is required",
    "string.max": "Lab Faculty Name must not exceed 100 characters",
    "any.required": "Lab Faculty Name is required",
  }),
  labFacultyCode: Joi.string().max(100).required().messages({
    "string.base": "Lab Faculty Code must be a string",
    "string.empty": "Lab Faculty Code is required",
    "string.max": "Lab Faculty Code must not exceed 100 characters",
    "any.required": "Lab Faculty Code is required",
  }),
  remarks: Joi.string().max(100).messages({
    "string.base": "Remarks must be a string",
    "string.max": "Remarks must not exceed 100 characters",
  }),
  isActive: Joi.boolean().required().messages({
    "boolean.base": "Is Active must be a boolean",
    "any.required": "Is Active is required",
  }),
  hospitalIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital ID must be an integer",
    "number.integer": "Hospital ID must be an integer",
    "number.empty": "Hospital ID is required",
    "any.required": "Hospital ID is required",
  }),

  hospitalGroupIDR: Joi.number().integer().messages({
    "number.base": "Hospital Group ID must be an integer",
    "number.integer": "Hospital Group ID must be an integer",
  }),

  createdBy: Joi.string().optional().messages({
    "string.base": "Created by must be a string",
  }),

  updatedBy: Joi.string().optional().messages({
    "string.base": "Updated by must be a string",
  }),
});

exports.labTestSampleType = Joi.object({
  labSampleType: Joi.string().max(100).required().messages({
    "string.base": "Lab Test Sample Type must be a string",
    "string.empty": "Lab Test Sample Type is required",
    "string.max": "Lab Test Sample Type must not exceed 100 characters",
    "any.required": "Lab Test Sample Type is required",
  }),

  isActive: Joi.boolean().required().messages({
    "boolean.base": "Is Active must be a boolean",
    "any.required": "Is Active is required",
  }),
  hospitalIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital ID must be an integer",
    "number.integer": "Hospital ID must be an integer",
    "number.empty": "Hospital ID is required",
    "any.required": "Hospital ID is required",
  }),

  hospitalGroupIDR: Joi.number().integer().messages({
    "number.base": "Hospital Group ID must be an integer",
    "number.integer": "Hospital Group ID must be an integer",
  }),

  createdBy: Joi.string().optional().messages({
    "string.base": "Created by must be a string",
  }),

  updatedBy: Joi.string().optional().messages({
    "string.base": "Updated by must be a string",
  }),
});

exports.labtestschema = Joi.object({
  labTestName: Joi.string().max(100).required().messages({
    "string.base": "Lab Test Name must be a string",
    "string.empty": "Lab Test Name is required",
    "string.max": "Lab Test Name must not exceed 100 characters",
    "any.required": "Lab Test Name is required",
  }),

  labTestCode: Joi.string().max(50).required().messages({
    "string.base": "Lab Test Code must be a string",
    "string.empty": "Lab Test Code is required",
    "string.max": "Lab Test Code must not exceed 50 characters",
    "any.required": "Lab Test Code is required",
  }),

  cptCode: Joi.string().max(50).required().messages({
    "string.base": "CPT Code must be a string",
    "string.empty": "CPT Code is required",
    "string.max": "CPT Code must not exceed 50 characters",
    "any.required": "CPT Code is required",
  }),

  labTestMethodIDR: Joi.number().integer().required().messages({
    "number.base": "Lab Test Method ID must be an integer",
    "number.integer": "Lab Test Method ID must be an integer",
    "number.empty": "Lab Test Method ID is required",
    "any.required": "Lab Test Method ID is required",
  }),

  labTestUnit: Joi.number().integer().required().messages({
    "number.base": "Lab Test Unit must be an integer",
    "number.integer": "Lab Test Unit must be an integer",
    "number.empty": "Lab Test Unit is required",
    "any.required": "Lab Test Unit is required",
  }),

  isMultiColumn: Joi.boolean().optional().messages({
    "boolean.base": "Is Multi Column must be a boolean",
  }),

  fieldType: Joi.number().integer().required().messages({
    "number.base": "Field Type must be an integer",
    "number.integer": "Field Type must be an integer",
    "number.empty": "Field Type is required",
    "any.required": "Field Type is required",
  }),

  //  maxLength:Joi.string().max(100).required().messages({
  // "string.base": "Max Length must be a string",
  // "string.empty": "Max Length is required",
  // "string.max": "Max Length must not exceed 100 characters",
  // "any.required": "Max Length is required",
  // }),
  maxLength: Joi.string()
    .max(100)
    .when("fieldType", {
      is: 2,
      then: Joi.required().messages({
        "string.base": "Max Length must be a string",
        "string.empty": "Max Length is required",
        "string.max": "Max Length must not exceed 100 characters",
        "any.required": "Max Length is required",
      }),
      otherwise: Joi.optional().allow("").allow(null),
    }),

  // fromRange: Joi.string().required().messages({
  //   "string.base": "From Range must be a string",
  //   "string.empty": "From Range is required",
  //   "string.max": "From Range must not exceed 50 characters",
  //   "any.required": "From Range is required",
  // }),

  // toRange: Joi.string().required().messages({
  //   "string.base": "To Range must be a string",
  //   "string.empty": "To Range is required",
  //   "string.max": "To Range must not exceed 50 characters",
  //   "any.required": "To Range is required",
  // }),
  fromRange: Joi.string()
    .max(50)
    .when("fieldType", {
      is: 1,
      then: Joi.required().messages({
        "string.base": "From Range must be a string",
        "string.empty": "From Range is required",
        "string.max": "From Range must not exceed 50 characters",
        "any.required": "From Range is required",
      }),
      otherwise: Joi.optional().allow("").allow(null),
    }),

  toRange: Joi.string()
    .max(50)
    .when("fieldType", {
      is: 1,
      then: Joi.required().messages({
        "string.base": "To Range must be a string",
        "string.empty": "To Range is required",
        "string.max": "To Range must not exceed 50 characters",
        "any.required": "To Range is required",
      }),
      otherwise: Joi.optional().allow("").allow(null),
    }),

  isCalculated: Joi.boolean().optional().messages({
    "boolean.base": "Is Calculated must be a boolean",
  }),

  isActive: Joi.boolean().required().messages({
    "boolean.base": "Is Active must be a boolean",
    "any.required": "Is Active is required",
  }),

  Formula: Joi.string()
    .max(50)
    .when("isCalculated", {
      is: true,
      then: Joi.required().messages({
        "string.base": "Formula must be a string",
        "string.empty": "Formula is required",
        "string.max": "Formula must not exceed 50 characters",
        "any.required": "Formula is required",
      }),
      otherwise: Joi.optional().allow("").allow(null),
    }),

  calculationTestIDR: Joi.string()
    .max(50)
    .when("isCalculated", {
      is: true,
      then: Joi.required().messages({
        "string.base": "Calculation Test ID must be a string",
        "string.empty": "Calculation Test ID is required",
        "string.max": "Calculation Test ID must not exceed 50 characters",
        "any.required": "Calculation Test ID is required",
      }),
      otherwise: Joi.optional().allow("").allow(null),
    }),

  Remark: Joi.string().max(200).required().messages({
    "string.base": "Remark must be a string",
    "string.empty": "Remark is required",
    "string.max": "Remark must not exceed 200 characters",
    "any.required": "Remark is required",
  }),

  usedForCalculation: Joi.boolean().optional().messages({
    "boolean.base": "Used For Calculation must be a boolean",
  }),

  detailType: Joi.number().integer().optional().messages({
    "number.base": "Detail Type must be an integer",
    "number.integer": "Detail Type must be an integer",
  }),

  hospitalIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital ID must be an integer",
    "number.integer": "Hospital ID must be an integer",
    "number.empty": "Hospital ID is required",
    "any.required": "Hospital ID is required",
  }),

  hospitalGroupIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital Group ID must be an integer",
    "number.integer": "Hospital Group ID must be an integer",
    "number.empty": "Hospital Group ID is required",
    "any.required": "Hospital Group ID is required",
  }),

  createdBy: Joi.string().optional().messages({
    "string.base": "Created by must be a string",
  }),

  updatedBy: Joi.string().optional().messages({
    "string.base": "Updated by must be a string",
  }),
});

exports.labTestNotes = Joi.object({
  labTestIDR: Joi.number().required().messages({
    "string.base": "Lab Test ID must be a number",
    "string.empty": "Lab Test ID is required",
    "any.required": "Lab Test ID is required",
  }),
  isLabTestReport: Joi.boolean().required().messages({
    "boolean.base": "Is Active must be a boolean",
  }),
  labTestReportIDR: Joi.number().required().messages({
    "string.base": "Lab Test Report must be a number",
    "string.empty": "Lab Test Report is required",
    "any.required": "Lab Test Report is required",
  }),
  labTestNote: Joi.string().max(100).required().messages({
    "string.base": "Lab Test Note must be a string",
    "string.empty": "Lab Test Note is required",
    "string.max": "Lab Test Note must not exceed 100 characters",
    "any.required": "Lab Test Note is required",
  }),
  isDefault: Joi.boolean().required().messages({
    "boolean.base": "Is Default must be a boolean",
  }),
  remarks: Joi.string().max(200).required().messages({
    "string.base": "Remark must be a string",
    "string.empty": "Remark is required",
    "string.max": "Remark must not exceed 200 characters",
    "any.required": "Remark is required",
  }),
  isActive: Joi.boolean().required().messages({
    "boolean.base": "Is Active must be a boolean",
    "any.required": "Is Active is required",
  }),
  hospitalIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital ID must be an integer",
    "number.integer": "Hospital ID must be an integer",
    "number.empty": "Hospital ID is required",
    "any.required": "Hospital ID is required",
  }),

  hospitalGroupIDR: Joi.number().integer().messages({
    "number.base": "Hospital Group ID must be an integer",
    "number.integer": "Hospital Group ID must be an integer",
  }),

  createdBy: Joi.string().optional().messages({
    "string.base": "Created by must be a string",
  }),

  updatedBy: Joi.string().optional().messages({
    "string.base": "Updated by must be a string",
  }),
});

exports.labtestrefdetailschema = Joi.object({
  labTestIDR: Joi.number().integer().required().messages({
    "number.base": "Lab Test ID must be an integer",
    "number.integer": "Lab Test ID must be an integer",
    "number.empty": "Lab Test ID is required",
    "any.required": "Lab Test ID is required",
  }),
  refTitle: Joi.string().max(100).required().messages({
    "string.base": "Reference Title must be a string",
    "string.empty": "Reference Title is required",
    "string.max": "Reference Title must not exceed 100 characters",
    "any.required": "Reference Title is required",
  }),
  refDetail: Joi.string().max(250).required().messages({
    "string.base": "Reference Detail must be a string",
    "string.empty": "Reference Detail is required",
    "string.max": "Reference Detail must not exceed 250 characters",
    "any.required": "Reference Detail is required",
  }),
  isActive: Joi.boolean().required().messages({
    "boolean.base": "Is Active must be a boolean",
    "any.required": "Is Active is required",
  }),
  hospitalIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital ID must be an integer",
    "number.integer": "Hospital ID must be an integer",
    "number.empty": "Hospital ID is required",
    "any.required": "Hospital ID is required",
  }),

  hospitalGroupIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital Group ID must be an integer",
    "number.integer": "Hospital Group ID must be an integer",
    "number.empty": "Hospital Group ID is required",
    "any.required": "Hospital Group ID is required",
  }),

  createdBy: Joi.string().optional().messages({
    "string.base": "Created by must be a string",
  }),

  updatedBy: Joi.string().optional().messages({
    "string.base": "Updated by must be a string",
  }),
});

exports.labTestCategorySchema = Joi.object({
  labTestCategoryName: Joi.string().max(100).required().messages({
    "string.base": "Lab Test Category Name must be a string",
    "string.empty": "Lab Test Category Name is required",
    "string.max": "Lab Test Category Name must not exceed 100 characters",
    "any.required": "Lab Test Category Name is required",
  }),
  labTestCategoryCode: Joi.string().max(50).required().messages({
    "string.base": "Lab Test Category Code must be a string",
    "string.empty": "Lab Test Category Code is required",
    "string.max": "Lab Test Category Code must not exceed 50 characters",
    "any.required": "Lab Test Category Code is required",
  }),

  fitToHundred: Joi.boolean().required().messages({
  "boolean.base": "Fit to hundred must be a boolean",
  "any.required": "Fit to hundred is required",
}),

  remarks: Joi.string().allow('').max(250).messages({
  "string.base": "Remarks must be a string",
  "string.max": "Remarks must not exceed 250 characters",
}),

  isActive: Joi.boolean().required().messages({
    "boolean.base": "Is Active must be a boolean",
    "any.required": "Is Active is required",
  }),
  hospitalIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital ID must be an integer",
    "number.integer": "Hospital ID must be an integer",
    "number.empty": "Hospital ID is required",
    "any.required": "Hospital ID is required",
  }),

  hospitalGroupIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital Group ID must be an integer",
    "number.integer": "Hospital Group ID must be an integer",
    "number.empty": "Hospital Group ID is required",
    "any.required": "Hospital Group ID is required",
  }),

  createdBy: Joi.string().optional().messages({
    "string.base": "Created by must be a string",
  }),

  updatedBy: Joi.string().optional().messages({
    "string.base": "Updated by must be a string",
  }),
});

exports.labTestCategoryDetailsSchema = Joi.object({
  labTestCategoryIDR: Joi.number().required().label("Lab Test Category ID"),
  labTestIDR: Joi.number().required().label("Lab Test ID"),
  srNo: Joi.number().required().label("Serial Number"),
  isActive: Joi.boolean().optional().label("Is Active"),
  hospitalIDR: Joi.number().required().label("Hospital ID"),
  hospitalGroupIDR: Joi.number().optional().label("Hospital Group ID"),
});

exports.labTestSensitivitySchema = Joi.object({
  labTestSensitivityID: Joi.number().integer().optional().label("Lab Test Sensitivity ID"),
  
  sensitivityPattern: Joi.string()
    .max(50)
    .required()
    .label("Sensitivity Pattern"),

    hospitalIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital ID must be an integer",
    "number.integer": "Hospital ID must be an integer",
    "number.empty": "Hospital ID is required",
    "any.required": "Hospital ID is required",
  }),

  hospitalGroupIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital Group ID must be an integer",
    "number.integer": "Hospital Group ID must be an integer",
    "number.empty": "Hospital Group ID is required",
    "any.required": "Hospital Group ID is required",
  }),
  });

  // CreatedBy: Joi.string()
  //   .required()
  //   .label("Created By"),

  // CreatedAt: Joi.date()
  //   .optional()
  //   .label("Created At"),

  // UpdatedBy: Joi.string()
  //   .optional()
  //   .label("Updated By"),

  // UpdatedAt: Joi.date()
  //   .optional()
  //   .label("Updated At")

// exports.labTestPackageSchema = Joi.object()


exports.labTestPackageSchema = Joi.object({
  labTestPackageName: Joi.string().max(100).required().label("Lab Test Package Name"),

  labTestPackageCode: Joi.string().max(50).required().label("Lab Test Package Code"),

  remarks: Joi.string().allow("", null).max(255).label("Remarks"),

  isActive: Joi.boolean().required().label("Is Active"),

  isDefault: Joi.boolean().required().label("Is Default"),

  hospitalIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital ID must be an integer",
    "number.integer": "Hospital ID must be an integer",
    "any.required": "Hospital ID is required",
  }),

  hospitalGroupIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital Group ID must be an integer",
    "number.integer": "Hospital Group ID must be an integer",
    "any.required": "Hospital Group ID is required",
  }),

  createdBy: Joi.string().max(100).optional().label("Created By"),

  updatedBy: Joi.string().max(100).optional().label("Updated By"),

  createdAt: Joi.date().optional().label("Created At"),

  updatedAt: Joi.date().optional().label("Updated At"),
});


exports.permissionValidator = Joi.object({
  permissionName: Joi.string().max(100).required().messages({
    "string.base": "Permission Name must be a string",
    "string.empty": "Permission Name is required",
    "string.max": "Permission Name must not exceed 100 characters",
    "any.required": "Permission Name is required",
  }),

  isActive: Joi.boolean().required().messages({
    "boolean.base": "Is Active must be a boolean",
    "any.required": "Is Active is required",
  }),

   hospitalIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital ID must be an integer",
    "number.integer": "Hospital ID must be an integer",
    "number.empty": "Hospital ID is required",
    "any.required": "Hospital ID is required",
  }),

  hospitalGroupIDR: Joi.number().integer().messages({
    "number.base": "Hospital Group ID must be an integer",
    "number.integer": "Hospital Group ID must be an integer",
  }),

  createdBy: Joi.string().optional().messages({
    "string.base": "Created by must be a string",
  }),

  updatedBy: Joi.string().optional().messages({
    "string.base": "Updated by must be a string",
  }),
});


exports.role = Joi.object({
  roleName: Joi.string().max(100).required().messages({
    "string.base": "Role name  must be a string",
    "string.empty": "Role name is required",
    "string.max": "Role name must not exceed 100 characters",
    "any.required": "Role name is required",
  }),

  isActive: Joi.boolean().required().messages({
    "boolean.base": "Is Active must be a boolean",
    "any.required": "Is Active is required",
  }),
  hospitalIDR: Joi.number().integer().required().messages({
    "number.base": "Hospital ID must be an integer",
    "number.integer": "Hospital ID must be an integer",
    "number.empty": "Hospital ID is required",
    "any.required": "Hospital ID is required",
  }),

  hospitalGroupIDR: Joi.number().integer().messages({
    "number.base": "Hospital Group ID must be an integer",
    "number.integer": "Hospital Group ID must be an integer",
  }),

  createdBy: Joi.string().optional().messages({
    "string.base": "Created by must be a string",
  }),

  updatedBy: Joi.string().optional().messages({
    "string.base": "Updated by must be a string",
  }),
});

// exports.rolepermission = Joi.object({
//   roleId: Joi.number().required().label("Role ID"),
//   moduleId: Joi.number().required().label("Module ID"),
//   submoduleId: Joi.number().required().label("Submodule ID"),
//    permissionId: Joi.number().required().label("Permission ID"),
//   isActive: Joi.boolean().optional().label("Is Active"),
//   hospitalIDR: Joi.number().required().label("Hospital ID"),
//   hospitalGroupIDR: Joi.number().optional().label("Hospital Group ID"),
// });

// Single entry schema
const rolePermissionEntry = Joi.object({
  roleId: Joi.number().required().label("Role ID"),
  moduleId: Joi.number().required().label("Module ID"),
  submoduleId: Joi.number().required().label("Submodule ID"),
  permissionId: Joi.number().required().label("Permission ID"),
  isActive: Joi.boolean().optional().label("Is Active"),
  hospitalIDR: Joi.number().required().label("Hospital ID"),
  hospitalGroupIDR: Joi.number().optional().label("Hospital Group ID"),
});

// Bulk create schema
exports.rolepermissionBulk = Joi.array().items(
  Joi.object({
    roleId: Joi.number().required().label("Role ID"),
    moduleId: Joi.number().required().label("Module ID"),
    submodules: Joi.array().items(
      Joi.object({
        submoduleId: Joi.number().required().label("Submodule ID"),
        permissionId: Joi.number().required().label("Permission ID"),
        isActive: Joi.boolean().optional().default(true),
        hospitalIDR: Joi.number().required().label("Hospital ID"),
        hospitalGroupIDR: Joi.number().optional().label("Hospital Group ID"),
      })
    ).min(1).required().label("Submodules")
  })
).min(1).label("Role Permissions");

exports.rolepermission = rolePermissionEntry;

