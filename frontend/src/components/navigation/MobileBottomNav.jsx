import { useState } from 'react';
import { LuMenu, LuX } from 'react-icons/lu';
import { NavLink, useLocation } from 'react-router-dom';

import { getNavigationForRole } from '../../config/navigation';

const getLinkClassName = ({ isActive }) =>
  `relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-primary ${
    isActive ? 'text-primary' : 'text-muted hover:text-text'
  }`;

export function MobileBottomNav({ role }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const navigation = getNavigationForRole(role);
  const mobileNavigation = navigation.filter((item) => item.mobile);
  const primaryNavigation = mobileNavigation.slice(0, 4);
  const primaryPaths = new Set(primaryNavigation.map((item) => item.path));
  const moreNavigation = navigation.filter(
    (item) => !primaryPaths.has(item.path)
  );
  const moreIsActive = moreNavigation.some((item) =>
    location.pathname.startsWith(item.path)
  );

  return (
    <>
      {isMoreOpen ? (
        <div className="fixed inset-0 z-40 bg-primary/30 px-3 pb-24 pt-20 lg:hidden">
          <div
            aria-label="More navigation"
            aria-modal="true"
            className="mx-auto max-h-full max-w-md overflow-y-auto rounded-card bg-card p-4 shadow-elevated"
            role="dialog"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-bold text-text">More</h2>
              <button
                aria-label="Close navigation"
                className="rounded-card p-2 text-muted hover:bg-page hover:text-text"
                onClick={() => setIsMoreOpen(false)}
                type="button"
              >
                <LuX aria-hidden="true" className="size-5" />
              </button>
            </div>
            <nav aria-label="More mobile navigation" className="mt-3">
              <ul className="grid gap-1">
                {moreNavigation.map(({ Icon, label, path }) => (
                  <li key={path}>
                    <NavLink
                      className={({ isActive }) =>
                        `flex min-h-12 items-center gap-3 rounded-card px-3 text-sm font-semibold ${
                          isActive
                            ? 'bg-periwinkle-light text-primary'
                            : 'text-muted hover:bg-page hover:text-text'
                        }`
                      }
                      onClick={() => setIsMoreOpen(false)}
                      to={path}
                    >
                      <Icon aria-hidden="true" className="size-5 shrink-0" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}

      <nav
        className="fixed right-3 bottom-3 left-3 z-50 flex min-h-16 overflow-hidden rounded-card bg-card shadow-elevated lg:hidden"
        aria-label="Mobile navigation"
      >
        {primaryNavigation.map(({ Icon, label, path }) => (
          <NavLink className={getLinkClassName} key={path} to={path}>
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span className="w-full truncate text-center">{label}</span>
          </NavLink>
        ))}
        {moreNavigation.length > 0 ? (
          <button
            aria-expanded={isMoreOpen}
            aria-label="More navigation"
            className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-primary ${
              moreIsActive ? 'text-primary' : 'text-muted hover:text-text'
            }`}
            onClick={() => setIsMoreOpen((value) => !value)}
            type="button"
          >
            <LuMenu aria-hidden="true" className="size-5 shrink-0" />
            <span>More</span>
          </button>
        ) : null}
      </nav>
    </>
  );
}
