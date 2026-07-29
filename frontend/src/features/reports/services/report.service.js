import apiClient from '../../../services/api-client';

const data = (response) => response?.data || {};

export const getDashboardStats = async () => {
  const response = await apiClient.get('/reports/dashboard');
  return data(response).stats || {};
};

export const getReport = async (reportType, params = {}) => {
  const response = await apiClient.get(`/reports/${reportType}`, { params });
  return data(response)[`${reportType.replace(/s$/, '')}_report`] || {};
};
