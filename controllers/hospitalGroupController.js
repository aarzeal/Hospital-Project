const HospitalGroup = require('../models/HospitalGroup');
const config = require('../config/config');
const { body, validationResult } = require('express-validator');
const sequelize = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.loginValidationRules = () => {
  return [
    body('SysUserName').notEmpty().withMessage('Username is required'),
    body('SysUserPwd').notEmpty().withMessage('Password is required')
  ];
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { SysUserName, SysUserPwd } = req.body;

  try {
    // Use parameterized queries to prevent SQL injection
    const [user] = await sequelize.query(
      `SELECT * FROM tblsysuser WHERE SysUserName = ? AND Active = ?`,
      {
        replacements: [SysUserName, 'true'], // Treat 'Active' as a string
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log('User:', user);

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare passwords (bcrypt manages the salt internally)
    const isPasswordValid = await bcrypt.compare(SysUserPwd, user.SysUserPwd);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate authentication token
    const authenticationToken = jwt.sign(
      { userId: user.SysUserID, userType: user.UserType },
      process.env.SUPERCLIENTSECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: authenticationToken });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

exports.createHospitalGroup = async (req, res) => {
  try {
    const hospitalGroup = await HospitalGroup.create(req.body);
    res.status(200).json({
      meta: {
        statusCode: 200,
        errorCode: 0
      },
      data: hospitalGroup
    });
  } catch (error) {
    res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 900
      },
      error: {
        message: 'Error creating hospital group: ' + error.message
      }
    });
  }
};

exports.getAllHospitalGroups = async (req, res) => {
  try {
    const hospitalGroups = await HospitalGroup.findAll();
    res.status(200).json({
      meta: {
        statusCode: 200,
        errorCode: 0
      },
      data: hospitalGroups
    });
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 901
      },
      error: {
        message: 'Error retrieving hospital groups: ' + error.message
      }
    });
  }
};

exports.getHospitalGroupById = async (req, res) => {
  const id = req.params.id;
  try {
    const hospitalGroup = await HospitalGroup.findByPk(id);
    if (!hospitalGroup) {
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 902
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 0
        },
        data: hospitalGroup
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 903
      },
      error: {
        message: 'Error retrieving hospital group: ' + error.message
      }
    });
  }
};

exports.updateHospitalGroup = async (req, res) => {
  const id = req.params.id;
  try {
    // Exclude HospitalGroupID from being updated
    const { HospitalGroupName, LicensedHospitalCount } = req.body;
    
    const [updatedRows] = await HospitalGroup.update(
      { HospitalGroupName, LicensedHospitalCount },
      {
        where: { HospitalGroupID: id }
      }
    );

    if (updatedRows === 0) {
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 904
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 0
        },
        data: {
          message: 'Hospital group updated successfully'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 905
      },
      error: {
        message: 'Error updating hospital group: ' + error.message
      }
    });
  }
};


exports.deleteHospitalGroup = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedRows = await HospitalGroup.destroy({
      where: { HospitalGroupID: id }
    });
    if (deletedRows === 0) {
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 906
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 0
        },
        data: {
          message: 'Hospital group deleted successfully'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 907
      },
      error: {
        message: 'Error deleting hospital group: ' + error.message
      }
    });
  }
};
