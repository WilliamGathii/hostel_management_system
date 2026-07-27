export function Skeleton({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-card bg-periwinkle-light ${className}`}
    />
  );
}

export function PanelSkeleton({ label = 'Loading information' }) {
  return (
    <div className="rounded-card bg-card p-5 shadow-card sm:p-6" role="status">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-4 h-8 w-44" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
