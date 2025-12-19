
const validateJSONContentType = require("../Middleware/jsonvalidation");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../Middleware/sendEmail");
const sendUserEmail = require("../Middleware/sendUserEmail");
const { Op } = require("sequelize");
const express = require("express");
const axios = require("axios");
const router = express.Router();
require('dotenv').config();

const multer = require('multer');
const {
  createUserValidationRules,
} = require("../validators/hospitalValidator");

const { validationResult } = require("express-validator");
const Hospital = require("../models/HospitalModel");
const sequelize = require("../database/connection");
const createUserMasterModel = require("../models/userMaster");
const createPatientMasterModel = require("../models/PatientMaster");
const createDynamicConnection = require("../database/dynamicConnection");
// const bcrypt = require('bcrypt');
const bcrypt = require("bcryptjs");
const logger = require("../logger"); // Assuming logger is configured properly in '../logger'
const jwt = require("jsonwebtoken");
const { DataTypes } = require("sequelize");
const { User } = require("../models/user");
const CountAPI = require("../models/ApisCounts");
const redis = require("redis");
const path = require('path');
const fs = require('fs');
const {

  redisClient,
  getAsync,
  setAsync,
} = require("../Middleware/redisClient");

const client = redis.createClient();

const requestIp = require("request-ip");
async function getClientIp(req) {
  let clientIp =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (
    clientIp === "::1" ||
    clientIp === "127.0.0.1" ||
    clientIp.startsWith("192.168") ||
    clientIp.startsWith("10.") ||
    clientIp.startsWith("172.")
  ) {
    try {
      const ipResponse = await axios.get("https://api.ipify.org?format=json");
      clientIp = ipResponse.data.ip;
    } catch (error) {
      logger.logWithMeta("Error fetching public IP", {
        error: error.message,
        erroerCode: 900,
      });

      clientIp = "127.0.0.1"; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

const dotenv = require("dotenv");
dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../profileImg');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/\s+/g, '_'); // Replace spaces in filename
    cb(null, `${timestamp}_${sanitizedFilename}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// Save Base64 Image
const saveBase64Image = (base64String, filename) => {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }
  const ext = matches[1].split('/')[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');

  const uploadPath = path.join(__dirname, '../profileImg');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const filePath = path.join(uploadPath, `${filename}.${ext}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
};

exports.createHospital = [
  upload.single('HospitalLogo'),
  async (req, res) => {
    const start = Date.now();
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 976;
      const statusCode = 400;
      logger.logWithMeta("warn", "Validation errors occurred", {
        errors: errors.array(),
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
      });
      return res.status(statusCode).json({
        meta: { statusCode, errorCode, executionTime },
        error: {
          message: 'Validation errors occurred',
          details: errors.array().map((err) => ({ field: err.param, message: err.msg })),
        },
      });
    }

    const {
      HospitalName,
      HospitalCode,
      ManagingCompanyEmail,
      HospitalDatabase,
      HospitalLogo,
      ...otherFields
    } = req.body;

    try {
      const existingHospital = await Hospital.findOne({
        where: { [Op.or]: [{ ManagingCompanyEmail }] },
      });

      if (existingHospital) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 977;
        const statusCode = 400;
        logger.logWithMeta("warn", "ManagingCompanyEmail already exists", {
          errorCode,
          statusCode,
          executionTime,
          hospitalId: req.hospitalId,
        });
        return res.status(statusCode).json({
          meta: { statusCode, errorCode, executionTime },
          error: { message: 'ManagingCompanyEmail already exists' },
        });
      }

      const uniqueKey = uuidv4();
      logger.info(`Generated unique key: ${uniqueKey}`);

      // Function to store the unique key in the existing apikey.json file inside the config folder
      // E:\Hospital-Project\Hospital_gateway-main\Hospital_gateway\config\apiKey.json
      const storeApiKey = (HospitalCode, uniqueKey) => {
        try {
          const configDir = path.join(__dirname, `../../${process.env.GATEWAYCONFIGPATH}`);
          const apiKeyFilePath = path.join(configDir, 'apiKey.json');

          let apiKeyData = {};

          if (fs.existsSync(apiKeyFilePath)) {
            const existingData = fs.readFileSync(apiKeyFilePath, 'utf8');
            apiKeyData = JSON.parse(existingData);
          }

          apiKeyData[HospitalCode] = uniqueKey;

          fs.writeFileSync(apiKeyFilePath, JSON.stringify(apiKeyData, null, 2));
          logger.info(`Stored unique key in file: ${apiKeyFilePath}`);
        } catch (err) {
          logger.error(`Error writing to file for unique key: ${err.message}`);
          throw err;
        }
      };

      storeApiKey(HospitalCode, uniqueKey);





      let savedImagePath = null;
      let imgBase64 = null;

      if (HospitalLogo && HospitalLogo.startsWith('data:image')) {
        savedImagePath = saveBase64Image(HospitalLogo, HospitalDatabase);
      } else if (req.file) {
        savedImagePath = req.file.path;
      }

      if (savedImagePath) {
        const imgBuffer = fs.readFileSync(savedImagePath);
        imgBase64 = `data:image/${path.extname(savedImagePath).slice(1)};base64,${imgBuffer.toString('base64')}`;
      }



      const newHospital = await Hospital.create({
        HospitalName,
        HospitalCode,
        ManagingCompanyEmail,
        HospitalDatabase,
        HospitalLogo: savedImagePath,
        UniqueKey: uniqueKey,
        ...otherFields,
      });

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const databaseName = HospitalDatabase.replace(/\s+/g, "_").toLowerCase();

      logger.info(`Generated database name: ${databaseName}`);
      await sequelize.query(`CREATE DATABASE \`${databaseName}\`;`);
      logger.info(`Database ${databaseName} created successfully`);

      console.log("uniqueKey", uniqueKey)


      res.status(200).json({
        meta: { statusCode: 200, executionTime },
        data: newHospital,
        HospitalLogo: imgBase64,
      });

    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 978;
      const statusCode = 500;

      logger.logWithMeta("warn", "Error creating hospital", {
        errorCode,
        statusCode,
        error: error.message,
        executionTime,
        hospitalId: req.hospitalId,
      });

      res.status(statusCode).json({
        meta: { statusCode, errorCode, executionTime },
        error: { message: `Error creating hospital: ${error.message}` },
      });
    }
  },
];

exports.getAllHospitals = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);

  try {
    const hospitals = await Hospital.findAll();
    let imgBase64 = null;
    // Read the hospital logo and convert it to base64 if it exists
    const hospitalsWithLogo = await Promise.all(
      hospitals.map(async (hospital) => {
        // if (hospital.HospitalLogo) {
        //   console.log("hospital.HospitalLogo",hospital.HospitalLogo)
        //   try {

        //     const logoPath = path.resolve(__dirname, `../../uploads/${hospital.HospitalLogo}`);
        //     const imgBuffer = fs.readFileSync(logoPath);
        //     const imgBase64 = `data:image/${path.extname(logoPath).slice(1)};base64,${imgBuffer.toString('base64')}`;
        //     hospital.HospitalLogo = imgBase64;


        //   } catch (error) {
        //     hospital.HospitalLogo = null; // If there's an error reading the logo, set it to null
        //   }
        // }

        if (hospital.HospitalLogo) {
          const imgPath = path.join(__dirname, '../profileImg', path.basename(hospital.HospitalLogo));
          if (fs.existsSync(imgPath)) {
            const imgBuffer = fs.readFileSync(imgPath);

            imgBase64 = `data:image/${path.extname(imgPath).slice(1)};base64,${imgBuffer.toString('base64')}`;
            hospital.HospitalLogo = imgBase64;
          }

        }

        return hospital;
      })
    );
    // console.log("imgBase640000000000",imgBase64)


    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the request details
    logger.logWithMeta("warn", `Retrieved all hospitals successfully`, {
      executionTime,
      statusCode: 200,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.json({
      meta: {
        statusCode: 200,
        executionTime: executionTime,
      },
      data: hospitalsWithLogo,

    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 904;

    // Log the error
    logger.logWithMeta("warn", `Error retrieving hospitals: ${error.message}`, {
      errorCode,
      statusCode: 500,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 904,
        executionTime: executionTime,
      },
      error: {
        message: "Error retrieving hospitals: " + error.message,
      },
    });
  }
};

exports.getHospitalById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const id = req.params.id;

  try {
    // Retrieve hospital by ID
    const hospital = await Hospital.findByPk(id);

    if (!hospital) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 905;

      logger.logWithMeta("warn", `Hospital with ID ${id} not found`, {
        errorCode,
        statusCode: 404,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode,
          executionTime,
        },
        error: {
          message: "Hospital not found",
        },
      });
    }

    // Handle logo file and convert to Base64 if exists
    // let logoBase64 = null;
    // if (hospital.HospitalLogo) {
    //   const logoPath = path.join(__dirname, "../profile", hospital.HospitalLogo); // Adjust the path
    //   console.log("logoPath.....",logoPath)
    //   if (fs.existsSync(logoPath)) {
    //     const logoBuffer = fs.readFileSync(logoPath);
    //     logoBase64 = `data:image/${path.extname(logoPath).slice(1)};base64,${logoBuffer.toString("base64")}`;
    //   }
    // }


    let imgBase64 = null;
    if (hospital.HospitalLogo) {
      const imgPath = path.join(__dirname, '../profileImg', path.basename(hospital.HospitalLogo));
      console.log("Checking file path:", imgPath);

      if (fs.existsSync(imgPath)) {
        try {
          const imgBuffer = fs.readFileSync(imgPath);
          const ext = path.extname(imgPath).slice(1) || 'png'; // Default to png if empty
          imgBase64 = `data:image/${ext};base64,${imgBuffer.toString('base64')}`;
        } catch (error) {
          console.error("Error reading file:", error);
        }
      } else {
        console.warn("File not found:", imgPath);
      }
    }
    console.log("Final imgBase64:", imgBase64);







    const end = Date.now();
    const executionTime = `${end - start}ms`;

    logger.logWithMeta("info", `Retrieved hospital with ID ${id} successfully`, {
      executionTime,
      statusCode: 200,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: hospital,
      hospitalLogo: imgBase64,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 906;

    logger.logWithMeta("error", `Error retrieving hospital: ${error.message}`, {
      errorCode,
      statusCode: 500,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
      },
      error: {
        message: `Error retrieving hospital: ${error.message}`,
      },
    });
  }
};



exports.updateHospital = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 907;

    logger.logWithMeta("warn", "Validation errors occurred while updating hospital", {
      errorCode,
      statusCode: 400,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    return res.status(400).json({
      meta: { statusCode: 400, errorCode, executionTime },
      error: {
        message: errors.array().map((err) => err.msg).join(", "),
      },
    });
  }

  const { HospitalLogo, ...updateFields } = req.body;
  const hospitalId = req.params.id;

  try {
    const hospital = await Hospital.findOne({ where: { HospitalID: hospitalId } });

    if (!hospital) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 908;

      logger.logWithMeta("warn", `Hospital with ID ${hospitalId} not found for update`, {
        errorCode,
        statusCode: 404,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(404).json({
        meta: { statusCode: 404, errorCode, executionTime },
        error: { message: "Hospital not found" },
      });
    }

    let savedImagePath = hospital.HospitalLogo;
    let imgBase64 = null;

    if (HospitalLogo && HospitalLogo.startsWith("data:image")) {
      savedImagePath = saveBase64Image(HospitalLogo, hospital.HospitalDatabase);
    } else if (req.file) {
      savedImagePath = req.file.path;
    }

    if (savedImagePath) {
      const imgBuffer = fs.readFileSync(savedImagePath);
      imgBase64 = `data:image/${path.extname(savedImagePath).slice(1)};base64,${imgBuffer.toString("base64")}`;
    }

    updateFields.HospitalLogo = savedImagePath;

    await Hospital.update(updateFields, { where: { HospitalID: hospitalId } });

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    logger.logWithMeta("info", `Hospital with ID ${hospitalId} updated successfully`, {
      statusCode: 200,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      meta: { statusCode: 200, executionTime },
      message: "Hospital updated successfully",
      imgBase64,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 909;

    logger.logWithMeta("error", "Error updating hospital", {
      errorCode,
      statusCode: 500,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: `Error updating hospital: ${error.message}` },
    });
  }
};


// Update hospital
// exports.updateHospital = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 907;

//     // Log the warning
//     logger.logWithMeta(
//       "warn",
//       `Validation errors occurred while updating hospital $`,
//       {
//         errorCode,
//         statusCode: 400,
//         // errorMessage: error.message,
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method,
//         userAgent: req.headers["user-agent"], // HTTP method
//       }
//     );
//     // logger.warn('Validation errors occurred while updating hospital', errors);
//     // const end = Date.now();
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 907,
//         executionTime: `${end - start}ms`,
//       },
//       error: {
//         message: errors
//           .array()
//           .map((err) => err.msg)
//           .join(", "),
//       },
//     });
//   }

//   const id = req.params.id;
//   try {
//     const [updatedRows] = await Hospital.update(req.body, {
//       where: { HospitalID: id },
//     });

//      let savedImagePath = hospital.HospitalLogo; // Use the existing image if no new image is uploaded
//           let imgBase64 = null;

//           if (HospitalLogo) {
//             imgBase64 = img.startsWith('data:image/jpeg;base64/') ? HospitalLogo.split(',')[1] : HospitalLogo;
//             savedImagePath = saveBase64Image(img, );
//           } else if (req.file) {
//             const imgBuffer = fs.readFileSync(req.file.path);
//             imgBase64 = imgBuffer.toString('base64');
//           }

//     if (updatedRows === 0) {
//       //       const end = Date.now();
//       // logger.warn(`Hospital with ID ${id} not found for update, executionTime: ${end - start}ms`);

//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 908;

//       // Log the warning
//       logger.logWithMeta(
//         "warn",
//         `Hospital with ID ${id} not found for update `,
//         {
//           errorCode,
//           statusCode: 404,

//           executionTime,
//           hospitalId: req.hospitalId,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers["user-agent"], // HTTP method
//         }
//       );
//       res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 908,
//           executionTime: `${end - start}ms`,
//         },
//         error: {
//           message: "Hospital not found",
//         },
//       });
//     } else {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       // Log the warning
//       logger.logWithMeta(
//         "warn",
//         `Hospital with ID ${id} updated successfully`,
//         {
//           executionTime,
//           statusCode: 200,
//           hospitalId: req.hospitalId,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers["user-agent"], // HTTP method
//         }
//       );

//       // logger.info(`Hospital with ID ${id} updated successfully, executionTime: ${end - start}ms`);

//       res.json({
//         meta: {
//           statusCode: 200,
//           executionTime: `${end - start}ms`,
//         },
//         message: "Hospital updated successfully",
//         imgBase64:imgBase64
//       });
//     }
//   } catch (error) {
//     // const end = Date.now();
//     // logger.error(`Error updating hospital, executionTime: ${end - start}ms`, { error: error.message });
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 909;

//     // Log the warning
//     logger.logWithMeta(
//       "warn",
//       `Error updating hospital, executionTime`,
//       {
//         errorCode,
//         statusCode: 500,

//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method,
//         userAgent: req.headers["user-agent"], // HTTP method
//       }
//     );
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 909,
//         executionTime: `${end - start}ms`,
//       },
//       error: {
//         message: "Error updating hospital: " + error.message,
//       },
//     });
//   }
// };

// Delete hospital
exports.deleteHospital = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const id = req.params.id;
  try {
    const deletedRows = await Hospital.destroy({
      where: { HospitalID: id },
    });
    if (deletedRows === 0) {
      // const end = Date.now();
      // logger.warn(`Hospital with ID ${id} not found for deletion, executionTime: ${end - start}ms`);

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 910;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `Hospital with ID ${id} not found for deletion ${error.message}`,
        {
          errorCode,
          statusCode: 404,
          errorMessage: error.message,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 910,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital not found",
        },
      });
    } else {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // Log the warning
      logger.logWithMeta(
        "warn",
        `Hospital with ID ${id} deleted successfully,`,
        {
          executionTime,
          statusCode: 200,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      // logger.info(`Hospital with ID ${id} deleted successfully, executionTime: ${end - start}ms`);

      res.json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`,
        },
        message: "Hospital deleted successfully",
      });
    }
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 911;

    // Log the warning
    logger.logWithMeta("warn", `Error deleting hospital ${error.message}`, {
      errorCode,
      statusCode: 500,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // const end = Date.now();
    // logger.error('Error deleting hospital', { error: error.message, executionTime: `${end - start}ms` });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 911,
      },
      error: {
        message: "Error deleting hospital: " + error.message,
      },
    });
  }
};

// Get hospitals by HospitalGroupID
exports.getHospitalsByHospitalGroupID = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { HospitalGroupIDR } = req.params;
  try {
    const hospitals = await Hospital.findAll({
      where: { HospitalGroupIDR },
    });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Retrieved hospitals by HospitalGroupIDR: ${HospitalGroupIDR} successfully,`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.info(`Retrieved hospitals by HospitalGroupIDR: ${HospitalGroupIDR} successfully, executionTime: ${end - start}ms`);

    res.json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: hospitals,
    });
  } catch (error) {
    // const end = Date.now();
    // logger.error('Error retrieving hospitals by HospitalGroupIDR', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 912;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Error retrieving hospitals by HospitalGroupIDR ${error.message}`,
      {
        errorCode,
        statusCode: 500,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 912,
        executionTime: `${end - start}ms`,
      },
      error: {
        message:
          "Error retrieving hospitals by HospitalGroupIDR: " + error.message,
      },
    });
  }
};

exports.getAllHospitalsByPagination = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5; // Default limit is 5, adjust as per your requirement

  const offset = (page - 1) * limit;

  try {
    const totalCount = await Hospital.count();
    const hospitals = await Hospital.findAll({
      offset,
      limit,
      // order: [[ 'ASC']] // Example ordering by createdAt, adjust as per your requirement
    });

    // logger.info(`Retrieved hospitals for page ${page} with limit ${limit} successfully, executionTime: ${end - start}ms`);
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Retrieved hospitals for page ${page} with limit ${limit} successfully`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    res.status(200).json({
      meta: {
        statusCode: 200,
        totalCount,
        page,
        limit,
        executionTime: `${end - start}ms`,
      },
      data: hospitals,
    });
  } catch (error) {
    // const end = Date.now();
    // logger.error(`Error retrieving hospitals with pagination, executionTime: ${end - start}ms`, { error: error.message });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 913;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Error retrieving hospitals with pagination ${error.message}`,
      {
        errorCode,
        statusCode: 500,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 913,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error retrieving hospitals with pagination: " + error.message,
      },
    });
  }
};


const { Sequelize } = require("sequelize");



const verifyUniqueKey = (providedKey, storedKey) => {
  logger.info(`Provided UniqueKey: ${providedKey}`);
  logger.info(`Stored UniqueKey: ${storedKey}`);
  return providedKey === storedKey;
};

const CryptoJS = require("crypto-js");

// Secret key should be in a suitable format and length
const ENCRYPT_SECRET_KEY = process.env.ENCRYPT_SECRET_KEY;
const ENCRYPT_SECRET_KEY2 = process.env.ENCRYPT_SECRET_KEY3;

// Function to decrypt the provided ciphertext
const decryptValue = (ciphertext) => {
  try {
    // Convert the secret key to a suitable format if needed
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPT_SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    // Check if the decrypted text is not empty
    if (!originalText) {
      throw new Error("Decryption failed or result is empty.");
    }

    return originalText;
  } catch (error) {
    console.error("Error during decryption:", error.message);
    return null;
  }
};


exports.HospitalCode = async (req, res) => {
  const start = Date.now();
  const logId = uuidv4();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);
  //
  if (!errors.isEmpty()) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 914;
    const statusCode = 400;
    //
    // Log validation error
    logger.logWithMeta("warn", `Validation errors during login`, {
      errorCode,
      logId,
      statusCode,
      errorMessage: errors
        .array()
        .map((err) => err.msg)
        .join(", "),
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
    //
    return res.status(400).json({
      meta: { statusCode, errorCode, executionTime },
      error: {
        message: "Validation errors occurred",
        details: errors
          .array()
          .map((err) => ({ field: err.param, message: err.msg })),
      },
    });
  }
  //
  const { HospitalCode } = req.body;
  const encryptedKeyFromHeader = req.headers["x-unique-key"];
  //
  if (!encryptedKeyFromHeader) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 915;
    //
    // Log missing encrypted key error
    logger.logWithMeta("warn", `Missing encrypted key in header`, {
      errorCode,
      logId,
      statusCode: 400,
      errorMessage: "Missing encrypted key",
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
    //
    return res.status(400).json({
      meta: { statusCode: 400, errorCode, executionTime },
      error: { message: "Missing encrypted key in the request header" },
    });
  }
  //
  if (!ENCRYPT_SECRET_KEY) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 916;
    //
    // Log missing decryption secret error
    logger.logWithMeta("warn", `Decryption secret is not defined`, {
      errorCode,
      logId,
      statusCode: 500,
      errorMessage: "Decryption secret is missing",
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
    //
    return res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: {
        message: "Internal Server Error: Decryption secret is not defined",
      },
    });
  }
  //
  try {
    const hospital = await Hospital.findOne({ where: { HospitalCode } });
    if (!hospital) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 917;
      //
      // Log hospital not found error
      logger.logWithMeta(
        "warn",
        `Hospital with HospitalCode ${HospitalCode} not found`,
        {
          errorCode,
          logId,
          statusCode: 404,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
        }
      );
      //
      return res.status(404).json({
        meta: { statusCode: 404, errorCode, executionTime },
        error: { message: "Hospital not found" },
      });
    }
    //
    const decryptedKey = decryptValue(encryptedKeyFromHeader);
    if (decryptedKey !== hospital.UniqueKey) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 918;
      //
      // Log invalid UniqueKey error
      logger.logWithMeta(
        "warn",
        `Invalid UniqueKey for HospitalCode ${HospitalCode}`,
        {
          errorCode,
          logId,
          statusCode: 401,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
        }
      );
      //
      return res.status(401).json({
        meta: { statusCode: 401, errorCode, executionTime },
        error: { message: "Unauthorized" },
      });
    }
    //
    console.log("Hospital Name:", hospital.HospitalName);
    //
    const existingToken = await getAsync(hospital.HospitalID.toString());
    //
    // const existingToken = await delAsync(hospital.HospitalID.toString());
    //
    let Hospitaltoken = existingToken;
    //
    if (!existingToken) {
      Hospitaltoken = jwt.sign(
        {
          hospitalId: hospital.HospitalID,
          hospitalDatabase: hospital.HospitalDatabase,
          hospitalGroupIDR: hospital.HospitalGroupIDR,
          // hospitalName: hospital.HospitalName,
          hospitalName: hospital.HospitalName || "Default Hospital Name",
          //
          MFAEnabled: hospital?.MFAEnabled,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      //
      await setAsync(
        hospital.HospitalID.toString(),
        Hospitaltoken,
        "EX",
        24 * 60 * 60
      );
    }
    //
    const decodedToken = jwt.verify(Hospitaltoken, process.env.JWT_SECRET);
    //
    console.log(decodedToken);
    //
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decodedToken.exp - currentTime;
    const expiresInMinutes = Math.floor(expiresIn / 60);
    //
    //
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    // logger.logWithMeta(
    //   "warn",
    //   `Hospital with HospitalCode ${HospitalCode} found successfully`,
    //   {
    //     message: `Execution Time: ${executionTime} ms, Log ID: ${logId}, statusCode: 200, Hospital ID: ${req.hospitalId}, Hospital Name: ${hospital.HospitalName || "Unknown Hospital"}, IP Address: ${clientIp}, API Name: ${req.originalUrl}, Method: ${req.method}, User Agent: ${req.headers["user-agent"]}`
    //   }
    // );

    logger.logWithMeta(
      "warn",
      `Hospital with HospitalCode ${HospitalCode} found successfully`,
      {
        executionTime,
        logId,
        statusCode: 200,
        hospitalId: req.hospitalId,
        hospitalName: hospital.HospitalName || "Unknown Hospital",
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    //
    //
    //
    //
    res.status(200).json({
      meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
      data: {
        Hospitaltoken,
        expiresInMinutes: `${expiresInMinutes} min`,
        MFAEnabled: hospital.MFAEnabled,
        hospital: {
          hospitalId: hospital.HospitalID,
          hospitalDatabase: hospital.HospitalDatabase,
          hospitalGroupIDR: hospital.HospitalGroupIDR,
          hospitalName: hospital.HospitalName,
        },
        message: "Database name found successfully",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 919;
    // Log error finding hospital
    logger.logWithMeta("warn", `Error finding hospital`, {
      errorCode,
      logId,
      statusCode: 500,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: `Error finding hospital: ${error.message}` },
    });
  }
};



exports.login = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);

  // Check validation errors
  if (!errors.isEmpty()) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 920;
    const statusCode = 400;
    logger.logWithMeta("warn", `Validation errors occurred during login`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      hospitalName: req.hospitalName,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
    return res.status(400).json({
      meta: {
        statusCode: statusCode,
        errorCode: 920,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const { Username, Password } = req.body;


  const Hospitaltoken = req.headers["authorization"];
  console.log("SessionToken", Hospitaltoken);

  try {


    // const secretKey = "mKJDnzbwLQxPriGj";  // Replace with actual key
    // const Password = "U2FsdGVkX1/VSkATXE/GCBNOA/mAhXYvaYpGCwm8T2o=";
    // const secretKey = process.env.SYSTEM_SECRET_KEY;

    // Encrypt
    // const encrypted = CryptoJS.AES.encrypt(Password, secretKey).toString();

    // console.log('Encrypted:', encrypted);

    // Decrypt
    // const decryptedBytes = CryptoJS.AES.decrypt(Password, secretKey);

    // const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

    // console.log('Decrypted:', decryptedPassword);


    const secretKey = process.env.SYSTEM_SECRET_KEY;
    //  const Password = "moin";

    // Encrypt
    // const encrypted = CryptoJS.AES.encrypt(Password, secretKey).toString();

    // console.log('Encrypted:', encrypted);

    // Decrypt
    const decryptedBytes = CryptoJS.AES.decrypt(Password, secretKey);
    const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

    console.log('Decrypted:', decryptedPassword);







    const hospital = await Hospital.findOne({ where: { Username } });

    // Check if hospital is found
    if (!hospital) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 921;
      const statusCode = 404;
      logger.logWithMeta("warn", `Hospital with Username "${Username}" not found`, {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        hospitalName: req.hospitalName,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(404).json({
        meta: {
          statusCode: statusCode,
          errorCode: 921,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital not found",
        },
      });
    }

    // Log and compare passwords
    console.log('Password from request:', decryptedPassword);
    console.log('Password from database:', hospital.Password); // Log the database password

    const passwordMatch = await bcrypt.compare(decryptedPassword, hospital.Password);

    console.log("passwordMatch:::", passwordMatch)

    // If password doesn't match
    if (!passwordMatch) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 922;
      const statusCode = 401;

      // Log the warning for incorrect password
      logger.logWithMeta("warn", `Incorrect password for hospital with Username ${Username}`, {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        hospitalName: req.hospitalName,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(401).json({
        meta: {
          statusCode: statusCode,
          errorCode: 922,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Incorrect password",
        },
      });
    }

    // Generate or retrieve session token
    const existingToken = await getAsync(hospital.HospitalID.toString());
    let SessionToken = existingToken;

    if (!existingToken) {
      SessionToken = jwt.sign(
        {
          hospitalId: hospital.HospitalID,
          hospitalDatabase: hospital.HospitalDatabase,
          hospitalGroupIDR: hospital.HospitalGroupIDR,
          hospitalName: hospital.HospitalName,
          ManagingCompanyAdd1: hospital.ManagingCompanyAdd1,
          ManagingCompanyEmail: hospital.ManagingCompanyEmail,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Store new token in Redis with expiration time
      await setAsync(hospital.HospitalID.toString(), SessionToken, "EX", 24 * 60 * 60);
    }

    const decodedToken = jwt.verify(SessionToken, process.env.JWT_SECRET);

    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decodedToken.exp - currentTime;
    const expiresInMinutes = Math.floor(expiresIn / 60);

    console.log(`Token expires in: ${expiresIn} seconds`);
    console.log("Decoded Token:", decodedToken);

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log successful login
    logger.logWithMeta(
      "info",
      `Hospital with ID ${decodedToken.hospitalId} logged in successfully`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        hospitalName: req.hospitalName,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      }
    );

    // Respond with session token and expiration time
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        SessionToken,
        expiresInMinutes: `${expiresInMinutes} min`,
        hospital: {
          id: decodedToken.hospitalId,
          username: hospital.Username,
          email: hospital.Email,
          hospitalDatabase: hospital.HospitalDatabase,
          HospitalGroupIDR: hospital.HospitalGroupIDR,
          HospitalName: decodedToken.hospitalName,
          ManagingCompanyAdd1: hospital.ManagingCompanyAdd1,
          ManagingCompanyEmail: hospital.ManagingCompanyEmail,
        },
        message: "Login successful and token generated.",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 923;
    const statusCode = 500;

    // Log error
    logger.logWithMeta("warn", `Error logging in`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: {
        statusCode: statusCode,
        errorCode: 923,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error logging in: " + error.message,
      },
    });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // const end = Date.now();
    // logger.warn('Validation errors occurred during password reset request', { errors, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 924;
    const statusCode = 400;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Validation errors occurred during password reset request`,
      {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    return res.status(400).json({
      meta: {
        statusCode: statusCode,
        errorCode: 924,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const uniqueKey = req.headers["x-unique-key"];

  if (!uniqueKey) {
    // const end = Date.now();
    // logger.error('Missing unique key in request headers', { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 925;
    const statusCode = 400;
    // Log the warning
    logger.logWithMeta("warn", `Missing unique key in request headers`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    return res.status(400).json({
      meta: {
        statusCode: statusCode,
        errorCode: 925,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Missing unique key in request headers",
      },
    });
  }

  try {
    // Find hospital by uniqueKey
    const hospital = await Hospital.findOne({
      where: { UniqueKey: uniqueKey },
    });
    if (!hospital) {
      // const end = Date.now();
      // logger.warn(`Hospital with UniqueKey ${uniqueKey} not found`, { executionTime: `${end - start}ms` });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 926;
      const statusCode = 404;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `Hospital with UniqueKey ${uniqueKey} not found`,
        {
          errorCode,
          statusCode,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );

      return res.status(404).json({
        meta: {
          statusCode: statusCode,
          errorCode: 926,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital not found",
        },
      });
    }

    // Ensure managingCompanyEmail is available
    const managingCompanyEmail = hospital.ManagingCompanyEmail;
    if (!managingCompanyEmail) {
      //       const end = Date.now();
      // logger.error(`Hospital with UniqueKey ${uniqueKey} does not have a ManagingCompanyEmail`, { executionTime: `${end - start}ms` });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 927;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta(
        "warn",
        `Hospital with UniqueKey ${uniqueKey} does not have a ManagingCompanyEmail`,
        {
          errorCode,
          statusCode,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      return res.status(400).json({
        meta: {
          statusCode: statusCode,
          errorCode: 927,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital does not have a managing company email",
        },
      });
    }
    const crypto = require("crypto");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // 1 hour from now

    hospital.ResetToken = resetToken;
    hospital.ResetTokenExpires = resetTokenExpires;
    await hospital.save({ fields: ["ResetToken", "ResetTokenExpires"] });

    const resetLink = `http://localhost:3000/api/v1/hospital/reset-password${resetToken}`;

    // Use the sendEmail function
    const emailResponse = await sendEmail(
      managingCompanyEmail,
      "Password Reset Request",
      `You requested a password reset. Click the link to reset your password: ${resetLink}`
    );

    if (emailResponse.meta.statusCode !== 200) {
      throw new Error("Failed to send reset email ");
    }
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Password reset link sent to ${managingCompanyEmail}`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );

    // logger.info(`Password reset link sent to ${managingCompanyEmail}`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password reset link sent successfully",
      },
    });
  } catch (error) {
    // const end = Date.now();
    // logger.error('Error requesting password reset', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 928;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error requesting password reset`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    res.status(500).json({
      meta: {
        statusCode: statusCode,
        errorCode: 928,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error requesting password reset: " + error.message,
      },
    });
  }
};

exports.resetPassword = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { token, newPassword } = req.body;

  try {
    const hospital = await Hospital.findOne({
      where: {
        ResetToken: token,
        ResetTokenExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!hospital) {
      // const end = Date.now();
      // logger.warn('Invalid or expired reset token', { executionTime: `${end - start}ms` });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 929;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta("warn", `Invalid or expired reset token`, {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });

      return res.status(400).json({
        meta: {
          statusCode: statusCode,
          errorCode: 929,
        },
        error: {
          message: "Invalid or expired reset token",
        },
      });
    }

    // Hash the new password
    // const SALT_ROUNDS = 10;
    // const salt = await bcrypt.genSalt(SALT_ROUNDS);
    // const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    // logger.info(`New password hashed: ${hashedNewPassword}`);

    // Save the new password
    hospital.Password = newPassword;
    await hospital.save({ fields: ["Password"] });

    // Log the password stored in the database
    const storedPassword = hospital.Password;
    logger.info(`Password stored in database: ${storedPassword}`);

    // Reload the hospital instance from the database to ensure the password was saved correctly
    await hospital.reload();
    logger.info(`Reloaded password from database: ${hospital.Password}`);

    // Verify that the saved password matches the hashed password
    // const isMatch = await bcrypt.compare(newPassword, hospital.Password);
    // logger.info(`Passwords match: ${isMatch}`);
    // if (!isMatch) {
    //   logger.error('Password mismatch: hashed password does not match stored password');
    //   logger.error(`New password: ${newPassword}`);
    //   logger.error(`Hashed password: ${hashedNewPassword}`);
    //   logger.error(`Stored password: ${hospital.Password}`);
    //   return res.status(500).json({
    //     meta: {
    //       statusCode: 500,
    //       errorCode: 962
    //     },
    //     error: {
    //       message: 'Error resetting password: password mismatch'
    //     }
    //   });
    // }

    // Clear reset token and expiration time
    hospital.ResetToken = null;
    hospital.ResetTokenExpires = null;
    await hospital.save({ fields: ["ResetToken", "ResetTokenExpires"] });
    logger.info("Reset token and expiration time cleared in the database");
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Password reset successfully for hospital with email ${hospital.Email}`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.info(`Password reset successfully for hospital with email ${hospital.Email}`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password reset successfully",
      },
    });
  } catch (error) {
    // const end = Date.now();
    // logger.error('Error resetting password', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 930;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error resetting password`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(500).json({
      meta: {
        statusCode: statusCode,
        errorCode: 930,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error resetting password: " + error.message,
      },
    });
  }
};

exports.changePassword = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // const end = Date.now();
    // logger.info('Validation errors occurred', { errors, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 931;
    const statusCode = 400;

    // Log the warning
    logger.logWithMeta("warn", `Validation errors occurred`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 931,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const { currentPassword, newPassword } = req.body;
  const uniqueKey = req.headers["x-unique-key"];

  try {
    const hospital = await Hospital.findOne({
      where: { UniqueKey: uniqueKey },
    });
    if (!hospital) {
      // const end = Date.now();
      // logger.warn('Hospital not found with provided unique key', { uniqueKey, executionTime: `${end - start}ms` });

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 932;
      const statusCode = 404;
      // Log the warning
      logger.logWithMeta(
        "warn",
        `Hospital not found with provided unique key`,
        {
          errorCode,
          statusCode,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 932,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital not found",
        },
      });
    }

    // Uncomment this section if you want to verify the current password

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      hospital.Password
    );
    if (!passwordMatch) {
      // const end = Date.now();
      // logger.warn('Current password is incorrect', { executionTime: `${end - start}ms` });

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 933;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta("warn", `Current password is incorrect`, {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 933,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Current password is incorrect",
        },
      });
    }

    // const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    // logger.info(`New password hashed: ${hashedNewPassword}`);

    hospital.Password = newPassword;

    // Save the new password to the database
    await hospital.save({ fields: ["Password"] });

    // Log the password after it has been saved to the database
    const updatedHospital = await Hospital.findOne({
      where: { UniqueKey: uniqueKey },
    });
    logger.info(`New password stored in database: ${updatedHospital.Password}`);

    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Password changed successfully for hospital with email ${hospital.ManagingCompanyEmail}`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.info(`Password changed successfully for hospital with email ${hospital.ManagingCompanyEmail}`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
      },
      data: {
        message: "Password changed successfully",
      },
    });
  } catch (error) {
    //     const end = Date.now();
    // logger.error('Error changing password', { error: error.message, executionTime: `${end - start}ms` });

    const end = Date.now();

    const executionTime = `${end - start}ms`;
    const errorCode = 934;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error changing password`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 934,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error changing password: " + error.message,
      },
    });
  }
};

exports.changeEmail = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    // logger.info('Validation errors occurred', errors);
    const executionTime = `${end - start}ms`;
    const errorCode = 935;
    const statusCode = 400;
    // Log the warning
    logger.logWithMeta("warn", `Validation errors occurred`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 935,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const { ManagingCompanyEmail } = req.body;
  const uniqueKey = req.headers["x-unique-key"];

  try {
    const hospital = await Hospital.findOne({
      where: { UniqueKey: uniqueKey },
    });
    if (!hospital) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 935;
      const statusCode = 404;
      // Log the warning
      logger.logWithMeta("warn", `Validation errors occurred`, {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      //       const end = Date.now();
      // logger.warn('Hospital not found with provided unique key', { uniqueKey: providedUniqueKey, executionTime: `${end - start}ms` });

      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 935,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital not found",
        },
      });
    }

    // Update hospital's email
    hospital.ManagingCompanyEmail = ManagingCompanyEmail;
    await hospital.save({ fields: ["ManagingCompanyEmail"] });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Email updated successfully for hospital with unique key ${uniqueKey}`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.info(`Email updated successfully for hospital with unique key ${uniqueKey}`, { uniqueKey, executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Email changed successfully",
      },
    });
  } catch (error) {
    //     const end = Date.now();
    // logger.error('Error changing email', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 936;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta("warn", `Error changing email`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 936,
      },
      error: {
        message: "Error changing email: " + error.message,
      },
    });
  }
};

exports.ensureSequelizeInstance = (req, res, next) => {
  const start = Date.now();
  // const clientIp = await getClientIp(req);

  if (!req.hospitalDatabase) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 937;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Database connection not established`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // logger.error('Database connection not established', { executionTime: `${end - start}ms` });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 937,
        executionTime: `${end - start}ms`,
      },

      error: {
        message: "Database connection not established",
      },
    });
  }

  const sequelize = new Sequelize(
    req.hospitalDatabase,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
    }
  );

  req.sequelize = sequelize;
  // logger.info('Sequelize instance created successfully');
  const end = Date.now();
  const executionTime = `${end - start}ms`;
  // Log the warning
  // logger.logWithMeta("warn", `Sequelize instance created successfully`, {
  //   executionTime,
  //   statusCode: 200,
  //   hospitalId: req.hospitalId,
  //   // ip: clientIp,
  //   apiName: req.originalUrl, // API name
  //   method: req.method,
  //   userAgent: req.headers["user-agent"], // HTTP method
  // });
  next();

  sequelize
    .sync({ alter: true })
    .then(() => {
      console.log("Database synchronized successfully.");
    })
    .catch((error) => {
      console.error("Error synchronizing the database:", error);
    });
};

const ENCRYPT_SECRET_KEY1 = process.env.ENCRYPT_SECRET_KEY2;


const encryptAES = (text, secretKey) => {
  try {
    console.log("Encrypting text:", text);
    console.log("Using secret key:", secretKey);
    return CryptoJS.AES.encrypt(text, secretKey).toString();
  } catch (error) {
    console.error("Encryption Error:", error.message);
    throw new Error("Error during encryption");
  }
};


exports.createUser = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { name, username, phone, email, password, empid, usertype, role_id } = req.body;// role_id added
  const hospitalId = req.hospitalId;
  const hospitalDatabase = req.hospitalDatabase;

  try {
    if (!password) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 938;

      // Log the warning
      logger.logWithMeta("warn", `Password is required`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
      throw new Error("Password is required");
    }

    const User = require("../models/user")(req.sequelize);
    await User.sync();

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 940;

      // Log the warning
      logger.logWithMeta("warn", `Email already exists`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 940,
          executionTime,
          hospitalDatabase,
        },
        error: { message: "Email already exists." },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a unique token
    const verificationToken = uuidv4();

    const encodeBase64 = (text) => Buffer.from(text).toString("base64");

    let encryptedDB = encryptAES(hospitalDatabase, ENCRYPT_SECRET_KEY1);
    let encryptedtoken = encryptAES(verificationToken, process.env.ENCRYPT_SECRET_KEY3);
    encryptedtoken = encodeBase64(encryptedtoken)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    encryptedDB = encodeBase64(encryptedDB);

    const user = await User.create({
      username,
      password: hashedPassword,
      hospitalId,
      name,
      phone,
      email,
      empid,
      usertype,
      role_id,   // ✅ ROLE ID ADDED HERE
      emailtoken: encryptedtoken,
      createdBy: hospitalId,
    });

    // const verificationLink = `http://localhost:3000/api/v1/hospital/verify/${encryptedtoken}?db=${encryptedDB}`;
    const verificationLink = `http://${process.env.HOST}:3000/api/v1/hospital/verify/${encryptedtoken}?db=${encryptedDB}`;

    await sendUserEmail(
      email,
      "Verify Your Email",
      `Click this link to verify your email: ${verificationLink}`
    );

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    logger.logWithMeta(
      "warn",
      `User created successfully. Verification email sent`,
      {
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      }
    );
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: { user },
      message: "User created successfully. Verification email sent.",
    });
  } catch (error) {
    console.log("Error:::", error)
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 939;

    logger.logWithMeta("warn", `Error creating user`, {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 939,
        executionTime,
        hospitalDatabase,
      },
      error: { message: "Error creating user: " + error.message },
    });
  }
};


const decryptAES = (encryptedText, secretKey) => {
  const start = Date.now();
  // const clientIp = await getClientIp(req);
  try {
    console.log("Decrypting text**********:", encryptedText);
    console.log("Using secret key************:", secretKey);

    if (!encryptedText || !secretKey) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 940;

      // Log the warning
      logger.logWithMeta("warn", `Missing encrypted text or secret key`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        // ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });

      throw new Error("Missing encrypted text or secret key");
    }

    const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 941;

      // Log the warning
      logger.logWithMeta("warn", `Decryption resulted in an empty string`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        // ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      throw new Error("Decryption resulted in an empty string");
    }

    return decrypted;
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 942;

    // Log the warning
    logger.logWithMeta("warn", `Error during decryption`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    console.error("Decryption Error:", error.message);
    throw new Error("Error during decryption");
  }
};

const decodeBase64 = (text) => Buffer.from(text, "base64").toString("utf8");

// const decryptAEStoken = (encryptedtoken, secretKey) => {
//   try {
//     console.log('Decrypting text**********:', encryptedtoken);
//     console.log('Using secret key************:', secretKey);

//     if (!encryptedtoken || !secretKey) {
//       throw new Error('Missing encrypted text or secret key');
//     }

//     const bytes = CryptoJS.AES.decrypt(encryptedtoken, secretKey);
//     const decryptedtoken = bytes.toString(CryptoJS.enc.Utf8);

//     if (!decryptedtoken) {
//       throw new Error('Decryption decryptedtoken in an empty string');
//     }

//     return decryptedtoken;
//   } catch (error) {
//     console.error('Decryption Error:', error.message);
//     throw new Error('Error during decryptedtoken');
//   }
// };

// const decodeBase64token = (text) => Buffer.from(text, 'base64').toString('utf8');

exports.verifyEmail = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { token } = req.params;
  // let token = req.params.token.replace(/-/g, '+').replace(/_/g, '/');
  const hospitalDatabase = req.query.db;

  try {
    if (!hospitalDatabase || !token) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 943;

      // Log the warning
      logger.logWithMeta("warn", `Missing database name or token`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      throw new Error("Missing database name or token");
    }

    const decodedDB = decodeBase64(hospitalDatabase);

    // const decodetoken = decodeBase64token(token);
    // const decodedToken = decodeBase64(token);

    console.log("Decoded DB//////:", decodedDB);

    // console.log('Decoded Token////////:', decodetoken);

    const decryptedDB = decryptAES(decodedDB, ENCRYPT_SECRET_KEY1);

    // const decryptedToken = decryptAEStoken(decodetoken, process.env.ENCRYPT_SECRET_KEY3);

    console.log("Decrypted DB.......:", decryptedDB);
    // console.log('Decrypted Token......:', decryptedToken);

    if (!decryptedDB || !token) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 944;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `Decryption failed or resulted in an empty string`,
        {
          errorCode,

          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 944,
          executionTime: `${Date.now() - start}ms`,
        },
        error: { message: "Decryption failed or resulted in an empty string" },
      });
    }

    const sequelize = new Sequelize(
      decryptedDB,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false,
      }
    );

    const User = require("../models/user")(sequelize);

    // const user = await User.findOne({ where: { emailtoken: decryptedToken } });
    const user = await User.findOne({ where: { emailtoken: token } });

    console.log("User found:", user);

    if (!user) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 945;

      // Log the warning
      logger.logWithMeta("warn", `Invalid or expired verification token`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 945,
          executionTime: `${Date.now() - start}ms`,
        },
        error: { message: "Invalid or expired verification token" },
      });
    }

    user.is_emailVerify = true;
    user.emailtoken = null;
    await user.save();
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Email verified successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    res.status(200).json({
      meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
      data: { message: "Email verified successfully" },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 946;

    // Log the warning
    logger.logWithMeta("warn", `Error verifying email`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    console.error("Verification Error:", error.message);
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 946,
        executionTime: `${Date.now() - start}ms`,
      },
      error: { message: "Error verifying email: " + error.message },
    });
  }
};


exports.resendVerificationEmail = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { email } = req.body;
  const User = require("../models/user")(req.sequelize);



  try {


    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 947;

      // Log the warning
      logger.logWithMeta("warn", `Email is not registered`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 947,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Email is not registered",
        },
      });
    }

    if (user.is_emailVerify == 1) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 948;

      // Log the warning
      logger.logWithMeta("warn", `Email is already verified`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      return res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 948,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Email is already verified",
        },
      });
    }

    const hospitalDatabase = req.hospitalDatabase;
    console.log("hospitalDatabase", hospitalDatabase);

    // Create a unique token
    let verificationToken = uuidv4();

    // Convert to Base64 and remove special characters
    const encodeBase64 = (text) => Buffer.from(text).toString("base64");

    let encryptedDB = encryptAES(hospitalDatabase, ENCRYPT_SECRET_KEY1);

    let encryptedtoken = encryptAES(
      verificationToken,
      process.env.ENCRYPT_SECRET_KEY3
    );
    encryptedtoken = encodeBase64(encryptedtoken);

    encryptedtoken = encryptedtoken
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    encryptedDB = encodeBase64(encryptedDB);

    // Save the email token to the user
    user.emailtoken = encryptedtoken;
    await user.save();

    // Construct the verification link
    const verificationLink = `http://${process.env.HOST}:3000/api/v1/hospital/verify/${encryptedtoken}?db=${encryptedDB}`;

    /////////////

    const secretKey = process.env.SYSTEM_SECRET_KEY;
    const encrypted = CryptoJS.AES.encrypt(verificationLink, secretKey).toString();
    const urlSafeEncrypted = encodeURIComponent(encrypted); // Make it URL-safe

    console.log("Encrypted (URL Safe):", urlSafeEncrypted);

    // Decrypt
    const decryptedBytes = CryptoJS.AES.decrypt(decodeURIComponent(urlSafeEncrypted), secretKey);
    const decryptedLink = decryptedBytes.toString(CryptoJS.enc.Utf8);

    console.log("Decrypted Link:", decryptedLink);


    ///////////////







    // Resend the verification email
    await sendUserEmail(
      user.email,
      "Resend Verification Email",
      `Click this link to verify your email: ${verificationLink}`
    );

    // const end = Date.now();
    // logger.info(`Verification email resent to ${user.email}`, { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Verification email resent to ${user.email}`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // Correctly log the error when in the catch block

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Verification email resent successfully",
      },
    });
  } catch (error) {
    // const end = Date.now();
    // logger.error('Error resending verification email', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 949;

    // Log the warning
    logger.logWithMeta("warn", `Error resending verification email`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 949,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error resending verification email: " + error.message,
      },
    });
  }
};
exports.getUser = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;

  try {
    const User = require("../models/user")(req.sequelize);
    const user = await User.findByPk(id);

    if (!user) {
      // const end = Date.now();
      // logger.warn(`User with ID ${id} not found`, { executionTime: `${end - start}ms` });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 950;

      // Log the warning
      logger.logWithMeta("warn", `User with ID ${id} not found`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 950,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "User not found",
        },
      });
    }
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `User with ID ${id} retrieved successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // const end = Date.now();
    // logger.info(`User with ID ${id} retrieved successfully`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        userId: user.userId,
        username: user.username,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    // const end = Date.now();
    // logger.error('Error retrieving user', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 951;

    // Log the warning
    logger.logWithMeta("warn", `Error retrieving user ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 951,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error retrieving user: " + error.message,
      },
    });
  }
};

exports.updateUser = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;
  const { name, phone, email, empid, usertype, role_id } = req.body; //role_id added

  try {
    const User = require("../models/user")(req.sequelize);
    const user = await User.findByPk(id);

    if (!user) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 952;

      // Log the warning
      logger.logWithMeta("warn", `User with ID ${id} not found`, {
        errorCode,
        errorMessage: "User not found",
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode,
          executionTime,
        },
        error: {
          message: "User not found",
        },
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (empid) user.empid = empid;
    if (usertype) user.usertype = usertype;
    if (role_id) user.role_id = role_id;  // ⭐ role_id update added here


    await user.save();

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the success message
    logger.logWithMeta("info", `User with ID ${id} updated successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        empid: user.empid,
        usertype: user.usertype,
        role_id: user.role_id,  // ⭐ role_id added in response
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 953;

    // Log the error
    logger.logWithMeta("error", `Error updating user: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
      },
      error: {
        message: `Error updating user: ${error.message}`,
      },
    });
  }
};


exports.deleteUser = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;

  try {
    const User = require("../models/user")(req.sequelize);
    const user = await User.findByPk(id);

    if (!user) {
      // const end = Date.now();
      // logger.warn(`User with ID ${id} not found`, { executionTime: `${end - start}ms` });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 954;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `User with ID ${id} not found}`,
        {
          errorCode,
          errorMessage: error.message,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 954,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "User not found",
        },
      });
    }

    await user.destroy();

    // const end = Date.now();
    // logger.info(`User with ID ${id} deleted successfully`, { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `User with ID ${id} deleted successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // Correctly log the error when in the catch block
    logger.logWithMeta("warn", `User with ID ${id} deleted successfully`, {
      // errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "User deleted successfully",
      },
    });
  } catch (error) {
    //     const end = Date.now();
    // logger.error('Error deleting user', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 955;

    // Log the warning
    logger.logWithMeta("warn", `Error deleting user${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 955,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error deleting user: " + error.message,
      },
    });
  }
};
exports.getAllUsers = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  try {
    const User = require("../models/user")(req.sequelize);
    const users = await User.findAll();

    //     const end = Date.now();
    // logger.info(`Retrieved all users successfully`, { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Retrieved all users successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // Correctly log the error when in the catch block

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: users,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 956;

    // Log the warning
    logger.logWithMeta("warn", `Error retrieving all users${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // const end = Date.now();
    // logger.error('Error retrieving all users', { error: error.message, executionTime: `${end - start}ms` });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 956,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error retrieving all users: " + error.message,
      },
    });
  }
};
exports.getAllUsersByPagination = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5; // Default limit is 5, adjust as per your requirement

  const offset = (page - 1) * limit;

  try {
    const totalCount = await User(req.sequelize).count();
    const users = await User(req.sequelize).findAll({
      offset,
      limit,
      order: [["createdAt", "ASC"]], // Example ordering by createdAt, adjust as per your requirement
    });
    // const end = Date.now();
    // logger.info(`Retrieved users for page ${page} with limit ${limit} successfully`, { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `get all users successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // Correctly log the error when in the catch block

    res.status(200).json({
      meta: {
        statusCode: 200,
        totalCount,
        page,
        limit,
        executionTime: `${end - start}ms`,
      },
      data: users,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 957;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Error retrieving users with pagination${error.message}`,
      {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    //     const end = Date.now();
    // logger.error('Error retrieving users with pagination', { error: error.message, executionTime: `${end - start}ms` });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 957,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error retrieving users with pagination: " + error.message,
      },
    });
  }
};

exports.loginUser = async (req, res) => {
  const start = Date.now();
  const logId = uuidv4();
  const clientIp = await getClientIp(req);
  const { Username, Password } = req.body;


  const secretKey = process.env.SYSTEM_SECRET_KEY;
  //   const Pass="1234"
  // // Encrypt
  // const encrypted = CryptoJS.AES.encrypt(Password, secretKey).toString();
  console.log('Encrypted00000000000:', Password);

  // Decrypt
  const decryptedBytes = CryptoJS.AES.decrypt(Password, secretKey);
  const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

  console.log('Decrypted0000:', decryptedPassword);


  if (!Username || !decryptedPassword) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 958;
    const statusCode = 400;
    // Log the warning
    logger.logWithMeta("warn", `Username or Password not provided`, {
      errorCode,
      logId,
      statusCode,
      errorMessage: "Username and Password are required",
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 958,
        executionTime,
      },
      error: {
        message: "Username and Password are required",
      },
    });
  }

  try {
    const User = require("../models/user")(req.sequelize);
    const user = await User.findOne({ where: { username: Username } });

    if (!user || !(await bcrypt.compare(decryptedPassword, user.password))) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 959;
      const statusCode = 401;
      // Log the warning
      logger.logWithMeta("warn", `Invalid username or password`, {
        errorCode,
        logId,
        statusCode,
        errorMessage: "Invalid username or password",
        executionTime,
        hospitalId: req.hospitalId,
        hospitalName: req.hospitalName,
        username: Username,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 959,
          executionTime,
        },
        error: {
          message: "Invalid username or password",
        },
      });
    }

    if (user.is_emailVerify !== "1" || user.phoneverify !== "1") {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 960;
      const statusCode = 403;

      // Log the warning
      logger.logWithMeta("warn", `Email or phone not verified`, {
        errorCode,
        logId,
        statusCode,
        errorMessage: "Email or phone not verified",
        executionTime,
        hospitalId: req.hospitalId,
        username: Username,
        hospitalName: req.hospitalName,
        username: Username,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 960,
          executionTime,
        },
        error: {
          message:
            "Email or phone not verified. Please verify email and phone.",
        },
      });
    }

    // Check if the user already has a valid token in Redis
    const existingToken = await getAsync(user.userId.toString());
    let AccessToken = existingToken;

    // If token is not present, generate a new one
    if (!existingToken) {
      const payload = {
        userId: user.userId,
        username: user.username,
        HospitalId: user.hospitalId,
        email: user.email,
      };

      AccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      await setAsync(user.userId.toString(), AccessToken, "EX", 24 * 60 * 60);
    }

    const decodedToken = jwt.decode(AccessToken);
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decodedToken.exp - currentTime;
    const expiresInMinutes = Math.floor(expiresIn / 60);

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log success
    logger.logWithMeta("info", `Login successful`, {
      executionTime,
      logId,
      statusCode: 200,
      hospitalId: req.hospitalId,
      hospitalName: req.hospitalName,
      username: Username,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
console.log("llllalaall",user)
    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: {
        AccessToken,
        expiresInMinutes: `${expiresInMinutes} min`,
        user: {
          id: user.userId,
          username: user.username,
          email: user.email,
          roleId:user.role_id,
        },
        message: "Login successful",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 961;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error logging in: ${error.message}`, {
      errorCode,
      logId,
      statusCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      hospitalName: req.hospitalName,
      username: Username,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 961,
        executionTime,
      },
      error: {
        message: "Error logging in: " + error.message,
      },
    });
  }
};

exports.sendOtp = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const logId = uuidv4();
  // Extract token from headers
  const token = req.headers["accesstoken"];

  console.log("token:::", token)

  if (!token) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 962;
    const statusCode = 401;
    // Log the warning
    logger.logWithMeta("warn", "No access token provided", {
      errorCode,
      logId,
      statusCode,
      errorMessage: "Access token is required",
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // User agent
    });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 962,
        executionTime,
      },
      error: {
        message: "Access token is required",
      },
    });
  }

  try {
    // Verify and decode the JWT token (assuming Bearer format)
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    const email = decoded.email;

    console.log("email:::", decoded)

    if (!email) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 963;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta("warn", "No email found in access token", {
        errorCode,
        logId,
        statusCode,
        errorMessage: "Email is required in the access token",
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // User agent
      });

      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 963,
          executionTime,
        },
        error: {
          message: "Email is required in the access token",
        },
      });
    }

    // Generate a 6-digit OTP using Math.random
    const otp = Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999

    // Store OTP in Redis with a 5-minute expiration
    const userId = decoded.userId; // Assuming userId is part of the token
    const expirationTime = 5 * 60; // 5 minutes in seconds
    await setAsync(`otp_${userId}`, otp.toString(), "EX", expirationTime);

    // Prepare email content
    const emailSubject = "Your OTP Code";
    const emailBody = `Your OTP code is ${otp}. It is valid for 5 minutes.`;

    // Send email
    await sendUserEmail(email, emailSubject, emailBody);

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log success message
    logger.logWithMeta("info", "OTP sent successfully to email", {
      executionTime,
      statusCode: 200,
      logId,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // User agent
    });

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: {
        message: "OTP sent successfully to your email",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 964;
    const statusCode = 500;
    // Log the error with error message
    logger.logWithMeta("warn", `Error sending OTP: ${error.message}`, {
      errorCode,
      statusCode,
      logId,
      errorMessage: error.message, // Properly access error message
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // User agent
    });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 964,
        executionTime,
      },
      error: {
        message: `Error sending OTP: ${error.message}`,
      },
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const logId = uuidv4();

  // Extract token from headers
  const token = req.headers["accesstoken"];

  if (!token) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 965;
    const statusCode = 401;
    // Log the warning
    logger.logWithMeta("warn", `No access token provided ${error.message}`, {
      errorCode,
      logId,
      statusCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // const end = Date.now();
    // logger.error('No access token provided', { executionTime: `${end - start}ms` });
    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 965,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Access token is required",
      },
    });
  }

  try {
    // Verify and decode the JWT token
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1212;

      // Correctly log the error when in the catch block
      logger.logWithMeta("warn", `Invalid token format`, {
        errorCode,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
      });
      throw new Error("Invalid token format");
    }

    const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
    logger.info("Decoded token:", decoded);

    const userId = decoded.userId; // Get userId from decoded token
    console.log("userId*******", userId);
    const { otp } = req.body; // OTP from the request body

    if (!otp) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 966;
      const statusCode = 400;

      // Log the warning
      logger.logWithMeta("warn", `No OTP provided ${error.message}`, {
        errorCode,
        logId,
        statusCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      // const end = Date.now();
      // logger.error('No OTP provided', { executionTime: `${end - start}ms` });
      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 966,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "OTP is required",
        },
      });
    }

    // Fetch the OTP from Redis
    const storedOtp = await getAsync(`otp_${userId}`);
    console.log("storedOtp****", storedOtp);

    if (!storedOtp) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 967;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta("warn", `OTP expired or not found ${error.message}`, {
        errorCode,
        logId,
        statusCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      // const end = Date.now();
      // logger.error('OTP expired or not found', { executionTime: `${end - start}ms` });
      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 967,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "OTP expired or not found",
        },
      });
    }

    if (otp !== storedOtp) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 968;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta("warn", `Invalid OTP ${error.message}`, {
        errorCode,
        statusCode,
        logId,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      // logger.error('Invalid OTP', { executionTime: `${end - start}ms` });
      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 968,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Invalid OTP",
        },
      });
    }
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `OTP verified successfully`, {
      executionTime,
      logId,
      statusCode: 200,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // // Correctly log the error when in the catch block
    // logger.logWithMeta("warn", `OTP verified successfully`, {
    //   // errorCode,
    //   // errorMessage: error.message,
    //   executionTime,
    //   // hospitalId: req.hospitalId,
    // });
    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "OTP verified successfully",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 969;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error verifying OTP `, {
      errorCode,
      statusCode,
      logId,
      // errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // const end = Date.now();
    // logger.error('Error verifying OTP', { error: error.message, executionTime: `${end - start}ms` });
    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 969,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error verifying OTP: ",
      },
    });
  }
};

exports.getProfile = (req, res) => {
  const start = Date.now();
  // const clientIp = await getClientIp(req);
  const token = req.headers["authorization"];

  if (!token) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 970;
    const statusCode = 401;
    // Log the warning
    logger.logWithMeta("warn", `No token provided${error.message}`, {
      errorCode,
      // logId,
      statusCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    logger.warn("No token provided");
    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 970,
        message: "No token provided",
      },
    });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET); // Adjust the secret as necessary
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `get all user successfully`, {
      executionTime,
      // logId,
      hospitalId: req.hospitalId,
      statusCode: 200,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // // Correctly log the error when in the catch block
    // logger.logWithMeta("warn", ` get all user successfully`, {

    //   executionTime,
    //   // hospitalId: req.hospitalId,
    // });
    res.status(200).json({
      meta: {
        statusCode: 200,
      },
      data: {
        userId: decoded.userId || "Unknown",
        hospitalId: decoded.hospitalId || "Unknown",
        // Add other fields you have in the token
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1155;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Failed to authenticate token${error.message}`, {
      errorCode,
      // logId,
      statusCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // logger.error('Failed to authenticate token', { error: error.message });
    res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 1155,
        message: "Failed to authenticate token",
      },
    });
  }
};

exports.requestUserPasswordReset = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { User } = require("../models/user");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1156;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Validation errors occurred during password reset request`,
      {
        errorCode,
        logId,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.warn('Validation errors occurred during password reset request', { errors, executionTime: `${end - start}ms` });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1156,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const { email } = req.body;

  if (!email) {
    logger.error("Email not provided", { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1157;

    // Log the warning
    logger.logWithMeta("warn", `Email is required`, {
      errorCode,
      logId,
      // errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1157,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Email is required",
      },
    });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1158;

      // Log the warning
      logger.logWithMeta("warn", `User with email ${email} not found`, {
        errorCode,
        logId,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      logger.warn(`User with email ${email} not found`, {
        executionTime: `${end - start}ms`,
      });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 1158,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "User not found",
        },
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `http://localhost:3000/api/v1/hospital/reset-Userpassword/${resetToken}`;

    const emailResponse = await sendEmail(
      email,
      "Password Reset Request",
      `You requested a password reset. Click the link to reset your password: ${resetLink}`
    );

    if (emailResponse.meta.statusCode !== 200) {
      throw new Error("Failed to send reset email");
    }

    // logger.info(`Password reset link sent to ${email}`, { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Password reset link sent to ${email}`, {
      executionTime,
      logId,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password reset link sent successfully",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1159;

    // Log the warning
    logger.logWithMeta("warn", `Error requesting password reset`, {
      errorCode,
      logId,
      // errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    logger.error("Error requesting password reset", {
      error: error.message,
      executionTime: `${end - start}ms`,
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1159,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error requesting password reset: " + error.message,
      },
    });
  }
};
exports.resetuserPassword = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1160;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Validation errors occurred during password reset`,
      {
        errorCode,
        logId,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    logger.warn("Validation errors occurred during password reset", {
      errors,
      executionTime: `${end - start}ms`,
    });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1160,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1161;

      // Log the warning
      logger.logWithMeta("warn", `Invalid or expired reset token`, {
        errorCode,
        logId,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      logger.warn("Invalid or expired reset token", {
        executionTime: `${end - start}ms`,
      });

      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 1161,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Invalid or expired reset token",
        },
      });
    }

    const SALT_ROUNDS = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    user.password = hashedNewPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Password reset successfully for user with email ${user.email}`,
      {
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.info(`Password reset successfully for user with email ${user.email}`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password reset successfully",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1162;

    // Log the warning
    logger.logWithMeta("warn", `Error resetting password'`, {
      errorCode,
      logId,
      // errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // logger.error('Error resetting password', { error: error.message, executionTime: `${end - start}ms` });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1162,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error resetting password: " + error.message,
      },
    });
  }
};

exports.decodeToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const start = Date.now();


  // const clientIp = await getClientIp(req);
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const AccessToken = authHeader.split(" ")[1]; // Assuming the token is in the format "Bearer <token>"

  try {
    const decoded = jwt.verify(AccessToken, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debugging log
    req.user = decoded; // Attach the decoded token to the request object
    next();
  } catch (error) {
    console.error("Token verification failed:", error); // Debugging log
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

exports.changeuserPassword = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { oldPassword, newPassword, ConfirmPassword } = req.body;

  if (!oldPassword || !newPassword || !ConfirmPassword) {
    const end = Date.now();
    logger.error("All password fields are required", {
      executionTime: `${end - start}ms`,
    });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1050,
        executionTime: `${end - start}ms`,
      },
      error: {
        message:
          "Old password, new password, and re-enter new password are required",
      },
    });
  }

  if (newPassword !== ConfirmPassword) {
    const end = Date.now();
    logger.error("New passwords do not match", {
      executionTime: `${end - start}ms`,
    });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1051,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "New passwords do not match",
      },
    });
  }

  try {
    console.log("req.user:", req.user); // Debugging log to check if req.user is set

    if (!req.user) {
      throw new Error("User ID is not defined in the token");
    }

    // Check if User model is loaded correctly
    // if (!User || typeof User.findOne !== 'function') {
    //   throw new Error('User model is not correctly defined or loaded');
    // }

    const user = await User.findOne({ where: { userId: req.user.userId } });
    console.log("user,ConfirmPassword", user)

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      const end = Date.now();
      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 1052,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Old password is incorrect",
        },
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Password updated successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password updated successfully",
      },
    });
  } catch (error) {
    console.error("Error in changePassword:", error); // Debugging log
    const end = Date.now();
    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1053,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error updating password: " + error.message,
      },
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { email } = req.body;

  if (!email) {
    const end = Date.now();
    logger.error("Email not provided", { executionTime: `${end - start}ms` });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 970,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Email is required",
      },
    });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const end = Date.now();
      logger.warn("User not found with provided email", {
        email,
        executionTime: `${end - start}ms`,
      });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 971,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "User not found",
        },
      });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour

    // Save token and expiration to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send email with the reset token
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Use your email service
      auth: {
        user: "asad94758@gmail.comm", // Your email
        pass: "nysg fofo uppg drvz", // Your email password
      },
    });

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset/${resetToken}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    // logger.info(`Password reset token sent to ${email}`, { email, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Password reset token sent to ${email}`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password reset token sent successfully",
      },
    });
  } catch (error) {
    const end = Date.now();
    logger.error("Error in forgot password", {
      error: error.message,
      executionTime: `${end - start}ms`,
    });

    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 972,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error in forgot password: " + error.message,
      },
    });
  }
};

exports.resetPassword = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    const end = Date.now();
    logger.error("Token or new password not provided", {
      executionTime: `${end - start}ms`,
    });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 973,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Token and new password are required",
      },
    });
  }

  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      const end = Date.now();
      logger.warn("Invalid or expired token", {
        token,
        executionTime: `${end - start}ms`,
      });

      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 974,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Invalid or expired token",
        },
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear the reset token and expiration
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // logger.info('Password reset successfully', { userId: user.userId, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Password reset successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password reset successfully",
      },
    });
  } catch (error) {
    const end = Date.now();
    logger.error("Error in resetting password", {
      error: error.message,
      executionTime: `${end - start}ms`,
    });

    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 975,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error in resetting password: " + error.message,
      },
    });
  }
};
