import apiClient from '../../../services/api-client';

const getResponseData = (response) => response?.data || {};

export const getMyStudentProfile = async () => {
  const response = await apiClient.get('/students/me');
  return getResponseData(response).student || null;
};

export const updateMyStudentProfile = async (profileData) => {
  const response = await apiClient.patch('/students/me', profileData);
  return getResponseData(response).student || null;
};

export const getStudents = async (params = {}) => {
  const response = await apiClient.get('/students', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      status: params.status || undefined,
    },
  });

  return getResponseData(response);
};

export const getStudentById = async (studentId) => {
  const response = await apiClient.get(`/students/${studentId}`);
  return getResponseData(response).student || null;
};

export const updateStudentStatus = async (studentId, accountStatus) => {
  const response = await apiClient.patch(`/students/${studentId}/status`, {
    account_status: accountStatus,
  });

  return getResponseData(response).student || null;
};
