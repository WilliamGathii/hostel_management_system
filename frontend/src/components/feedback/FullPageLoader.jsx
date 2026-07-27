import { LoadingSpinner } from './LoadingSpinner';

export function FullPageLoader({ label = 'Loading your account' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <LoadingSpinner label={label} />
    </div>
  );
}
