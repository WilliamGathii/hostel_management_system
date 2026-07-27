const express = require('express');

const visitorController = require('../controllers/visitor.controller');
const authenticate = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');
const {
  visitorIdentifierValidation,
  visitorListValidation,
  visitorCreateValidation,
  visitorApprovalValidation,
  visitorVerificationValidation,
  handleVisitorValidation,
} = require('../validators/visitor.validator');

const router = express.Router();

router.use(authenticate);
router.post(
  '/',
  authorizeRoles('student'),
  visitorCreateValidation,
  handleVisitorValidation,
  visitorController.createVisitor
);
router.get(
  '/me',
  authorizeRoles('student'),
  visitorListValidation,
  handleVisitorValidation,
  visitorController.listMyVisitors
);
router.get(
  '/',
  authorizeRoles('admin', 'security_staff'),
  visitorListValidation,
  handleVisitorValidation,
  visitorController.listVisitors
);
router.get(
  '/:visitorId',
  authorizeRoles('student', 'admin', 'security_staff'),
  visitorIdentifierValidation,
  handleVisitorValidation,
  visitorController.getVisitor
);
router.patch(
  '/:visitorId/approval',
  authorizeRoles('admin'),
  visitorIdentifierValidation,
  visitorApprovalValidation,
  handleVisitorValidation,
  visitorController.updateApproval
);
router.post(
  '/:visitorId/verify-entry',
  authorizeRoles('admin', 'security_staff'),
  visitorIdentifierValidation,
  visitorVerificationValidation,
  handleVisitorValidation,
  visitorController.verifyEntry
);
router.patch(
  '/:visitorId/verify-exit',
  authorizeRoles('admin', 'security_staff'),
  visitorIdentifierValidation,
  visitorVerificationValidation,
  handleVisitorValidation,
  visitorController.verifyExit
);

module.exports = router;
