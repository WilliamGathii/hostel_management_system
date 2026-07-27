import apiClient from '../../../services/api-client';

const data = (response) => response?.data || {};

export const registerVisitor = async (visitorData) => {
  const response = await apiClient.post('/visitors', visitorData);
  return data(response).visitor || null;
};

export const getMyVisitors = async (params = {}) => {
  const response = await apiClient.get('/visitors/me', { params });
  return data(response);
};

export const getVisitors = async (params = {}) => {
  const response = await apiClient.get('/visitors', { params });
  return data(response);
};

export const getVisitor = async (visitorId) => {
  const response = await apiClient.get(`/visitors/${visitorId}`);
  return data(response).visitor || null;
};

export const updateVisitorApproval = async (visitorId, approvalStatus) => {
  const response = await apiClient.patch(`/visitors/${visitorId}/approval`, {
    approval_status: approvalStatus,
  });
  return data(response).visitor || null;
};

export const verifyVisitorEntry = async (visitorId, notes = '') => {
  const response = await apiClient.post(`/visitors/${visitorId}/verify-entry`, {
    notes,
  });
  return data(response).visitor || null;
};

export const verifyVisitorExit = async (visitorId, notes = '') => {
  const response = await apiClient.patch(`/visitors/${visitorId}/verify-exit`, {
    notes,
  });
  return data(response).visitor || null;
};
