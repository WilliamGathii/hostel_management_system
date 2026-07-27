import { LuArrowRight } from 'react-icons/lu';
import { Link } from 'react-router-dom';

export function QuickActionCard({ title, description, path, Icon }) {
  return (
    <Link
      className="group flex min-h-24 items-start gap-3 rounded-card bg-card p-4 shadow-card hover:bg-periwinkle-light/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      to={path}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-text">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-muted">
          {description}
        </span>
      </span>
      <LuArrowRight
        aria-hidden="true"
        className="mt-1 size-4 shrink-0 text-muted transition group-hover:text-primary"
      />
    </Link>
  );
}
