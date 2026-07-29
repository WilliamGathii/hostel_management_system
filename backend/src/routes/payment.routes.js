const express = require('express');

const paymentController = require('../controllers/payment.controller');
const authenticate = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');
const {
  paymentIdentifierValidation,
  paymentListValidation,
  paymentCreateValidation,
  paymentStatusValidation,
  handlePaymentValidation,
} = require('../validators/payment.validator');

const router = express.Router();

router.use(authenticate);
router.get(
  '/me',
  authorizeRoles('student'),
  paymentListValidation,
  handlePaymentValidation,
  paymentController.listMyPayments
);
router.get(
  '/',
  authorizeRoles('admin'),
  paymentListValidation,
  handlePaymentValidation,
  paymentController.listPayments
);
router.post(
  '/',
  authorizeRoles('student', 'admin'),
  paymentCreateValidation,
  handlePaymentValidation,
  paymentController.createPayment
);
router.get(
  '/:paymentId',
  authorizeRoles('student', 'admin'),
  paymentIdentifierValidation,
  handlePaymentValidation,
  paymentController.getPayment
);
router.patch(
  '/:paymentId/status',
  authorizeRoles('admin'),
  paymentIdentifierValidation,
  paymentStatusValidation,
  handlePaymentValidation,
  paymentController.updatePaymentStatus
);

module.exports = router;
