const express = require('express');

const studentController = require('../controllers/student.controller');
const authenticate = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');
const {
  studentCreateValidation,
  studentAdminUpdateValidation,
  studentProfileUpdateValidation,
  studentListValidation,
  studentIdentifierValidation,
  studentStatusValidation,
  handleStudentValidation,
} = require('../validators/student.validator');

const router = express.Router();

router.get(
  '/me',
  authenticate,
  authorizeRoles('student'),
  studentController.getMyProfile
);
router.patch(
  '/me',
  authenticate,
  authorizeRoles('student'),
  studentProfileUpdateValidation,
  handleStudentValidation,
  studentController.updateMyProfile
);
router.get(
  '/',
  authenticate,
  authorizeRoles('admin'),
  studentListValidation,
  handleStudentValidation,
  studentController.listStudents
);
router.post(
  '/',
  authenticate,
  authorizeRoles('admin'),
  studentCreateValidation,
  handleStudentValidation,
  studentController.createStudent
);
router.get(
  '/:studentId',
  authenticate,
  authorizeRoles('admin'),
  studentIdentifierValidation,
  handleStudentValidation,
  studentController.getStudent
);
router.patch(
  '/:studentId',
  authenticate,
  authorizeRoles('admin'),
  studentIdentifierValidation,
  studentAdminUpdateValidation,
  handleStudentValidation,
  studentController.updateStudent
);
router.patch(
  '/:studentId/status',
  authenticate,
  authorizeRoles('admin'),
  studentIdentifierValidation,
  studentStatusValidation,
  handleStudentValidation,
  studentController.updateStudentStatus
);

module.exports = router;
