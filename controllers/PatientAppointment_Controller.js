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


    const slotsDetails = generateStartTimes(DoctorSlotInfo);

    

    const finalSlotStructure = createSlotStructure(
      slotsDetails,
      formattedAppointments
    );

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

      console.log("appointments1111111111", appointments);

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

      console.log("formattedAppointments:::", formattedAppointments);

      const finalSlotStructure = createSlotStructure(
        slotsDetails,
        formattedAppointments
      );


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

    console.log("formattedAppointments:::", formattedAppointments);

    const finalSlotStructure = createSlotStructure(
      slotsDetails,
      formattedAppointments
    );
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


// exports.getPatientAppointmentSummary = async (req, res, next) => {
//   const startTime = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);
//   const hospitalDatabase = req.hospitalDatabase;

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const {
//       start,
//       end,
//       duration,
//       doctor_ID,
//       service_ID,
//       department_ID,
//       HospitalID,
//       mode_Of_Booking,
//     } = req.query;
    
//     const toArray = (param) => {
//       if (!param) return null;
//       return Array.isArray(param) ? param : [param];
//     };

    
// const doctor_IDs = toArray(req.query.doctor_ID);
// const department_IDs = toArray(req.query.department_ID);
// const service_IDs = toArray(req.query.service_ID);
// const mode_Of_Bookings = toArray(req.query.mode_Of_Booking);


//     const PatientAppointment = require("../models/PatientAppointment_Model.js")(
//       req.sequelize
//     );
//     const FORMAT = "DD-MM-YYYY";

//     let from, to, durationUsed = null;
//     let allData = false;

//     if (!start && !end && !duration) {
//       allData = true;
//     } else if (!start) {
//       return res.status(400).json({ message: "Start date is required when using end or duration" });
//     } else if (start && !dayjs(start, FORMAT, true).isValid()) {
//       return res.status(400).json({ message: "Invalid start date format" });
//     } else {
//       from = dayjs(start, FORMAT).startOf("day");

//       if (duration) {
//         switch (duration) {
//           case "one_day":
//             to = from.endOf("day");
//             durationUsed = "one_day";
//             break;
//           case "one_week":
//             to = from.add(6, "day").endOf("day");
//             durationUsed = "one_week";
//             break;
//           case "one_month":
//             to = from.add(1, "month").subtract(1, "day").endOf("day");
//             durationUsed = "one_month";
//             break;
//           default:
//             return res.status(400).json({
//               message: "Invalid duration. Use one_day, one_week, or one_month.",
//             });
//         }
//       } else if (end) {
//         if (!dayjs(end, FORMAT, true).isValid()) {
//           return res.status(400).json({ message: "Invalid end date format" });
//         }
//         to = dayjs(end, FORMAT).endOf("day");
//         if (from.isAfter(to)) {
//           return res.status(400).json({ message: "Start date must be before end date" });
//         }
//         durationUsed = "custom_range";
//       } else {
//         return res.status(400).json({ message: "Either end or duration is required with start" });
//       }
//     }

//     const whereCondition = {};
//     if (!allData) {
//       whereCondition.appointment_Start_Time = {
//         [Op.between]: [from.toDate(), to.toDate()],
//       };
//     }
//     if (doctor_IDs) whereCondition.employee_IDR = { [Op.in]: doctor_IDs };
//     if (department_IDs) whereCondition.department_IDR = { [Op.in]: department_IDs };
//     if (service_IDs) whereCondition.service_IDR = { [Op.in]: service_IDs };
//     if (HospitalID) whereCondition.hospital_IDR = HospitalID;
//     if (mode_Of_Bookings) whereCondition.mode_Of_Booking = {[Op.in]:mode_Of_Bookings};

//     const appointments = await PatientAppointment.findAll({
//       where: {
//         ...whereCondition,
//         // is_canceled: false,
//       },
//       attributes: [
//         "employee_IDR",
//         "service_IDR",
//         "department_IDR",
//         "hospital_IDR",
//         "mode_Of_Booking",
//         "appointment_Start_Time", 
//         "is_canceled"
//       ],
//       raw: true,
//     });

//     console.log("appointments:::::::::", appointments)
 
//     const hospitalWiseData = {};
//     appointments.forEach((app) => {
//     const hospitalId = app.hospital_IDR;
//   const doctorId = app.employee_IDR;
//   const serviceId = app.service_IDR;
//   const departmentId = app.department_IDR;
//   const mode = app.mode_Of_Booking;
//   const appointmentDate = dayjs(app.appointment_Start_Time).format(FORMAT);
//       if (!hospitalId) return;
//       if (!hospitalWiseData[hospitalId]) {
//         hospitalWiseData[hospitalId] = {
//           totalnumberofbookings: 0,
//           doctorWiseCount: {},
//           departmentWiseCount: {},
//           serviceWiseCount: {},
//           modeWiseCount: {},
//           dailySummary: {},
//           doctorWiseDailySummary: {},
//           departmentWiseDailySummary: {},
//           serviceWiseDailySummary: {},
//           modeOfBookingWiseDailySummary: {},
//         };
//       }

//       const hospitalData = hospitalWiseData[hospitalId];
//       hospitalData.totalnumberofbookings += 1;
//       hospitalData.doctorWiseCount[doctorId] = (hospitalData.doctorWiseCount[doctorId] || 0) + 1;
//       hospitalData.serviceWiseCount[serviceId] = (hospitalData.serviceWiseCount[serviceId] || 0) + 1;
//       hospitalData.departmentWiseCount[departmentId] = (hospitalData.departmentWiseCount[departmentId] || 0) + 1;
//       hospitalData.modeWiseCount[mode] = (hospitalData.modeWiseCount[mode] || 0) + 1;
//       hospitalData.dailySummary[appointmentDate] = (hospitalData.dailySummary[appointmentDate] || 0) + 1;

//       if (!hospitalData.doctorWiseDailySummary[doctorId]) {
//         hospitalData.doctorWiseDailySummary[doctorId] = {};
//       }
//       hospitalData.doctorWiseDailySummary[doctorId][appointmentDate] =
//         (hospitalData.doctorWiseDailySummary[doctorId][appointmentDate] || 0) + 1;
        
//       if (!hospitalData.departmentWiseDailySummary[departmentId]) {
//         hospitalData.departmentWiseDailySummary[departmentId] = {};
//       }
//       hospitalData.departmentWiseDailySummary[departmentId][appointmentDate] =
//         (hospitalData.departmentWiseDailySummary[departmentId][appointmentDate] || 0) + 1;
    
//       if (!hospitalData.serviceWiseDailySummary[serviceId]) {
//         hospitalData.serviceWiseDailySummary[serviceId] = {};
//       }
//       hospitalData.serviceWiseDailySummary[serviceId][appointmentDate] =
//         (hospitalData.serviceWiseDailySummary[serviceId][appointmentDate] || 0) + 1;

//       if (!hospitalData.modeOfBookingWiseDailySummary[mode]) {
//         hospitalData.modeOfBookingWiseDailySummary[mode] = {};
//       }
//       hospitalData.modeOfBookingWiseDailySummary[mode][appointmentDate] =
//         (hospitalData.modeOfBookingWiseDailySummary[mode][appointmentDate] || 0) + 1;
//     });

//     Object.values(hospitalWiseData).forEach((hospitalData) => {
//       const sortObjectByDate = (obj) =>
//         Object.fromEntries(
//           Object.entries(obj).sort(([dateA], [dateB]) =>
//             dayjs(dateA, FORMAT).diff(dayjs(dateB, FORMAT))
//           )
//         );
    
//       hospitalData.dailySummary = sortObjectByDate(hospitalData.dailySummary);
    
//       for (const docId in hospitalData.doctorWiseDailySummary) {
//         hospitalData.doctorWiseDailySummary[docId] = sortObjectByDate(
//           hospitalData.doctorWiseDailySummary[docId]
//         );
//       }
    
//       for (const deptId in hospitalData.departmentWiseDailySummary) {
//         hospitalData.departmentWiseDailySummary[deptId] = sortObjectByDate(
//           hospitalData.departmentWiseDailySummary[deptId]
//         );
//       }
    
//       for (const serviceId in hospitalData.serviceWiseDailySummary) {
//         hospitalData.serviceWiseDailySummary[serviceId] = sortObjectByDate(
//           hospitalData.serviceWiseDailySummary[serviceId]
//         );
//       }
    
//       for (const mode in hospitalData.modeOfBookingWiseDailySummary) {
//         hospitalData.modeOfBookingWiseDailySummary[mode] = sortObjectByDate(
//           hospitalData.modeOfBookingWiseDailySummary[mode]
//         );
//       }
//     });

//     const finalDataArray = Object.entries(hospitalWiseData).map(
//       ([hospitalId, data]) => ({
//         [hospitalId]:
//          data, 
//       })
//     );

//     const executionTime = `${Date.now() - startTime}ms`;

//     return res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime,
//         Type: "booked_appointments",
//         totalAppointments: appointments.length,
//         filtersApplied: {
//           doctor_ID: doctor_ID || null,
//           service_ID: service_ID || null,
//           department_ID: department_ID || null,
//           HospitalID: HospitalID || null,
//           mode_Of_Booking: mode_Of_Booking || null,
//         },
//         dateRange: allData
//           ? { type: "full_data", message: "No date filters applied" }
//           : {
//               startDate: from.format(FORMAT),
//               endDate: to.format(FORMAT),
//               durationUsed,
//             },
//       },
//       data: {
//         hospitalWiseSummary: finalDataArray,
//       },
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - startTime}ms`;
//     const errorCode = 9271;

//     logger.logWithMeta("error", "Error fetching patient appointment summary", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       clientIp,
//       createdBy: req.username,
//       error: error.message,
//     });

//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         executionTime,
//         errorCode,
//         hospitalDatabase,
//       },
//       error: {
//         message: "Error fetching appointment summary: " + error.message,
//       },
//     });
//   }
// };















































//------------------------------------------------------------------------------------------------------------------------------------
// exports.getPatientAppointmentSummary = async (req, res, next) => {
//   const startTime = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);
//   const hospitalDatabase = req.hospitalDatabase;

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const {
//       start,
//       end,
//       duration,
//       doctor_ID,
//       service_ID,
//       department_ID,
//       HospitalID,
//       mode_Of_Booking,
//     } = req.query;
    
//     const toArray = (param) => {
//       if (!param) return null;
//       return Array.isArray(param) ? param : [param];
//     };

    
// const doctor_IDs = toArray(req.query.doctor_ID);
// const department_IDs = toArray(req.query.department_ID);
// const service_IDs = toArray(req.query.service_ID);
// const mode_Of_Bookings = toArray(req.query.mode_Of_Booking);


//     const PatientAppointment = require("../models/PatientAppointment_Model.js")(
//       req.sequelize
//     );
//     const FORMAT = "DD-MM-YYYY";

//     let from, to, durationUsed = null;
//     let allData = false;

//     if (!start && !end && !duration) {
//       allData = true;
//     } else if (!start) {
//       return res.status(400).json({ message: "Start date is required when using end or duration" });
//     } else if (start && !dayjs(start, FORMAT, true).isValid()) {
//       return res.status(400).json({ message: "Invalid start date format" });
//     } else {
//       from = dayjs(start, FORMAT).startOf("day");

//       if (duration) {
//         switch (duration) {
//           case "one_day":
//             to = from.endOf("day");
//             durationUsed = "one_day";
//             break;
//           case "one_week":
//             to = from.add(6, "day").endOf("day");
//             durationUsed = "one_week";
//             break;
//           case "one_month":
//             to = from.add(1, "month").subtract(1, "day").endOf("day");
//             durationUsed = "one_month";
//             break;
//           default:
//             return res.status(400).json({
//               message: "Invalid duration. Use one_day, one_week, or one_month.",
//             });
//         }
//       } else if (end) {
//         if (!dayjs(end, FORMAT, true).isValid()) {
//           return res.status(400).json({ message: "Invalid end date format" });
//         }
//         to = dayjs(end, FORMAT).endOf("day");
//         if (from.isAfter(to)) {
//           return res.status(400).json({ message: "Start date must be before end date" });
//         }
//         durationUsed = "custom_range";
//       } else {
//         return res.status(400).json({ message: "Either end or duration is required with start" });
//       }
//     }

//     const whereCondition = {};
//     if (!allData) {
//       whereCondition.appointment_Start_Time = {
//         [Op.between]: [from.toDate(), to.toDate()],
//       };
//     }

//     // if (doctor_ID) whereCondition.employee_IDR = doctor_ID;
//     // if (service_ID) whereCondition.service_IDR = service_ID;
//     // if (department_ID) whereCondition.department_IDR = department_ID;
//     if (doctor_IDs) whereCondition.employee_IDR = { [Op.in]: doctor_IDs };
//     if (department_IDs) whereCondition.department_IDR = { [Op.in]: department_IDs };
//     if (service_IDs) whereCondition.service_IDR = { [Op.in]: service_IDs };
//     if (HospitalID) whereCondition.hospital_IDR = HospitalID;
//     if (mode_Of_Bookings) whereCondition.mode_Of_Booking = {[Op.in]:mode_Of_Bookings};

//     const appointments = await PatientAppointment.findAll({
//       where: {
//         ...whereCondition,
//         is_canceled: false,
//       },
//       attributes: [
//         "employee_IDR",
//         "service_IDR",
//         "department_IDR",
//         "hospital_IDR",
//         "mode_Of_Booking",
//         "appointment_Start_Time", 
//       ],
//       raw: true,
//     });
 
//     const hospitalWiseData = {};
//     appointments.forEach((app) => {
//     const hospitalId = app.hospital_IDR;
//   const doctorId = app.employee_IDR;
//   const serviceId = app.service_IDR;
//   const departmentId = app.department_IDR;
//   const mode = app.mode_Of_Booking;
//   const appointmentDate = dayjs(app.appointment_Start_Time).format(FORMAT);
//       if (!hospitalId) return;
//       if (!hospitalWiseData[hospitalId]) {
//         hospitalWiseData[hospitalId] = {
//           totalnumberofbookings: 0,
//           doctorWiseCount: {},
//           departmentWiseCount: {},
//           serviceWiseCount: {},
//           modeWiseCount: {},
//           dailySummary: {},
//           doctorWiseDailySummary: {},
//           departmentWiseDailySummary: {},
//           serviceWiseDailySummary: {},
//           modeOfBookingWiseDailySummary: {},
//         };
//       }

//       const hospitalData = hospitalWiseData[hospitalId];
//       hospitalData.totalnumberofbookings += 1;
//       hospitalData.doctorWiseCount[doctorId] = (hospitalData.doctorWiseCount[doctorId] || 0) + 1;
//       hospitalData.serviceWiseCount[serviceId] = (hospitalData.serviceWiseCount[serviceId] || 0) + 1;
//       hospitalData.departmentWiseCount[departmentId] = (hospitalData.departmentWiseCount[departmentId] || 0) + 1;
//       hospitalData.modeWiseCount[mode] = (hospitalData.modeWiseCount[mode] || 0) + 1;
//       hospitalData.dailySummary[appointmentDate] = (hospitalData.dailySummary[appointmentDate] || 0) + 1;

//       if (!hospitalData.doctorWiseDailySummary[doctorId]) {
//         hospitalData.doctorWiseDailySummary[doctorId] = {};
//       }
//       hospitalData.doctorWiseDailySummary[doctorId][appointmentDate] =
//         (hospitalData.doctorWiseDailySummary[doctorId][appointmentDate] || 0) + 1;
        
//       if (!hospitalData.departmentWiseDailySummary[departmentId]) {
//         hospitalData.departmentWiseDailySummary[departmentId] = {};
//       }
//       hospitalData.departmentWiseDailySummary[departmentId][appointmentDate] =
//         (hospitalData.departmentWiseDailySummary[departmentId][appointmentDate] || 0) + 1;
    
//       if (!hospitalData.serviceWiseDailySummary[serviceId]) {
//         hospitalData.serviceWiseDailySummary[serviceId] = {};
//       }
//       hospitalData.serviceWiseDailySummary[serviceId][appointmentDate] =
//         (hospitalData.serviceWiseDailySummary[serviceId][appointmentDate] || 0) + 1;

//       if (!hospitalData.modeOfBookingWiseDailySummary[mode]) {
//         hospitalData.modeOfBookingWiseDailySummary[mode] = {};
//       }
//       hospitalData.modeOfBookingWiseDailySummary[mode][appointmentDate] =
//         (hospitalData.modeOfBookingWiseDailySummary[mode][appointmentDate] || 0) + 1;
//     });

//     Object.values(hospitalWiseData).forEach((hospitalData) => {
//       const sortObjectByDate = (obj) =>
//         Object.fromEntries(
//           Object.entries(obj).sort(([dateA], [dateB]) =>
//             dayjs(dateA, FORMAT).diff(dayjs(dateB, FORMAT))
//           )
//         );
    
//       hospitalData.dailySummary = sortObjectByDate(hospitalData.dailySummary);
    
//       for (const docId in hospitalData.doctorWiseDailySummary) {
//         hospitalData.doctorWiseDailySummary[docId] = sortObjectByDate(
//           hospitalData.doctorWiseDailySummary[docId]
//         );
//       }
    
//       for (const deptId in hospitalData.departmentWiseDailySummary) {
//         hospitalData.departmentWiseDailySummary[deptId] = sortObjectByDate(
//           hospitalData.departmentWiseDailySummary[deptId]
//         );
//       }
    
//       for (const serviceId in hospitalData.serviceWiseDailySummary) {
//         hospitalData.serviceWiseDailySummary[serviceId] = sortObjectByDate(
//           hospitalData.serviceWiseDailySummary[serviceId]
//         );
//       }
    
//       for (const mode in hospitalData.modeOfBookingWiseDailySummary) {
//         hospitalData.modeOfBookingWiseDailySummary[mode] = sortObjectByDate(
//           hospitalData.modeOfBookingWiseDailySummary[mode]
//         );
//       }
//     });

//     const finalDataArray = Object.entries(hospitalWiseData).map(
//       ([hospitalId, data]) => ({
//         [hospitalId]:
//          data, 
//       })
//     );

//     const executionTime = `${Date.now() - startTime}ms`;

//     return res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime,
//         Type: "booked_appointments",
//         totalAppointments: appointments.length,
//         filtersApplied: {
//           doctor_ID: doctor_ID || null,
//           service_ID: service_ID || null,
//           department_ID: department_ID || null,
//           HospitalID: HospitalID || null,
//           mode_Of_Booking: mode_Of_Booking || null,
//         },
//         dateRange: allData
//           ? { type: "full_data", message: "No date filters applied" }
//           : {
//               startDate: from.format(FORMAT),
//               endDate: to.format(FORMAT),
//               durationUsed,
//             },
//       },
//       data: {
//         hospitalWiseSummary: finalDataArray,
//       },
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - startTime}ms`;
//     const errorCode = 9271;

//     logger.logWithMeta("error", "Error fetching patient appointment summary", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       clientIp,
//       createdBy: req.username,
//       error: error.message,
//     });

//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         executionTime,
//         errorCode,
//         hospitalDatabase,
//       },
//       error: {
//         message: "Error fetching appointment summary: " + error.message,
//       },
//     });
//   }
// };
































































exports.getPatientAppointmentSummary = async (req, res, next) => {
  const startTime = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      start,
      end,
      duration,
      doctor_ID,
      service_ID,
      department_ID,
      HospitalID,
      mode_Of_Booking,
    } = req.query;

    const toArray = (param) => {
      if (!param) return null;
      return Array.isArray(param) ? param : [param];
    };

    const doctor_IDs = toArray(doctor_ID);
    const department_IDs = toArray(department_ID);
    const service_IDs = toArray(service_ID);
    const mode_Of_Bookings = toArray(mode_Of_Booking);

    const PatientAppointment = require("../models/PatientAppointment_Model.js")(req.sequelize);
    const FORMAT = "DD-MM-YYYY";

    let from, to, durationUsed = null;
    let allData = false;

    if (!start && !end && !duration) {
      allData = true;
    } else if (!start) {
      return res.status(400).json({ message: "Start date is required when using end or duration" });
    } else if (start && !dayjs(start, FORMAT, true).isValid()) {
      return res.status(400).json({ message: "Invalid start date format" });
    } else {
      from = dayjs(start, FORMAT).startOf("day");

      if (duration) {
        switch (duration) {
          case "one_day":
            to = from.endOf("day");
            durationUsed = "one_day";
            break;
          case "one_week":
            to = from.add(6, "day").endOf("day");
            durationUsed = "one_week";
            break;
          case "one_month":
            to = from.add(1, "month").subtract(1, "day").endOf("day");
            durationUsed = "one_month";
            break;
          default:
            return res.status(400).json({ message: "Invalid duration. Use one_day, one_week, or one_month." });
        }
      } else if (end) {
        if (!dayjs(end, FORMAT, true).isValid()) {
          return res.status(400).json({ message: "Invalid end date format" });
        }
        to = dayjs(end, FORMAT).endOf("day");
        if (from.isAfter(to)) {
          return res.status(400).json({ message: "Start date must be before end date" });
        }
        durationUsed = "custom_range";
      } else {
        return res.status(400).json({ message: "Either end or duration is required with start" });
      }
    }

    const whereCondition = {};
    if (!allData) {
      whereCondition.appointment_Start_Time = {
        [Op.between]: [from.toDate(), to.toDate()],
      };
    }

    if (doctor_IDs) whereCondition.employee_IDR = { [Op.in]: doctor_IDs };
    if (department_IDs) whereCondition.department_IDR = { [Op.in]: department_IDs };
    if (service_IDs) whereCondition.service_IDR = { [Op.in]: service_IDs };
    if (HospitalID) whereCondition.hospital_IDR = HospitalID;
    if (mode_Of_Bookings) whereCondition.mode_Of_Booking = { [Op.in]: mode_Of_Bookings };

    const appointments = await PatientAppointment.findAll({
      where: whereCondition,
      attributes: [
        "employee_IDR",
        "service_IDR",
        "department_IDR",
        "hospital_IDR",
        "mode_Of_Booking",
        "appointment_Start_Time",
        "is_canceled",
      ],
      raw: true,
    });

    const hospitalWiseData = {};
    appointments.forEach((app) => {
      const hospitalId = app.hospital_IDR;
      const doctorId = app.employee_IDR;
      const serviceId = app.service_IDR;
      const departmentId = app.department_IDR;
      const mode = app.mode_Of_Booking;
      const appointmentDate = dayjs(app.appointment_Start_Time).format(FORMAT);
      const isCanceled = app.is_canceled;

      if (!hospitalId) return;

      if (!hospitalWiseData[hospitalId]) {
        hospitalWiseData[hospitalId] = {
          totalnumberofbookings: 0,
          totalCanceledAppointments: 0,
          totalNonCanceledAppointments: 0,
          doctorWiseCount: {},
          departmentWiseCount: {},
          serviceWiseCount: {},
          modeWiseCount: {},
          dailySummary: {},
          doctorWiseDailySummary: {},
          departmentWiseDailySummary: {},
          serviceWiseDailySummary: {},
          modeOfBookingWiseDailySummary: {},
        };
      }

      const hospitalData = hospitalWiseData[hospitalId];
      hospitalData.totalnumberofbookings += 1;
      if (isCanceled) {
        hospitalData.totalCanceledAppointments += 1;
      } else {
        hospitalData.totalNonCanceledAppointments += 1;
      }

      const incrementNestedCount = (mainObj, key, dateKey, isCanceled) => {
        if (!mainObj[key]) mainObj[key] = {};
        if (!mainObj[key][dateKey]) mainObj[key][dateKey] = { total: 0, canceled: 0, nonCanceled: 0 };
        mainObj[key][dateKey].total += 1;
        mainObj[key][dateKey].canceled += isCanceled ? 1 : 0;
        mainObj[key][dateKey].nonCanceled += isCanceled ? 0 : 1;
      };

      // Daily Summary
      incrementNestedCount({ daily: hospitalData.dailySummary }, "daily", appointmentDate, isCanceled);

      // Doctor
      hospitalData.doctorWiseCount[doctorId] = hospitalData.doctorWiseCount[doctorId] || { total: 0, canceled: 0, nonCanceled: 0 };
      hospitalData.doctorWiseCount[doctorId].total += 1;
      hospitalData.doctorWiseCount[doctorId].canceled += isCanceled ? 1 : 0;
      hospitalData.doctorWiseCount[doctorId].nonCanceled += isCanceled ? 0 : 1;
      incrementNestedCount(hospitalData.doctorWiseDailySummary, doctorId, appointmentDate, isCanceled);

      // Department
      hospitalData.departmentWiseCount[departmentId] = hospitalData.departmentWiseCount[departmentId] || { total: 0, canceled: 0, nonCanceled: 0 };
      hospitalData.departmentWiseCount[departmentId].total += 1;
      hospitalData.departmentWiseCount[departmentId].canceled += isCanceled ? 1 : 0;
      hospitalData.departmentWiseCount[departmentId].nonCanceled += isCanceled ? 0 : 1;
      incrementNestedCount(hospitalData.departmentWiseDailySummary, departmentId, appointmentDate, isCanceled);

      // Service
      hospitalData.serviceWiseCount[serviceId] = hospitalData.serviceWiseCount[serviceId] || { total: 0, canceled: 0, nonCanceled: 0 };
      hospitalData.serviceWiseCount[serviceId].total += 1;
      hospitalData.serviceWiseCount[serviceId].canceled += isCanceled ? 1 : 0;
      hospitalData.serviceWiseCount[serviceId].nonCanceled += isCanceled ? 0 : 1;
      incrementNestedCount(hospitalData.serviceWiseDailySummary, serviceId, appointmentDate, isCanceled);

      // Mode
      hospitalData.modeWiseCount[mode] = hospitalData.modeWiseCount[mode] || { total: 0, canceled: 0, nonCanceled: 0 };
      hospitalData.modeWiseCount[mode].total += 1;
      hospitalData.modeWiseCount[mode].canceled += isCanceled ? 1 : 0;
      hospitalData.modeWiseCount[mode].nonCanceled += isCanceled ? 0 : 1;
      incrementNestedCount(hospitalData.modeOfBookingWiseDailySummary, mode, appointmentDate, isCanceled);
    });

    const sortObjectByDate = (obj) =>
      Object.fromEntries(
        Object.entries(obj).sort(([dateA], [dateB]) =>
          dayjs(dateA, FORMAT).diff(dayjs(dateB, FORMAT))
        )
      );

    Object.values(hospitalWiseData).forEach((hospitalData) => {
      hospitalData.dailySummary = sortObjectByDate(hospitalData.dailySummary);
    });

    const finalDataArray = Object.entries(hospitalWiseData).map(
      ([hospitalId, data]) => ({
        [hospitalId]: data,
      })
    );

    const executionTime = `${Date.now() - startTime}ms`;

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        Type: "all_appointments",
        totalAppointments: appointments.length,
        filtersApplied: {
          doctor_ID: doctor_ID || null,
          service_ID: service_ID || null,
          department_ID: department_ID || null,
          HospitalID: HospitalID || null,
          mode_Of_Booking: mode_Of_Booking || null,
        },
        dateRange: allData
          ? { type: "full_data", message: "No date filters applied" }
          : {
              startDate: from.format(FORMAT),
              endDate: to.format(FORMAT),
              durationUsed,
            },
      },
      data: {
        hospitalWiseSummary: finalDataArray,
      },
    });
  } catch (error) {
    const executionTime = `${Date.now() - startTime}ms`;
    const errorCode = 9271;

    logger.logWithMeta("error", "Error fetching patient appointment summary", {
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
        message: "Error fetching appointment summary: " + error.message,
      },
    });
  }
};


