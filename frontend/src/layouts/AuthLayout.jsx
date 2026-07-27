import { LuBuilding2, LuShieldCheck, LuUsers, LuWrench } from 'react-icons/lu';
import { Outlet } from 'react-router-dom';

const highlights = [
  {
    Icon: LuUsers,
    label: 'Student services',
  },
  {
    Icon: LuWrench,
    label: 'Maintenance support',
  },
  {
    Icon: LuShieldCheck,
    label: 'Secure visitor access',
  },
];

export function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-page lg:grid lg:grid-cols-[minmax(22rem,45%)_1fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-primary px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute -top-20 -right-20 size-72 rotate-12 border border-white/10"
          aria-hidden="true"
        />
        <div
          className="absolute right-20 bottom-28 size-44 -rotate-6 border border-white/10"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex size-12 items-center justify-center rounded-card bg-white/10">
            <LuBuilding2 className="size-7" aria-hidden="true" />
          </div>
          <p className="mt-7 text-sm font-semibold text-indigo-200">
            Smart hostel services
          </p>
          <h1 className="mt-2 max-w-xl text-4xl font-bold">
            Hostel Management System
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-indigo-100">
            Manage hostel rooms, maintenance requests, visitors and student
            services in one place.
          </p>
        </div>

        <div className="relative grid gap-3">
          {highlights.map(({ Icon, label }) => (
            <div
              className="flex items-center gap-3 border-t border-white/15 pt-3 text-sm text-indigo-100"
              key={label}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:bg-card lg:px-12">
        <div className="w-full max-w-lg rounded-card border border-border bg-card p-5 shadow-card sm:p-8 lg:border-0 lg:p-0 lg:shadow-none">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-card bg-primary text-white">
              <LuBuilding2 className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">Smart hostel</p>
              <p className="font-bold text-text">Hostel Management System</p>
            </div>
          </div>
          {children || <Outlet />}
        </div>
      </section>
    </main>
  );
}
