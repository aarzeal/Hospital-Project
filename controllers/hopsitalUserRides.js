// const { Module, Submodule, UserRides } = require('../models');
const { Module } = require('../models/HospitalModules');
const { Submodule } = require('../models/hospitalsubmodule');
const { UserRides } = require('../models/hospitalUserRides');
const logger = require('../logger');

// Controller for handling POST request to create a user ride
exports.createUserRide = async (req, res) => {
  try {
    const newUserRide = await UserRides.create(req.body);
    res.json({
      meta: {
        status: 'success',
        errorCode: null,
        message: 'User ride created successfully'
      },
      data: newUserRide
    });
  } catch (error) {
    logger.error('Error during creating user rides:', error.message);
    res.status(400).json({
      meta: {
        status: 'error',
        errorCode: 944,
        message: error.message
      }
    });
  }
};

// Controller for handling GET request to fetch all user rides
exports.getAllUserRides = async (req, res) => {
  try {
    const userRides = await UserRides.findAll();
    logger.info('All user rides retrieved successfully');
    res.json({
      meta: {
        status: 'success',
        errorCode: null,
        message: 'All user rides retrieved successfully'
      },
      data: userRides
    });
  } catch (error) {
    logger.error('Error retrieving user rides:', error.message);
    res.status(400).json({
      meta: {
        status: 'error',
        errorCode: 945,
        message: error.message
      }
    });
  }
};

// Controller for handling PUT request to update a user ride by ID
exports.updateUserRide = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await UserRides.update(req.body, {
      where: { id }
    });
    if (updated) {
      const updatedUserRide = await UserRides.findOne({ where: { id } });
      res.json({
        meta: {
          status: 'success',
          errorCode: null,
          message: 'User ride updated successfully'
        },
        data: updatedUserRide
      });
    } else {
      throw new Error('User ride not found');
    }
  } catch (error) {
    res.status(400).json({
      meta: {
        status: 'error',
        errorCode: 946,
        message: error.message
      }
    });
  }
};

// Controller for fetching submodule names associated with user rides
exports.fetchSubmoduleNames = async (req, res) => {
  try {
    const { userId } = req.params;
    const userRides = await UserRides.findAll({
      where: { user_id: userId },
      include: { model: Submodule, attributes: ['name'] }
    });
    const submoduleNames = userRides.map(ride => ride.Submodule.name);
    res.json({
      meta: {
        status: 'success',
        errorCode: null,
        message: 'Submodule names retrieved successfully'
      },
      data: submoduleNames
    });
  } catch (error) {
    res.status(400).json({
      meta: {
        status: 'error',
        errorCode: 947,
        message: error.message
      }
    });
  }
};

exports.fetchModuleAndSubmoduleNames = async (req, res) => {
  try {
    const { userId } = req.params;
    const userRides = await UserRides.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Module,
          attributes: ['name'],
          include: {
            model: Submodule,
            attributes: ['name']
          }
        }
      ]
    });

    const moduleAndSubmoduleNames = userRides.map(ride => ({
      moduleName: ride.Module.name,
      submoduleNames: ride.Module.Submodules.map(submodule => submodule.name)
    }));

    res.json({
      meta: {
        status: 'success',
        errorCode: null,
        message: 'Module and submodule names retrieved successfully'
      },
      data: moduleAndSubmoduleNames
    });
  } catch (error) {
    logger.error('Error retrieving module and submodule names:', error.message);
    res.status(400).json({
      meta: {
        status: 'error',
        errorCode: 948,
        message: error.message
      }
    });
  }
};
