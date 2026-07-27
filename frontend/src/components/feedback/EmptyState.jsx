import { LuInbox } from 'react-icons/lu';

export function EmptyState({
  title = 'Nothing to show',
  description = 'Records will appear here when they are available.',
}) {
  return (
    <div className="py-10 text-center">
      <LuInbox className="mx-auto size-9 text-muted" aria-hidden="true" />
      <h2 className="mt-3 text-base font-semibold text-text">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
    </div>
  );
}
