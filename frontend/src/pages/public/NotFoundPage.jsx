import { LuFileQuestion } from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { getRoleHomePath } from '../../utils/role-home';

export function NotFoundPage() {
  const { user, isAuthenticated } = useAuth();
  const returnPath = isAuthenticated ? getRoleHomePath(user.role) : '/login';

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4 py-10">
      <div className="w-full max-w-md text-center">
        <LuFileQuestion
          className="mx-auto size-12 text-muted"
          aria-hidden="true"
        />
        <p className="mt-5 text-sm font-semibold text-information">
          Page not found
        </p>
        <h1 className="mt-1 text-2xl font-bold text-text">
          We could not find that page
        </h1>
        <p className="mt-3 text-sm text-muted">
          The address may be incorrect or the page may have moved.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-card bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          to={returnPath}
        >
          Go to a safe page
        </Link>
      </div>
    </main>
  );
}
