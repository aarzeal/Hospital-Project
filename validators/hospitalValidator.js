const { body } = require('express-validator');
const StaffMaster = require('../models/staffMaster');
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
      .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters')
      .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,100}$/)
      .withMessage('Password must contain at least one capital letter, one numeric digit, and one special character'),

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
      .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters')
      .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,100}$/)
      .withMessage('Password must contain at least one capital letter, one numeric digit, and one special character'),


      
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
      // .notEmpty().withMessage('EMR Number is required')
      .isLength({ max: 50 }).withMessage('EMR Number cannot exceed 50 characters'),
    body('HospitalGroupID')
      .optional()
      .isInt().withMessage('Hospital Group ID must be an integer'),
    body('PatientFirstName')
      .notEmpty().withMessage('Patient First Name is required')
      .isLength({ max: 255 }).withMessage('Patient First Name cannot exceed 255 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Patient First Name can only contain letters and spaces'),
      body('PatientMiddleName')
      .optional()
      
      .isLength({ max: 255 }).withMessage('Patient Middle Name cannot exceed 255 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Patient Middle Name can only contain letters and spaces'),
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
      .notEmpty().withMessage('Blood Group is required'),
      // .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Blood Group must be a valid type'),
    body('Gender')
      .notEmpty().withMessage('Gender is required'),
      // .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
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
      .optional(),
      // .isIn(['Single', 'Married', 'Divorced', 'Widowed']).withMessage('Marital Status must be Single, Married, Divorced, or Widowed'),
    body('Occupation')
      .optional()
      .isLength({ max: 255 }).withMessage('Occupation cannot exceed 255 characters'),
    body('Nationality')
      .optional(),
      // .isLength({ max: 255 }).withMessage('Nationality cannot exceed 255 characters'),
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




exports.createDoctorValidationRules = () => {
  return [
    body('FirstName')
      .notEmpty().withMessage('First Name is required')
      .isLength({ max: 50 }).withMessage('First Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('First Name can only contain letters and spaces'),
    body('MiddleName')
      .optional()
      .isLength({ max: 50 }).withMessage('Middle Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Middle Name can only contain letters and spaces'),
    body('LastName')
      .notEmpty().withMessage('Last Name is required')
      .isLength({ max: 50 }).withMessage('Last Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Last Name can only contain letters and spaces'),
    body('Qualification')
      .notEmpty().withMessage('Qualification is required')
      .isLength({ max: 100 }).withMessage('Qualification cannot exceed 100 characters'),
    body('Specialization')
      .notEmpty().withMessage('Specialization is required')
      .isLength({ max: 100 }).withMessage('Specialization cannot exceed 100 characters'),
    body('Email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be a valid email address')
      .isLength({ max: 100 }).withMessage('Email cannot exceed 100 characters'),
    body('Address')
      .notEmpty().withMessage('Address is required')
      .isLength({ max: 255 }).withMessage('Address cannot exceed 255 characters'),
    body('WhatsAppNumber')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('WhatsApp Number must be a valid 10-digit number'),
    body('MobileNumber')
      .notEmpty().withMessage('Mobile Number is required')
      .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),
    body('HospitalID')
      .notEmpty().withMessage('Hospital ID is required')
      .isInt().withMessage('Hospital ID must be an integer'),
    body('DateOfBirth')
      .optional()
      .isDate().withMessage('Date of Birth must be a valid date'),
    body('Gender')
      .optional()
      .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    body('LicenseNumber')
      .notEmpty().withMessage('License Number is required')
      .isLength({ max: 50 }).withMessage('License Number cannot exceed 50 characters'),
    body('YearsOfExperience')
      .optional()
      .isInt({ min: 0 }).withMessage('Years of Experience must be a non-negative integer'),
  ];
};

exports.updateDoctorValidationRules = () => {
  return [
    body('FirstName')
      .optional()
      .isLength({ max: 50 }).withMessage('First Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('First Name can only contain letters and spaces'),
    body('MiddleName')
      .optional()
      .isLength({ max: 50 }).withMessage('Middle Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Middle Name can only contain letters and spaces'),
    body('LastName')
      .optional()
      .isLength({ max: 50 }).withMessage('Last Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Last Name can only contain letters and spaces'),
    body('Qualification')
      .optional()
      .isLength({ max: 100 }).withMessage('Qualification cannot exceed 100 characters'),
    body('Specialization')
      .optional()
      .isLength({ max: 100 }).withMessage('Specialization cannot exceed 100 characters'),
    body('Email')
      .optional()
      .isEmail().withMessage('Email must be a valid email address')
      .isLength({ max: 100 }).withMessage('Email cannot exceed 100 characters'),
    body('Address')
      .optional()
      .isLength({ max: 255 }).withMessage('Address cannot exceed 255 characters'),
    body('WhatsAppNumber')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('WhatsApp Number must be a valid 10-digit number'),
    body('MobileNumber')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),
    body('HospitalID')
      .optional()
      .isInt().withMessage('Hospital ID must be an integer'),
    body('DateOfBirth')
      .optional()
      .isDate().withMessage('Date of Birth must be a valid date'),
    body('Gender')
      .optional()
      .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    body('LicenseNumber')
      .optional()
      .isLength({ max: 50 }).withMessage('License Number cannot exceed 50 characters'),
    body('YearsOfExperience')
      .optional()
      .isInt({ min: 0 }).withMessage('Years of Experience must be a non-negative integer'),
  ];
};


exports.createStaffValidationRules = () => {
  return [
    body('FirstName')
      .notEmpty().withMessage('First Name is required')
      .isLength({ max: 50 }).withMessage('First Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('First Name can only contain letters and spaces'),
    body('MiddleName')
      .optional()
      .isLength({ max: 50 }).withMessage('Middle Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Middle Name can only contain letters and spaces'),
    body('LastName')
      .notEmpty().withMessage('Last Name is required')
      .isLength({ max: 50 }).withMessage('Last Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Last Name can only contain letters and spaces'),
      body('Email')
      .optional()
      .isEmail().withMessage('Email must be a valid email address')
      .isLength({ max: 100 }).withMessage('Email cannot exceed 100 characters'),
      // .custom(async (value, { req }) => {
      //   const staff = await StaffMaster.findOne({ where: { Email: value } });
      //   if (staff && staff.Id !== req.params.id) {
      //     return Promise.reject('Email is already registered');
      //   }
      // }),
    body('Address')
      .notEmpty().withMessage('Address is required')
      .isLength({ max: 255 }).withMessage('Address cannot exceed 255 characters'),
    body('MobileNumber')
      .notEmpty().withMessage('Mobile Number is required')
      .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),
    body('Qualification')
      .notEmpty().withMessage('Qualification is required')
      .isLength({ max: 100 }).withMessage('Qualification cannot exceed 100 characters'),
    body('Experience')
      .optional()
      .isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
    body('Specialization')
      .optional()
      .isLength({ max: 100 }).withMessage('Specialization cannot exceed 100 characters'),
    body('WhatsAppNumber')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('WhatsApp Number must be a valid 10-digit number'),
    // body('HospitalID')
      // .notEmpty().withMessage('Hospital ID is required')
      // .isInt().withMessage('Hospital ID must be an integer'),
  ];
};

exports.updateStaffValidationRules = () => {
  return [
    body('FirstName')
      .optional()
      .isLength({ max: 50 }).withMessage('First Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('First Name can only contain letters and spaces'),
    body('MiddleName')
      .optional()
      .isLength({ max: 50 }).withMessage('Middle Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Middle Name can only contain letters and spaces'),
    body('LastName')
      .optional()
      .isLength({ max: 50 }).withMessage('Last Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Last Name can only contain letters and spaces'),
    body('Email')
      .optional()
      .isEmail().withMessage('Email must be a valid email address')
      .isLength({ max: 100 }).withMessage('Email cannot exceed 100 characters'),
    body('Address')
      .optional()
      .isLength({ max: 255 }).withMessage('Address cannot exceed 255 characters'),
    body('MobileNumber')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),
    body('Qualification')
      .optional()
      .isLength({ max: 100 }).withMessage('Qualification cannot exceed 100 characters'),
    body('Experience')
      .optional()
      .isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
    body('Specialization')
      .optional()
      .isLength({ max: 100 }).withMessage('Specialization cannot exceed 100 characters'),
    body('WhatsAppNumber')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('WhatsApp Number must be a valid 10-digit number'),
    body('HospitalID')
      .optional()
      .isInt().withMessage('Hospital ID must be an integer'),
  ];
};



exports.createSkillValidationRules = () => {
  return [
    body('SkillName')
      .notEmpty().withMessage('SkillName is required')
      .isLength({ max: 40 }).withMessage('SkillName cannot exceed 40 characters'),
    body('IsClinicalSkill')
      .notEmpty().withMessage('IsClinicalSkill is required')
      .isBoolean().withMessage('IsClinicalSkill must be a boolean value'),
    body('IsActive')
      .optional()
      .isBoolean().withMessage('IsActive must be a boolean value'),
  
  ];
};

exports.updateSkillValidationRules = () => {
  return [
    body('SkillName')
      .optional()
      .isLength({ max: 40 }).withMessage('SkillName cannot exceed 40 characters'),
    body('IsClinicalSkill')
      .optional()
      .isBoolean().withMessage('IsClinicalSkill must be a boolean value'),
    body('IsActive')
      .optional()
      .isBoolean().withMessage('IsActive must be a boolean value'),
    body('CreatedBy')
      .optional(),
    
  ];
};


exports.createDoctorValidationRules = () => {
  return [
    body('FirstName')
      .notEmpty().withMessage('First Name is required')
      .isLength({ max: 40 }).withMessage('First Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('First Name can only contain letters and spaces'),
    body('MiddleName')
      .optional()
      .isLength({ max: 40 }).withMessage('Middle Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Middle Name can only contain letters and spaces'),
    body('LastName')
      .notEmpty().withMessage('Last Name is required')
      .isLength({ max: 40 }).withMessage('Last Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Last Name can only contain letters and spaces'),
    body('Qualification')
      .notEmpty().withMessage('Qualification is required'),
    body('Specialization')
      .notEmpty().withMessage('Specialization is required'),
    body('Email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be a valid email address')
      .isLength({ max: 255 }).withMessage('Email cannot exceed 255 characters'),
    body('Address')
      .notEmpty().withMessage('Address is required'),
    body('WhatsAppNumber')
      .optional()
      .matches(/^[0-9]{0,10}$/).withMessage('WhatsApp Number must be a valid 10-digit number'),
    body('MobileNumber')
      .notEmpty().withMessage('Mobile Number is required')
      .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),
    body('HospitalID')
      .notEmpty().withMessage('Hospital ID is required')
      .isInt().withMessage('Hospital ID must be an integer'),
    body('DateOfBirth')
      .notEmpty().withMessage('Date of Birth is required')
      .isISO8601().withMessage('Date of Birth must be a valid date'),
    body('Gender')
      .notEmpty().withMessage('Gender is required')
      .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be one of "Male", "Female", or "Other"'),
    body('LicenseNumber')
      .notEmpty().withMessage('License Number is required'),
    body('YearsOfExperience')
      .notEmpty().withMessage('Years of Experience is required')
      .isInt({ min: 0 }).withMessage('Years of Experience must be a non-negative integer'),
    body('HospitalGroupIDR')
      .notEmpty().withMessage('Hospital Group IDR is required')
      .isInt().withMessage('Hospital Group IDR must be an integer'),
    body('IsActive')
      .optional()
      .isBoolean().withMessage('IsActive must be a boolean value'),
    body('CreatedBy')
      .notEmpty().withMessage('CreatedBy is required')
      .isInt().withMessage('CreatedBy must be an integer')
  ];
};

exports.updateDoctorValidationRules = () => {
  return [
    body('FirstName')
      .optional()
      .isLength({ max: 40 }).withMessage('First Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('First Name can only contain letters and spaces'),
    body('MiddleName')
      .optional()
      .isLength({ max: 40 }).withMessage('Middle Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Middle Name can only contain letters and spaces'),
    body('LastName')
      .optional()
      .isLength({ max: 40 }).withMessage('Last Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Last Name can only contain letters and spaces'),
    body('Qualification')
      .optional()
      .notEmpty().withMessage('Qualification is required'),
    body('Specialization')
      .optional()
      .notEmpty().withMessage('Specialization is required'),
    body('Email')
      .optional()
      .isEmail().withMessage('Email must be a valid email address')
      .isLength({ max: 255 }).withMessage('Email cannot exceed 255 characters'),
    body('Address')
      .optional()
      .notEmpty().withMessage('Address is required'),
    body('WhatsAppNumber')
      .optional()
      .matches(/^[0-9]{0,10}$/).withMessage('WhatsApp Number must be a valid 10-digit number'),
    body('MobileNumber')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),
    body('HospitalID')
      .optional()
      .isInt().withMessage('Hospital ID must be an integer'),
    body('DateOfBirth')
      .optional()
      .isISO8601().withMessage('Date of Birth must be a valid date'),
    body('Gender')
      .optional()
      .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be one of "Male", "Female", or "Other"'),
    body('LicenseNumber')
      .optional()
      .notEmpty().withMessage('License Number is required'),
    body('YearsOfExperience')
      .optional()
      .isInt({ min: 0 }).withMessage('Years of Experience must be a non-negative integer'),
    body('HospitalGroupIDR')
      .optional()
      .isInt().withMessage('Hospital Group IDR must be an integer'),
    body('IsActive')
      .optional()
      .isBoolean().withMessage('IsActive must be a boolean value'),
    body('CreatedBy')
      .optional()
      .isInt().withMessage('CreatedBy must be an integer')
  ];
};








const path = require('path');
const fs = require('fs');

let config;

try {
  const configPath = path.join(__dirname, '../config/employeeConfig.json');
  const configFile = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configFile);
} catch (error) {
  console.error('Error loading employeeConfig.json:', error);
  throw error;
}

exports.createEmployeeValidationRules = () => {
  return [
    body('FName')
      .notEmpty().withMessage('First Name is required')
      .isLength({ max: 40 }).withMessage('First Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('First Name can only contain letters and spaces'),
    body('MName')
      .optional()
      .isLength({ max: 40 }).withMessage('Middle Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Middle Name can only contain letters and spaces'),
    body('LName')
      .notEmpty().withMessage('Last Name is required')
      .isLength({ max: 40 }).withMessage('Last Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Last Name can only contain letters and spaces'),
    body('SpecialtyIDR')
      .notEmpty().withMessage('SpecialtyIDR ID is required')
      .isInt().withMessage('SpecialtyIDR ID must be an integer'),
    body('Gender')
      .notEmpty().withMessage('Gender is required')
      .isIn(Object.keys(config.Gender).map(Number)).withMessage(`Gender must be one of ${Object.keys(config.Gender).map(Number).join(', ')}`),
    body('BloodGroupIDR')
      .notEmpty().withMessage('Blood Group ID is required')
      .isIn(Object.keys(config.BloodGroup).map(Number)).withMessage(`Blood Group must be one of ${Object.keys(config.BloodGroup).map(Number).join(', ')}`),
    body('DepartmentIDR')
      .notEmpty().withMessage('Department ID is required')
      .isInt().withMessage('Department ID must be an integer'),
    body('DesignationIDR')
      .notEmpty().withMessage('Designation ID is required')
      .isInt().withMessage('Designation ID must be an integer'),
    body('NationalityIDR')
      .notEmpty().withMessage('Nationality is required')
      .isIn(Object.keys(config.Nationality).map(Number)).withMessage(`Nationality must be one of ${Object.keys(config.Nationality).map(Number).join(', ')}`),
    body('ReligionIDR')
      .notEmpty().withMessage('Religion is required')
      .isIn(Object.keys(config.Religion).map(Number)).withMessage(`Religion must be one of ${Object.keys(config.Religion).map(Number).join(', ')}`),
    body('CastIDF')
      .notEmpty().withMessage('Cast is required')
      .isIn(Object.keys(config.Cast).map(Number)).withMessage(`Cast must be one of ${Object.keys(config.Cast).map(Number).join(', ')}`),
    body('QualificationIDR')
      .notEmpty().withMessage('Qualification is required')
      .isIn(Object.keys(config.Qualification).map(Number)).withMessage(`Qualification must be one of ${Object.keys(config.Qualification).map(Number).join(', ')}`),
    body('EmployeeCategoryIDR')
      .notEmpty().withMessage('Employee Category ID is required')
      .isInt().withMessage('Employee Category ID must be an integer'),
    body('EmployeeCode')
      .notEmpty().withMessage('Employee Code is required')
      .isLength({ max: 20 }).withMessage('Employee Code cannot exceed 20 characters'),
    body('UniqueTAXNo')
      .notEmpty().withMessage('Unique TAX Number is required')
      .isLength({ max: 20 }).withMessage('Unique TAX Number cannot exceed 20 characters'),
    body('DateOfBirth')
      .notEmpty().withMessage('Date of Birth is required')
      .isISO8601().withMessage('Date of Birth must be a valid date'),
    body('DateOfJoining')
      .notEmpty().withMessage('Date of Joining is required')
      .isISO8601().withMessage('Date of Joining must be a valid date'),
    body('MaritalStatus')
      .notEmpty().withMessage('Marital Status is required')
      .isIn(Object.keys(config.MaritalStatus).map(Number)).withMessage(`Marital Status must be one of ${Object.keys(config.MaritalStatus).map(Number).join(', ')}`)
  ];
};

exports.updateEmployeeValidationRules = () => {
  return [
    body('FName')
      .optional()
      .isLength({ max: 40 }).withMessage('First Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('First Name can only contain letters and spaces'),
    body('MName')
      .optional()
      .isLength({ max: 40 }).withMessage('Middle Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Middle Name can only contain letters and spaces'),
    body('LName')
      .optional()
      .isLength({ max: 40 }).withMessage('Last Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Last Name can only contain letters and spaces'),
    body('SkillSetIDR')
      .optional()
      .isInt().withMessage('SkillSet ID must be an integer'),
    body('Gender')
      .optional()
      .isIn(Object.keys(config.Gender).map(Number)).withMessage(`Gender must be one of ${Object.keys(config.Gender).map(Number).join(', ')}`),
    body('BloodGroupIDR')
      .optional()
      .isIn(Object.keys(config.BloodGroup).map(Number)).withMessage(`Blood Group must be one of ${Object.keys(config.BloodGroup).map(Number).join(', ')}`),
    body('DepartmentIDR')
      .optional()
      .isInt().withMessage('Department ID must be an integer'),
    body('DesignationIDR')
      .optional()
      .isInt().withMessage('Designation ID must be an integer'),
    body('NationalityIDR')
      .optional()
      .isIn(Object.keys(config.Nationality).map(Number)).withMessage(`Nationality must be one of ${Object.keys(config.Nationality).map(Number).join(', ')}`),
    body('ReligionIDR')
      .optional()
      .isIn(Object.keys(config.Religion).map(Number)).withMessage(`Religion must be one of ${Object.keys(config.Religion).map(Number).join(', ')}`),
    body('CastIDF')
      .optional()
      .isIn(Object.keys(config.Cast).map(Number)).withMessage(`Cast must be one of ${Object.keys(config.Cast).map(Number).join(', ')}`),
    body('QualificationIDR')
      .optional()
      .isIn(Object.keys(config.Qualification).map(Number)).withMessage(`Qualification must be one of ${Object.keys(config.Qualification).map(Number).join(', ')}`),
    body('EmployeeCategoryIDR')
      .optional()
      .isInt().withMessage('Employee Category ID must be an integer'),
    body('EmployeeCode')
      .optional()
      .isLength({ max: 20 }).withMessage('Employee Code cannot exceed 20 characters'),
    body('UniqueTAXNo')
      .optional()
      .isLength({ max: 20 }).withMessage('Unique TAX Number cannot exceed 20 characters'),
    body('DateOfBirth')
      .optional()
      .isISO8601().withMessage('Date of Birth must be a valid date'),
    body('DateOfJoining')
      .optional()
      .isISO8601().withMessage('Date of Joining must be a valid date'),
    body('MaritalStatus')
      .optional()
      .isIn(Object.keys(config.MaritalStatus).map(Number)).withMessage(`Marital Status must be one of ${Object.keys(config.MaritalStatus).map(Number).join(', ')}`)
  ];
};

exports.createSkillValidationRules = () => {
  return [
    body('SkillName')
      .notEmpty().withMessage('Skill Name is required')
      .isLength({ max: 40 }).withMessage('Skill Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('SkillName can only contain letters'),
    body('IsClinicalSkill')
      .notEmpty().withMessage('Is Clinical Skill is required')
      .isBoolean().withMessage('Is Clinical Skill must be a boolean value'),
    body('IsActive')
      .optional()
      .isBoolean().withMessage('IsActive must be a boolean value'),
    body('CreatedBy')
      .notEmpty().withMessage('Created By is required')
      .isString().withMessage('Created By must be a string'),
    body('CreatedAt')
      .optional()
      .isISO8601().withMessage('Created At must be a valid date'),
    body('EditedBy')
      .optional()
      .isString().withMessage('Edited By must be a string'),
    body('EditedAt')
      .optional()
      .isISO8601().withMessage('Edited At must be a valid date'),
    body('HospitalIDR')
      .notEmpty().withMessage('Hospital IDR is required')
      .isInt().withMessage('Hospital IDR must be an integer'),
    body('Reserve1')
      .optional()
      .isInt().withMessage('Reserve1 must be an integer'),
    body('Reserve2')
      .optional()
      .isInt().withMessage('Reserve2 must be an integer'),
    body('Reserve3')
      .optional()
      .isLength({ max: 250 }).withMessage('Reserve3 cannot exceed 250 characters'),
    body('Reserve4')
      .optional()
      .isLength({ max: 250 }).withMessage('Reserve4 cannot exceed 250 characters')
  ];
};

exports.updateSkillValidationRules = () => {
  return [
    body('SkillName')
      .optional()
      .isLength({ max: 40 }).withMessage('Skill Name cannot exceed 40 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Skill Name can only contain letters and spaces'),
    body('IsClinicalSkill')
      .optional()
      .isBoolean().withMessage('Is Clinical Skill must be a boolean value'),
    body('IsActive')
      .optional()
      .isBoolean().withMessage('IsActive must be a boolean value'),
    body('CreatedBy')
      .optional()
      .isString().withMessage('Created By must be a string'),
    body('CreatedAt')
      .optional()
      .isISO8601().withMessage('Created At must be a valid date'),
    body('EditedBy')
      .optional()
      .isString().withMessage('Edited By must be a string'),
    body('EditedAt')
      .optional()
      .isISO8601().withMessage('Edited At must be a valid date'),
    body('HospitalIDR')
      .optional()
      .isInt().withMessage('Hospital IDR must be an integer'),
    body('Reserve1')
      .optional()
      .isInt().withMessage('Reserve1 must be an integer'),
    body('Reserve2')
      .optional()
      .isInt().withMessage('Reserve2 must be an integer'),
    body('Reserve3')
      .optional()
      .isLength({ max: 250 }).withMessage('Reserve3 cannot exceed 250 characters'),
    body('Reserve4')
      .optional()
      .isLength({ max: 250 }).withMessage('Reserve4 cannot exceed 250 characters')
  ];
};







// const { User } = require('../models/user'); 

// exports.createUserValidationRules = () => {
//   return [
//     body('name')
//       .notEmpty().withMessage('Name is required')
//       .isLength({ max: 255 }).withMessage('Name must be between 1 and 255 characters')
//       .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
    
//     body('phone')
//       .notEmpty().withMessage('Phone is required')
//       .isLength({ min: 10, max: 15 }).withMessage('Phone must be between 10 and 15 characters')
//       .isNumeric().withMessage('Phone must contain only numbers'),

//     body('email')
//       .optional({ checkFalsy: true })
//       .isEmail().withMessage('Invalid email address')
//       .isLength({ max: 255 }).withMessage('Email must be between 1 and 255 characters'),

//     body('username')
//       .notEmpty().withMessage('Username is required')
//       .isLength({ max: 255 }).withMessage('Username must be between 1 and 255 characters')
//       .custom(async (value) => {
//         const user = await User.findOne({ where: { username: value } });
//         if (user) {
//           return Promise.reject('Username is already in use');
//         }
//       }),

//     body('password')
//       .notEmpty().withMessage('Password is required')
//       .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters'),

//     body('hospitalId')
//       .notEmpty().withMessage('Hospital ID is required')
//       .isInt().withMessage('Hospital ID must be an integer'),

//     body('empid')
//       .notEmpty().withMessage('Employee ID is required')
//       .isInt().withMessage('Employee ID must be an integer'),

//     body('is_emailVerify')
//       .optional()
//       .isBoolean().withMessage('is_emailVerify must be a boolean value'),

//     body('usertype')
//       .optional()
//       .isString().withMessage('Usertype must be a string'),

//     body('lockuser')
//       .optional()
//       .isString().withMessage('Lockuser must be a string'),

//     body('phoneverify')
//       .optional()
//       .isString().withMessage('Phoneverify must be a string'),

//     body('otp')
//       .optional()
//       .isString().withMessage('OTP must be a string'),

//     body('emailtoken')
//       .optional()
//       .isString().withMessage('Email token must be a string'),

//     body('createdBy')
//       .notEmpty().withMessage('Created By is required')
//       .isInt().withMessage('Created By must be an integer'),

//     body('Reserve1')
//       .optional()
//       .isInt().withMessage('Reserve1 must be an integer'),

//     body('Reserve2')
//       .optional()
//       .isInt().withMessage('Reserve2 must be an integer'),

//     body('Reserve3')
//       .optional()
//       .isString().withMessage('Reserve3 must be a string'),

//     body('Reserve4')
//       .optional()
//       .isString().withMessage('Reserve4 must be a string')
//   ];
// };

// exports.updateUserValidationRules = () => {
//   return [
//     body('name')
//       .optional()
//       .isLength({ max: 255 }).withMessage('Name must be between 1 and 255 characters')
//       .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
    
//     body('phone')
//       .optional()
//       .isLength({ min: 10, max: 15 }).withMessage('Phone must be between 10 and 15 characters')
//       .isNumeric().withMessage('Phone must contain only numbers'),

//     body('email')
//       .optional({ checkFalsy: true })
//       .isEmail().withMessage('Invalid email address')
//       .isLength({ max: 255 }).withMessage('Email must be between 1 and 255 characters'),

//     body('username')
//       .optional()
//       .isLength({ max: 255 }).withMessage('Username must be between 1 and 255 characters')
//       .custom(async (value, { req }) => {
//         const user = await User.findOne({ where: { username: value } });
//         if (user && user.userId !== req.params.id) {
//           return Promise.reject('Username is already in use');
//         }
//       }),

//     body('password')
//       .optional()
//       .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters'),

//     body('hospitalId')
//       .optional()
//       .isInt().withMessage('Hospital ID must be an integer'),

//     body('empid')
//       .optional()
//       .isInt().withMessage('Employee ID must be an integer'),

//     body('is_emailVerify')
//       .optional()
//       .isBoolean().withMessage('is_emailVerify must be a boolean value'),

//     body('usertype')
//       .optional()
//       .isString().withMessage('Usertype must be a string'),

//     body('lockuser')
//       .optional()
//       .isString().withMessage('Lockuser must be a string'),

//     body('phoneverify')
//       .optional()
//       .isString().withMessage('Phoneverify must be a string'),

//     body('otp')
//       .optional()
//       .isString().withMessage('OTP must be a string'),

//     body('emailtoken')
//       .optional()
//       .isString().withMessage('Email token must be a string'),

//     body('createdBy')
//       .optional()
//       .isInt().withMessage('Created By must be an integer'),

//     body('Reserve1')
//       .optional()
//       .isInt().withMessage('Reserve1 must be an integer'),

//     body('Reserve2')
//       .optional()
//       .isInt().withMessage('Reserve2 must be an integer'),

//     body('Reserve3')
//       .optional()
//       .isString().withMessage('Reserve3 must be a string'),

//     body('Reserve4')
//       .optional()
//       .isString().withMessage('Reserve4 must be a string')
//   ];
// };