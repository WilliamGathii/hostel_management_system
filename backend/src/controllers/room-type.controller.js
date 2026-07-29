const roomTypeService = require('../services/room-type.service');
const { sendSuccess } = require('../utils/api-response');

const listRoomTypes = async (req, res, next) => {
  try {
    const roomTypes = await roomTypeService.listRoomTypes(req.user, {
      status: req.validatedQuery.status || '',
    });
    return sendSuccess(res, {
      message: 'Room types retrieved successfully',
      data: { room_types: roomTypes },
    });
  } catch (error) {
    return next(error);
  }
};

const getRoomType = async (req, res, next) => {
  try {
    const roomType = await roomTypeService.getRoomType(
      req.user,
      req.validatedParams.roomTypeId
    );
    return sendSuccess(res, {
      message: 'Room type retrieved successfully',
      data: { room_type: roomType },
    });
  } catch (error) {
    return next(error);
  }
};

const createRoomType = async (req, res, next) => {
  try {
    const roomType = await roomTypeService.createRoomType(
      req.user,
      req.validatedBody
    );
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Room type created successfully',
      data: { room_type: roomType },
    });
  } catch (error) {
    return next(error);
  }
};

const updateRoomType = async (req, res, next) => {
  try {
    const roomType = await roomTypeService.updateRoomType(
      req.user,
      req.validatedParams.roomTypeId,
      req.validatedBody
    );
    return sendSuccess(res, {
      message: 'Room type updated successfully',
      data: { room_type: roomType },
    });
  } catch (error) {
    return next(error);
  }
};

const updateRoomTypeStatus = async (req, res, next) => {
  try {
    const roomType = await roomTypeService.updateRoomTypeStatus(
      req.user,
      req.validatedParams.roomTypeId,
      req.validatedBody.status
    );
    return sendSuccess(res, {
      message: 'Room type status updated successfully',
      data: { room_type: roomType },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createRoomType,
  getRoomType,
  listRoomTypes,
  updateRoomType,
  updateRoomTypeStatus,
};
