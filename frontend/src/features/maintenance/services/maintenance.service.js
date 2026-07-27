import apiClient from '../../../services/api-client';

const data = (response) => response?.data || {};

export const submitMaintenanceRequest = async (requestData) => {
  const response = await apiClient.post('/maintenance-requests', requestData);
  return data(response).maintenance_request || null;
};

export const getMyMaintenanceRequests = async (params = {}) => {
  const response = await apiClient.get('/maintenance-requests/me', {
    params,
  });
  return data(response);
};

export const getMaintenanceRequests = async (params = {}) => {
  const response = await apiClient.get('/maintenance-requests', { params });
  return data(response);
};

export const getMaintenanceRequest = async (requestId) => {
  const response = await apiClient.get(`/maintenance-requests/${requestId}`);
  return data(response);
};

export const assignMaintenanceRequest = async (requestId, staffId) => {
  const response = await apiClient.patch(
    `/maintenance-requests/${requestId}/assign`,
    { assigned_staff_id: staffId }
  );
  return data(response).maintenance_request || null;
};

export const updateMaintenanceStatus = async (requestId, status, note = '') => {
  const response = await apiClient.patch(
    `/maintenance-requests/${requestId}/status`,
    { status, note }
  );
  return data(response).maintenance_request || null;
};

export const addMaintenanceUpdate = async (requestId, note) => {
  const response = await apiClient.post(
    `/maintenance-requests/${requestId}/updates`,
    { note }
  );
  return data(response).update || null;
};
