import { NavLink } from 'react-router-dom';

import { getNavigationForRole } from '../../config/navigation';

const getLinkClassName = ({ isActive }) =>
  `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-primary ${
    isActive ? 'text-primary' : 'text-muted'
  }`;

export function MobileBottomNav({ role }) {
  const navigation = getNavigationForRole(role).filter((item) => item.mobile);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex min-h-16 border-t border-border bg-card lg:hidden"
      aria-label="Mobile navigation"
    >
      {navigation.map(({ Icon, label, path }) => (
        <NavLink className={getLinkClassName} key={path} to={path}>
          <Icon className="size-5 shrink-0" aria-hidden="true" />
          <span className="w-full truncate text-center">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
