const { body } = require('express-validator');
// const User = require('../models/user'); 
// const PatientMaster = require('../models/PatientMaster');

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
exports.createPatientValidationRules = () => {
  return [
   
    body('EMRNumber')
      .notEmpty().withMessage('EMR Number is required')
      .isLength({ max: 50 }).withMessage('EMR Number cannot exceed 50 characters'),
    body('HospitalGroupID')
      .optional()
      .isInt().withMessage('Hospital Group ID must be an integer'),
    body('PatientFirstName')
      .notEmpty().withMessage('Patient First Name is required')
      .isLength({ max: 255 }).withMessage('Patient First Name cannot exceed 255 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Patient First Name can only contain letters and spaces'),
    body('PatientLastName')
      .notEmpty().withMessage('Patient Last Name is required')
      .isLength({ max: 255 }).withMessage('Patient Last Name cannot exceed 255 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Patient Last Name can only contain letters and spaces'),
    body('Age')
      .notEmpty().withMessage('Age is required')
      .isInt({ min: 0 }).withMessage('Age must be a non-negative integer'),
    body('DOB')
      .notEmpty().withMessage('Date of Birth is required')
      .isDate().withMessage('Date of Birth must be a valid date'),
    body('BloodGroup')
      .notEmpty().withMessage('Blood Group is required')
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Blood Group must be a valid type'),
    body('Gender')
      .notEmpty().withMessage('Gender is required')
      .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    body('Phone')
      .notEmpty().withMessage('Phone is required')
      .matches(/^[0-9]{10}$/).withMessage('Phone must be a valid 10-digit number'),
    body('WhatsappNumber')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('WhatsApp Number must be a valid 10-digit number'),
    body('Email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be a valid email address')
      .isLength({ max: 255 }).withMessage('Email cannot exceed 255 characters'),
    body('AcceptedPolicy')
      .notEmpty().withMessage('Accepted Policy is required')
      .isBoolean().withMessage('Accepted Policy must be a boolean value'),
    body('IsCommunicationAllowed')
      .notEmpty().withMessage('Is Communication Allowed is required')
      .isBoolean().withMessage('Is Communication Allowed must be a boolean value'),
    body('PatientAddress')
      .notEmpty().withMessage('Patient Address is required')
      .isLength({ max: 255 }).withMessage('Patient Address cannot exceed 255 characters'),
    body('EmergencyContactName')
      .optional()
      .isLength({ max: 255 }).withMessage('Emergency Contact Name cannot exceed 255 characters')
      .matches(/^[a-zA-Z\s\-.,]+$/).withMessage('Emergency Contact Name can only contain letters, spaces, hyphens, periods, and commas'),
    body('EmergencyContactPhone')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('Emergency Contact Phone must be a valid 10-digit number'),
    body('InsuranceProvider')
      .optional()
      .isLength({ max: 255 }).withMessage('Insurance Provider cannot exceed 255 characters'),
    body('InsurancePolicyNumber')
      .optional()
      .isLength({ max: 255 }).withMessage('Insurance Policy Number cannot exceed 255 characters'),
    body('MedicalHistory')
      .optional()
      .isLength({ max: 5000 }).withMessage('Medical History cannot exceed 5000 characters'),
    body('CurrentMedications')
      .optional()
      .isLength({ max: 5000 }).withMessage('Current Medications cannot exceed 5000 characters'),
    body('Allergies')
      .optional()
      .isLength({ max: 5000 }).withMessage('Allergies cannot exceed 5000 characters'),
    body('MaritalStatus')
      .optional()
      .isIn(['Single', 'Married', 'Divorced', 'Widowed']).withMessage('Marital Status must be Single, Married, Divorced, or Widowed'),
    body('Occupation')
      .optional()
      .isLength({ max: 255 }).withMessage('Occupation cannot exceed 255 characters'),
    body('Nationality')
      .optional()
      .isLength({ max: 255 }).withMessage('Nationality cannot exceed 255 characters'),
    body('Language')
      .optional()
      .isLength({ max: 255 }).withMessage('Language cannot exceed 255 characters'),
    body('createdBy')
      .optional()
      .isLength({ max: 255 }).withMessage('Created By cannot exceed 255 characters'),
  ];
};

exports.updatePatientValidationRules = () => {
  return [
   
  
    body('HospitalGroupID')
      .optional()
      .isInt().withMessage('Hospital Group ID must be an integer'),
    body('PatientFirstName')
      .optional()
      .isLength({ max: 255 }).withMessage('Patient First Name cannot exceed 255 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Patient First Name can only contain letters and spaces'),
    body('PatientLastName')
      .optional()
      .isLength({ max: 255 }).withMessage('Patient Last Name cannot exceed 255 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Patient Last Name can only contain letters and spaces'),
    body('Age')
      .optional()
      .isInt({ min: 0 }).withMessage('Age must be a non-negative integer'),
    body('DOB')
      .optional()
      .isDate().withMessage('Date of Birth must be a valid date'),
    body('BloodGroup')
      .optional()
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Blood Group must be a valid type'),
    body('Gender')
      .optional()
      .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    body('Phone')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('Phone must be a valid 10-digit number'),
    body('WhatsappNumber')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('WhatsApp Number must be a valid 10-digit number'),
    body('Email')
      .optional()
      .isEmail().withMessage('Email must be a valid email address')
      .isLength({ max: 255 }).withMessage('Email cannot exceed 255 characters'),
    body('AcceptedPolicy')
      .optional()
      .isBoolean().withMessage('Accepted Policy must be a boolean value'),
    body('IsCommunicationAllowed')
      .optional()
      .isBoolean().withMessage('Is Communication Allowed must be a boolean value'),
    body('PatientAddress')
      .optional()
      .isLength({ max: 255 }).withMessage('Patient Address cannot exceed 255 characters'),
    body('EmergencyContactName')
      .optional()
      .isLength({ max: 255 }).withMessage('Emergency Contact Name cannot exceed 255 characters')
      .matches(/^[a-zA-Z\s\-.,]+$/).withMessage('Emergency Contact Name can only contain letters, spaces, hyphens, periods, and commas'),
    body('EmergencyContactPhone')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('Emergency Contact Phone must be a valid 10-digit number'),
    body('InsuranceProvider')
      .optional()
      .isLength({ max: 255 }).withMessage('Insurance Provider cannot exceed 255 characters'),
    body('InsurancePolicyNumber')
      .optional()
      .isLength({ max: 255 }).withMessage('Insurance Policy Number cannot exceed 255 characters'),
    body('MedicalHistory')
      .optional()
      .isLength({ max: 5000 }).withMessage('Medical History cannot exceed 5000 characters'),
    body('CurrentMedications')
      .optional()
      .isLength({ max: 5000 }).withMessage('Current Medications cannot exceed 5000 characters'),
    body('Allergies')
      .optional()
      .isLength({ max: 5000 }).withMessage('Allergies cannot exceed 5000 characters'),
    body('MaritalStatus')
      .optional()
      .isIn(['Single', 'Married', 'Divorced', 'Widowed']).withMessage('Marital Status must be Single, Married, Divorced, or Widowed'),
    body('Occupation')
      .optional()
      .isLength({ max: 255 }).withMessage('Occupation cannot exceed 255 characters'),
    body('Nationality')
      .optional()
      .isLength({ max: 255 }).withMessage('Nationality cannot exceed 255 characters'),
    body('Language')
      .optional()
      .isLength({ max: 255 }).withMessage('Language cannot exceed 255 characters'),
    body('updatedBy')
      .optional()
      .isLength({ max: 255 }).withMessage('Updated By cannot exceed 255 characters'),
  ];
};