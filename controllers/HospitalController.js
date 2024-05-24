const { validationResult } = require('express-validator');
const Hospital = require('../models/HospitalModel');
const sequelize = require('../database/connection');

// exports.createHospital = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 908
//       },
//       error: {
//         message: 'Validation errors occurred',
//         details: errors.array().map(err => ({
//           field: err.param,
//           message: err.msg
//         }))
//       }

//     });
//   }

//   try {
//     const hospital = await Hospital.create(req.body);
//     res.status(200).json({
//       meta: {
//         statusCode: 200
//       },
//       data: hospital
//     });
//   } catch (error) {
//     res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 909
//       },
//       error: {
//         message: 'Error creating hospital: ' + error.message
//       }
//     });
//   }
// };


exports.createHospital = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 908
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

  try {
    const hospital = await Hospital.create(req.body);

    // Generate database name (e.g., from HospitalName)
    const databaseName = hospital.HospitalName.replace(/\s+/g, '_').toLowerCase();

    // Check if database exists (MySQL specific query)
    const [databases] = await sequelize.query(`SHOW DATABASES LIKE '${databaseName}'`);

    if (databases.length === 0) {
      // Create new database
      await sequelize.query(`CREATE DATABASE \`${databaseName}\``);
    }

    // Associate hospital with database (store the association in your application's database)
    // Add code here if you need to store this association

    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: hospital
    });
  } catch (error) {
    res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 909
      },
      error: {
        message: 'Error creating hospital: ' + error.message
      }
    });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.findAll();
    res.json({
      meta: {
        statusCode: 200
      },
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 910
      },
      error: {
        message: 'Error retrieving hospitals: ' + error.message
      }
    });
  }
};

exports.getHospitalById = async (req, res) => {
  const id = req.params.id;
  try {
    const hospital = await Hospital.findByPk(id);
    if (!hospital) {
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 911
        },
        error: {
          message: 'Hospital not found'
        }
      });
    } else {
      res.json({
        meta: {
          statusCode: 200
        },
        data: hospital
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 912
      },
      error: {
        message: 'Error retrieving hospital: ' + error.message
      }
    });
  }
};

exports.updateHospital = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 913
      },
      error: {
        message: errors.array().map(err => err.msg).join(', ')
      }
    });
  }

  const id = req.params.id;
  try {
    const [updatedRows] = await Hospital.update(req.body, {
      where: { HospitalID: id }
    });
    if (updatedRows === 0) {
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 914
        },
        error: {
          message: 'Hospital not found'
        }
      });
    } else {
      res.json({
        meta: {
          statusCode: 200
        },
        message: 'Hospital updated successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 915
      },
      error: {
        message: 'Error updating hospital: ' + error.message
      }
    });
  }
};

exports.deleteHospital = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedRows = await Hospital.destroy({
      where: { HospitalID: id }
    });
    if (deletedRows === 0) {
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 916
        },
        error: {
          message: 'Hospital not found'
        }
      });
    } else {
      res.json({
        meta: {
          statusCode: 200
        },
        message: 'Hospital deleted successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 917
      },
      error: {
        message: 'Error deleting hospital: ' + error.message
      }
    });
  }
};
