const express = require('express');

const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
const {
  registerValidation,
  loginValidation,
  handleValidationErrors,
} = require('../validators/auth.validator');

const router = express.Router();

router.post(
  '/register',
  registerValidation,
  handleValidationErrors,
  authController.register
);
router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  authController.login
);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
