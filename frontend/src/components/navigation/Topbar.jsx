import { LuLogOut } from 'react-icons/lu';

import { ROLE_LABELS, getNavigationForRole } from '../../config/navigation';

export function Topbar({ user, pathname, onLogout, isLoggingOut }) {
  const currentItem = getNavigationForRole(user.role).find(
    (item) => item.path === pathname
  );

  return (
    <header className="sticky top-0 z-20 flex min-h-topbar items-center justify-between gap-4 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-text">
          {currentItem?.label || 'Hostel Management System'}
        </p>
        <p className="truncate text-xs text-muted lg:hidden">
          Hostel Management System
        </p>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="max-w-48 truncate text-sm font-semibold text-text">
            {user.full_name}
          </p>
          <p className="text-xs text-muted">
            {ROLE_LABELS[user.role] || 'User'}
          </p>
        </div>
        <button
          aria-label="Sign out"
          className="inline-flex min-h-10 items-center gap-2 rounded-card px-3 text-sm font-semibold text-muted hover:bg-page hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
          disabled={isLoggingOut}
          onClick={onLogout}
          title="Sign out"
          type="button"
        >
          <LuLogOut className="size-5" aria-hidden="true" />
          <span className="hidden sm:inline">
            {isLoggingOut ? 'Signing out' : 'Sign out'}
          </span>
        </button>
      </div>
    </header>
  );
}
