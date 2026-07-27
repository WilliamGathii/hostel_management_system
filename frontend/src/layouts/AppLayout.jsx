import { useEffect, useState } from 'react';
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

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

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
      <Sidebar
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
        user={user}
      />
      <div className="min-w-0 lg:pl-[calc(var(--sidebar-width)+2.25rem)]">
        <Topbar
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
          pathname={location.pathname}
          user={user}
        />
        <main className="min-h-screen pb-24 lg:pb-8 lg:pt-2">
          {children || <Outlet />}
        </main>
        <MobileBottomNav role={user.role} />
      </div>
    </div>
  );
}
