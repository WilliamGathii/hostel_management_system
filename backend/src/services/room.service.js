const {
  generateRoomCode,
  generateRoomCodes,
} = require('../../../shared/room-code.js');
const roomModel = require('../models/room.model');
const roomTypeModel = require('../models/room-type.model');
const notificationService = require('./notification.service');
const AppError = require('../utils/app-error');

const ADMIN_ROLE = 'admin';
const STUDENT_ROLE = 'student';
const ROOM_OPERATIONAL_STATUSES = new Set([
  'active',
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

const normalizeText = (value) =>
  value === null || value === undefined ? null : value.trim() || null;

const pagination = (options, total) => ({
  page: options.page,
  limit: options.limit,
  total,
  totalPages: total === 0 ? 0 : Math.ceil(total / options.limit),
});

const listRooms = async (user, options) => {
  requireRole(user, ADMIN_ROLE);
  const [rooms, total] = await Promise.all([
    roomModel.listRooms(options),
    roomModel.countRooms(options),
  ]);

  return { rooms, pagination: pagination(options, total) };
};

const getRoom = async (user, roomId) => {
  requireRole(user, ADMIN_ROLE);
  const room = await roomModel.findRoomById(roomId);

  if (!room) {
    throw new AppError('Room was not found', 404);
  }

  return room;
};

const requireActiveRoomType = async (roomTypeId, database) => {
  const roomType = await roomTypeModel.findRoomTypeById(
    roomTypeId,
    database,
    true
  );

  if (!roomType) {
    throw new AppError('Room type was not found', 404);
  }
  if (roomType.status !== 'active') {
    throw new AppError('Inactive room types cannot generate rooms', 409);
  }

  return roomType;
};

const conflictError = (roomCodes) =>
  new AppError('One or more room codes already exist', 409, [
    {
      field: 'room_codes',
      message: `Conflicting room codes: ${roomCodes.join(', ')}`,
    },
  ]);

const createRoom = async (user, roomData) => {
  requireRole(user, ADMIN_ROLE);

  try {
    return await roomModel.withTransaction(async (database) => {
      const roomType = await requireActiveRoomType(
        roomData.room_type_id,
        database
      );
      const roomCode = generateRoomCode(
        roomType.code,
        roomData.floor_number,
        roomData.room_number
      );
      const generatedRooms = [
        {
          roomCode,
          roomNumber: Number(roomData.room_number),
        },
      ];
      const conflicts = await roomModel.findRoomConflicts(
        roomType.id,
        Number(roomData.floor_number),
        generatedRooms,
        database
      );

      if (conflicts.length > 0) {
        throw conflictError(conflicts);
      }

      return roomModel.createRoom(
        {
          room_type_id: roomType.id,
          floor_number: Number(roomData.floor_number),
          room_number: Number(roomData.room_number),
          room_code: roomCode,
          capacity: roomType.default_capacity,
          description: normalizeText(roomData.description),
        },
        database
      );
    });
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('Room code already exists', 409);
    }
    throw error;
  }
};

const createRoomsBulk = async (user, data) => {
  requireRole(user, ADMIN_ROLE);

  try {
    return await roomModel.withTransaction(async (database) => {
      const roomType = await requireActiveRoomType(data.room_type_id, database);
      const floorNumber = Number(data.floor_number);
      const generatedRooms = generateRoomCodes(
        roomType.code,
        floorNumber,
        data.starting_room_number,
        data.quantity
      );
      const conflicts = await roomModel.findRoomConflicts(
        roomType.id,
        floorNumber,
        generatedRooms,
        database
      );

      if (conflicts.length > 0) {
        throw conflictError(conflicts);
      }

      await roomModel.createRooms(
        generatedRooms.map((room) => ({
          room_type_id: roomType.id,
          floor_number: floorNumber,
          room_number: room.roomNumber,
          room_code: room.roomCode,
          capacity: roomType.default_capacity,
          description: null,
        })),
        database
      );

      const roomCodes = generatedRooms.map((room) => room.roomCode);

      return {
        created_count: roomCodes.length,
        floor_number: floorNumber,
        room_type: {
          id: roomType.id,
          code: roomType.code,
          name: roomType.name,
          default_capacity: roomType.default_capacity,
        },
        first_room_code: roomCodes[0],
        last_room_code: roomCodes.at(-1),
        room_codes: roomCodes,
      };
    });
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('One or more room codes already exist', 409);
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

  const normalizedData = {};

  if (Object.hasOwn(roomData, 'capacity')) {
    normalizedData.capacity = Number(roomData.capacity);

    if (normalizedData.capacity < existingRoom.current_occupancy) {
      throw new AppError(
        'Room capacity cannot be below current occupancy',
        409
      );
    }
  }
  if (Object.hasOwn(roomData, 'description')) {
    normalizedData.description = normalizeText(roomData.description);
  }

  return roomModel.updateRoom(roomId, normalizedData);
};

const updateRoomStatus = async (user, roomId, status) => {
  requireRole(user, ADMIN_ROLE);

  if (!ROOM_OPERATIONAL_STATUSES.has(status)) {
    throw new AppError('Room operational status is not supported', 400);
  }

  const room = await roomModel.findRoomById(roomId);

  if (!room) {
    throw new AppError('Room was not found', 404);
  }
  if (room.operational_status === status) {
    throw new AppError('Room already has this operational status', 409);
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
  const [allocations, total] = await Promise.all([
    roomModel.listAllocations(options),
    roomModel.countAllocations(options),
  ]);

  return { allocations, pagination: pagination(options, total) };
};

const ensureRoomCanReceiveAllocation = (room) => {
  if (!room) {
    throw new AppError('Room was not found', 404);
  }
  if (
    room.operational_status !== 'active' ||
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
          monthly_rate_at_allocation: room.monthly_rate,
          notes: normalizeText(allocationData.notes),
        },
        database
      );
      await notificationService.createNotification(
        {
          user_id: student.user_id,
          notification_type: 'room_allocation',
          title: 'Room allocated',
          message: `You have been allocated to room ${room.room_code}.`,
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
      normalizedData.monthly_rate_at_allocation = targetRoom.monthly_rate;
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

    await roomModel.finishAllocation(
      allocationId,
      {
        allocation_status: endData.allocation_status || 'completed',
        actual_end_date: endData.actual_end_date,
        notes: normalizeText(endData.notes),
      },
      database
    );

    return roomModel.findAllocationById(allocationId, database);
  });
};

module.exports = {
  createAllocation,
  createRoom,
  createRoomsBulk,
  endAllocation,
  getMyAllocation,
  getRoom,
  listAllocations,
  listRooms,
  updateAllocation,
  updateRoom,
  updateRoomStatus,
};
