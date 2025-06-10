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

exports.labtestmethodcreate = [
  body("labTestMethodName")
    .trim()
    .notEmpty().withMessage("Lab Test Method Name is required")
    .isString().withMessage("Lab Test Method Name must be a string")
    .isLength({ max: 50 }).withMessage("Lab Test Method Name must not exceed 50 characters"),

  body("labTestMethodCode")
    .notEmpty()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Lab Test Method Code must be an String"),

  body("Remark")
    .optional()
    .isString()
    .withMessage("Lab Test Method Remark must be an String"),

  body("isActive").isBoolean().withMessage("Is Active must be a boolean"),

  body("hospitalIDR")
    .optional()
    .isInt()
    .withMessage("Hospital ID must be an integer"),

  body("hospitalGroupIDR")
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

exports.labTestDetailsCreate = [
  body("lab_test_name")
    .notEmpty()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Lab Test Name is Required"),

  body("lab_test_code")
    .notEmpty()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Lab Test Code is Required"),

  body("cpt_code")
    .notEmpty()
    .isString()
    .isLength({ max: 50 })
    .withMessage("CPT Code is Required"),

  body("lab_test_method_IDR")
    .isInt()
    .notEmpty()
    .withMessage("Lab Test Method ID is required"),

  body("lab_test_unit")
    .isInt()
    .notEmpty()
    .withMessage("Lab Test Unit ID is required"),

  body("is_multi_column")
    .isBoolean()
    .withMessage("Is Multi Column must be a boolean"),

  body("field_type")
    .isInt()
    .notEmpty()
    .withMessage("Field type is required"),

  body("from_range")
    .notEmpty()
    .isString()
    .isLength({ max: 50 })
    .withMessage("From range is required"),

  body("to_range")
    .notEmpty()
    .isString()
    .isLength({ max: 50 })
    .withMessage("To range is required"),

  body("is_calculated")
    .isBoolean()
    .withMessage("Is Calculated must be a boolean"),

  body("is_active")
    .isBoolean()
    .withMessage("Is Active must be a boolean"),

  body("formula")
    .notEmpty()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Formula is required"),

  body("calculation_test_IDR")
    .notEmpty()
    .isInt()
    .withMessage("Calculation test is required"),

  body("remark")
    .isString()
    .isLength({ max: 500 }),

  body("used_for_calculation")
    .isBoolean()
    .withMessage("Used For Calculation must be a boolean"),

  body("detail_type")
    .notEmpty()
    .isInt()
    .withMessage("Detail Type is required"),

  body("hospital_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital ID must be an integer"),

  body("hospital_group_IDR")
    .optional()
    .isInt()
    .withMessage("Hospital Group ID must be an integer"),

  body("created_by")
    .optional()
    .isString()
    .withMessage("Created by must be a string"),

  body("updated_by")
    .optional()
    .isString()
    .withMessage("Updated by must be a string"),
]

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

  body("Slot1").isBoolean().withMessage("Is Slot1 must be a boolean"),

  body("Slot2").isBoolean().withMessage("Is Slot2 must be a boolean"),

  body("Slot1_StartTime").custom((value, { req }) => {
    if (req.body.Slot1 === false) {
      if (value !== undefined && value !== null) {
        throw new Error(
          "Slot1_StartTime must not be provided when Slot1 is false"
        );
      }
      return true;
    }

    // If Slot2 is true, validate value
    if (value === undefined || value === null || value === "") {
      throw new Error("Slot1_StartTime is required when Slot1 is true");
    }

    const regex = /^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;
    if (!regex.test(value)) {
      throw new Error("Invalid Slot1 time format. Please use HH:mm");
    }
    return true;
  }),

  body("Slot1_EndTime").custom((value, { req }) => {
    if (req.body.Slot1 === false) {
      if (value !== undefined && value !== null) {
        throw new Error(
          "Slot1_EndTime must not be provided when Slot1 is false"
        );
      }
      return true;
    }

    // If Slot2 is true, validate value
    if (value === undefined || value === null || value === "") {
      throw new Error("Slot1_EndTime is required when Slot1 is true");
    }

    // If Slot2 is true, validate time format
    const regex = /^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;
    if (!regex.test(value)) {
      throw new Error("Invalid Slot1 end time format. Please use HH:mm");
    }

    const startTimestamp = timeToSeconds(req.body.Slot1_StartTime);
    const endTimestamp = timeToSeconds(value);
    if (endTimestamp <= startTimestamp) {
      throw new Error("End time must be greater than start time");
    }

    return true;
  }),

  body("Slot2_StartTime").custom((value, { req }) => {
    if (req.body.Slot2 === false) {
      if (value !== undefined && value !== null) {
        throw new Error(
          "Slot2_StartTime must not be provided when Slot2 is false"
        );
      }
      return true;
    }

    // If Slot2 is true, validate value
    if (value === undefined || value === null || value === "") {
      throw new Error("Slot2_StartTime is required when Slot2 is true");
    }

    const regex = /^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(value)) {
      throw new Error(
        "Invalid Slot2 start time format. Please use HH:mm or HH:mm:ss"
      );
    }

    const slot1endTimestamp = timeToSeconds(req.body.Slot1_EndTime);
    const slot2startTimestamp = timeToSeconds(value);

    if (slot2startTimestamp <= slot1endTimestamp) {
      throw new Error("Slot2 Start time must be greater than Slot1 End time");
    }

    return true;
  }),
  // .optional({ nullable: true }) // allow null
  // .custom((value, { req }) => {
  //   if (req.body.Slot2 === false) return true; // Skip if Slot2 is false
  //   const regex = /^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;
  //   if (!regex.test(value)) {
  //     throw new Error("Invalid Slot2 time format. Please use HH:mm");
  //   }
  //   const slot1endTimestamp = timeToSeconds(req.body.Slot1_EndTime);
  //   const slot2startTimestamp = timeToSeconds(value);
  //   if (slot2startTimestamp <= slot1endTimestamp) {
  //     throw new Error("Slot2 Start time must be greater than Slot1 End time");
  //   }
  //   return true;
  // }),

  body("Slot2_EndTime").custom((value, { req }) => {
    if (req.body.Slot2 === false) {
      if (value !== undefined && value !== null) {
        throw new Error(
          "Slot2_EndTime must not be provided when Slot2 is false"
        );
      }
      return true;
    }

    // If Slot2 is true, validate value
    if (value === undefined || value === null || value === "") {
      throw new Error("Slot2_StartTime is required when Slot2 is true");
    }

    // If Slot2 is true, validate time format
    const regex = /^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(value)) {
      throw new Error("Invalid Slot2 end time format. Please use HH:mm");
    }

    const startTimestamp = timeToSeconds(req.body.Slot2_StartTime);
    const endTimestamp = timeToSeconds(value);
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

  body("Slot1").isBoolean().withMessage("Is Slot2 must be a boolean"),

  body("Slot2").isBoolean().withMessage("Is Slot2 must be a boolean"),

  body("Slot1_StartTime").custom((value, { req }) => {
    if (req.body.Slot1 === false) {
      if (value !== undefined && value !== null) {
        throw new Error(
          "Slot1_StartTime must not be provided when Slot1 is false"
        );
      }
      return true;
    }

    // If Slot2 is true, validate value
    if (value === undefined || value === null || value === "") {
      throw new Error("Slot1_StartTime is required when Slot1 is true");
    }

    const regex = /^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;
    if (!regex.test(value)) {
      throw new Error("Invalid Slot1 time format. Please use HH:mm");
    }
    return true;
  }),

  body("Slot1_EndTime").custom((value, { req }) => {
    if (req.body.Slot1 === false) {
      if (value !== undefined && value !== null) {
        throw new Error(
          "Slot1_EndTime must not be provided when Slot1 is false"
        );
      }
      return true;
    }

    // If Slot2 is true, validate value
    if (value === undefined || value === null || value === "") {
      throw new Error("Slot1_EndTime is required when Slot1 is true");
    }

    // If Slot2 is true, validate time format
    const regex = /^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;
    if (!regex.test(value)) {
      throw new Error("Invalid Slot1 end time format. Please use HH:mm");
    }

    const startTimestamp = timeToSeconds(req.body.Slot1_StartTime);
    const endTimestamp = timeToSeconds(value);
    if (endTimestamp <= startTimestamp) {
      throw new Error("End time must be greater than start time");
    }

    return true;
  }),

  body("Slot2_StartTime").custom((value, { req }) => {
    if (req.body.Slot2 === false) {
      if (value !== undefined && value !== null) {
        throw new Error(
          "Slot2_StartTime must not be provided when Slot2 is false"
        );
      }
      return true;
    }

    // If Slot2 is true, validate value
    if (value === undefined || value === null || value === "") {
      throw new Error("Slot2_StartTime is required when Slot2 is true");
    }

    const regex = /^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(value)) {
      throw new Error(
        "Invalid Slot2 start time format. Please use HH:mm or HH:mm:ss"
      );
    }

    const slot1endTimestamp = timeToSeconds(req.body.Slot1_EndTime);
    const slot2startTimestamp = timeToSeconds(value);

    if (slot2startTimestamp <= slot1endTimestamp) {
      throw new Error("Slot2 Start time must be greater than Slot1 End time");
    }

    return true;
  }),
  // .optional({ nullable: true }) // allow null
  // .custom((value, { req }) => {
  //   if (req.body.Slot2 === false) return true; // Skip if Slot2 is false
  //   const regex = /^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;
  //   if (!regex.test(value)) {
  //     throw new Error("Invalid Slot2 time format. Please use HH:mm");
  //   }
  //   const slot1endTimestamp = timeToSeconds(req.body.Slot1_EndTime);
  //   const slot2startTimestamp = timeToSeconds(value);
  //   if (slot2startTimestamp <= slot1endTimestamp) {
  //     throw new Error("Slot2 Start time must be greater than Slot1 End time");
  //   }
  //   return true;
  // }),

  body("Slot2_EndTime").custom((value, { req }) => {
    if (req.body.Slot2 === false) {
      if (value !== undefined && value !== null) {
        throw new Error(
          "Slot2_EndTime must not be provided when Slot2 is false"
        );
      }
      return true;
    }

    // If Slot2 is true, validate value
    if (value === undefined || value === null || value === "") {
      throw new Error("Slot2_StartTime is required when Slot2 is true");
    }

    // If Slot2 is true, validate time format
    const regex = /^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(value)) {
      throw new Error("Invalid Slot2 end time format. Please use HH:mm");
    }

    const startTimestamp = timeToSeconds(req.body.Slot2_StartTime);
    const endTimestamp = timeToSeconds(value);
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

exports.patientappointmentcreate = [
  body("appointment_Code")
    .notEmpty()
    .isString()
    .withMessage("Appointment code is required and it should be String"),

  body("appointment_Purpose")
    .isString()
    .withMessage("Give the proper Appointment Purpose in String "),

  body("is_New_Patient")
    .isBoolean()
    .withMessage("Is new Patient must be a boolean"),

  body("patient_Name")
    .optional()
    .isString()
    .withMessage("Patient name is optional "),

  body("patient_IDR")
    .optional()
    .isInt()
    .withMessage("Patient IDR is optional according to is new patient"),

  body("employee_IDR")
    .notEmpty()
    .isInt()
    .withMessage("Employee IDR is according to Doctors ID"),

  body("department_IDR")
    .notEmpty()
    .isInt()
    .withMessage("Department IDR is required"),

  body("appointment_Start_Time"),

  body("appointment_End_Time"),

  body("mode_Of_Booking"),

  body("appointment_Book_Reason"),

  body("is_Arrived"),

  body("is_canceled"),

  body("appointment_Cancle_Reason"),

  body("want_SMS_Reminder"),

  body("want_Email_Reminder"),

  body("want_WhatsAPP_Reminder"),

  body("patient_Contact_Number"),

  body("service_IDR"),

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
],
  exports.patientappointmentupdate = [
    body("appointment_Code")
      .notEmpty()
      .isString()
      .withMessage("Appointment code is required and it should be String"),

    body("bookDate"),

    body("appointment_Purpose")
      .isString()
      .withMessage("Give the proper Appointment Purpose in String "),

    body("is_New_Patient")
      .isBoolean()
      .withMessage("Is new Patient must be a boolean"),

    body("patient_Name")
      .optional()
      .isString()
      .withMessage("Patient name is optional "),

    body("patient_IDR")
      .optional()
      .isInt()
      .withMessage("Patient IDR is optional according to is new patient"),

    body("employee_IDR")
      .notEmpty()
      .isInt()
      .withMessage("Employee IDR is according to Doctors ID"),

    body("department_IDR")
      .notEmpty()
      .isInt()
      .withMessage("Department IDR is required"),

    body("appointment_Start_Time"),

    body("appointment_End_Time"),

    body("mode_Of_Booking"),

    body("appointment_Book_Reason"),

    body("is_Arrived"),

    body("is_canceled"),

    body("appointment_Cancle_Reason"),

    body("want_SMS_Reminder"),

    body("want_Email_Reminder"),

    body("want_WhatsAPP_Reminder"),

    body("patient_Contact_Number"),

    body("service_IDR"),

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
  ],
  exports.registerAgeGroup = [
    body("ageGroupName")
      .notEmpty()
      .isString()
      .withMessage("Age group is required and must be String ")
  ]


exports.product = [
  body("Name")
    .notEmpty()
    .isString()
    .withMessage("Product name is required and it should be String"),
  body("product_price")
    .notEmpty()
    .isFloat()
    .withMessage("Product name is required and it should be Float"),
]