import { LuShieldAlert } from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { getRoleHomePath } from '../../utils/role-home';

export function UnauthorizedPage() {
  const { user, isAuthenticated } = useAuth();
  const returnPath = isAuthenticated ? getRoleHomePath(user.role) : '/login';

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-card bg-warning-soft text-warning">
          <LuShieldAlert className="size-8" aria-hidden="true" />
        </div>
        <p className="mt-5 text-sm font-semibold text-warning">
          Permission required
        </p>
        <h1 className="mt-1 text-2xl font-bold text-text">
          Access unavailable
        </h1>
        <p className="mt-3 text-sm text-muted">
          Your account does not have permission to open this page.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-card bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          to={returnPath}
        >
          Return to your home page
        </Link>
      </div>
    </main>
  );
}
