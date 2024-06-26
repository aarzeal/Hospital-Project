const { body } = require('express-validator');
// const User = require('../models/user'); 

exports.createHospitalValidationRules = () => {
  return [
    body('HospitalName')
      .notEmpty().withMessage('Hospital Name is required')
      .isLength({ max: 255 }).withMessage('Hospital Name cannot exceed 255 characters')
      .matches(/^[a-zA-Z0-9\s\-.,]+$/).withMessage('Hospital Name can only contain letters, numbers, spaces, hyphens, periods, and commas'),
    body('HospitalCode')
      .notEmpty().withMessage('Hospital Code is required')
      .isLength({ max: 50 }).withMessage('Hospital Code cannot exceed 50 characters'),
    body('ManagingCompany')
      .notEmpty().withMessage('Managing Company is required')
      .isLength({ max: 255 }).withMessage('Managing Company cannot exceed 255 characters'),
    body('ManagingCompanyEmail')
      .notEmpty().withMessage('Managing Company Email is required')
      .isEmail().withMessage('Managing Company Email must be a valid email address')
      .isLength({ max: 255 }).withMessage('Managing Company Email cannot exceed 255 characters'),
    body('City')
      .notEmpty().withMessage('City is required')
      .isLength({ max: 255 }).withMessage('City cannot exceed 255 characters'),
    body('Province')
      .notEmpty().withMessage('Province is required')
      .isLength({ max: 255 }).withMessage('Province cannot exceed 255 characters'),
    body('Country')
      .notEmpty().withMessage('Country is required')
      .isLength({ max: 255 }).withMessage('Country cannot exceed 255 characters'),
    body('HospitalOwner')
      .notEmpty().withMessage('Hospital Owner is required')
      .isLength({ max: 255 }).withMessage('Hospital Owner cannot exceed 255 characters'),
    body('OwnerName')
      .notEmpty().withMessage('Owner Name is required')
      .isLength({ max: 255 }).withMessage('Owner Name cannot exceed 255 characters'),
    body('OwnerCity')
      .notEmpty().withMessage('Owner City is required')
      .isLength({ max: 255 }).withMessage('Owner City cannot exceed 255 characters'),
    body('OwnerCountry')
      .notEmpty().withMessage('Owner Country is required')
      .isLength({ max: 255 }).withMessage('Owner Country cannot exceed 255 characters'),
    body('OwnerEmail')
      .notEmpty().withMessage('Owner Email is required')
      .isEmail().withMessage('Owner Email must be a valid email address')
      .isLength({ max: 255 }).withMessage('Owner Email cannot exceed 255 characters'),
    body('ServiceNo')
      .notEmpty().withMessage('Service No is required')
      .isLength({ max: 50 }).withMessage('Service No cannot exceed 50 characters'),
    body('RegistrationNo')
      .notEmpty().withMessage('Registration No is required')
      .isLength({ max: 50 }).withMessage('Registration No cannot exceed 50 characters'),
  ];
};

exports.updateHospitalValidationRules = () => {
  return [
    body('HospitalName')
      .optional()
      .isLength({ max: 255 }).withMessage('Hospital Name cannot exceed 255 characters')
      .matches(/^[a-zA-Z0-9\s\-.,]+$/).withMessage('Hospital Name can only contain letters, numbers, spaces, hyphens, periods, and commas'),
    body('HospitalCode')
      .optional()
      .isLength({ max: 50 }).withMessage('Hospital Code cannot exceed 50 characters'),
    body('ManagingCompany')
      .optional()
      .isLength({ max: 255 }).withMessage('Managing Company cannot exceed 255 characters'),
    body('ManagingCompanyEmail')
      .optional()
      .isEmail().withMessage('Managing Company Email must be a valid email address')
      .isLength({ max: 255 }).withMessage('Managing Company Email cannot exceed 255 characters'),
    body('City')
      .optional()
      .isLength({ max: 255 }).withMessage('City cannot exceed 255 characters'),
    body('Province')
      .optional()
      .isLength({ max: 255 }).withMessage('Province cannot exceed 255 characters'),
    body('Country')
      .optional()
      .isLength({ max: 255 }).withMessage('Country cannot exceed 255 characters'),
    body('HospitalOwner')
      .optional()
      .isLength({ max: 255 }).withMessage('Hospital Owner cannot exceed 255 characters'),
    body('OwnerName')
      .optional()
      .isLength({ max: 255 }).withMessage('Owner Name cannot exceed 255 characters'),
    body('OwnerCity')
      .optional()
      .isLength({ max: 255 }).withMessage('Owner City cannot exceed 255 characters'),
    body('OwnerCountry')
      .optional()
      .isLength({ max: 255 }).withMessage('Owner Country cannot exceed 255 characters'),
    body('OwnerEmail')
      .optional()
      .isEmail().withMessage('Owner Email must be a valid email address')
      .isLength({ max: 255 }).withMessage('Owner Email cannot exceed 255 characters'),
    body('ServiceNo')
      .optional()
      .isLength({ max: 50 }).withMessage('Service No cannot exceed 50 characters'),
    body('RegistrationNo')
      .optional()
      .isLength({ max: 50 }).withMessage('Registration No cannot exceed 50 characters'),
  ];
};

const User = require('../models/user'); // Adjust the path to your User model

exports.createUserValidationRules = () => {
  return [
    body('name')
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 255 }).withMessage('Name cannot exceed 255 characters'),
    body('phone')
      .notEmpty().withMessage('Phone is required')
      .isLength({ min: 10, max: 15 }).withMessage('Phone must be between 10 and 15 characters')
      .matches(/^[0-9]+$/).withMessage('Phone can only contain numbers'),
    body('username')
      .notEmpty().withMessage('Username is required')
      .isLength({ max: 255 }).withMessage('Username cannot exceed 255 characters')
      .custom(async (value) => {
        const user = await User.findOne({ where: { username: value } });
        if (user) {
          throw new Error('Username is already in use');
        }
      }),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters'),
    body('hospitalId')
      .notEmpty().withMessage('Hospital ID is required')
      .isInt().withMessage('Hospital ID must be an integer'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended']).withMessage('Status must be one of active, inactive, or suspended'),
    body('is_emailVerify')
      .optional()
      .isIn(['yes', 'no']).withMessage('Email verification must be either yes or no'),
    body('usertype')
      .optional()
      .isIn(['admin', 'user', 'guest']).withMessage('User type must be one of admin, user, or guest'),
    body('lockuser')
      .optional()
      .isIn(['yes', 'no']).withMessage('Lock user must be either yes or no'),
    body('phoneverify')
      .optional()
      .isIn(['yes', 'no']).withMessage('Phone verification must be either yes or no'),
  ];
};

exports.updateUserValidationRules = () => {
  return [
    body('name')
      .optional()
      .isLength({ max: 255 }).withMessage('Name cannot exceed 255 characters'),
    body('phone')
      .optional()
      .isLength({ min: 10, max: 15 }).withMessage('Phone must be between 10 and 15 characters')
      .matches(/^[0-9]+$/).withMessage('Phone can only contain numbers'),
    body('username')
      .optional()
      .isLength({ max: 255 }).withMessage('Username cannot exceed 255 characters')
      .custom(async (value, { req }) => {
        if (!value) {
          return true; // Skip uniqueness check if username is not provided in update
        }
        const user = await User.findOne({ where: { username: value } });
        if (user && user.userId !== parseInt(req.params.id, 10)) {
          throw new Error('Username is already in use');
        }
      }),
    body('password')
      .optional()
      .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters'),
    body('hospitalId')
      .optional()
      .isInt().withMessage('Hospital ID must be an integer'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended']).withMessage('Status must be one of active, inactive, or suspended'),
    body('is_emailVerify')
      .optional()
      .isIn(['yes', 'no']).withMessage('Email verification must be either yes or no'),
    body('usertype')
      .optional()
      .isIn(['admin', 'user', 'guest']).withMessage('User type must be one of admin, user, or guest'),
    body('lockuser')
      .optional()
      .isIn(['yes', 'no']).withMessage('Lock user must be either yes or no'),
    body('phoneverify')
      .optional()
      .isIn(['yes', 'no']).withMessage('Phone verification must be either yes or no'),
  ];
};
