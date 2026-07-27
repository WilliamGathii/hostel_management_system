import apiClient from '../../../services/api-client';

const data = (response) => response?.data || {};

export const getAnnouncements = async (params = {}) => {
  const response = await apiClient.get('/announcements', { params });
  return data(response);
};

export const createAnnouncement = async (announcementData) => {
  const response = await apiClient.post('/announcements', announcementData);
  return data(response).announcement || null;
};

export const updateAnnouncement = async (announcementId, announcementData) => {
  const response = await apiClient.patch(
    `/announcements/${announcementId}`,
    announcementData
  );
  return data(response).announcement || null;
};

export const deleteAnnouncement = async (announcementId) => {
  const response = await apiClient.delete(`/announcements/${announcementId}`);
  return data(response).announcement_id || null;
};

export const getNotifications = async (params = {}) => {
  const response = await apiClient.get('/notifications', { params });
  return data(response);
};

export const markNotificationRead = async (notificationId) => {
  const response = await apiClient.patch(
    `/notifications/${notificationId}/read`
  );
  return data(response).notification || null;
};

export const markAllNotificationsRead = async () => {
  const response = await apiClient.patch('/notifications/read-all');
  return data(response).updated_count || 0;
};
