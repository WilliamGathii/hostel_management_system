const express = require('express');

const roomController = require('../controllers/room.controller');
const authenticate = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');
const {
  allocationIdentifierValidation,
  allocationListValidation,
  allocationCreateValidation,
  allocationUpdateValidation,
  allocationEndValidation,
  handleRoomValidation,
} = require('../validators/room.validator');

const router = express.Router();

router.get(
  '/me',
  authenticate,
  authorizeRoles('student'),
  roomController.getMyAllocation
);
router.get(
  '/',
  authenticate,
  authorizeRoles('admin'),
  allocationListValidation,
  handleRoomValidation,
  roomController.listAllocations
);
router.post(
  '/',
  authenticate,
  authorizeRoles('admin'),
  allocationCreateValidation,
  handleRoomValidation,
  roomController.createAllocation
);
router.patch(
  '/:allocationId',
  authenticate,
  authorizeRoles('admin'),
  allocationIdentifierValidation,
  allocationUpdateValidation,
  handleRoomValidation,
  roomController.updateAllocation
);
router.patch(
  '/:allocationId/end',
  authenticate,
  authorizeRoles('admin'),
  allocationIdentifierValidation,
  allocationEndValidation,
  handleRoomValidation,
  roomController.endAllocation
);

module.exports = router;
