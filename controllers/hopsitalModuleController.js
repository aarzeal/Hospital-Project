
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const logger = require('../logger');  // Assuming logger is configured properly in '../logger'
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.creatmodules = async (req, res) => {
  const start = Date.now();
    const { modules_name } = req.body;
    const hospitalId = req.hospitalId;
  
    try {
     
     
      const UserModules = require('../models/HospitalModules')(req.sequelize);
  
      // Ensure the table exists
      await UserModules.sync();
  
      const userModules = await UserModules.create({ modules_name,hospitalId  });
      const end = Date.now();
      logger.info(`User created successfully with username: ${modules_name}, hospitalId: ${hospitalId}, executionTime: ${end - start}ms`);
  
      res.status(201).json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`
        },
        data: {
            modules_Id: userModules.modules_Id,
          modules_name: userModules.modules_name
        }
      });
    } catch (error) {
      const end = Date.now();
      logger.error('Error creating Modules', { error: error.message, executionTime: `${end - start}ms` });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 938,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Error creating modules: ' + error.message
        }
      });
    }
  };
 exports.getModule = async (req, res) => {
  const start = Date.now();
    const { modules_Id } = req.body;
    console.log(modules_Id)
  
    try {
      const UserModules = require('../models/HospitalModules')(req.sequelize);

      const userModules = await UserModules.findByPk(modules_Id);
  
      if (!userModules) {
        const end = Date.now();
        logger.warn(`module with ID ${modules_Id} not found, executionTime: ${end - start}ms`);
        return res.status(404).json({
          meta: {
            statusCode: 404,
            errorCode: 939,
            executionTime: `${end - start}ms`
          },
          error: {
            message: 'module not found'
            
          }
        });
      }
  
      const end = Date.now();
      logger.info(`User with ID ${modules_Id} retrieved successfully,executionTime: ${end - start}ms`);
      
      res.status(200).json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`
        },
        data: {
            modules_Id: userModules.modules_Id,
            modules_name: userModules.modules_name
        }
      });
    } catch (error) {
      const end = Date.now();
      logger.error('Error retrieving Modules', { error: error.message , executionTime: `${end - start}ms`});
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 940,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Error retrieving Modules: ' + error.message
        }
      });
    }
  };
  exports.getAllModules = async (req, res) => {
    const start = Date.now();
    
    try {
      const UserModules = require('../models/HospitalModules')(req.sequelize);
  
      // Fetch all modules
      const allModules = await UserModules.findAll();
  
      // If no modules found
      if (!allModules || allModules.length === 0) {
        const end = Date.now();
        logger.warn(`No modules found, executionTime: ${end - start}ms`);
        return res.status(404).json({
          meta: {
            statusCode: 404,
            errorCode: 941,
            executionTime: `${end - start}ms`
          },
          error: {
            message: 'No modules found'
          }
        });
      }
  
      const end = Date.now();
      logger.info(`Modules retrieved successfully, executionTime: ${end - start}ms`);
      
      // Return all modules
      res.status(200).json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`
        },
        data: allModules.map(module => ({
          modules_Id: module.modules_Id,
          modules_name: module.modules_name
        }))
      });
    } catch (error) {
      const end = Date.now();
      logger.error('Error retrieving all modules', { error: error.message, executionTime: `${end - start}ms` });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 942,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Error retrieving modules: ' + error.message
        }
      });
    }
  };
  
  exports.updateModule = async (req, res) => {
    const start = Date.now();
    const { modules_Id } = req.body;
    const { modules_name } = req.body;
  
    try {
      const UserModules = require('../models/HospitalModules')(req.sequelize);
      const userModules = await UserModules.findByPk(modules_Id);
  
      if (!userModules) {
        const end = Date.now();
        logger.warn(`User with ID ${modules_Id} not found, executionTime: ${end - start}ms`);
        return res.status(404).json({
          meta: {
            statusCode: 404,
            errorCode: 941,
            executionTime: `${end - start}ms`
          },
          error: {
            message: 'Module not found'
          }
        });
      }
  
      if (modules_name) userModules.modules_name = modules_name;
      
  
      await userModules.save();
      const end = Date.now();
      logger.info(`User with ID ${modules_Id} updated successfully, executionTime: ${end - start}ms`);
      res.status(200).json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`
        },
        data: {
            modules_Id: userModules.modules_Id,
            modules_name: userModules.modules_name
        }
      });
    } catch (error) {
      const end = Date.now();
      logger.error('Error updating user', { error: error.message , executionTime: `${end - start}ms`});
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 942,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Error updating user: ' + error.message
        }
      });
    }

    
  };



