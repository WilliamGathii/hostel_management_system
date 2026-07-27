const AppError = require('../utils/app-error');

const APPROVED_ROLES = new Set([
  'student',
  'admin',
  'maintenance_staff',
  'security_staff',
]);

const authorizeRoles = (...allowedRoles) => {
  if (
    allowedRoles.length === 0 ||
    allowedRoles.some((role) => !APPROVED_ROLES.has(role))
  ) {
    throw new Error('Authorization middleware requires approved roles.');
  }

  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError('Authentication is required', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('You do not have permission for this action', 403));
      return;
    }

    next();
  };
};

module.exports = {
  APPROVED_ROLES,
  authorizeRoles,
};
