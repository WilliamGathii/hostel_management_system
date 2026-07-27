export function DashboardSection({
  title,
  description,
  actions,
  children,
  className = '',
}) {
  return (
    <section className={className}>
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-text">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}
