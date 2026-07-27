import {
  LuBedDouble,
  LuBuilding2,
  LuShieldCheck,
  LuWrench,
} from 'react-icons/lu';
import { Outlet } from 'react-router-dom';

const highlights = [
  {
    Icon: LuBedDouble,
    label: 'Room and resident records',
  },
  {
    Icon: LuWrench,
    label: 'Maintenance coordination',
  },
  {
    Icon: LuShieldCheck,
    label: 'Visitor entry verification',
  },
];

export function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-page lg:grid lg:grid-cols-[minmax(24rem,46%)_1fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-periwinkle-light p-7 lg:flex lg:flex-col">
        <div className="flex h-full flex-col justify-between rounded-card bg-primary px-10 py-12 text-white shadow-elevated xl:px-14">
          <div>
            <div className="flex items-center gap-3">
              <LuBuilding2 className="size-7 text-periwinkle" aria-hidden="true" />
              <p className="text-sm font-semibold text-periwinkle-light">
                Resident services
              </p>
            </div>
            <h1 className="mt-16 max-w-xl text-4xl font-bold leading-tight">
              Hostel Management System
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-periwinkle-light">
              A calm workspace for hostel residents, staff, rooms, maintenance,
              and visitor access.
            </p>
          </div>

          <div className="grid gap-4">
            {highlights.map(({ Icon, label }) => (
              <div
                className="flex items-center gap-3 border-t border-white/15 pt-4 text-sm text-periwinkle-light"
                key={label}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:bg-card lg:px-12">
        <div className="w-full max-w-md rounded-card bg-card p-5 shadow-elevated sm:p-8 lg:p-0 lg:shadow-none">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <LuBuilding2 className="size-7 text-primary" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-information">
                Resident services
              </p>
              <p className="font-bold text-text">Hostel Management System</p>
            </div>
          </div>
          {children || <Outlet />}
        </div>
      </section>
    </main>
  );
}
