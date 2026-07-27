const express = require('express');

const maintenanceController = require('../controllers/maintenance.controller');
const authenticate = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');
const {
  listValidation,
  requestIdentifierValidation,
  requestCreateValidation,
  requestAssignValidation,
  requestStatusValidation,
  requestUpdateValidation,
  handleMaintenanceValidation,
} = require('../validators/maintenance.validator');

const router = express.Router();

router.use(authenticate);
router.post(
  '/',
  authorizeRoles('student'),
  requestCreateValidation,
  handleMaintenanceValidation,
  maintenanceController.createRequest
);
router.get(
  '/me',
  authorizeRoles('student'),
  listValidation,
  handleMaintenanceValidation,
  maintenanceController.listMyRequests
);
router.get(
  '/',
  authorizeRoles('admin', 'maintenance_staff'),
  listValidation,
  handleMaintenanceValidation,
  maintenanceController.listRequests
);
router.get(
  '/:requestId',
  authorizeRoles('student', 'admin', 'maintenance_staff'),
  requestIdentifierValidation,
  handleMaintenanceValidation,
  maintenanceController.getRequest
);
router.patch(
  '/:requestId/assign',
  authorizeRoles('admin'),
  requestIdentifierValidation,
  requestAssignValidation,
  handleMaintenanceValidation,
  maintenanceController.assignRequest
);
router.patch(
  '/:requestId/status',
  authorizeRoles('admin', 'maintenance_staff'),
  requestIdentifierValidation,
  requestStatusValidation,
  handleMaintenanceValidation,
  maintenanceController.updateStatus
);
router.post(
  '/:requestId/updates',
  authorizeRoles('admin', 'maintenance_staff'),
  requestIdentifierValidation,
  requestUpdateValidation,
  handleMaintenanceValidation,
  maintenanceController.addUpdate
);

module.exports = router;
