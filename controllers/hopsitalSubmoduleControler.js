
const express = require('express');
const router = express.Router();

const logger = require('../logger');  // Assuming logger is configured properly in '../logger'

const dotenv = require('dotenv');
dotenv.config();

exports.creatsubmodules = async (req, res) => {
    const { submodule_name,modules_Id } = req.body;
    const hospitalId = req.hospitalId;
  
    try {
     
     
      const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
  
      // Ensure the table exists
      await UserSubModules.sync();
  
      const userSubModules = await UserSubModules.create({ submodule_name,modules_Id,hospitalId  });
      logger.info(`User created successfully with username: ${submodule_name}, hospitalId: ${hospitalId}`);
  
      res.status(201).json({
        meta: {
          statusCode: 200
        },
        data: {
            submodule_id: userSubModules.submodule_id,
            submodule_name: userSubModules.submodule_name,
            modules_Id:userSubModules.modules_Id
        }
      });
    } catch (error) {
      logger.error('Error creating subModules', { error: error.message });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 943
        },
        error: {
          message: 'Error creating submodules: ' + error.message
        }
      });
    }
  };
exports.getSubModule = async (req, res) => {
    const { submodule_id } = req.body;
    console.log(submodule_id)
  
    try {
      const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);

      const userSubModules = await UserSubModules.findByPk(submodule_id);
  
      if (!userSubModules) {
        logger.warn(`submodule with ID ${submodule_id} not found`);
        return res.status(404).json({
          meta: {
            statusCode: 404,
            errorCode: 944
          },
          error: {
            message: 'submodule not found'
            
          }
        });
      }
  
      logger.info(`submodule with ID ${submodule_id} retrieved successfully`);
      
      res.status(200).json({
        meta: {
          statusCode: 200
        },
        data: {
            submodule_id: userSubModules.submodule_id,
            submodule_name: userSubModules.submodule_name,
            modules_Id:userSubModules.modules_Id
        }
      });
    } catch (error) {
      logger.error('Error retrieving subModules', { error: error.message });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 945
        },
        error: {
          message: 'Error retrieving subModules: ' + error.message
        }
      });
    }
  };
  
  exports.updateSubModule = async (req, res) => {
    const { submodule_id } = req.body;
    const { submodules_name } = req.body;
  
    try {
      const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
      const userSubModules = await UserSubModules.findByPk(submodule_id);
  
      if (!userSubModules) {
        logger.warn(`User with ID ${submodule_id} not found`);
        return res.status(404).json({
          meta: {
            statusCode: 404,
            errorCode: 946
          },
          error: {
            message: 'subModule not found'
          }
        });
      }
  
      if (submodules_name) userSubModules.submodules_name = submodules_name;
      
  
      await userSubModules.save();
  
      logger.info(`User with ID ${submodule_id} updated successfully`);
      res.status(200).json({
        meta: {
          statusCode: 200
        },
        data: {
            submodule_id: userSubModules.submodule_id,
            submodules_name: userSubModules.submodules_name
        }
      });
    } catch (error) {
      logger.error('Error updating submodules', { error: error.message });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 947
        },
        error: {
          message: 'Error updating submodule: ' + error.message
        }
      });
    }
  };

  exports.getSubModulesByModuleId = async (req, res) => {
    const { modules_Id } = req.body;
    

    logger.info(`Received request for submodules with module_id: ${modules_Id} `);

    if (!modules_Id) {
        logger.warn('Module ID is missing in the request');
        return res.status(400).json({
            meta: {
                statusCode: 400,
                errorCode: 948
            },
            error: {
                message: 'subModule ID is required'
            }
        });
    }

    try {
        const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
        const UserModules = require('../models/HospitalModules')(req.sequelize); // Assuming this is the modules model

        // Find the module for the given module_id and hospitalId
        const module = await UserModules.findOne({ where: { modules_Id } });

        if (!module) {
            logger.warn(`Module with ID ${modules_Id} `);
            return res.status(404).json({
                meta: {
                    statusCode: 404,
                    errorCode: 949
                },
                error: {
                    message: 'subModule not found'
                }
            });
        }

        // Find all submodules for the given module_id and hospitalId
        const subModules = await UserSubModules.findAll({ where: { modules_Id: modules_Id} });

        if (!subModules || subModules.length === 0) {
            logger.warn(`Submodules for module ID ${modules_Id} `);
            return res.status(404).json({
                meta: {
                    statusCode: 404,
                    errorCode: 950
                },
                error: {
                    message: 'Submodules not found'
                }
            });
        }

        // Format the response
        const response = {
            modules_Id: module.modules_Id,
            modules_name: module.modules_name,
            submodules: subModules.map(sub => ({
                submodule_id: sub.submodule_id,
                submodule_name: sub.submodule_name
            }))
        };

        logger.info(`Submodules for module ID ${modules_Id} `);

        res.status(200).json({
            meta: {
                statusCode: 200
            },
            data: response
        });
    } catch (error) {
        logger.error('Error retrieving submodules', { error: error.message });
        res.status(500).json({
            meta: {
                statusCode: 500,
                errorCode: 951
            },
            error: {
                message: 'Error retrieving submodules: ' + error.message
            }
        });
    }
};;

