import { LuInbox } from 'react-icons/lu';

export function EmptyState({
  title = 'Nothing to show',
  description = 'Records will appear here when they are available.',
  actions,
  Icon = LuInbox,
}) {
  return (
    <div className="px-4 py-12 text-center">
      <Icon className="mx-auto size-8 text-periwinkle" aria-hidden="true" />
      <h2 className="mt-3 text-base font-semibold text-text">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
      {actions ? (
        <div className="mt-5 flex justify-center">{actions}</div>
      ) : null}
    </div>
  );
}
