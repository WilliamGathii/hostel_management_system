import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { Sidebar } from '../components/navigation/Sidebar';
import { Topbar } from '../components/navigation/Topbar';
import { useAuth } from '../hooks/useAuth';

export function AppLayout({ children }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      navigate('/login', {
        replace: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-page">
      <Sidebar role={user.role} />
      <div className="min-w-0 lg:pl-sidebar">
        <Topbar
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
          pathname={location.pathname}
          user={user}
        />
        <main className="min-h-[calc(100vh-var(--topbar-height))] pb-20 lg:pb-0">
          {children || <Outlet />}
        </main>
        <MobileBottomNav role={user.role} />
      </div>
    </div>
  );
}
