const { body } = require("express-validator");

exports.validateRoomTypeRegister = [
  body("roomType_Name")
    .notEmpty()
    .withMessage("Room type is required")
    .isLength({ max: 50 })
    .withMessage("Room type must be at most 50 characters"),

  body("roomType_Code")
    .notEmpty()
    .withMessage("Room code is required")
    .isLength({ max: 50 })
    .withMessage("Room code must be at most 50 characters"),

  body("isActive").isBoolean().withMessage("Is Active must be a boolean"),

  body("hospital_IDR").notEmpty().withMessage("Hospital ID is required"),

  body("hospitalGroup_IDR")
    .notEmpty()
    .withMessage("Hospital Group ID is required"),
];

exports.validateRoomTypeUpdate = [
  body("roomType_Name")
    .notEmpty()
    .withMessage("Room type is required")
    .isLength({ max: 50 })
    .withMessage("Room type must be at most 50 characters"),

  body("roomType_Code")
    .notEmpty()
    .withMessage("Room code is required")
    .isLength({ max: 50 })
    .withMessage("Room code must be at most 50 characters"),

  body("isActive").isBoolean().withMessage("Is Active must be a boolean"),

  body("hospital_IDR").notEmpty().withMessage("Hospital ID is required"),

  body("hospitalGroup_IDR")
    .notEmpty()
    .withMessage("Hospital Group ID is required"),
];

exports.wardregister = [
  body("wardName")
    .notEmpty()
    .withMessage("Ward name is required")
    .isLength({ max: 50 })
    .withMessage("Ward name must be at most 50 characters"),

  body("wardTypeIDR")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Ward type IDR must be an integer if provided."),

  body("serviceIDR").notEmpty().withMessage("Service is required"),

  body("floorIDR")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Floor IDR must be an integer if provided."),

  body("bedCapacity").notEmpty().withMessage("bed Capacity is required"),

  body("bedCapacityperRoom")
    .notEmpty()
    .withMessage("bed Capacity per room is required"),

  body("isEffective")
    .optional()
    .isBoolean()
    .withMessage("isEffective must be a boolean"),

  body("isNUrChargeApplication")
    .optional()
    .isBoolean()
    .withMessage("isNUrChargeApplication must be a boolean"),

  body("checkinTime").notEmpty().withMessage("Check-in time is required"),

  body("Non_Active")
    .optional()
    .isBoolean()
    .withMessage("Non_Active must be a boolean"),

  body("hospitalIDR")
    .notEmpty()
    .withMessage("Hospital ID is required")
    .isInt()
    .withMessage("Hospital ID must be an integer"),

  body("hospitalGroupIDR")
    .notEmpty()
    .withMessage("Hospital Group ID is required")
    .isInt()
    .withMessage("Hospital Group ID must be an integer"),

  body("createdBy")
    .optional()
    .isString()
    .withMessage("Created By must be a string"),
];

exports.wardupdate = [
  body("wardName")
    .notEmpty()
    .withMessage("Ward name is required")
    .isLength({ max: 50 })
    .withMessage("Ward name must be at most 50 characters"),

  body("wardTypeIDR")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Ward type IDR must be an integer if provided."),

  body("serviceIDR").notEmpty().withMessage("Service IDR is required"),

  body("floorIDR")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Floor IDR must be an integer if provided."),

  body("bedCapacity").notEmpty().withMessage("bed Capacity is required"),

  body("bedCapacityperRoom")
    .notEmpty()
    .withMessage("bed Capacity per room is required"),

  body("isEffective")
    .optional()
    .isBoolean()
    .withMessage("isEffective must be a boolean"),

  body("checkinTime").notEmpty().withMessage("Check-in time is required"),

  body("isNUrChargeApplication")
    .optional()
    .isBoolean()
    .withMessage("isNUrChargeApplication must be a boolean"),

  body("hospitalIDR")
    .notEmpty()
    .withMessage("Hospital ID is required")
    .isInt()
    .withMessage("Hospital ID must be an integer"),

  body("hospitalGroupIDR")
    .notEmpty()
    .withMessage("Hospital Group ID is required")
    .isInt()
    .withMessage("Hospital Group ID must be an integer"),

  body("Non_Active")
    .optional()
    .isBoolean()
    .withMessage("Non_Active must be a boolean"),

  body("hospitalIDR")
    .notEmpty()
    .withMessage("Hospital ID is required")
    .isInt()
    .withMessage("Hospital ID must be an integer"),

  body("hospitalGroupIDR")
    .notEmpty()
    .withMessage("Hospital Group ID is required")
    .isInt()
    .withMessage("Hospital Group ID must be an integer"),

  body("updatedBy")
    .optional()
    .isString()
    .withMessage("updated By must be a string"),
];

exports.wwcaregister = [
  body("wardIDR").notEmpty().isInt().withMessage(" Ward IDR is required"),

  body("typeEnum").optional().isInt().withMessage("Type must be in Integer"),

  body("serviceIDR").notEmpty().isInt().withMessage("Service IDR is required"),

  body("costAddRate")
    .optional()
    .isString()
    .withMessage("costAdd rate is not mandatory"),

  body("fromdate")
    .notEmpty()
    .withMessage("From Date is required")
    .isISO8601()
    .withMessage("From Date must be a valid date"),

  body("todate")
    .notEmpty()
    .withMessage("To Date is required")
    .isISO8601()
    .withMessage("To Date must be a valid date"),

  body("isActive").isBoolean().withMessage("Is Active must be a boolean"),

  body("hospital_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital ID must be an integer"),

  body("hospitalGroup_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital Group ID must be an integer"),

  body("createdBy")
    .optional()
    .isString()
    .withMessage("Created by must be a string"),

  body("updatedBy")
    .optional()
    .isString()
    .withMessage("Updated by must be a string"),
];

exports.wwcaupdate = [
  body("wardIDR").notEmpty().isInt().withMessage(" Ward IDR is required"),

  body("typeEnum").optional().isInt().withMessage("Type must be in Integer"),

  body("serviceIDR").notEmpty().isInt().withMessage("Service IDR is required"),

  body("costAddRate")
    .optional()
    .isString()
    .withMessage("costAdd rate is not mandatory"),

  body("fromdate")
    .notEmpty()
    .withMessage("From Date is required")
    .isISO8601()
    .withMessage("From Date must be a valid date"),

  body("todate")
    .notEmpty()
    .withMessage("To Date is required")
    .isISO8601()
    .withMessage("To Date must be a valid date"),

  body("isActive").isBoolean().withMessage("Is Active must be a boolean"),

  body("hospital_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital ID must be an integer"),

  body("hospitalGroup_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital Group ID must be an integer"),

  body("createdBy")
    .optional()
    .isString()
    .withMessage("Created by must be a string"),

  body("updatedBy")
    .optional()
    .isString()
    .withMessage("Updated by must be a string"),
];

exports.roomsregister = [
  body("room_Name")
    .notEmpty()
    .isString()
    .withMessage("Ward name is required")
    .isLength({ max: 50 })
    .withMessage("Ward name must be at most 50 characters"),

  body("roomType_IDR")
    .optional()
    .isInt()
    .withMessage("roomType ID must be an integer"),

  body("isActive").isBoolean().withMessage("Is Active must be a boolean"),
  body("hospital_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital ID must be an integer"),

  body("hospitalGroup_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital Group ID must be an integer"),

  body("createdBy")
    .optional()
    .isString()
    .withMessage("Created by must be a string"),

  body("updatedBy")
    .optional()
    .isString()
    .withMessage("Updated by must be a string"),
];

exports.roomsupdate = [
  body("room_Name")
    .notEmpty()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Room Type name must be at most 50 characters"),

  body("roomType_IDR")
    .optional()
    .isInt()
    .withMessage("roomType ID must be an integer"),

  body("isActive")
    .isBoolean()
    .withMessage("Is Active must be a boolean"),

  body("hospital_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital ID must be an integer"),

  body("hospitalGroup_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital Group ID must be an integer"),

  body("createdBy")
    .optional()
    .isString()
    .withMessage("Created by must be a string"),

  body("updatedBy")
    .optional()
    .isString()
    .withMessage("Updated by must be a string"),
];

exports.wardroomlinkcreate = [
  body("ward_IDR")
    .optional()
    .isInt()
    .withMessage("roomType ID must be an integer"),

  body("room_IDR")
    .optional()
    .isInt()
    .withMessage("roomType ID must be an integer"),

  body("isActive").isBoolean().withMessage("Is Active must be a boolean"),

  body("hospital_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital ID must be an integer"),

  body("hospitalGroup_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital Group ID must be an integer"),

  body("createdBy")
    .optional()
    .isString()
    .withMessage("Created by must be a string"),

  body("updatedBy")
    .optional()
    .isString()
    .withMessage("Updated by must be a string"),
];

exports.wardroomlinkupdate = [
  body("ward_IDR")
    .optional()
    .isInt()
    .withMessage("roomType ID must be an integer"),

  body("room_IDR")
    .optional()
    .isInt()
    .withMessage("roomType ID must be an integer"),

  body("isActive").isBoolean().withMessage("Is Active must be a boolean"),

  body("hospital_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital ID must be an integer"),

  body("hospitalGroup_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital Group ID must be an integer"),

  body("createdBy")
    .optional()
    .isString()
    .withMessage("Created by must be a string"),

  body("updatedBy")
    .optional()
    .isString()
    .withMessage("Updated by must be a string"),
];
