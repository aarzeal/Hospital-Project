// controllers/apisRatesController.js

const ApisRates = require('../models/apichargaes');
const CountAPI = require('../models/ApisCounts');
const logger = require('../logger');

// Create a new ApisRate
exports.createApisRate = async (req, res) => {
  const { Apiname, method, Rate, HospitalId } = req.body;
  const startTime = Date.now();

  try {
    // Ensure that HospitalId exists in CountAPI
    const countAPI = await CountAPI.findByPk(HospitalId);
    if (!countAPI) {
      return res.status(400).json({
        meta: { statusCode: 400, errorCode: 1040 },
        error: { message: 'Invalid HospitalId. No matching entry found in CountAPI.' }
      });
    }

    const newApisRate = await ApisRates.create({
      Apiname,
      method,
      Rate,
      HospitalId
    });
    logger.info(`Created new ApisRate successfully in ${Date.now() - startTime}ms`);
    res.status(201).json({
      meta: { statusCode: 201 },
      data: newApisRate
    });
  } catch (error) {
    logger.error(`Error creating ApisRate: ${error.message} in ${Date.now() - startTime}ms`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1035 },
      error: { message: 'Failed to create ApisRate due to a server error. Please ensure all fields are correctly filled and try again.' }
    });
  }
};

// Get all ApisRates
exports.getAllApisRates = async (req, res) => {
  const startTime = Date.now();

  try {
    const apisRates = await ApisRates.findAll();
    logger.info(`Retrieved all ApisRates successfully in ${Date.now() - startTime}ms`);
    res.status(200).json({
      meta: { statusCode: 200 },
      data: apisRates
    });
  } catch (error) {
    logger.error(`Error retrieving ApisRates: ${error.message} in ${Date.now() - startTime}ms`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1036 },
      error: { message: 'Failed to retrieve ApisRates due to a server error.' }
    });
  }
};

// Get ApisRate by ID
exports.getApisRateById = async (req, res) => {
  const { id } = req.params;
  const startTime = Date.now();

  try {
    const apisRate = await ApisRates.findByPk(id);
    if (!apisRate) {
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1041 },
        error: { message: 'ApisRate not found.' }
      });
    }
    logger.info(`Retrieved ApisRate with ID ${id} successfully in ${Date.now() - startTime}ms`);
    res.status(200).json({
      meta: { statusCode: 200 },
      data: apisRate
    });
  } catch (error) {
    logger.error(`Error retrieving ApisRate with ID ${id}: ${error.message} in ${Date.now() - startTime}ms`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1037 },
      error: { message: 'Failed to retrieve ApisRate due to a server error.' }
    });
  }
};

// Update ApisRate by ID
exports.updateApisRate = async (req, res) => {
  const { id } = req.params;
  const { Apiname, method, Rate, HospitalId } = req.body;
  const startTime = Date.now();

  try {
    const apisRate = await ApisRates.findByPk(id);
    if (!apisRate) {
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1041 },
        error: { message: 'ApisRate not found.' }
      });
    }

    // Ensure that HospitalId exists in CountAPI
    if (HospitalId) {
      const countAPI = await CountAPI.findByPk(HospitalId);
      if (!countAPI) {
        return res.status(400).json({
          meta: { statusCode: 400, errorCode: 1040 },
          error: { message: 'Invalid HospitalId. No matching entry found in CountAPI.' }
        });
      }
    }

    await apisRate.update({ Apiname, method, Rate, HospitalId });
    logger.info(`Updated ApisRate with ID ${id} successfully in ${Date.now() - startTime}ms`);
    res.status(200).json({
      meta: { statusCode: 200 },
      data: apisRate
    });
  } catch (error) {
    logger.error(`Error updating ApisRate with ID ${id}: ${error.message} in ${Date.now() - startTime}ms`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1038 },
      error: { message: 'Failed to update ApisRate due to a server error. Please ensure all fields are correctly filled and try again.' }
    });
  }
};

// Delete ApisRate by ID
exports.deleteApisRate = async (req, res) => {
  const { id } = req.params;
  const startTime = Date.now();

  try {
    const apisRate = await ApisRates.findByPk(id);
    if (!apisRate) {
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1041 },
        error: { message: 'ApisRate not found.' }
      });
    }

    await apisRate.destroy();
    logger.info(`Deleted ApisRate with ID ${id} successfully in ${Date.now() - startTime}ms`);
    res.status(200).json({
      meta: { statusCode: 200 },
      message: 'ApisRate deleted successfully.'
    });
  } catch (error) {
    logger.error(`Error deleting ApisRate with ID ${id}: ${error.message} in ${Date.now() - startTime}ms`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1039 },
      error: { message: 'Failed to delete ApisRate due to a server error.' }
    });
  }
};
