import apiClient from '../../../services/api-client';

const data = (response) => response?.data || {};

export const getRooms = async (params = {}) => {
  const response = await apiClient.get('/rooms', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      floor: params.floor || undefined,
      room_type_id: params.room_type_id || undefined,
      room_type_code: params.room_type_code || undefined,
      operational_status: params.operational_status || undefined,
      occupancy_status: params.occupancy_status || undefined,
    },
  });
  return data(response);
};

export const getRoomById = async (roomId) => {
  const response = await apiClient.get(`/rooms/${roomId}`);
  return data(response).room || null;
};

export const createRoom = async (roomData) => {
  const response = await apiClient.post('/rooms', roomData);
  return data(response).room || null;
};

export const createRoomsBulk = async (roomData) => {
  const response = await apiClient.post('/rooms/bulk', roomData);
  return data(response);
};

export const updateRoom = async (roomId, roomData) => {
  const response = await apiClient.patch(`/rooms/${roomId}`, roomData);
  return data(response).room || null;
};

export const updateRoomStatus = async (roomId, status) => {
  const response = await apiClient.patch(`/rooms/${roomId}/status`, {
    status,
  });
  return data(response).room || null;
};

export const getMyAllocation = async () => {
  const response = await apiClient.get('/allocations/me');
  return data(response).allocation || null;
};

export const getAllocations = async (params = {}) => {
  const response = await apiClient.get('/allocations', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      status: params.status || undefined,
      student_id: params.student_id || undefined,
      room_id: params.room_id || undefined,
    },
  });
  return data(response);
};

export const getRoomTypes = async (params = {}) => {
  const response = await apiClient.get('/room-types', { params });
  return data(response).room_types || [];
};

export const getRoomTypeById = async (roomTypeId) => {
  const response = await apiClient.get(`/room-types/${roomTypeId}`);
  return data(response).room_type || null;
};

export const createRoomType = async (roomTypeData) => {
  const response = await apiClient.post('/room-types', roomTypeData);
  return data(response).room_type || null;
};

export const updateRoomType = async (roomTypeId, roomTypeData) => {
  const response = await apiClient.patch(
    `/room-types/${roomTypeId}`,
    roomTypeData
  );
  return data(response).room_type || null;
};

export const updateRoomTypeStatus = async (roomTypeId, status) => {
  const response = await apiClient.patch(`/room-types/${roomTypeId}/status`, {
    status,
  });
  return data(response).room_type || null;
};

export const createAllocation = async (allocationData) => {
  const response = await apiClient.post('/allocations', allocationData);
  return data(response).allocation || null;
};

export const updateAllocation = async (allocationId, allocationData) => {
  const response = await apiClient.patch(
    `/allocations/${allocationId}`,
    allocationData
  );
  return data(response).allocation || null;
};

export const endAllocation = async (allocationId, endData) => {
  const response = await apiClient.patch(
    `/allocations/${allocationId}/end`,
    endData
  );
  return data(response).allocation || null;
};
