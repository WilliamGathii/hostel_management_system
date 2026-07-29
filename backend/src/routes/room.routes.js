const express = require('express');

const roomController = require('../controllers/room.controller');
const authenticate = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');
const {
  roomIdentifierValidation,
  roomListValidation,
  roomCreateValidation,
  roomBulkCreateValidation,
  roomUpdateValidation,
  roomStatusValidation,
  handleRoomValidation,
} = require('../validators/room.validator');

const router = express.Router();

router.use(authenticate, authorizeRoles('admin'));
router.get(
  '/',
  roomListValidation,
  handleRoomValidation,
  roomController.listRooms
);
router.post(
  '/bulk',
  roomBulkCreateValidation,
  handleRoomValidation,
  roomController.createRoomsBulk
);
router.post(
  '/',
  roomCreateValidation,
  handleRoomValidation,
  roomController.createRoom
);
router.get(
  '/:roomId',
  roomIdentifierValidation,
  handleRoomValidation,
  roomController.getRoom
);
router.patch(
  '/:roomId',
  roomIdentifierValidation,
  roomUpdateValidation,
  handleRoomValidation,
  roomController.updateRoom
);
router.patch(
  '/:roomId/status',
  roomIdentifierValidation,
  roomStatusValidation,
  handleRoomValidation,
  roomController.updateRoomStatus
);

module.exports = router;
