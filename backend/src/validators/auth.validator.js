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
  loginValidation,
  handleValidationErrors,
};
