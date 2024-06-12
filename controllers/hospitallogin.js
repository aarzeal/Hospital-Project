const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../logger'); // Assuming logger is configured properly in '../logger'
const Hospital = require('../models/HospitalModel');
const sequelize = require('../database/connection');

// Hardcoded credentials
const STATIC_USERNAME = 'Hospital2'; // Corrected typo here
const STATIC_PASSWORD = 'Pass@1234';

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors occurred during login', errors);
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 923
      },
      error: {
        message: 'Validation errors occurred',
        details: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      }
    });
  }

  const { Username, Password } = req.body;

  logger.info(`Received login request for Username: ${Username}`);

  try {
    // Check if the username matches the static credentials
    if (Username !== STATIC_USERNAME || Password !== STATIC_PASSWORD) {
      logger.warn(`Incorrect username or password for username ${Username}`);
      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 925
        },
        error: {
          message: 'Incorrect username or password'
        }
      });
    }

    // Find the hospital in the database
    const hospital = await Hospital.findOne({ where: { Username: STATIC_USERNAME } });
    if (!hospital) {
      logger.warn(`Hospital with Username ${STATIC_USERNAME} not found`);
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 924
        },
        error: {
          message: 'Hospital not found'
        }
      });
    }

    // Generate JWT token
    const Hospitaltoken = jwt.sign(
      { hospitalId: hospital.HospitalID, hospitalDatabase: hospital.HospitalDatabase },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Decode the token to retrieve the hospitalId
    const decodedToken = jwt.verify(Hospitaltoken, process.env.JWT_SECRET);

    logger.info(`Hospital with ID ${decodedToken.hospitalId} logged in successfully`);
    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: {
        Hospitaltoken,
        hospital: {
          id: decodedToken.hospitalId,
          username: hospital.Username,
          email: hospital.Email
        }
      }
    });
  } catch (error) {
    logger.error('Error logging in', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 926
      },
      error: {
        message: 'Error logging in: ' + error.message
      }
    });
  }
};
