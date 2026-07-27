import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

const RouteLoader = () => (
  <div
    className="flex min-h-screen items-center justify-center bg-page px-4 text-primary"
    role="status"
  >
    <span className="size-8 animate-spin rounded-full border-4 border-primary-soft border-t-primary" />
    <span className="sr-only">Checking your session</span>
  </div>
);

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return children || <Outlet />;
}
