import { LuBuilding2, LuLogOut } from 'react-icons/lu';

import { ROLE_LABELS, getNavigationForRole } from '../../config/navigation';

export function Topbar({ user, pathname, onLogout, isLoggingOut }) {
  const currentItem = getNavigationForRole(user.role).find((item) =>
    pathname.startsWith(item.path)
  );

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 bg-page/95 px-4 backdrop-blur sm:px-6 lg:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-card bg-primary text-white">
          <LuBuilding2 className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text">
            {currentItem?.label || 'Hostel Management'}
          </p>
          <p className="truncate text-xs text-muted">
            {ROLE_LABELS[user.role] || 'User'}
          </p>
        </div>
      </div>

      <button
        aria-label="Sign out"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-card text-muted hover:bg-error-soft hover:text-error focus-visible:outline-primary disabled:opacity-60"
        disabled={isLoggingOut}
        onClick={onLogout}
        title="Sign out"
        type="button"
      >
        <LuLogOut className="size-5" aria-hidden="true" />
      </button>
    </header>
  );
}
