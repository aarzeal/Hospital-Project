const { body } = require("express-validator");
const { timeToSeconds } = require("../util/methods");

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
    .withMessage("Room name is required")
    .isLength({ max: 50 })
    .withMessage("Room name must be at most 50 characters"),

  body("roomType_IDR")
    .notEmpty()
    .withMessage("Room Type is Required")
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
    .notEmpty()
    .withMessage("Room Type is Required")
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

exports.storecreate = [
  body("store_name")
    .notEmpty()
    .isString()
    .withMessage("Store name is required")
    .isLength({ max: 50 })
    .withMessage("Store name must be at most 50 characters"),

  body("store_code")
    .notEmpty()
    .isString()
    .withMessage("Store Code Is Required"),

  body("store_IDR")
    .optional()
    .custom((value) => value === null || Number.isInteger(Number(value)))
    .withMessage("store ID must be an integer or null"),

  body("parent_Store_IDR")
    .optional()
    .custom((value) => value === null || Number.isInteger(Number(value)))
    .withMessage("Store ID must be an integer or null"),

  // body("store_IDR")
  //   .optional()
  //   .isInt()
  //   .withMessage("store ID must be an integer"),

  // body("parent_Store_IDR")
  //   .optional()
  //   .isInt()
  //   .withMessage("Store ID must be an integer"),

  body("is_Main_store")
    .optional()
    .isBoolean()
    .withMessage("Is Main store must be a boolean"),

  body("is_Stock_Closing_Daily")
    .isBoolean()
    .withMessage("Is Stock Closing Daily must be a boolean"),

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

exports.storeupdate = [
  body("store_name")
    .notEmpty()
    .isString()
    .withMessage("Store name is required")
    .isLength({ max: 50 })
    .withMessage("Store name must be at most 50 characters"),

  body("store_code")
    .notEmpty()
    .isString()
    .withMessage("Store Code Is Required"),

  // body("store_IDR")
  //   .optional()
  //   .isInt()
  //   .withMessage("store ID must be an integer"),

  // body("parent_Store_IDR")
  //   .optional()
  //   .isInt()
  //   .withMessage("Store ID must be an integer"),

  body("store_IDR")
    .optional()
    .custom((value) => value === null || Number.isInteger(Number(value)))
    .withMessage("store ID must be an integer or null"),

  body("parent_Store_IDR")
    .optional()
    .custom((value) => value === null || Number.isInteger(Number(value)))
    .withMessage("Store ID must be an integer or null"),

  body("is_Main_store")
    .isBoolean()
    .withMessage("Is Main store must be a boolean"),

  body("is_Stock_Closing_Daily")
    .isBoolean()
    .withMessage("Is Stock Closing Daily must be a boolean"),

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

exports.registerAppointmentSchedule = [
  body("Employee_IDR").notEmpty().withMessage("Employee ID must be an integer"),

  body("Day").notEmpty(),

  body("Slot1")
    .exists()
    .withMessage("Slot1 is required")
    .custom((value) => {
      // Ensure slot1 is a valid time in HH:mm:ss format
      const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/; // regex for HH:mm:ss
      if (!regex.test(value)) {
        throw new Error("Invalid Slot1 time format. Please use HH:mm");
      }
      return true;
    }),

  body("Slot2")
    .exists()
    .withMessage("Slot2 is required")
    .custom((value, { req }) => {
      // Ensure slot2 is a valid time in HH:mm:ss format
      const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
      if (!regex.test(value)) {
        throw new Error("Invalid Slot2 time format. Please use HH:mm");
      }
      // Convert slot1 and slot2 to total seconds since midnight
      const slot1Seconds = timeToSeconds(req.body.Slot1);
      const slot2Seconds = timeToSeconds(value);

      // Ensure slot2 time is greater than slot1 time
      if (slot2Seconds <= slot1Seconds) {
        throw new Error("Slot2 time must be greater than Slot1 time");
      }
      return true;
    }),

  body("Slot1_StartTime")
    .exists()
    .withMessage("startTime is required")
    .custom((value) => {
      const startDate = new Date(value);
      if (isNaN(startDate.getTime())) {
        throw new Error("Invalid start time format");
      }
      return true;
    }),

  body("Slot1_EndTime")
    .exists()
    .withMessage("endTime is required")
    .custom((value, { req }) => {
      const endDate = new Date(value);
      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end time format");
      }
      const startTimestamp = new Date(req.body.Slot1_StartTime).getTime();
      const endTimestamp = endDate.getTime();

      if (endTimestamp <= startTimestamp) {
        throw new Error("End time must be greater than start time");
      }

      return true;
    }),

  body("Slot2_StartTime")
    .exists()
    .withMessage("startTime is required")
    .custom((value) => {
      const startDate = new Date(value);
      if (isNaN(startDate.getTime())) {
        throw new Error("Invalid start time format");
      }
      return true;
    }),

  body("Slot2_EndTime")
    .exists()
    .withMessage("endTime is required")
    .custom((value, { req }) => {
      const endDate = new Date(value);
      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end time format");
      }
      const startTimestamp = new Date(req.body.Slot2_StartTime).getTime();
      const endTimestamp = endDate.getTime();

      if (endTimestamp <= startTimestamp) {
        throw new Error("End time must be greater than start time");
      }

      return true;
    }),

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

exports.updateAppointmentSchedule = [
  body("Employee_IDR").notEmpty().withMessage("Employee ID must be an integer"),

  body("Day").notEmpty(),

  body("Slot1")
    .exists()
    .withMessage("Slot1 is required")
    .custom((value) => {
      // Ensure slot1 is a valid time in HH:mm:ss format
      const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/; // regex for HH:mm:ss
      if (!regex.test(value)) {
        throw new Error("Invalid Slot1 time format. Please use HH:mm");
      }
      return true;
    })
    ,

  body("Slot2")
    .exists()
    .withMessage("Slot2 is required")
    .custom((value, { req }) => {
      // Ensure slot2 is a valid time in HH:mm:ss format
      const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
      if (!regex.test(value)) {
        throw new Error("Invalid Slot2 time format. Please use HH:mm");
      }
      // Convert slot1 and slot2 to total seconds since midnight
      const slot1Seconds = timeToSeconds(req.body.Slot1);
      const slot2Seconds = timeToSeconds(value);

      // Ensure slot2 time is greater than slot1 time
      if (slot2Seconds <= slot1Seconds) {
        throw new Error("Slot2 time must be greater than Slot1 time");
      }
      return true;
    }),

  body("Slot1_StartTime")
    .exists()
    .withMessage("startTime is required")
    .custom((value) => {
      const startDate = new Date(value);
      if (isNaN(startDate.getTime())) {
        throw new Error("Invalid start time format");
      }
      return true;
    }),

  body("Slot1_EndTime")
    .exists()
    .withMessage("endTime is required")
    .custom((value, { req }) => {
      const endDate = new Date(value);
      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end time format");
      }
      const startTimestamp = new Date(req.body.Slot1_StartTime).getTime();
      const endTimestamp = endDate.getTime();

      if (endTimestamp <= startTimestamp) {
        throw new Error("End time must be greater than start time");
      }

      return true;
    }),

  body("Slot2_StartTime")
    .exists()
    .withMessage("startTime is required")
    .custom((value) => {
      const startDate = new Date(value);
      if (isNaN(startDate.getTime())) {
        throw new Error("Invalid start time format");
      }
      return true;
    }),

  body("Slot2_EndTime")
    .exists()
    .withMessage("endTime is required")
    .custom((value, { req }) => {
      const endDate = new Date(value);
      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end time format");
      }
      const startTimestamp = new Date(req.body.Slot2_StartTime).getTime();
      const endTimestamp = endDate.getTime();

      if (endTimestamp <= startTimestamp) {
        throw new Error("End time must be greater than start time");
      }

      return true;
    }),

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
