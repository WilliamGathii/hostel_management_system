const roomTypeModel = require('../models/room-type.model');
const AppError = require('../utils/app-error');

const requireAdmin = (user) => {
  if (!user) {
    throw new AppError('Authentication is required', 401);
  }

  if (user.role !== 'admin') {
    throw new AppError('You do not have permission for this action', 403);
  }
};

const normalizeText = (value) =>
  value === null || value === undefined ? null : value.trim() || null;

const normalizeRoomType = (data) => {
  const normalized = {};

  if (Object.hasOwn(data, 'code')) {
    normalized.code = data.code.trim().toUpperCase();
  }
  if (Object.hasOwn(data, 'name')) {
    normalized.name = data.name.trim();
  }
  if (Object.hasOwn(data, 'monthly_rate')) {
    normalized.monthly_rate = Number(data.monthly_rate);
  }
  if (Object.hasOwn(data, 'default_capacity')) {
    normalized.default_capacity = Number(data.default_capacity);
  }
  if (Object.hasOwn(data, 'description')) {
    normalized.description = normalizeText(data.description);
  }

  return normalized;
};

const handleUniqueConflict = (error) => {
  if (error.code !== '23505') {
    throw error;
  }

  if (error.constraint === 'room_types_code_key') {
    throw new AppError('Room type code already exists', 409);
  }

  throw new AppError('Room type name already exists', 409);
};

const listRoomTypes = async (user, options) => {
  requireAdmin(user);
  return roomTypeModel.listRoomTypes(options);
};

const getRoomType = async (user, roomTypeId) => {
  requireAdmin(user);
  const roomType = await roomTypeModel.findRoomTypeById(roomTypeId);

  if (!roomType) {
    throw new AppError('Room type was not found', 404);
  }

  return roomType;
};

const createRoomType = async (user, data) => {
  requireAdmin(user);

  try {
    return await roomTypeModel.createRoomType(normalizeRoomType(data));
  } catch (error) {
    return handleUniqueConflict(error);
  }
};

const updateRoomType = async (user, roomTypeId, data) => {
  requireAdmin(user);
  const roomType = await roomTypeModel.findRoomTypeById(roomTypeId);

  if (!roomType) {
    throw new AppError('Room type was not found', 404);
  }

  try {
    return await roomTypeModel.updateRoomType(
      roomTypeId,
      normalizeRoomType(data)
    );
  } catch (error) {
    return handleUniqueConflict(error);
  }
};

const updateRoomTypeStatus = async (user, roomTypeId, status) => {
  requireAdmin(user);
  const roomType = await roomTypeModel.findRoomTypeById(roomTypeId);

  if (!roomType) {
    throw new AppError('Room type was not found', 404);
  }
  if (roomType.status === status) {
    throw new AppError('Room type already has this status', 409);
  }

  return roomTypeModel.updateRoomTypeStatus(roomTypeId, status);
};

module.exports = {
  createRoomType,
  getRoomType,
  listRoomTypes,
  updateRoomType,
  updateRoomTypeStatus,
};
