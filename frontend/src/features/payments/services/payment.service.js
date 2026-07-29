import apiClient from '../../../services/api-client';

const data = (response) => response?.data || {};

export const getMyPayments = async (params = {}) => {
  const response = await apiClient.get('/payments/me', { params });
  return data(response);
};

export const getPayments = async (params = {}) => {
  const response = await apiClient.get('/payments', { params });
  return data(response);
};

export const getPaymentById = async (paymentId) => {
  const response = await apiClient.get(`/payments/${paymentId}`);
  return data(response).payment || null;
};

export const createPayment = async (paymentData) => {
  const response = await apiClient.post('/payments', paymentData);
  return data(response).payment || null;
};

export const updatePaymentStatus = async (paymentId, paymentData) => {
  const response = await apiClient.patch(
    `/payments/${paymentId}/status`,
    paymentData
  );
  return data(response).payment || null;
};
