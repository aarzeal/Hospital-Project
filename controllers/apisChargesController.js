


// controllers/chargesController.js
const CountAPI = require('../models/ApisCounts');
const Charges = require('../models/apichargaes');
const { Op } = require('sequelize');
const logger = require('../logger');



// exports.calculateCharges = async (req, res) => {
//   const { Apiname, hospitalId } = req.body;

//   try {
//     // Get the count of API calls from CountAPI table
//     const apiCallCount = await CountAPI.count({
//       where: {
//         Apiname,
//         hospitalId
//       }
//     });

//     // Get the charge rate for the API from Charges table
//     const chargeData = await Charges.findOne({
//       where: {
//         Apiname,
//         hospitalId
//       }
//     });

//     if (!chargeData) {
//       return res.status(404).json({ message: 'Charges not found for this API' });
//     }

//     // Calculate the total charges
//     const totalCharges = apiCallCount * chargeData.chargeRate;

//     // Send the response with total charges
//     return res.status(200).json({
//       Apiname,
//       hospitalId,
//       apiCallCount,
//       chargeRate: chargeData.chargeRate,
//       totalCharges
//     });

//   } catch (error) {
//     console.error('Error calculating charges:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };




// exports.calculateCharges = async (req, res) => {
//   const { Apiname, hospitalId, startDate, endDate, hoursAgo } = req.body;

//   try {
//     // Determine the time range based on hoursAgo or specific dates
//     let whereConditions = {
//       Apiname,
//       hospitalId
//     };

//     if (hoursAgo) {
//       const currentTime = new Date();
//       const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
//       whereConditions.createdAt = {
//         [Op.between]: [pastTime, currentTime]
//       };
//     } else if (startDate && endDate) {
//       whereConditions.createdAt = {
//         [Op.between]: [new Date(startDate), new Date(endDate)]
//       };
//     }

//     // Get the count of API calls from CountAPI table
//     const apiCallCount = await CountAPI.count({
//       where: whereConditions
//     });

//     // Get the charge rate for the API from Charges table
//     const chargeData = await Charges.findOne({
//       where: {
//         Apiname,
//         hospitalId
//       }
//     });

//     if (!chargeData) {
//       return res.status(404).json({ message: 'Charges not found for this API' });
//     }

//     // Calculate the total charges
//     const totalCharges = apiCallCount * chargeData.chargeRate;

//     // Send the response with total charges
//     return res.status(200).json({
//       Apiname,
//       hospitalId,
//       apiCallCount,
//       chargeRate: chargeData.chargeRate,
//       totalCharges
//     });

//   } catch (error) {
//     console.error('Error calculating charges:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };


// exports.calculateCharges = async (req, res) => {
//   const { Apiname, hospitalId, startDate, endDate, hoursAgo } = req.body;

//   try {
//     let whereConditions = {
//       Apiname,
//       hospitalId
//     };

//     if (hoursAgo) {
//       const currentTime = new Date();
//       const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
//       whereConditions.createdAt = {
//         [Op.between]: [pastTime, currentTime]
//       };
//     } else if (startDate && endDate) {
//       // Adjust endDate to include the entire day
//       const adjustedEndDate = new Date(endDate);
//       adjustedEndDate.setHours(23, 59, 59, 999); // Set to end of the day

//       whereConditions.createdAt = {
//         [Op.between]: [new Date(startDate), adjustedEndDate]
//       };
//     }

//     // Get the count of API calls from CountAPI table
//     const apiCallCount = await CountAPI.count({
//       where: whereConditions
//     });

//     // Get the charge rate for the API from Charges table
//     const chargeData = await Charges.findOne({
//       where: {
//         Apiname,
//         hospitalId
//       }
//     });

//     if (!chargeData) {
//       return res.status(404).json({ message: 'Charges not found for this API' });
//     }

//     // Calculate the total charges
//     const totalCharges = apiCallCount * chargeData.chargeRate;

//     // Send the response with total charges
//     return res.status(200).json({
//       Apiname,
//       hospitalId,
//       apiCallCount,
//       chargeRate: chargeData.chargeRate,
//       totalCharges
//     });

//   } catch (error) {
//     console.error('Error calculating charges:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };




// exports.createCharge = async (req, res) => {
//   const { Apiname, hospitalId, chargeRate } = req.body;

//   try {
//     // Check if all required fields are present
//     if (!Apiname  || !hospitalId || !chargeRate) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Create a new charge entry
//     const newCharge = await Charges.create({
//       Apiname,
      
//       hospitalId,
//       chargeRate
//     });

//     // Return the newly created charge
//     return res.status(200).json({
//       message: 'Charge created successfully',
//       charge: newCharge
//     });

//   } catch (error) {
//     console.error('Error creating charge:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };






exports.createCharge = async (req, res) => {
  const start = Date.now();
  const { Apiname, hospitalId, chargeRate } = req.body;

  try {
    // Check if all required fields are present
    if (!Apiname || !hospitalId || !chargeRate) {
      const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1096;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `Charge creation failed: Missing required fields`, {
      errorCode,
      // errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });
      // logger.warn('Charge creation failed: Missing required fields', { errorCode: 1096 });
      return res.status(400).json({
        errorCode: 1096,
        message: 'All fields (Apiname, hospitalId, chargeRate) are required.'
      });
    }

    // Create a new charge entry
    const newCharge = await Charges.create({
      Apiname,
      hospitalId,
      chargeRate
    });

    // Log success message
    logger.info('Charge created successfully', { Apiname, hospitalId, chargeRate });

    // Return the newly created charge
    return res.status(200).json({
      message: 'Charge created successfully',
      charge: newCharge
    });

  } catch (error) {
    // Log the error message
    // logger.error('Error creating charge', { errorCode: 1097, error: error.message });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1097;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `Error creating charge:${error.message}`, {
      errorCode,
      errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });
    // Return internal server error with proper error code
    return res.status(500).json({
      errorCode: 1097,
      message: 'Internal server error. Unable to create charge.'
    });
  }
};
exports.calculateCharges = async (req, res) => {
  const start = Date.now();
  const { Apiname, hospitalId, startDate, endDate, hoursAgo } = req.body;

  try {
    let whereConditions = {
      Apiname,
      hospitalId
    };

    if (hoursAgo) {
      const currentTime = new Date();
      const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
      whereConditions.createdAt = {
        [Op.between]: [pastTime, currentTime]
      };
    } else if (startDate && endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999); // Include the entire day
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), adjustedEndDate]
      };
    }

    const apiCallCount = await CountAPI.count({
      where: whereConditions
    });

    const chargeData = await Charges.findOne({
      where: {
        Apiname,
        hospitalId
      }
    });

    if (!chargeData) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1098;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `Charges not found for API:${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.error(`Charges not found for API: ${Apiname}, Hospital: ${hospitalId}`, { errorCode: 1098 });
      return res.status(404).json({
        errorCode: 1098,
        message: 'Charges not found for this API'
      });
    }

    const totalCharges = apiCallCount * chargeData.chargeRate;

    // Success logging
    logger.info(`Charges calculated for API: ${Apiname}, Hospital: ${hospitalId}, Calls: ${apiCallCount}, Total Charges: ${totalCharges}`);

    return res.status(200).json({
      Apiname,
      hospitalId,
      apiCallCount,
      chargeRate: chargeData.chargeRate,
      totalCharges
    });

  } catch (error) {
    const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1099;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `Error calculating charges for API:${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
    // logger.error(`Error calculating charges for API: ${Apiname}, Hospital: ${hospitalId}. Error: ${error.message}`, { errorCode: 1099 });
    return res.status(500).json({
      errorCode: 1099,
      message: 'Internal server error'
    });
  }
};
// exports.calculateChargeswithDetails = async (req, res) => {
//   const { Apiname, hospitalId, startDate, endDate, hoursAgo } = req.body;

//   try {
//     let whereConditions = {
//       Apiname,
//       hospitalId
//     };

//     if (hoursAgo) {
//       const currentTime = new Date();
//       const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
//       whereConditions.createdAt = {
//         [Op.between]: [pastTime, currentTime]
//       };
//     } else if (startDate && endDate) {
//       const adjustedEndDate = new Date(endDate);
//       adjustedEndDate.setHours(23, 59, 59, 999);
//       whereConditions.createdAt = {
//         [Op.between]: [new Date(startDate), adjustedEndDate]
//       };
//     }

//     const apiCalls = await CountAPI.findAll({
//       where: whereConditions,
//       attributes: ['id', 'createdby', 'createdAt', 'userAgent']
//     });

//     const apiCallCount = apiCalls.length;

//     const chargeData = await Charges.findOne({
//       where: {
//         Apiname,
//         hospitalId
//       }
//     });

//     if (!chargeData) {
//       logger.error(`Charges not found for API: ${Apiname}, Hospital: ${hospitalId}`, { errorCode: 1098 });
//       return res.status(404).json({
//         errorCode: 1098,
//         message: 'Charges not found for this API'
//       });
//     }

//     const totalCharges = apiCallCount * chargeData.chargeRate;

//     // Success logging
//     logger.info(`Charges and API details retrieved for API: ${Apiname}, Hospital: ${hospitalId}, Calls: ${apiCallCount}, Total Charges: ${totalCharges}`);

//     return res.status(200).json({
//       Apiname,
//       hospitalId,
//       apiCallCount,
//       chargeRate: chargeData.chargeRate,
//       totalCharges,
//       apiDetails: apiCalls
//     });

//   } catch (error) {
//     logger.error(`Error retrieving API details for API: ${Apiname}, Hospital: ${hospitalId}. Error: ${error.message}`, { errorCode: 1099 });
//     return res.status(500).json({
//       errorCode: 1099,
//       message: 'Internal server error'
//     });
//   }
// };


exports.calculateChargeswithDetails = async (req, res) => {
  const start = Date.now();
  const { Apiname, hospitalId, startDate, endDate, hoursAgo } = req.body;

  try {
    // Validate required parameters
    if (!Apiname || !hospitalId) {
      // logger.error('Missing required fields: Apiname or hospitalId', { errorCode: 1100 });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1100;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `Missing required fields::${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      return res.status(400).json({
        errorCode: 1100,
        message: 'Missing required fields: Apiname or hospitalId'
      });
    }

    let whereConditions = {
      Apiname,
      hospitalId
    };

    // Filter based on hoursAgo or date range
    if (hoursAgo) {
      const currentTime = new Date();
      const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
      whereConditions.createdAt = {
        [Op.between]: [pastTime, currentTime]
      };
    } else if (startDate && endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), adjustedEndDate]
      };
    }

    // Retrieve API call details
    const apiCalls = await CountAPI.findAll({
      where: whereConditions,
      attributes: ['id', 'createdby', 'createdAt', 'userAgent']
    });

    const apiCallCount = apiCalls.length;

    if (apiCallCount === 0) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1101;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `No API calls found for API::${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.warn(`No API calls found for API: ${Apiname}, Hospital: ${hospitalId}`, { errorCode: 1101 });
      return res.status(404).json({
        errorCode: 1101,
        message: 'No API calls found for the given parameters'
      });
    }

    // Retrieve charge data for the API
    const chargeData = await Charges.findOne({
      where: { Apiname, hospitalId }
    });

    if (!chargeData) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1102;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `Charges not found for API::${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.error(`Charges not found for API: ${Apiname}, Hospital: ${hospitalId}`, { errorCode: 1102 });
      return res.status(404).json({
        errorCode: 1102,
        message: 'Charges not found for this API'
      });
    }

    // Calculate total charges
    const totalCharges = apiCallCount * chargeData.chargeRate;

    // Success logging
    logger.info(`Charges and API details retrieved successfully for API: ${Apiname}, Hospital: ${hospitalId}. Calls: ${apiCallCount}, Total Charges: ${totalCharges}`);

    // Send success response with detailed information
    return res.status(200).json({
      message: 'Charges and API call details retrieved successfully',
      Apiname,
      hospitalId,
      apiCallCount,
      chargeRate: chargeData.chargeRate,
      totalCharges,
      apiDetails: apiCalls.map(call => ({
        id: call.id,
        createdBy: call.createdby,
        createdAt: call.createdAt,
        userAgent: call.userAgent
      }))
    });

  } catch (error) {
    logger.error(`Error retrieving API details for API: ${Apiname}, Hospital: ${hospitalId}. Error: ${error.message}`, { errorCode: 1103 });
    return res.status(500).json({
      errorCode: 1103,
      message: 'Internal server error',
      details: error.message
    });
  }
};






// exports.calculateCharges = async (req, res) => {
//   const { Apiname, hospitalId, startDate, endDate, hoursAgo } = req.body;

//   try {
//     let whereConditions = {
//       Apiname,
//       hospitalId
//     };

//     if (hoursAgo) {
//       const currentTime = new Date();
//       const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
//       whereConditions.createdAt = {
//         [Op.between]: [pastTime, currentTime]
//       };
//     } else if (startDate && endDate) {
//       // Adjust endDate to include the entire day
//       const adjustedEndDate = new Date(endDate);
//       adjustedEndDate.setHours(23, 59, 59, 999); // Set to end of the day

//       // Debugging output
//       console.log('Query Range:', {
//         startDate: new Date(startDate).toISOString(),
//         endDate: adjustedEndDate.toISOString()
//       });

//       whereConditions.createdAt = {
//         [Op.between]: [new Date(startDate), adjustedEndDate]
//       };
//     }

//     // Debugging output
//     console.log('Where Conditions:', whereConditions);

//     // Get the count of API calls from CountAPI table
//     const apiCallCount = await CountAPI.count({
//       where: whereConditions
//     });

//     // Get the charge rate for the API from Charges table
//     const chargeData = await Charges.findOne({
//       where: {
//         Apiname,
//         hospitalId
//       }
//     });

//     if (!chargeData) {
//       return res.status(404).json({ message: 'Charges not found for this API' });
//     }

//     // Calculate the total charges
//     const totalCharges = apiCallCount * chargeData.chargeRate;

//     // Send the response with total charges
//     return res.status(200).json({
//       Apiname,
//       hospitalId,
//       apiCallCount,
//       chargeRate: chargeData.chargeRate,
//       totalCharges
//     });

//   } catch (error) {
//     console.error('Error calculating charges:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };
// exports.calculateChargeswithDetails = async (req, res) => {
//   const { Apiname, hospitalId, startDate, endDate, hoursAgo } = req.body;

//   try {
//     let whereConditions = {
//       Apiname,
//       hospitalId
//     };

//     if (hoursAgo) {
//       const currentTime = new Date();
//       const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
//       whereConditions.createdAt = {
//         [Op.between]: [pastTime, currentTime]
//       };
//     } else if (startDate && endDate) {
//       const adjustedEndDate = new Date(endDate);
//       adjustedEndDate.setHours(23, 59, 59, 999); // Include the whole day

//       whereConditions.createdAt = {
//         [Op.between]: [new Date(startDate), adjustedEndDate]
//       };
//     }

//     // Get the count of API calls and the list of details from CountAPI table
//     const apiCalls = await CountAPI.findAll({
//       where: whereConditions,
//       attributes: ['id', 'createdby', 'createdAt', 'userAgent'] // Include the necessary fields
//     });

//     const apiCallCount = apiCalls.length; // Calculate the count based on the retrieved data

//     // Get the charge rate for the API from Charges table
//     const chargeData = await Charges.findOne({
//       where: {
//         Apiname,
//         hospitalId
//       }
//     });

//     if (!chargeData) {
//       return res.status(404).json({ message: 'Charges not found for this API' });
//     }

//     // Calculate the total charges
//     const totalCharges = apiCallCount * chargeData.chargeRate;

//     // Send the response with total charges and the list of API call details
//     return res.status(200).json({
//       Apiname,
//       hospitalId,
//       apiCallCount,
//       chargeRate: chargeData.chargeRate,
//       totalCharges,
//       apiDetails: apiCalls // Send the list of API call details
//     });

//   } catch (error) {
//     console.error('Error calculating charges:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };
