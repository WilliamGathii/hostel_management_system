import apiClient from '../../../services/api-client';

const data = (response) => response?.data || {};

export const getRooms = async (params = {}) => {
  const response = await apiClient.get('/rooms', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      status: params.status || undefined,
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
    },
  });
  return data(response);
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
