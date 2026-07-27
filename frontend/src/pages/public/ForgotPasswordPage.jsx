import { LuKeyRound } from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { Alert } from '../../components/feedback/Alert';

export function ForgotPasswordPage() {
  return (
    <div>
      <div className="flex size-11 items-center justify-center rounded-card bg-primary-soft text-primary">
        <LuKeyRound className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-text">Password help</h2>
      <p className="mt-2 text-sm text-muted">
        Password reset is not available in the first version of the system.
        Please contact the system administrator for help.
      </p>
      <div className="mt-5">
        <Alert variant="information">
          No password reset request will be sent from this page.
        </Alert>
      </div>
      <Link
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-card bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        to="/login"
      >
        Return to sign in
      </Link>
    </div>
  );
}
