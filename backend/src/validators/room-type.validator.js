const { body, param, query } = require('express-validator');

const {
  handleValidation,
  validateAllowedFields,
} = require('./common.validator');

const roomTypeIdentifierValidation = [
  param('roomTypeId')
    .isUUID()
    .withMessage('Room type identifier must be a valid UUID'),
];

const roomTypeListValidation = [
  query('status').optional().isIn(['active', 'inactive']),
];

const roomTypeCreateValidation = [
  body().custom(
    validateAllowedFields(
      new Set([
        'code',
        'name',
        'monthly_rate',
        'default_capacity',
        'description',
      ]),
      'Room type details are required'
    )
  ),
  body('code')
    .isString()
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]$/)
    .withMessage('Room type code must be one uppercase letter'),
  body('name').isString().trim().isLength({ min: 2, max: 100 }),
  body('monthly_rate')
    .isFloat({ gt: 0, max: 9999999999.99 })
    .withMessage('Monthly rate must be greater than zero')
    .toFloat(),
  body('default_capacity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Default capacity must be between 1 and 100')
    .toInt(),
  body('description')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 1000 }),
];

const roomTypeUpdateValidation = [
  body().custom(
    validateAllowedFields(
      new Set(['name', 'monthly_rate', 'default_capacity', 'description']),
      'Provide at least one room type field to update'
    )
  ),
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('monthly_rate')
    .optional()
    .isFloat({ gt: 0, max: 9999999999.99 })
    .withMessage('Monthly rate must be greater than zero')
    .toFloat(),
  body('default_capacity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Default capacity must be between 1 and 100')
    .toInt(),
  body('description')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 1000 }),
];

const roomTypeStatusValidation = [
  body().custom(
    validateAllowedFields(new Set(['status']), 'Room type status is required')
  ),
  body('status').isIn(['active', 'inactive']),
];

module.exports = {
  handleRoomTypeValidation: handleValidation,
  roomTypeCreateValidation,
  roomTypeIdentifierValidation,
  roomTypeListValidation,
  roomTypeStatusValidation,
  roomTypeUpdateValidation,
};
