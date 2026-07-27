import { PageContainer } from '../../../components/common/PageContainer';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { PanelSkeleton } from '../../../components/feedback/Skeleton';

export function DashboardPageState({
  isLoading,
  user,
  hasError = false,
  children,
}) {
  if (isLoading) {
    return (
      <PageContainer className="space-y-5">
        <PanelSkeleton label="Loading dashboard" />
        <div className="grid gap-5 lg:grid-cols-2">
          <PanelSkeleton label="Loading dashboard section" />
          <PanelSkeleton label="Loading dashboard section" />
        </div>
      </PageContainer>
    );
  }

  if (!user || hasError) {
    return (
      <PageContainer>
        <div className="rounded-card bg-card shadow-card">
          <ErrorState
            description="We could not load your account information. Please sign in again."
            title="Dashboard information is unavailable"
          />
        </div>
      </PageContainer>
    );
  }

  return children;
}
