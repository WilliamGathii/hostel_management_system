import { LuBuilding2 } from 'react-icons/lu';
import { NavLink } from 'react-router-dom';

import { getNavigationForRole } from '../../config/navigation';

const getLinkClassName = ({ isActive }) =>
  `flex min-h-11 items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
    isActive
      ? 'bg-white text-primary'
      : 'text-indigo-100 hover:bg-white/10 hover:text-white'
  }`;

export function Sidebar({ role }) {
  const navigation = getNavigationForRole(role);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar flex-col bg-primary text-white lg:flex">
      <div className="flex min-h-topbar items-center gap-3 border-b border-white/10 px-5">
        <div className="flex size-9 items-center justify-center rounded-card bg-white/10">
          <LuBuilding2 className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">Hostel Management</p>
          <p className="text-xs text-indigo-200">Smart hostel services</p>
        </div>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-3 py-5"
        aria-label="Main navigation"
      >
        <ul className="space-y-1">
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

      <div className="border-t border-white/10 px-5 py-4 text-xs text-indigo-200">
        Hostel Management System
      </div>
    </aside>
  );
}
