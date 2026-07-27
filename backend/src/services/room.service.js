const roomModel = require('../models/room.model');
const notificationService = require('./notification.service');
const AppError = require('../utils/app-error');

const ADMIN_ROLE = 'admin';
const STUDENT_ROLE = 'student';
const ROOM_STATUSES = new Set([
  'available',
  'occupied',
  'full',
  'under_maintenance',
  'inactive',
]);
const BLOCKED_ALLOCATION_STATUSES = new Set([
  'full',
  'under_maintenance',
  'inactive',
]);

const requireRole = (user, role) => {
  if (!user) {
    throw new AppError('Authentication is required', 401);
  }

  if (user.role !== role) {
    throw new AppError('You do not have permission for this action', 403);
  }
};

const normalizeText = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  return value.trim() || null;
};

const normalizeRoomData = (roomData) => {
  const normalized = {};

  ['room_number', 'room_type', 'floor', 'description'].forEach((field) => {
    if (Object.hasOwn(roomData, field)) {
      normalized[field] = normalizeText(roomData[field]);
    }
  });

  if (Object.hasOwn(roomData, 'capacity')) {
    normalized.capacity = Number(roomData.capacity);
  }

  return normalized;
};

const listRooms = async (user, options) => {
  requireRole(user, ADMIN_ROLE);
  const rooms = await roomModel.listRooms(options);
  const total = await roomModel.countRooms(options);

  return {
    rooms,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / options.limit),
    },
  };
};

const getRoom = async (user, roomId) => {
  requireRole(user, ADMIN_ROLE);
  const room = await roomModel.findRoomById(roomId);

  if (!room) {
    throw new AppError('Room was not found', 404);
  }

  return room;
};

const createRoom = async (user, roomData) => {
  requireRole(user, ADMIN_ROLE);

  try {
    return await roomModel.createRoom(normalizeRoomData(roomData));
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('Room number already exists', 409);
    }

    throw error;
  }
};

const updateRoom = async (user, roomId, roomData) => {
  requireRole(user, ADMIN_ROLE);
  const existingRoom = await roomModel.findRoomById(roomId);

  if (!existingRoom) {
    throw new AppError('Room was not found', 404);
  }

  const normalizedData = normalizeRoomData(roomData);

  if (
    normalizedData.capacity !== undefined &&
    normalizedData.capacity < existingRoom.current_occupancy
  ) {
    throw new AppError('Room capacity cannot be below current occupancy', 409);
  }

  return roomModel.updateRoom(roomId, normalizedData);
};

const updateRoomStatus = async (user, roomId, status) => {
  requireRole(user, ADMIN_ROLE);

  if (!ROOM_STATUSES.has(status)) {
    throw new AppError('Room status is not supported', 400);
  }

  const room = await roomModel.findRoomById(roomId);

  if (!room) {
    throw new AppError('Room was not found', 404);
  }

  if (room.status === status) {
    throw new AppError('Room already has this status', 409);
  }

  if (status === 'available' && room.current_occupancy > 0) {
    throw new AppError('An occupied room cannot be marked available', 409);
  }

  if (status === 'full' && room.current_occupancy < room.capacity) {
    throw new AppError('Room occupancy has not reached capacity', 409);
  }

  return roomModel.updateRoomStatus(roomId, status);
};

const getMyAllocation = async (user) => {
  requireRole(user, STUDENT_ROLE);
  const allocation = await roomModel.findCurrentAllocationByUser(user.id);

  if (!allocation) {
    throw new AppError('No active room allocation was found', 404);
  }

  return allocation;
};

const listAllocations = async (user, options) => {
  requireRole(user, ADMIN_ROLE);
  const allocations = await roomModel.listAllocations(options);
  const total = await roomModel.countAllocations(options);

  return {
    allocations,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / options.limit),
    },
  };
};

const ensureRoomCanReceiveAllocation = (room) => {
  if (!room) {
    throw new AppError('Room was not found', 404);
  }

  if (
    BLOCKED_ALLOCATION_STATUSES.has(room.status) ||
    room.current_occupancy >= room.capacity
  ) {
    throw new AppError('Room is not available for allocation', 409);
  }
};

const createAllocation = async (user, allocationData) => {
  requireRole(user, ADMIN_ROLE);

  try {
    return await roomModel.withTransaction(async (database) => {
      const student = await roomModel.findStudentById(
        allocationData.student_id,
        database
      );

      if (!student || student.account_status !== 'active') {
        throw new AppError('Active Student account was not found', 404);
      }

      const existingAllocation = await roomModel.findActiveAllocationByStudent(
        allocationData.student_id,
        database
      );

      if (existingAllocation) {
        throw new AppError('Student already has an active allocation', 409);
      }

      const room = await roomModel.lockRoomById(
        allocationData.room_id,
        database
      );
      ensureRoomCanReceiveAllocation(room);

      const allocationId = await roomModel.insertAllocation(
        {
          ...allocationData,
          allocated_by: user.id,
          notes: normalizeText(allocationData.notes),
        },
        database
      );
      await roomModel.adjustRoomOccupancy(room.id, 1, database);
      await notificationService.createNotification(
        {
          user_id: student.user_id,
          notification_type: 'room_allocation',
          title: 'Room allocated',
          message: `You have been allocated to room ${room.room_number}.`,
          related_entity_type: 'room_allocation',
          related_entity_id: allocationId,
        },
        database
      );

      return roomModel.findAllocationById(allocationId, database);
    });
  } catch (error) {
    if (
      error.code === '23505' &&
      error.constraint === 'room_allocations_one_active_student'
    ) {
      throw new AppError('Student already has an active allocation', 409);
    }

    throw error;
  }
};

const updateAllocation = async (user, allocationId, allocationData) => {
  requireRole(user, ADMIN_ROLE);

  return roomModel.withTransaction(async (database) => {
    const allocation = await roomModel.findAllocationById(
      allocationId,
      database,
      true
    );

    if (!allocation) {
      throw new AppError('Room allocation was not found', 404);
    }

    if (allocation.allocation_status !== 'active') {
      throw new AppError('Only an active allocation can be changed', 409);
    }

    const normalizedData = {
      ...allocationData,
      notes: Object.hasOwn(allocationData, 'notes')
        ? normalizeText(allocationData.notes)
        : undefined,
    };

    if (
      allocationData.room_id &&
      allocationData.room_id !== allocation.room_id
    ) {
      const targetRoom = await roomModel.lockRoomById(
        allocationData.room_id,
        database
      );
      ensureRoomCanReceiveAllocation(targetRoom);

      await roomModel.lockRoomById(allocation.room_id, database);
      await roomModel.adjustRoomOccupancy(allocation.room_id, -1, database);
      await roomModel.adjustRoomOccupancy(targetRoom.id, 1, database);
    }

    await roomModel.updateAllocationRecord(
      allocationId,
      normalizedData,
      database
    );
    return roomModel.findAllocationById(allocationId, database);
  });
};

const endAllocation = async (user, allocationId, endData) => {
  requireRole(user, ADMIN_ROLE);

  return roomModel.withTransaction(async (database) => {
    const allocation = await roomModel.findAllocationById(
      allocationId,
      database,
      true
    );

    if (!allocation) {
      throw new AppError('Room allocation was not found', 404);
    }

    if (allocation.allocation_status !== 'active') {
      throw new AppError('Room allocation is not active', 409);
    }

    await roomModel.lockRoomById(allocation.room_id, database);
    await roomModel.finishAllocation(
      allocationId,
      {
        allocation_status: endData.allocation_status || 'completed',
        actual_end_date: endData.actual_end_date,
        notes: normalizeText(endData.notes),
      },
      database
    );
    await roomModel.adjustRoomOccupancy(allocation.room_id, -1, database);

    return roomModel.findAllocationById(allocationId, database);
  });
};

module.exports = {
  listRooms,
  getRoom,
  createRoom,
  updateRoom,
  updateRoomStatus,
  getMyAllocation,
  listAllocations,
  createAllocation,
  updateAllocation,
  endAllocation,
};
