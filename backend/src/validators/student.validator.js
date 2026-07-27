const {
  body,
  matchedData,
  param,
  query,
  validationResult,
} = require('express-validator');

const AppError = require('../utils/app-error');

const EDITABLE_PROFILE_FIELDS = new Set([
  'phone',
  'course',
  'year_of_study',
  'emergency_contact_name',
  'emergency_contact_phone',
]);
const ACCOUNT_STATUSES = ['active', 'suspended', 'inactive'];
const PHONE_PATTERN = /^[0-9+()\-\s]+$/;

const ensureObjectWithAllowedFields = (allowedFields, emptyMessage) =>
  body().custom((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Request body must be an object');
    }

    const fields = Object.keys(value);
    const unknownFields = fields.filter((field) => !allowedFields.has(field));

    if (unknownFields.length > 0) {
      throw new Error(`Unsupported field: ${unknownFields.join(', ')}`);
    }

    if (fields.length === 0) {
      throw new Error(emptyMessage);
    }

    return true;
  });

const optionalText = (field, label, maximumLength, minimumLength = 0) =>
  body(field)
    .optional({ nullable: true })
    .customSanitizer((value) =>
      typeof value === 'string' ? value.trim() : value
    )
    .custom((value) => {
      if (value === null || value === '') {
        return true;
      }

      if (typeof value !== 'string') {
        throw new Error(`${label} must be text`);
      }

      if (value.length < minimumLength || value.length > maximumLength) {
        throw new Error(
          `${label} must be between ${minimumLength} and ${maximumLength} characters`
        );
      }

      return true;
    });

const optionalPhone = (field, label) =>
  body(field)
    .optional({ nullable: true })
    .customSanitizer((value) =>
      typeof value === 'string' ? value.trim() : value
    )
    .custom((value) => {
      if (value === null || value === '') {
        return true;
      }

      if (typeof value !== 'string') {
        throw new Error(`${label} must be text`);
      }

      if (value.length < 7 || value.length > 30) {
        throw new Error(`${label} must be between 7 and 30 characters`);
      }

      if (!PHONE_PATTERN.test(value)) {
        throw new Error(`Enter a valid ${label.toLowerCase()}`);
      }

      return true;
    });

const studentProfileUpdateValidation = [
  ensureObjectWithAllowedFields(
    EDITABLE_PROFILE_FIELDS,
    'Provide at least one profile field to update'
  ),
  optionalPhone('phone', 'Phone number'),
  optionalText('course', 'Course', 150, 2),
  body('year_of_study')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === '') {
        return true;
      }

      if (!Number.isInteger(Number(value)) || Number(value) < 1) {
        throw new Error('Year of study must be a positive integer');
      }

      return true;
    })
    .customSanitizer((value) =>
      value === '' || value === null ? null : Number(value)
    ),
  optionalText('emergency_contact_name', 'Emergency contact name', 150, 2),
  optionalPhone('emergency_contact_phone', 'Emergency contact phone'),
];

const studentListValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
    .toInt(),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be text')
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search must not exceed 100 characters'),
  query('status')
    .optional()
    .isIn(ACCOUNT_STATUSES)
    .withMessage('Status must be active, suspended, or inactive'),
];

const studentIdentifierValidation = [
  param('studentId')
    .isUUID()
    .withMessage('Student identifier must be a valid UUID'),
];

const studentStatusValidation = [
  ensureObjectWithAllowedFields(
    new Set(['account_status']),
    'Account status is required'
  ),
  body('account_status')
    .isIn(ACCOUNT_STATUSES)
    .withMessage('Account status must be active, suspended, or inactive'),
];

const handleStudentValidation = (req, _res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((error) => ({
      field: error.path || 'request',
      message: error.msg,
    }));

    next(new AppError('Validation failed', 422, errors));
    return;
  }

  const validatedBody = matchedData(req, {
    locations: ['body'],
  });
  delete validatedBody[''];

  req.validatedBody = validatedBody;
  req.validatedQuery = matchedData(req, {
    locations: ['query'],
  });
  req.validatedParams = matchedData(req, {
    locations: ['params'],
  });
  next();
};

module.exports = {
  ACCOUNT_STATUSES,
  studentProfileUpdateValidation,
  studentListValidation,
  studentIdentifierValidation,
  studentStatusValidation,
  handleStudentValidation,
};
