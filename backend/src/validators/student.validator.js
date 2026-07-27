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
const ADMIN_STUDENT_FIELDS = new Set([
  'full_name',
  'email',
  'phone',
  'student_number',
  'course',
  'year_of_study',
  'emergency_contact_name',
  'emergency_contact_phone',
]);
const CREATE_STUDENT_FIELDS = new Set([...ADMIN_STUDENT_FIELDS, 'password']);

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

const fullNameValidation = (optional = false) => {
  let validation = body('full_name');

  if (optional) {
    validation = validation.optional();
  }

  return validation
    .isString()
    .withMessage('Full name is required')
    .bail()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Full name must be between 2 and 150 characters');
};

const emailValidation = (optional = false) => {
  let validation = body('email');

  if (optional) {
    validation = validation.optional();
  }

  return validation
    .isString()
    .withMessage('Email is required')
    .bail()
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address')
    .customSanitizer((value) => value.toLowerCase());
};

const studentNumberValidation = (optional = false) => {
  let validation = body('student_number');

  if (optional) {
    validation = validation.optional();
  }

  return validation
    .isString()
    .withMessage('Student number is required')
    .bail()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Student number must not exceed 50 characters')
    .matches(/^[A-Za-z0-9/-]+$/)
    .withMessage('Student number contains unsupported characters');
};

const passwordValidation = body('password')
  .isString()
  .withMessage('Password is required')
  .bail()
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .custom((value) => Buffer.byteLength(value, 'utf8') <= 72)
  .withMessage('Password must not exceed 72 bytes')
  .matches(/[A-Za-z]/)
  .withMessage('Password must contain at least one letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number');

const yearOfStudyValidation = body('year_of_study')
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
  );

const sharedAdminStudentValidation = [
  optionalPhone('phone', 'Phone number'),
  optionalText('course', 'Course', 150, 2),
  yearOfStudyValidation,
  optionalText('emergency_contact_name', 'Emergency contact name', 150, 2),
  optionalPhone('emergency_contact_phone', 'Emergency contact phone'),
];

const studentCreateValidation = [
  ensureObjectWithAllowedFields(
    CREATE_STUDENT_FIELDS,
    'Student account details are required'
  ),
  fullNameValidation(),
  emailValidation(),
  passwordValidation,
  studentNumberValidation(),
  ...sharedAdminStudentValidation,
];

const studentAdminUpdateValidation = [
  ensureObjectWithAllowedFields(
    ADMIN_STUDENT_FIELDS,
    'Provide at least one Student field to update'
  ),
  fullNameValidation(true),
  emailValidation(true),
  studentNumberValidation(true),
  ...sharedAdminStudentValidation,
];

const studentProfileUpdateValidation = [
  ensureObjectWithAllowedFields(
    EDITABLE_PROFILE_FIELDS,
    'Provide at least one profile field to update'
  ),
  optionalPhone('phone', 'Phone number'),
  optionalText('course', 'Course', 150, 2),
  yearOfStudyValidation,
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
  studentCreateValidation,
  studentAdminUpdateValidation,
  studentProfileUpdateValidation,
  studentListValidation,
  studentIdentifierValidation,
  studentStatusValidation,
  handleStudentValidation,
};
