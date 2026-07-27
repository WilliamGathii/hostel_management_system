import { LuArrowRight } from 'react-icons/lu';
import { Link } from 'react-router-dom';

export function QuickActionCard({ title, description, path, Icon }) {
  return (
    <Link
      className="group flex min-h-32 items-start gap-4 rounded-card border border-border bg-card p-4 shadow-card transition hover:border-primary/30 hover:bg-primary-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      to={path}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-card bg-primary-soft text-primary">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-text">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-muted">
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
