import { LuConstruction } from 'react-icons/lu';

import { PageContainer } from '../components/common/PageContainer';
import { PageHeader } from '../components/common/PageHeader';
import { Alert } from '../components/feedback/Alert';
import { ROLE_LABELS } from '../config/navigation';
import { useAuth } from '../hooks/useAuth';

export function FeaturePlaceholderPage({
  title,
  description,
  dashboard = false,
}) {
  const { user } = useAuth();
  const firstName = user.full_name?.trim().split(/\s+/)[0] || 'there';
  const heading = dashboard ? `Welcome, ${firstName}` : title;

  return (
    <PageContainer>
      <PageHeader
        description={
          dashboard ? `${ROLE_LABELS[user.role]} workspace` : description
        }
        title={heading}
      />

      <section className="border-t border-border py-8">
        <LuConstruction className="size-8 text-warning" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-bold text-text">
          {dashboard ? `${title} foundation is ready` : title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {dashboard
            ? 'The complete dashboard will be built in Step 7.'
            : 'This feature will be added in a later development step.'}
        </p>
        <div className="mt-5 max-w-2xl">
          <Alert variant="information">
            This page is a navigation placeholder and does not contain live
            records or completed feature tools.
          </Alert>
        </div>
      </section>
    </PageContainer>
  );
}
