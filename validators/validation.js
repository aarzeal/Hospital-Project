const { body } = require('express-validator');

exports.validateRoomTypeRegister = [

    body('roomType_Name')
    .notEmpty().withMessage('Room type is required')
    .isLength({ max: 50 }).withMessage('Room type must be at most 50 characters'),

    body('roomType_Code')
    .notEmpty().withMessage('Room code is required')
    .isLength({ max: 50 }).withMessage('Room code must be at most 50 characters'),

    body('isActive')
    .isBoolean().withMessage('Is Active must be a boolean'),

    body('hospital_IDR')
    .notEmpty().withMessage('Hospital ID is required'),

    body('hospitalGroup_IDR')
    .notEmpty().withMessage('Hospital Group ID is required'),
]

exports.validateRoomTypeUpdate = [

    body('roomType_Name')
    .notEmpty().withMessage('Room type is required')
    .isLength({ max: 50 }).withMessage('Room type must be at most 50 characters'),

    body('roomType_Code')
    .notEmpty().withMessage('Room code is required')
    .isLength({ max: 50 }).withMessage('Room code must be at most 50 characters'),

    body('isActive')
    .isBoolean().withMessage('Is Active must be a boolean'),

    body('hospital_IDR')
    .notEmpty().withMessage('Hospital ID is required'),

    body('hospitalGroup_IDR')
    .notEmpty().withMessage('Hospital Group ID is required'),
]