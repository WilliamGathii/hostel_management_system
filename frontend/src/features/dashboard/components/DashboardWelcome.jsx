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
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-information">{roleLabel}</p>
        <h1 className="mt-1 text-2xl font-bold text-text sm:text-[1.75rem]">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
          {name ? `Welcome, ${name}. ${message}` : message}
        </p>
      </div>
      <p className="shrink-0 text-sm font-medium text-muted">{dateLabel}</p>
    </header>
  );
}
