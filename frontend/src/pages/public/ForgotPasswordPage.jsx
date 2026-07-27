import { LuKeyRound } from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { Alert } from '../../components/feedback/Alert';

export function ForgotPasswordPage() {
  return (
    <div>
      <LuKeyRound className="size-7 text-primary" aria-hidden="true" />
      <h2 className="mt-5 text-2xl font-bold text-text">Password help</h2>
      <p className="mt-2 text-sm text-muted">
        Contact the system administrator to reset your account password.
      </p>
      <div className="mt-5">
        <Alert variant="information">
          For your security, the administrator will confirm your account
          details before making a change.
        </Alert>
      </div>
      <Link
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-card bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-primary"
        to="/login"
      >
        Return to sign in
      </Link>
    </div>
  );
}
