const { body } = require('express-validator');

exports.createHospitalValidationRules = () => {
  return [
    body('ManagingCompanyEmail').isEmail().withMessage('Managing Company Email must be a valid email address'),
    body('OwnerEmail').isEmail().withMessage('Owner Email must be a valid email address')
  ];
};

exports.updateHospitalValidationRules = () => {
  return [
    body('ManagingCompanyEmail').optional().isEmail().withMessage('Managing Company Email must be a valid email address'),
    body('OwnerEmail').optional().isEmail().withMessage('Owner Email must be a valid email address')
  ];
};
