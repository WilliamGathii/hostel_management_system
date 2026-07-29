const { body, matchedData, validationResult } = require('express-validator');

const AppError = require('../utils/app-error');

const normalizeEmail = (value) => value.trim().toLowerCase();

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

const changeRequiredPasswordValidation = [
  body('newPassword')
    .isString()
    .withMessage('New password is required')
    .bail()
    .notEmpty()
    .withMessage('New password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .custom((value) => Buffer.byteLength(value, 'utf8') <= 72)
    .withMessage('Password must not exceed 72 bytes')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain at least one letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('confirmPassword')
    .isString()
    .withMessage('Password confirmation is required')
    .bail()
    .notEmpty()
    .withMessage('Password confirmation is required')
    .bail()
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords must match'),
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
  changeRequiredPasswordValidation,
  loginValidation,
  handleValidationErrors,
};
