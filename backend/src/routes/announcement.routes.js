const express = require('express');

const announcementController = require('../controllers/announcement.controller');
const authenticate = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');
const {
  announcementIdentifierValidation,
  announcementListValidation,
  announcementCreateValidation,
  announcementUpdateValidation,
  handleAnnouncementValidation,
} = require('../validators/announcement.validator');

const router = express.Router();

router.use(authenticate);
router.get(
  '/',
  announcementListValidation,
  handleAnnouncementValidation,
  announcementController.listAnnouncements
);
router.post(
  '/',
  authorizeRoles('admin'),
  announcementCreateValidation,
  handleAnnouncementValidation,
  announcementController.createAnnouncement
);
router.patch(
  '/:announcementId',
  authorizeRoles('admin'),
  announcementIdentifierValidation,
  announcementUpdateValidation,
  handleAnnouncementValidation,
  announcementController.updateAnnouncement
);
router.delete(
  '/:announcementId',
  authorizeRoles('admin'),
  announcementIdentifierValidation,
  handleAnnouncementValidation,
  announcementController.deleteAnnouncement
);

module.exports = router;
