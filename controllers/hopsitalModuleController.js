
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const logger = require('../logger');  // Assuming logger is configured properly in '../logger'
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.creatmodules = async (req, res) => {
    const { modules_name } = req.body;
    const hospitalId = req.hospitalId;
  
    try {
     
     
      const UserModules = require('../models/HospitalModules')(req.sequelize);
  
      // Ensure the table exists
      await UserModules.sync();
  
      const userModules = await UserModules.create({ modules_name,hospitalId  });
      logger.info(`User created successfully with username: ${modules_name}, hospitalId: ${hospitalId}`);
  
      res.status(201).json({
        meta: {
          statusCode: 200
        },
        data: {
            modules_Id: userModules.modules_Id,
          modules_name: userModules.modules_name
        }
      });
    } catch (error) {
      logger.error('Error creating Modules', { error: error.message });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 938
        },
        error: {
          message: 'Error creating modules: ' + error.message
        }
      });
    }
  };
 exports.getModule = async (req, res) => {
    const { modules_Id } = req.body;
    console.log(modules_Id)
  
    try {
      const UserModules = require('../models/HospitalModules')(req.sequelize);

      const userModules = await UserModules.findByPk(modules_Id);
  
      if (!userModules) {
        logger.warn(`module with ID ${modules_Id} not found`);
        return res.status(404).json({
          meta: {
            statusCode: 404,
            errorCode: 939
          },
          error: {
            message: 'module not found'
            
          }
        });
      }
  
      logger.info(`User with ID ${modules_Id} retrieved successfully`);
      
      res.status(200).json({
        meta: {
          statusCode: 200
        },
        data: {
            modules_Id: userModules.modules_Id,
            modules_name: userModules.modules_name
        }
      });
    } catch (error) {
      logger.error('Error retrieving Modules', { error: error.message });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 940
        },
        error: {
          message: 'Error retrieving Modules: ' + error.message
        }
      });
    }
  };
  
  exports.updateModule = async (req, res) => {
    const { modules_Id } = req.body;
    const { modules_name } = req.body;
  
    try {
      const UserModules = require('../models/HospitalModules')(req.sequelize);
      const userModules = await UserModules.findByPk(modules_Id);
  
      if (!userModules) {
        logger.warn(`User with ID ${modules_Id} not found`);
        return res.status(404).json({
          meta: {
            statusCode: 404,
            errorCode: 941
          },
          error: {
            message: 'Module not found'
          }
        });
      }
  
      if (modules_name) userModules.modules_name = modules_name;
      
  
      await userModules.save();
  
      logger.info(`User with ID ${modules_Id} updated successfully`);
      res.status(200).json({
        meta: {
          statusCode: 200
        },
        data: {
            modules_Id: userModules.modules_Id,
            modules_name: userModules.modules_name
        }
      });
    } catch (error) {
      logger.error('Error updating user', { error: error.message });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 942
        },
        error: {
          message: 'Error updating user: ' + error.message
        }
      });
    }
  };



