const express = require('express');

const reportController = require('../controllers/report.controller');
const authenticate = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');
const {
  reportValidation,
  handleReportValidation,
} = require('../validators/report.validator');

const router = express.Router();

router.use(authenticate);
router.get('/dashboard', reportController.getDashboard);
router.use(authorizeRoles('admin'));
router.get(
  '/rooms',
  reportValidation,
  handleReportValidation,
  reportController.getRoomReport
);
router.get(
  '/students',
  reportValidation,
  handleReportValidation,
  reportController.getStudentReport
);
router.get(
  '/maintenance',
  reportValidation,
  handleReportValidation,
  reportController.getMaintenanceReport
);
router.get(
  '/visitors',
  reportValidation,
  handleReportValidation,
  reportController.getVisitorReport
);
router.get(
  '/payments',
  reportValidation,
  handleReportValidation,
  reportController.getPaymentReport
);

module.exports = router;
