const express = require('express');

const roomTypeController = require('../controllers/room-type.controller');
const authenticate = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');
const {
  handleRoomTypeValidation,
  roomTypeCreateValidation,
  roomTypeIdentifierValidation,
  roomTypeListValidation,
  roomTypeStatusValidation,
  roomTypeUpdateValidation,
} = require('../validators/room-type.validator');

const router = express.Router();

router.use(authenticate, authorizeRoles('admin'));
router.get(
  '/',
  roomTypeListValidation,
  handleRoomTypeValidation,
  roomTypeController.listRoomTypes
);
router.post(
  '/',
  roomTypeCreateValidation,
  handleRoomTypeValidation,
  roomTypeController.createRoomType
);
router.get(
  '/:roomTypeId',
  roomTypeIdentifierValidation,
  handleRoomTypeValidation,
  roomTypeController.getRoomType
);
router.patch(
  '/:roomTypeId',
  roomTypeIdentifierValidation,
  roomTypeUpdateValidation,
  handleRoomTypeValidation,
  roomTypeController.updateRoomType
);
router.patch(
  '/:roomTypeId/status',
  roomTypeIdentifierValidation,
  roomTypeStatusValidation,
  handleRoomTypeValidation,
  roomTypeController.updateRoomTypeStatus
);

module.exports = router;
