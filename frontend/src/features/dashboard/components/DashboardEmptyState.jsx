import { LuInbox } from 'react-icons/lu';

export function DashboardEmptyState({
  title = 'No information is available yet',
  description = 'This information will appear after the related module is added.',
  Icon = LuInbox,
}) {
  return (
    <div className="rounded-card border border-dashed border-border bg-card px-5 py-9 text-center">
      <Icon aria-hidden="true" className="mx-auto size-9 text-muted" />
      <h3 className="mt-3 text-base font-semibold text-text">{title}</h3>
      <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-muted">
        {description}
      </p>
    </div>
  );
}
