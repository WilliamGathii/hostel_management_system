import { LuCalendarDays } from 'react-icons/lu';

import { StatusChip } from '../../../components/common/StatusChip';

const formatCurrentDate = () =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
  }).format(new Date());

export function DashboardWelcome({
  title,
  message,
  name,
  roleLabel,
  dateLabel = formatCurrentDate(),
}) {
  return (
    <section className="overflow-hidden rounded-card bg-primary px-5 py-6 text-white shadow-card sm:px-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <StatusChip variant="information">{roleLabel}</StatusChip>
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            {name ? `Welcome, ${name}. ${message}` : message}
          </p>
        </div>
        <p className="flex shrink-0 items-center gap-2 text-sm text-blue-100">
          <LuCalendarDays aria-hidden="true" className="size-4" />
          {dateLabel}
        </p>
      </div>
    </section>
  );
}
