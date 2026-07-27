const { body, matchedData, validationResult } = require('express-validator');

const AppError = require('../utils/app-error');

const normalizeEmail = (value) => value.trim().toLowerCase();

const registerValidation = [
  body('full_name')
    .isString()
    .withMessage('Full name is required')
    .bail()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Full name must be between 2 and 150 characters'),
  body('email')
    .isString()
    .withMessage('Email is required')
    .bail()
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address')
    .customSanitizer(normalizeEmail),
  body('phone')
    .isString()
    .withMessage('Phone number is required')
    .bail()
    .trim()
    .isLength({ min: 7, max: 30 })
    .withMessage('Phone number must be between 7 and 30 characters')
    .matches(/^[0-9+()\-\s]+$/)
    .withMessage('Enter a valid phone number'),
  body('password')
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
    .withMessage('Password must contain at least one number'),
  body('student_number')
    .isString()
    .withMessage('Student number is required')
    .bail()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Student number must not exceed 50 characters')
    .matches(/^[A-Za-z0-9/-]+$/)
    .withMessage('Student number contains unsupported characters'),
  body('course')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Course must be text')
    .bail()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Course must be between 2 and 150 characters'),
  body('year_of_study')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('Year of study must be a positive number')
    .toInt(),
  body('emergency_contact_name')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Emergency contact name must be text')
    .bail()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Emergency contact name must be between 2 and 150 characters'),
  body('emergency_contact_phone')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Emergency contact phone must be text')
    .bail()
    .trim()
    .isLength({ min: 7, max: 30 })
    .withMessage('Emergency contact phone must be between 7 and 30 characters')
    .matches(/^[0-9+()\-\s]+$/)
    .withMessage('Enter a valid emergency contact phone number'),
];

const loginValidation = [
  body('email')
    .isString()
    .withMessage('Email is required')
    .bail()
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address')
    .customSanitizer(normalizeEmail),
  body('password')
    .isString()
    .withMessage('Password is required')
    .bail()
    .notEmpty()
    .withMessage('Password is required'),
];

const handleValidationErrors = (req, _res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    next(new AppError('Validation failed', 422, errors));
    return;
  }

  req.validatedBody = matchedData(req, {
    locations: ['body'],
    includeOptionals: true,
  });
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  handleValidationErrors,
};
