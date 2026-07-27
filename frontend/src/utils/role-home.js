export const ROLE_HOME_PATHS = Object.freeze({
  student: '/student/dashboard',
  admin: '/admin/dashboard',
  maintenance_staff: '/maintenance/dashboard',
  security_staff: '/security/dashboard',
});

export const getRoleHomePath = (role) =>
  ROLE_HOME_PATHS[role] || '/unauthorized';
