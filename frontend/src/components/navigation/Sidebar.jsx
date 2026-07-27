import { LuBuilding2, LuLogOut } from 'react-icons/lu';
import { NavLink } from 'react-router-dom';

import {
  ROLE_LABELS,
  getNavigationForRole,
} from '../../config/navigation';

const getLinkClassName = ({ isActive }) =>
  `group relative flex min-h-11 items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
    isActive
      ? 'bg-periwinkle-light text-primary'
      : 'text-muted hover:bg-page hover:text-text'
  }`;

const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'HM';

export function Sidebar({ user, onLogout, isLoggingOut }) {
  const navigation = getNavigationForRole(user.role);

  return (
    <aside className="fixed top-4 bottom-4 left-4 z-30 hidden w-sidebar flex-col overflow-hidden rounded-card bg-card shadow-elevated lg:flex">
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="flex size-10 items-center justify-center rounded-card bg-primary text-white">
          <LuBuilding2 className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-primary">
            Hostel Management
          </p>
          <p className="text-xs text-muted">Resident services</p>
        </div>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-3 py-2"
        aria-label="Main navigation"
      >
        <p className="px-3 pb-2 text-xs font-semibold text-muted">Workspace</p>
        <ul className="space-y-0.5">
          {navigation.map(({ Icon, label, path }) => (
            <li key={path}>
              <NavLink className={getLinkClassName} to={path}>
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="m-3 rounded-card bg-page p-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-periwinkle text-sm font-bold text-primary">
            {getInitials(user.full_name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">
              {user.full_name}
            </p>
            <p className="truncate text-xs text-muted">
              {ROLE_LABELS[user.role] || 'User'}
            </p>
          </div>
        </div>
        <button
          aria-label="Sign out"
          className="mt-3 flex min-h-10 w-full items-center gap-2 rounded-card px-2.5 text-sm font-semibold text-muted hover:bg-error-soft hover:text-error focus-visible:outline-primary disabled:opacity-60"
          disabled={isLoggingOut}
          onClick={onLogout}
          type="button"
        >
          <LuLogOut className="size-4" aria-hidden="true" />
          {isLoggingOut ? 'Signing out' : 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
