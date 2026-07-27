import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { getRoleHomePath } from '../utils/role-home';

export function PublicOnlyRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

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

  return children || <Outlet />;
}
