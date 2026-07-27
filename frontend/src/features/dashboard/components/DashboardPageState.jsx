import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';

export function DashboardPageState({
  isLoading,
  user,
  hasError = false,
  children,
}) {
  if (isLoading) {
    return (
      <PageContainer>
        <Card className="grid min-h-72 place-items-center">
          <LoadingSpinner label="Loading dashboard" />
        </Card>
      </PageContainer>
    );
  }

  if (!user || hasError) {
    return (
      <PageContainer>
        <Card>
          <ErrorState
            description="We could not load your account information. Please sign in again."
            title="Dashboard information is unavailable"
          />
        </Card>
      </PageContainer>
    );
  }

  return children;
}
