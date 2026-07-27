const announcementModel = require('../models/announcement.model');
const AppError = require('../utils/app-error');

const requireAdmin = (user) => {
  if (!user) {
    throw new AppError('Authentication is required', 401);
  }
  if (user.role !== 'admin') {
    throw new AppError('You do not have permission for this action', 403);
  }
};

const normalizeOptionalText = (value) =>
  value === null || value === undefined ? null : value.trim() || null;

const normalizeData = (data, existing = null) => {
  const normalized = {};
  ['title', 'message'].forEach((field) => {
    if (Object.hasOwn(data, field)) {
      normalized[field] = data[field].trim();
    }
  });
  if (Object.hasOwn(data, 'target_role')) {
    normalized.target_role =
      data.target_role === 'all'
        ? null
        : normalizeOptionalText(data.target_role);
  }
  if (Object.hasOwn(data, 'expires_at')) {
    normalized.expires_at = data.expires_at || null;
  }
  if (Object.hasOwn(data, 'status')) {
    normalized.status = data.status;
  }
  if (Object.hasOwn(data, 'published_at')) {
    normalized.published_at = data.published_at || null;
  }

  const finalStatus = normalized.status || existing?.status || 'draft';
  if (
    finalStatus === 'published' &&
    !normalized.published_at &&
    !existing?.published_at
  ) {
    normalized.published_at = new Date();
  }
  return normalized;
};

const listAnnouncements = async (user, options) => {
  if (!user) {
    throw new AppError('Authentication is required', 401);
  }
  const query = {
    ...options,
    role: user.role,
    isAdmin: user.role === 'admin',
  };
  const announcements = await announcementModel.listAnnouncements(query);
  const total = await announcementModel.countAnnouncements(query);
  return {
    announcements,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / options.limit),
    },
  };
};

const createAnnouncement = async (user, data) => {
  requireAdmin(user);
  return announcementModel.withTransaction(async (database) => {
    const normalized = normalizeData(data);
    const announcementId = await announcementModel.createAnnouncement(
      { ...normalized, created_by: user.id },
      database
    );
    const announcement = await announcementModel.findAnnouncementById(
      announcementId,
      database
    );
    if (announcement.status === 'published') {
      await announcementModel.createRecipientsAndNotifications(
        announcement,
        database
      );
    }
    return announcement;
  });
};

const updateAnnouncement = async (user, announcementId, data) => {
  requireAdmin(user);
  return announcementModel.withTransaction(async (database) => {
    const existing = await announcementModel.findAnnouncementById(
      announcementId,
      database,
      true
    );
    if (!existing) {
      throw new AppError('Announcement was not found', 404);
    }
    if (
      existing.status === 'published' &&
      Object.hasOwn(data, 'target_role') &&
      (data.target_role === 'all' ? null : data.target_role) !==
        existing.target_role
    ) {
      throw new AppError('The audience cannot change after publication', 409);
    }

    const normalized = normalizeData(data, existing);
    await announcementModel.updateAnnouncement(
      announcementId,
      normalized,
      database
    );
    const announcement = await announcementModel.findAnnouncementById(
      announcementId,
      database
    );
    if (
      existing.status !== 'published' &&
      announcement.status === 'published'
    ) {
      await announcementModel.createRecipientsAndNotifications(
        announcement,
        database
      );
    }
    return announcement;
  });
};

const deleteAnnouncement = async (user, announcementId) => {
  requireAdmin(user);
  const deleted = await announcementModel.deleteAnnouncement(announcementId);
  if (!deleted) {
    throw new AppError('Announcement was not found', 404);
  }
  return deleted.id;
};

module.exports = {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
