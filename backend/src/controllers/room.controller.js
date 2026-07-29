const roomService = require('../services/room.service');
const { sendSuccess } = require('../utils/api-response');

const listRooms = async (req, res, next) => {
  try {
    const result = await roomService.listRooms(req.user, {
      page: req.validatedQuery.page || 1,
      limit: req.validatedQuery.limit || 20,
      search: req.validatedQuery.search || '',
      floor: req.validatedQuery.floor || '',
      roomTypeId: req.validatedQuery.room_type_id || '',
      roomTypeCode: req.validatedQuery.room_type_code || '',
      operationalStatus: req.validatedQuery.operational_status || '',
      occupancyStatus: req.validatedQuery.occupancy_status || '',
    });
    return sendSuccess(res, {
      message: 'Rooms retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const createRoomsBulk = async (req, res, next) => {
  try {
    const result = await roomService.createRoomsBulk(
      req.user,
      req.validatedBody
    );
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Rooms generated successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const getRoom = async (req, res, next) => {
  try {
    const room = await roomService.getRoom(
      req.user,
      req.validatedParams.roomId
    );
    return sendSuccess(res, {
      message: 'Room retrieved successfully',
      data: { room },
    });
  } catch (error) {
    return next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const room = await roomService.createRoom(req.user, req.validatedBody);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Room created successfully',
      data: { room },
    });
  } catch (error) {
    return next(error);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const room = await roomService.updateRoom(
      req.user,
      req.validatedParams.roomId,
      req.validatedBody
    );
    return sendSuccess(res, {
      message: 'Room updated successfully',
      data: { room },
    });
  } catch (error) {
    return next(error);
  }
};

const updateRoomStatus = async (req, res, next) => {
  try {
    const room = await roomService.updateRoomStatus(
      req.user,
      req.validatedParams.roomId,
      req.validatedBody.status
    );
    return sendSuccess(res, {
      message: 'Room status updated successfully',
      data: { room },
    });
  } catch (error) {
    return next(error);
  }
};

const getMyAllocation = async (req, res, next) => {
  try {
    const allocation = await roomService.getMyAllocation(req.user);
    return sendSuccess(res, {
      message: 'Room allocation retrieved successfully',
      data: { allocation },
    });
  } catch (error) {
    return next(error);
  }
};

const listAllocations = async (req, res, next) => {
  try {
    const result = await roomService.listAllocations(req.user, {
      page: req.validatedQuery.page || 1,
      limit: req.validatedQuery.limit || 20,
      search: req.validatedQuery.search || '',
      status: req.validatedQuery.status || '',
      roomId: req.validatedQuery.room_id || '',
      studentId: req.validatedQuery.student_id || '',
    });
    return sendSuccess(res, {
      message: 'Room allocations retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const createAllocation = async (req, res, next) => {
  try {
    const allocation = await roomService.createAllocation(
      req.user,
      req.validatedBody
    );
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Student allocated successfully',
      data: { allocation },
    });
  } catch (error) {
    return next(error);
  }
};

const updateAllocation = async (req, res, next) => {
  try {
    const allocation = await roomService.updateAllocation(
      req.user,
      req.validatedParams.allocationId,
      req.validatedBody
    );
    return sendSuccess(res, {
      message: 'Room allocation updated successfully',
      data: { allocation },
    });
  } catch (error) {
    return next(error);
  }
};

const endAllocation = async (req, res, next) => {
  try {
    const allocation = await roomService.endAllocation(
      req.user,
      req.validatedParams.allocationId,
      req.validatedBody
    );
    return sendSuccess(res, {
      message: 'Room allocation ended successfully',
      data: { allocation },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listRooms,
  getRoom,
  createRoom,
  createRoomsBulk,
  updateRoom,
  updateRoomStatus,
  getMyAllocation,
  listAllocations,
  createAllocation,
  updateAllocation,
  endAllocation,
};
