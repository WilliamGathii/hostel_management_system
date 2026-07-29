import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { getRoleHomePath } from '../utils/role-home';

export function PasswordChangeRoute({ children }) {
  const { user, isAuthenticated, isLoading, isPasswordChangeRequired } =
    useAuth();

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-page px-4 text-primary"
        role="status"
      >
        Checking your session
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  if (!isPasswordChangeRequired) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          notice: 'Please log in again to change your temporary password.',
          noticeVariant: 'information',
        }}
      />
    );
  }

  return children || <Outlet />;
}
