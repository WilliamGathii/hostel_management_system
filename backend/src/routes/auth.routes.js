const express = require('express');

const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
const authenticatePasswordChange = require('../middleware/authenticate-password-change');
const {
  changeRequiredPasswordValidation,
  loginValidation,
  handleValidationErrors,
} = require('../validators/auth.validator');

const router = express.Router();

router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  authController.login
);
router.post(
  '/change-required-password',
  authenticatePasswordChange,
  changeRequiredPasswordValidation,
  handleValidationErrors,
  authController.changeRequiredPassword
);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
