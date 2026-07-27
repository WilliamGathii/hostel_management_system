import { LuCircleAlert } from 'react-icons/lu';

import { Button } from '../common/Button';

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again.',
  onRetry,
}) {
  return (
    <div className="px-4 py-12 text-center">
      <LuCircleAlert className="mx-auto size-8 text-error" aria-hidden="true" />
      <h2 className="mt-3 text-base font-semibold text-text">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry} variant="secondary">
          Retry
        </Button>
      ) : null}
    </div>
  );
}
