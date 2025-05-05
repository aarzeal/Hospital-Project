const logger = require("../logger");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const { validationResult } = require("express-validator");
const getClientIp = require("../util/clientip");
const getLocationData = require("../util/locationHelper");
const { DATE } = require("sequelize");
const moment = require("moment");

dotenv.config();

function generateStartTimes(schedule) {
  function getStartTimes(startTime, endTime, duration) {
    const times = [];
    let current = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    while (current < end) {
      times.push(current.toTimeString().slice(0, 5)); // format as "HH:mm"
      current = new Date(current.getTime() + duration * 60000);
    }

    return times;
  }

  return schedule.map((daySchedule) => {
    const result = {
      Day: daySchedule.Day,
      Slot1: daySchedule.Slot1,
      Slot2: daySchedule.Slot2,
    };

    if (
      daySchedule.Slot1 &&
      daySchedule.Slot1StartTime &&
      daySchedule.Slot1EndTime
    ) {
      result.Slot1Times = getStartTimes(
        daySchedule.Slot1StartTime,
        daySchedule.Slot1EndTime,
        daySchedule.Duration
      );
    }

    if (
      daySchedule.Slot2 &&
      daySchedule.Slot2StartTime &&
      daySchedule.Slot2EndTime
    ) {
      result.Slot2Times = getStartTimes(
        daySchedule.Slot2StartTime,
        daySchedule.Slot2EndTime,
        daySchedule.Duration
      );
    }

    return result;
  });
}

// function createSlotStructure(doctorSlots, appointments) {
//   const result = [];

//   doctorSlots.forEach((slot) => {
//     const dayObj = {
//       Day: slot.Day,
//       date: "", // We'll fill it from appointments
//       slot1: slot.Slot1,
//       slot2: slot.Slot2,
//       bookedSlotsInSlot1: {},
//       availableSlotsInSlot1: {},
//       bookedSlotsInSlot2: {},
//       availableSlotsInSlot2: {},
//     };

//     const appointmentsForDay = appointments.filter((app) => {
//       const date = new Date(app.date);
//       const jsDay = date.getDay(); // 0 (Sun) to 6 (Sat)
//       const customDay = jsDay === 6 ? 7 : jsDay + 1; // convert to 1–7 (Sun=1, Sat=7)

//       return customDay === slot.Day;
//     });

//     console.log("appointmentsForDay;;;;", appointmentsForDay)

//     if (appointmentsForDay.length > 0) {
//       dayObj.date = appointmentsForDay[0].date.split("-").reverse().join("-"); // Convert yyyy-mm-dd to dd-mm-yyyy
//     }     else return;

//     // Process Slot1
//     if (slot.Slot1Times) {
//       slot.Slot1Times.forEach((time) => {
//         const matched = appointmentsForDay.find(
//           (app) => app.startTime === time
//         );
//         if (matched) {
//           dayObj.bookedSlotsInSlot1[time] = {
//             patientname:
//               typeof matched.patientDetails === "string"
//                 ? matched.patientDetails
//                 : "",
//             patientIDR:
//               typeof matched.patientDetails === "number"
//                 ? matched.patientDetails
//                 : null,
//             ServiceIdr: matched.ServiceID,
//             appointment_ID: matched.appointment_ID,
//             appointment_Code: matched.appointment_Code,
//             appointment_Purpose: matched.appointment_Purpose,
//             appointment_Book_Reason: matched.appointment_Book_Reason,
//             mode_Of_Booking: matched.mode_Of_Booking,
//             is_Arrived: matched.is_Arrived,
//             is_canceled: matched.is_canceled,
//             appointment_Cancle_Reason: matched.appointment_Cancle_Reason,
//             patient_Contact_Number: matched.patient_Contact_Number,
//           };
//         } else {
//           dayObj.availableSlotsInSlot1[time] = {
//             patientname: "",
//             patientIDR: null,
//             ServiceIdr: null,
//           };
//         }
//       });
//     }

//     // Process Slot2
//     if (slot.Slot2Times) {
//       slot.Slot2Times.forEach((time) => {
//         const matched = appointmentsForDay.find(
//           (app) => app.startTime === time
//         );
//         if (matched) {
//           dayObj.bookedSlotsInSlot2[time] = {
//             patientname:
//               typeof matched.patientDetails === "string"
//                 ? matched.patientDetails
//                 : "",
//             patientIDR:
//               typeof matched.patientDetails === "number"
//                 ? matched.patientDetails
//                 : null,
//             ServiceIdr: matched.ServiceID,
//             appointment_ID: matched.appointment_ID,
//             appointment_Code: matched.appointment_Code,
//             appointment_Purpose: matched.appointment_Purpose,
//             appointment_Book_Reason: matched.appointment_Book_Reason,
//             mode_Of_Booking: matched.mode_Of_Booking,
//             is_Arrived: matched.is_Arrived,
//             is_canceled: matched.is_canceled,
//             appointment_Cancle_Reason: matched.appointment_Cancle_Reason,
//             patient_Contact_Number: matched.patient_Contact_Number,
//           };
//         } else {
//           dayObj.availableSlotsInSlot2[time] = {
//             patientname: "",
//             patientIDR: null,
//             ServiceIdr: null,
//           };
//         }
//       });
//     }

//     result.push(dayObj);
//   });

//   return result;
// }

function createSlotStructure(doctorSlots, appointments) {
  const result = [];

  const appointmentsByDate = {};
  appointments.forEach((app) => {
    if (!appointmentsByDate[app.date]) {
      appointmentsByDate[app.date] = [];
    }
    appointmentsByDate[app.date].push(app);
  });

  console.log("appointmentsByDate;;;", appointmentsByDate)
  Object.entries(appointmentsByDate).forEach(([dateStr, dailyAppointments]) => {
    const dateObj = new Date(dateStr);
    const jsDay = dateObj.getDay(); // 0 (Sun) to 6 (Sat)
    const customDay = jsDay === 6 ? 7 : jsDay + 1;

    // Match this date's weekday with doctorSlots
    const slot = doctorSlots.find((s) => s.Day === customDay);
    if (!slot) return;

    const dayObj = {
      Day: slot.Day,
      date: dateStr.split("-").reverse().join("-"), // Convert YYYY-MM-DD to DD-MM-YYYY
      slot1: slot.Slot1,
      slot2: slot.Slot2,
      bookedSlotsInSlot1: {},
      availableSlotsInSlot1: {},
      bookedSlotsInSlot2: {},
      availableSlotsInSlot2: {},
    };

    // Process Slot1
    if (slot.Slot1Times) {
      slot.Slot1Times.forEach((time) => {
        const matchedAppointments = dailyAppointments.filter((app) => app.startTime === time);
      
        if (matchedAppointments.length > 0) {
          dayObj.bookedSlotsInSlot1[time] = matchedAppointments.map((matched) => ({
            appointment_ID: matched.appointment_ID,
            patientname: typeof matched.patientDetails === "string" ? matched.patientDetails : "",
            patientIDR: typeof matched.patientDetails === "number" ? matched.patientDetails : null,
            ServiceIdr: matched.ServiceID,
            appointment_Code: matched.appointment_Code,
            appointment_Purpose: matched.appointment_Purpose,
            appointment_Book_Reason: matched.appointment_Book_Reason,
            mode_Of_Booking: matched.mode_Of_Booking,
            is_Arrived: matched.is_Arrived,
            is_canceled: matched.is_canceled,
            appointment_Cancle_Reason: matched.appointment_Cancle_Reason,
            patient_Contact_Number: matched.patient_Contact_Number,
          }));
        } else {
          dayObj.availableSlotsInSlot1[time] = [{
            patientname: "",
            patientIDR: null,
            ServiceIdr: null,
          }];
        }
      });
      
    }

    // Process Slot2
    if (slot.Slot2Times) {
      slot.Slot2Times.forEach((time) => {
        const matchedAppointments = dailyAppointments.filter((app) => app.startTime === time);
      
        if (matchedAppointments.length > 0) {
          dayObj.bookedSlotsInSlot2[time] = matchedAppointments.map((matched) => ({
            appointment_ID: matched.appointment_ID,
            patientname: typeof matched.patientDetails === "string" ? matched.patientDetails : "",
            patientIDR: typeof matched.patientDetails === "number" ? matched.patientDetails : null,
            ServiceIdr: matched.ServiceID,
            appointment_Code: matched.appointment_Code,
            appointment_Purpose: matched.appointment_Purpose,
            appointment_Book_Reason: matched.appointment_Book_Reason,
            mode_Of_Booking: matched.mode_Of_Booking,
            is_Arrived: matched.is_Arrived,
            is_canceled: matched.is_canceled,
            appointment_Cancle_Reason: matched.appointment_Cancle_Reason,
            patient_Contact_Number: matched.patient_Contact_Number,
          }));
        } else {
          dayObj.availableSlotsInSlot2[time] = [{
            patientname: "",
            patientIDR: null,
            ServiceIdr: null,
          }];
        }
      });
      
    }

    result.push(dayObj);
  });

  return result;
}


exports.create_Patient_Appointment = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;

  const {
    appointment_Code,
    //bookDate,
    appointment_Purpose,
    is_New_Patient,
    patient_Name,
    patient_IDR,
    employee_IDR,
    department_IDR,
    appointment_Start_Time,
    appointment_End_Time,
    mode_Of_Booking,
    appointment_Book_Reason,
    is_Arrived,
    is_canceled,
    appointment_Cancle_Reason,
    want_SMS_Reminder,
    want_Email_Reminder,
    want_WhatsAPP_Reminder,
    patient_Contact_Number,
    service_IDR,
    isActive,
    hospital_IDR,
    hospitalGroup_IDR,
    bookedBy,
    bookedAt,
    createdBy,
    // CreatedAt,
    // updatedBy,
    // updatedAt
  } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const hospital = require("../models/HospitalModel.js");
    const Patient = require("../models/PatientMaster.js");
    const Employee = require("../models/tblEmployee.js")(req.sequelize);
    const Department = require("../models/DepartmentModel.js")(req.sequelize);
    const Service = require("../models/ser")(req.sequelize);
    const PatientAppointment = require("../models/PatientAppointment_Model.js")(
      req.sequelize
    );
    const Group = require("../models/HospitalGroup");

    // let store_IDR = null;
    if (patient_IDR) {
      const patientIDR = await Patient.findOne({
        where: { PatientID: patient_IDR },
      });
      if (!patientIDR) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9253;

        logger.logWithMeta(
          "error",
          "Invalid Patient ID, not found in MasterDB",
          {
            errorCode,
            executionTime,
            hospitalId: req.hospitalName,
            apiName: req.originalUrl,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,
            updatedBy: req.username,
          }
        );
        return res.status(400).json({
          errorCode,
          message: "Invalid Patient ID, not found in MasterDB",
        });
      }
    }

    if (employee_IDR) {
      const employeeIDR = await Employee.findOne({
        where: { EmployeeID: employee_IDR },
      });
      if (!employeeIDR) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9252;

        logger.logWithMeta(
          "error",
          "Invalid employee ID, not found in MasterDB",
          {
            errorCode,
            executionTime,
            hospitalId: req.hospitalName,
            apiName: req.originalUrl,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,
            updatedBy: req.username,
          }
        );
        return res.status(400).json({
          errorCode,
          message: "Invalid employee ID, not found in MasterDB",
        });
      }
    }

    if (department_IDR) {
      const departmentIDR = await Department.findOne({
        where: { DepartmentId: department_IDR },
      });
      if (!departmentIDR) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9252;

        logger.logWithMeta(
          "error",
          "Invalid Department ID, not found in MasterDB",
          {
            errorCode,
            executionTime,
            hospitalId: req.hospitalName,
            apiName: req.originalUrl,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,
            updatedBy: req.username,
          }
        );
        return res.status(400).json({
          errorCode,
          message: "Invalid Department ID, not found in MasterDB",
        });
      }
    }

    if (service_IDR) {
      const serviceIDR = await Service.findOne({
        where: { service_id: service_IDR },
      });
      if (!serviceIDR) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9252;

        logger.logWithMeta(
          "error",
          "Invalid Service ID, not found in MasterDB",
          {
            errorCode,
            executionTime,
            hospitalId: req.hospitalName,
            apiName: req.originalUrl,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,
            updatedBy: req.username,
          }
        );
        return res.status(400).json({
          errorCode,
          message: "Invalid Service ID, not found in MasterDB",
        });
      }
    }

    const group = await Group.findOne({
      where: { HospitalGroupID: hospitalGroup_IDR },
    });

    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9243;

      logger.logWithMeta(
        "error",
        "Invalid HospitalGroupID, not found in MasterDB",
        {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }

    const hospitalid = await hospital.findOne({
      where: { HospitalID: hospital_IDR },
    });
    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9244;

      logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username,
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalID, not found in MasterDB",
      });
    }

    await PatientAppointment.sync({ force: false });
    const patientappointment = await PatientAppointment.create({
      appointment_Code,
      bookDate: Date.now(),
      appointment_Purpose,
      is_New_Patient,
      patient_Name,
      patient_IDR,
      employee_IDR,
      department_IDR,
      appointment_Start_Time: new Date(appointment_Start_Time),
      appointment_End_Time: new Date(appointment_End_Time),
      mode_Of_Booking,
      appointment_Book_Reason,
      is_Arrived,
      is_canceled,
      appointment_Cancle_Reason,
      want_SMS_Reminder,
      want_Email_Reminder,
      want_WhatsAPP_Reminder,
      patient_Contact_Number,
      service_IDR,
      isActive,
      hospital_IDR,
      hospitalGroup_IDR,
      bookedBy: req.username,
      bookedAt: Date.now(),
      createdBy: req.username,
      // CreatedAt: Date.now()
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Patient Appointment created successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: { patientappointment },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9003;

    logger.logWithMeta("error", "Error creating Patient Appointment", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error creating Patient Appointment: " + error.message,
      },
    });
  }
};

exports.getallpatientAppointments = async (req, res) => {
  const start = Date.now();
  try {
    const patientAppointment = require("../models/PatientAppointment_Model.js")(
      req.sequelize
    );
    const PatientAppointments = await patientAppointment.findAll();

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta(
      "info",
      "Fetched Appointment Schedule records successfully",
      {
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      }
    );

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        totalRecords: PatientAppointments.length,
      },
      data: PatientAppointments,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9246;

    logger.logWithMeta("error", "Error fetching Appointment Schedule records", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: {
        message:
          "Error fetching Appointment Schedule records: " + error.message,
      },
    });
  }
};

exports.getPatientAppointmentById = async (req, res) => {
  //const logId = uuidv4();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);

  try {
    const { appointment_ID } = req.params;
    const patientAppointment = require("../models/PatientAppointment_Model.js")(
      req.sequelize
    );
    const PatientAppointments = await patientAppointment.findByPk(
      appointment_ID
    );

    if (!PatientAppointments) {
      logger.logWithMeta("warn", "Patient Appointment not found", {
        //logId,
        errorCode: 9247,
        apiName: req.originalUrl,
        method: req.method,
        clientIp,
        locationData,
        createdBy: req.username,
        updatedBy: req.username,
      });
      return res
        .status(404)
        .json({ errorCode: 9247, message: "Patient Appointment not found" });
    }

    logger.logWithMeta("info", "Patient Appointment fetched successfully", {
      // logId,
      apiName: req.originalUrl,
      method: req.method,
      clientIp,
      locationData,
      data: PatientAppointments,
      createdBy: req.username,
      updatedBy: req.username,
    });

    return res.status(200).json({
      message: "Patient Appointment fetched successfully",
      data: PatientAppointments,
    });
  } catch (error) {
    logger.logWithMeta("error", "Error fetching Patient Appointment", {
      //logId,
      errorCode: 9248,
      apiName: req.originalUrl,
      method: req.method,
      clientIp,
      errorMessage: error.message,
      locationData,
      createdBy: req.username,
      updatedBy: req.username,
    });

    return res.status(500).json({
      errorCode: 9248,
      message: "Error fetching Patient Appointment",
      error: error.message,
    });
  }
};

exports.update_Patient_Appointment_By_Id = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;

  const {
    appointment_Code,
    bookDate,
    appointment_Purpose,
    is_New_Patient,
    patient_Name,
    patient_IDR,
    employee_IDR,
    department_IDR,
    appointment_Start_Time,
    appointment_End_Time,
    mode_Of_Booking,
    appointment_Book_Reason,
    is_Arrived,
    is_canceled,
    appointment_Cancle_Reason,
    want_SMS_Reminder,
    want_Email_Reminder,
    want_WhatsAPP_Reminder,
    patient_Contact_Number,
    service_IDR,
    isActive,
    hospital_IDR,
    hospitalGroup_IDR,
    bookedBy,
    bookedAt,
    updatedBy,
    updatedAt,
  } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const hospital = require("../models/HospitalModel.js");
    const Patient = require("../models/PatientMaster.js");
    const Employee = require("../models/tblEmployee.js")(req.sequelize);
    const Department = require("../models/DepartmentModel.js")(req.sequelize);
    const Service = require("../models/ser")(req.sequelize);
    const PatientAppointment = require("../models/PatientAppointment_Model.js")(
      req.sequelize
    );
    const Group = require("../models/HospitalGroup");

    // let store_IDR = null;
    if (patient_IDR) {
      const patientIDR = await Patient.findOne({
        where: { PatientID: patient_IDR },
      });
      if (!patientIDR) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9253;

        logger.logWithMeta(
          "error",
          "Invalid Patient ID, not found in MasterDB",
          {
            errorCode,
            executionTime,
            hospitalId: req.hospitalName,
            apiName: req.originalUrl,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,
            updatedBy: req.username,
          }
        );
        return res.status(400).json({
          errorCode,
          message: "Invalid Patient ID, not found in MasterDB",
        });
      }
    }

    if (employee_IDR) {
      const employeeIDR = await Employee.findOne({
        where: { EmployeeID: employee_IDR },
      });
      if (!employeeIDR) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9252;

        logger.logWithMeta(
          "error",
          "Invalid employee ID, not found in MasterDB",
          {
            errorCode,
            executionTime,
            hospitalId: req.hospitalName,
            apiName: req.originalUrl,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,
            updatedBy: req.username,
          }
        );
        return res.status(400).json({
          errorCode,
          message: "Invalid employee ID, not found in MasterDB",
        });
      }
    }

    if (department_IDR) {
      const departmentIDR = await Department.findOne({
        where: { DepartmentId: department_IDR },
      });
      if (!departmentIDR) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9252;

        logger.logWithMeta(
          "error",
          "Invalid Department ID, not found in MasterDB",
          {
            errorCode,
            executionTime,
            hospitalId: req.hospitalName,
            apiName: req.originalUrl,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,
            updatedBy: req.username,
          }
        );
        return res.status(400).json({
          errorCode,
          message: "Invalid Department ID, not found in MasterDB",
        });
      }
    }

    if (service_IDR) {
      const serviceIDR = await Service.findOne({
        where: { service_id: service_IDR },
      });
      if (!serviceIDR) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9252;

        logger.logWithMeta(
          "error",
          "Invalid Service ID, not found in MasterDB",
          {
            errorCode,
            executionTime,
            hospitalId: req.hospitalName,
            apiName: req.originalUrl,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,
            updatedBy: req.username,
          }
        );
        return res.status(400).json({
          errorCode,
          message: "Invalid Service ID, not found in MasterDB",
        });
      }
    }

    const group = await Group.findOne({
      where: { HospitalGroupID: hospitalGroup_IDR },
    });

    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9243;

      logger.logWithMeta(
        "error",
        "Invalid HospitalGroupID, not found in MasterDB",
        {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }

    const hospitalid = await hospital.findOne({
      where: { HospitalID: hospital_IDR },
    });
    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9244;

      logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username,
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalID, not found in MasterDB",
      });
    }
    const { appointment_ID } = req.params;
    const patientappointment = await PatientAppointment.findOne({
      where: { appointment_ID },
    });
    if (!patientappointment) {
      logger.logWithMeta("error", "Patient Appointment not found", {
        appointment_ID,
        hospitalDatabase,
        apiName: req.originalUrl,
      });
      return res
        .status(404)
        .json({ errorCode: 9247, message: " Patient Appointment not found" });
    }

    await patientappointment.update({
      appointment_Code,
      bookDate,
      appointment_Purpose,
      is_New_Patient,
      patient_Name,
      patient_IDR,
      employee_IDR,
      department_IDR,
      appointment_Start_Time,
      appointment_End_Time,
      mode_Of_Booking,
      appointment_Book_Reason,
      is_Arrived,
      is_canceled,
      appointment_Cancle_Reason,
      want_SMS_Reminder,
      want_Email_Reminder,
      want_WhatsAPP_Reminder,
      patient_Contact_Number,
      service_IDR,
      isActive,
      hospital_IDR,
      hospitalGroup_IDR,
      bookedBy,
      bookedAt,
      updatedBy: req.username,
      updatedAt: Date.now(),
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Patient Appointment Updated successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: { patientappointment },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9003;

    logger.logWithMeta("error", "Error while Updating Patient Appointment", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error while Updating Patient Appointment: " + error.message,
      },
    });
  }
};

exports.deletePatientAppointmentById = async (req, res) => {
  const start = Date.now();
  const hospitalDatabase = req.hospitalDatabase;
  const { appointment_ID } = req.params;
  try {
    const patientAppointment = require("../models/PatientAppointment_Model.js")(
      req.sequelize
    );
    const logger = require("../logger");

    const PatientAppointment = await patientAppointment.findOne({
      where: { appointment_ID },
    });
    if (!PatientAppointment) {
      logger.logWithMeta("error", "Patient Appointment not found", {
        appointment_ID,
        hospitalDatabase,
        apiName: req.originalUrl,
      });
      return res
        .status(404)
        .json({ errorCode: 9247, message: "Patient Appointment not found" });
    }

    await PatientAppointment.destroy();
    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Patient Appointment deleted successfully", {
      appointment_ID,
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      message: "Patient Appointment deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9250;
    logger.logWithMeta("error", "Error deleting Patient Appointment", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });
    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error deleting Patient Appointment: " + error.message,
      },
    });
  }
};

exports.getAppointmentsByDoctorId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { employee_IDR } = req.params;

  try {
    const patientAppointment = require("../models/PatientAppointment_Model.js")(
      req.sequelize
    );
    const appointmentSchedule =
      require("../models/AppointmentSchedule_Model.js")(req.sequelize);
    const Employee = require("../models/tblEmployee.js")(req.sequelize);

    // Check if doctor exists
    const doctorExists = await Employee.findOne({
      where: { EmployeeID: employee_IDR },
    });

    if (!doctorExists) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9260;

      logger.logWithMeta("warn", "Doctor (Employee) not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        clientIp,
        createdBy: req.username,
      });

      return res.status(404).json({
        errorCode,
        message: "Doctor (Employee) not found",
      });
    }
    const AppointmentSchedule = await appointmentSchedule.findAll({
      where: { Employee_IDR: employee_IDR },
    });

    const DoctorSlotInfo =
      AppointmentSchedule.length > 0
        ? AppointmentSchedule.map((item) => {
          return {
            AppointmentSchedule_Id: item.AppointmentSchedule_Id,
            Day: item.Day,
            Slot1: item.Slot1,
            Slot1StartTime: item.Slot1_StartTime,
            Slot1EndTime: item.Slot1_EndTime,
            Slot2: item.Slot2,
            Slot2StartTime: item.Slot2_StartTime,
            Slot2EndTime: item.Slot2_EndTime,
            Duration: item.Duration,
          };
        })
        : [];

    const appointments = await patientAppointment.findAll({
      where: { employee_IDR },
    });

    const formattedAppointments = appointments.map((item) => {
      const startIST = moment(item.appointment_Start_Time);
      const endIST = moment(item.appointment_End_Time);

      return {
        date: startIST.format("YYYY-MM-DD"),
        startTime: startIST.format("HH:mm"),
        endTime: endIST.format("HH:mm"),
        patientDetails: !item?.is_New_Patient
          ? item.patient_IDR
          : item.patient_Name,
        ServiceID: item.service_IDR,
        appointment_Code: item.appointment_Code,
        appointment_ID: item.appointment_ID,
        appointment_Purpose: item.appointment_Purpose,
        mode_Of_Booking: item.mode_Of_Booking,
        appointment_Book_Reason: item.appointment_Book_Reason,
        is_Arrived: item.is_Arrived,
        is_canceled: item.is_canceled,
        appointment_Cancle_Reason: item.appointment_Cancle_Reason,
        patient_Contact_Number: item.patient_Contact_Number,
      };
    });

    // console.log("formattedAppointments-----", formattedAppointments);

    const slotsDetails = generateStartTimes(DoctorSlotInfo);

    // console.log("DoctorSlotInfo+++++",AppointmentSchedule);
    //console.log("formattedAppointments++++++++", formattedAppointments);

    const finalSlotStructure = createSlotStructure(
      slotsDetails,
      formattedAppointments
    );

    // console.log("slotsDetails", slotsDetails)
    // console.log("finalSlotStructure-+-+-+-+-+", appointments);

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Fetched appointments for doctor successfully", {
      executionTime,
      doctorId: employee_IDR,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      method: req.method,
      city: locationData?.city,
      country: locationData?.country,
      userAgent: req.headers["user-agent"],
      clientIp,
    });

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        totalRecords: finalSlotStructure.length,
        hospitalDatabase,
      },
      data: finalSlotStructure,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9261;

    logger.logWithMeta("error", "Error fetching appointments for doctor", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      clientIp,
      createdBy: req.username,
      error: error.message,
    });

    return res.status(500).json({
      meta: {
        statusCode: 500,
        executionTime,
        errorCode,
        hospitalDatabase,
      },
      error: {
        message: "Error fetching appointments for doctor: " + error.message,
      },
    });
  }
};

exports.getAppointmentsByDoctor = async (req, res, next) => {
  const startTime = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { employee_IDR } = req.params;
    const { start, end, on } = req.query;

    const PatientAppointment = require("../models/PatientAppointment_Model.js")(
      req.sequelize
    );

    const Employee = require("../models/tblEmployee.js")(req.sequelize);

    const AppointmentSchedule =
      require("../models/AppointmentSchedule_Model.js")(req.sequelize);

    // Check if doctor exists
    const doctor = await Employee.findOne({
      where: { EmployeeID: employee_IDR },
    });

    if (!doctor) {
      const executionTime = `${Date.now() - startTime}ms`;
      const errorCode = 9260;

      logger.logWithMeta("warn", "Doctor (Employee) not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        clientIp,
        createdBy: req.username,
      });

      return res.status(404).json({
        errorCode,
        message: "Doctor (Employee) not found",
      });
    }

    const AppointmentScheduleData = await AppointmentSchedule.findAll({
      where: { Employee_IDR: employee_IDR },
    });

    const DoctorSlotInfo =
      AppointmentScheduleData.length > 0
        ? AppointmentScheduleData.map((item) => {
          return {
            AppointmentSchedule_Id: item.AppointmentSchedule_Id,
            Day: item.Day,
            Slot1: item.Slot1,
            Slot1StartTime: item.Slot1_StartTime,
            Slot1EndTime: item.Slot1_EndTime,
            Slot2: item.Slot2,
            Slot2StartTime: item.Slot2_StartTime,
            Slot2EndTime: item.Slot2_EndTime,
            Duration: item.Duration,
          };
        })
        : [];

    const slotsDetails = generateStartTimes(DoctorSlotInfo);


    // const slotsDetails = generateStartTimes(DoctorSlotInfo);

    // const appointmentsData = await PatientAppointment.findAll({
    //   where: { employee_IDR },
    // });



    let from, to;
    const FORMAT = "DD-MM-YYYY";

    if (on) {
      if (!dayjs(on, FORMAT, true).isValid()) {
        return res
          .status(400)
          .json({ message: `Provide valid ${on} date in DD-MM-YYYY format` });
      }

      const from = dayjs(on, FORMAT).startOf("day");
      const to = dayjs(on, FORMAT).endOf("day");

      const appointments = await PatientAppointment.findAll({
        where: {
          employee_IDR,
          appointment_Start_Time: {
            [Op.between]: [from.toDate(), to.toDate()],
          },
        },
      });

      console.log("appointments1111111111", appointments)

      const formattedAppointments = appointments.map((item) => {
        const startIST = moment(item.appointment_Start_Time);
        const endIST = moment(item.appointment_End_Time);

        return {
          date: startIST.format("YYYY-MM-DD"),
          startTime: startIST.format("HH:mm"),
          endTime: endIST.format("HH:mm"),
          patientDetails: !item?.is_New_Patient
            ? item.patient_IDR
            : item.patient_Name,
          ServiceID: item.service_IDR,
          appointment_Code: item.appointment_Code,
          appointment_ID: item.appointment_ID,
          appointment_Purpose: item.appointment_Purpose,
          mode_Of_Booking: item.mode_Of_Booking,
          appointment_Book_Reason: item.appointment_Book_Reason,
          is_Arrived: item.is_Arrived,
          is_canceled: item.is_canceled,
          appointment_Cancle_Reason: item.appointment_Cancle_Reason,
          patient_Contact_Number: item.patient_Contact_Number,
        };
      });

      console.log("formattedAppointments:::", formattedAppointments)


      const finalSlotStructure = createSlotStructure(
        slotsDetails,
        formattedAppointments
      );



      // const result = appointments.map((item) => ({
      //   appointment_ID: item.appointment_ID,
      //   patientDetails: !item?.is_New_Patient
      //     ? item.patient_IDR
      //     : item.patient_Name,
      //   bookDate: item.bookDate,
      //   appointment_Start_Time: item.appointment_Start_Time,
      //   appointment_End_Time: item.appointment_End_Time,
      //   appointment_Code: item.appointment_Code,
      //   appointment_Purpose: item.appointment_Purpose,
      //   mode_Of_Booking: item.mode_Of_Booking,
      //   appointment_Book_Reason: item.appointment_Book_Reason,
      //   is_Arrived: item.is_Arrived,
      //   is_canceled: item.is_canceled,
      //   appointment_Cancle_Reason: item.appointment_Cancle_Reason,
      //   ServiceID: item.service_IDR,
      //   patient_Contact_Number: item.patient_Contact_Number,
      // }));

      const executionTime = `${Date.now() - startTime}ms`;

      return res.status(200).json({
        meta: {
          statusCode: 200,
          executionTime,
          totalRecords: appointments.length,
          hospitalDatabase,
        },
        data: finalSlotStructure,
      });
    }
    const monthParam = req.query.month;
    if (monthParam) {
      const monthIndex = isNaN(monthParam)
        ? dayjs().month(monthParam.toLowerCase()).month() // jan‑dec → 0‑11
        : parseInt(monthParam, 10) - 1; // 1‑12  → 0‑11

      console.log("monthParam+-+-+", monthIndex);

      if (monthIndex < 0 || monthIndex > 11)
        return res.status(400).json({ message: "Invalid month value" });

      const yr = req.query.year ? parseInt(req.query.year, 10) : now.year();

      if (isNaN(yr) || yr < 1900)
        return res.status(400).json({ message: "Invalid year value" });

      from = dayjs().year(yr).month(monthIndex).startOf("month");
      to = dayjs().year(yr).month(monthIndex).endOf("month");
    } else {
      if (!start || !end)
        return res
          .status(400)
          .json({ message: "Provide start & end in DD-MM-YYYY format" });

      if (
        !dayjs(start, FORMAT, true).isValid() ||
        !dayjs(end, FORMAT, true).isValid()
      )
        return res.status(400).json({ message: "Invalid date format" });

      from = dayjs(start, FORMAT).startOf("day");
      to = dayjs(end, FORMAT).endOf("day");
    }
    // console.log("from:::",  from )
    // console.log("to:::",  to )

    if (from.isAfter(to))
      return res.status(400).json({ message: "start must be before end" });

    const appointments = await PatientAppointment.findAll({
      where: {
        employee_IDR,
        appointment_Start_Time: {
          [Op.between]: [from.toDate(), to.toDate()],
        },
      },
    });

    const formattedAppointments = appointments.map((item) => {
      const startIST = moment(item.appointment_Start_Time);
      const endIST = moment(item.appointment_End_Time);

      return {
        date: startIST.format("YYYY-MM-DD"),
        startTime: startIST.format("HH:mm"),
        endTime: endIST.format("HH:mm"),
        patientDetails: !item?.is_New_Patient
          ? item.patient_IDR
          : item.patient_Name,
        ServiceID: item.service_IDR,
        appointment_Code: item.appointment_Code,
        appointment_ID: item.appointment_ID,
        appointment_Purpose: item.appointment_Purpose,
        mode_Of_Booking: item.mode_Of_Booking,
        appointment_Book_Reason: item.appointment_Book_Reason,
        is_Arrived: item.is_Arrived,
        is_canceled: item.is_canceled,
        appointment_Cancle_Reason: item.appointment_Cancle_Reason,
        patient_Contact_Number: item.patient_Contact_Number,
      };
    });

    console.log("formattedAppointments:::", formattedAppointments)


    const finalSlotStructure = createSlotStructure(
      slotsDetails,
      formattedAppointments
    );

    // const result = appointments.map((item) => ({
    //   appointment_ID: item.appointment_ID,
    //   patientDetails: !item?.is_New_Patient
    //     ? item.patient_IDR
    //     : item.patient_Name,
    //   bookDate: item.bookDate,
    //   appointment_Start_Time: item.appointment_Start_Time,
    //   appointment_End_Time: item.appointment_End_Time,
    //   appointment_Code: item.appointment_Code,
    //   appointment_Purpose: item.appointment_Purpose,
    //   mode_Of_Booking: item.mode_Of_Booking,
    //   appointment_Book_Reason: item.appointment_Book_Reason,
    //   is_Arrived: item.is_Arrived,
    //   is_canceled: item.is_canceled,
    //   appointment_Cancle_Reason: item.appointment_Cancle_Reason,
    //   ServiceID: item.service_IDR,
    //   patient_Contact_Number: item.patient_Contact_Number,
    // }));

    const executionTime = `${Date.now() - startTime}ms`;

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        totalRecords: appointments.length,
        hospitalDatabase,
      },
      data: finalSlotStructure,
    });
  } catch (error) {
    const executionTime = `${Date.now() - startTime}ms`;
    const errorCode = 9261;

    logger.logWithMeta("error", "Error fetching appointments for doctor", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      clientIp,
      createdBy: req.username,
      error: error.message,
    });

    return res.status(500).json({
      meta: {
        statusCode: 500,
        executionTime,
        errorCode,
        hospitalDatabase,
      },
      error: {
        message: "Error fetching appointments for doctor: " + error.message,
      },
    });
  }
};

// exports.getAppointmentsByDoctor = async (req, res, next) => {
//   const { employee_IDR } = req.params;
//   try {
//     const patientAppointment = require("../models/PatientAppointment_Model.js")(
//       req.sequelize
//     );
//     const appointmentSchedule =
//       require("../models/AppointmentSchedule_Model.js")(req.sequelize);
//     const Employee = require("../models/tblEmployee.js")(req.sequelize);

//     const { range, start, end, on } = req.query;
//     const doctorExists = await Employee.findOne({
//       where: { EmployeeID: employee_IDR },
//     });

//     if (!doctorExists) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 9260;

//       logger.logWithMeta("warn", "Doctor (Employee) not found", {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalName,
//         apiName: req.originalUrl,
//         city: locationData?.city,
//         country: locationData?.country,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//         clientIp,
//         createdBy: req.username,
//       });

//       return res.status(404).json({
//         errorCode,
//         message: "Doctor (Employee) not found",
//       });
//     }
//       // ---------- 1. Resolve the date window ----------
//     let from, to;
//     const FORMAT = 'DD-MM-YYYY';
//     const now = dayjs();
//     if (on) {
//       if (!dayjs(on, FORMAT, true).isValid()) {
//         return res.status(400).json({ message: 'Provide valid `on` date in DD-MM-YYYY format' });
//       }

//       const from = dayjs(on, FORMAT).startOf('day');
//       const to = dayjs(on, FORMAT).endOf('day');

//       // Move query and response code block here, and return early:
//       const appointments = await patientAppointment.findAll({
//         where: {
//           employee_IDR,
//           appointment_Start_Time: {
//             [Op.between]: [from.toDate(), to.toDate()]
//           }
//         },
//         order: [['appointment_Start_Time', 'ASC']]
//       });

//       const result = appointments.map(item => ({
//         appointment_ID: item.appointment_ID,
//         patientDetails: !item?.is_New_Patient ? item.patient_IDR : item.patient_Name,
//         bookDate: item.bookDate,
//         appointment_Start_Time: item.appointment_Start_Time,
//         appointment_End_Time: item.appointment_End_Time,
//         appointment_Code: item.appointment_Code,
//         appointment_Purpose: item.appointment_Purpose,
//         mode_Of_Booking: item.mode_Of_Booking,
//         appointment_Book_Reason: item.appointment_Book_Reason,
//         is_Arrived: item.is_Arrived,
//         is_canceled: item.is_canceled,
//         appointment_Cancle_Reason: item.appointment_Cancle_Reason,
//         ServiceID: item.service_IDR,
//         patient_Contact_Number: item.patient_Contact_Number,
//       }));

//       return res.json(result);
//     }
//     // If caller passed `month`, we handle it first and ignore `range`
//  const monthParam = req.query.month;

// // "1"‑"12" or name
//   if (monthParam) {
//    // Normalise: allow names or numbers
//   const monthIndex =
//      isNaN(monthParam)
//        ? dayjs().month(monthParam.toLowerCase()).month() // jan‑dec → 0‑11
//        : parseInt(monthParam, 10) - 1;                  // 1‑12  → 0‑11

//    if (monthIndex < 0 || monthIndex > 11)
//      return res.status(400).json({ message: 'Invalid month value' });

//    const yr = req.query.year ? parseInt(req.query.year, 10) : now.year();
//    if (isNaN(yr) || yr < 1900)
//      return res.status(400).json({ message: 'Invalid year value' });

//    from = dayjs().year(yr).month(monthIndex).startOf('month');
//    to   = dayjs().year(yr).month(monthIndex).endOf('month');

//  } else {                                               // server local time
//     switch (range) {
//       case 'month':
//         from = now.startOf('month');
//         to   = now.endOf('month');
//         break;
//       case 'week':
//         from = now.startOf('week');                         // Monday 00:00
//         to   = now.endOf('week');                           // Sunday 23:59
//         break;
//       case 'date':                                          // today
//         from = now.startOf('day');
//         to   = now.endOf('day');
//         break;
//       default:
//         // -------- custom window -------------
//         if (!start || !end)
//           return res.status(400).json({ message: 'Provide start & end in DD-MM-YYYY format' });

//         if (!dayjs(start, FORMAT, true).isValid() || !dayjs(end, FORMAT, true).isValid())
//           return res.status(400).json({ message: 'Invalid date format' });

//         from = dayjs(start, FORMAT);
//         to   = dayjs(end, FORMAT);
//     }
//   }

//     // Ensure from <= to
//     if (from.isAfter(to))
//       return res.status(400).json({ message: 'start must be before end' });

//     // ---------- 2. Query ----------
//     const appointments = await patientAppointment.findAll({
//       where: {
//         employee_IDR,
//         appointment_Start_Time: {
//           [Op.between]: [from.toDate(), to.toDate()]
//         }
//       },
//       order: [['appointment_Start_Time', 'ASC']]
//     });

//     // ---------- 3. Format output back to DD-MM-YYYY HH:mm ----------
//     const result = appointments.map(item=> ({
//       appointment_ID: item.appointment_ID,
//       patientDetails: !item?.is_New_Patient ? item.patient_IDR : item.patient_Name,
//       bookDate:item.bookDate,
//       appointment_Start_Time:item. appointment_Start_Time,
//       appointment_End_Time:item.appointment_End_Time,
//         appointment_Code: item.appointment_Code,
//         appointment_Purpose: item.appointment_Purpose,
//         mode_Of_Booking: item.mode_Of_Booking,
//         appointment_Book_Reason: item.appointment_Book_Reason,
//         is_Arrived: item.is_Arrived,
//         is_canceled: item.is_canceled,
//         appointment_Cancle_Reason: item.appointment_Cancle_Reason,
//         ServiceID: item.service_IDR,
//         patient_Contact_Number: item.patient_Contact_Number,
//     }));

//     res.json(result);
//   } catch (err) {
//     next(err);
//   }
// };
