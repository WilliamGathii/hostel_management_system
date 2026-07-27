import { LuLoaderCircle } from 'react-icons/lu';

export function LoadingSpinner({ label = 'Loading' }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-sm text-muted"
      role="status"
    >
      <LuLoaderCircle
        className="size-5 animate-spin text-primary"
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
