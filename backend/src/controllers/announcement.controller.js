const announcementService = require('../services/announcement.service');
const { sendSuccess } = require('../utils/api-response');

const listAnnouncements = async (req, res, next) => {
  try {
    const result = await announcementService.listAnnouncements(req.user, {
      page: req.validatedQuery.page || 1,
      limit: req.validatedQuery.limit || 20,
      search: req.validatedQuery.search || '',
      status: req.validatedQuery.status || '',
    });
    return sendSuccess(res, {
      message: 'Announcements retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.createAnnouncement(
      req.user,
      req.validatedBody
    );
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Announcement created successfully',
      data: { announcement },
    });
  } catch (error) {
    return next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.updateAnnouncement(
      req.user,
      req.validatedParams.announcementId,
      req.validatedBody
    );
    return sendSuccess(res, {
      message: 'Announcement updated successfully',
      data: { announcement },
    });
  } catch (error) {
    return next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcementId = await announcementService.deleteAnnouncement(
      req.user,
      req.validatedParams.announcementId
    );
    return sendSuccess(res, {
      message: 'Announcement deleted successfully',
      data: { announcement_id: announcementId },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
