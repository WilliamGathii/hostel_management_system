import { LuClipboardList } from 'react-icons/lu';

import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { StatusChip } from '../../../components/common/StatusChip';
import {
  DASHBOARD_BY_ROLE,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
} from '../../../config/dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { DashboardEmptyState } from '../components/DashboardEmptyState';
import { DashboardPageState } from '../components/DashboardPageState';
import { DashboardSection } from '../components/DashboardSection';
import { DashboardStatCard } from '../components/DashboardStatCard';
import { DashboardWelcome } from '../components/DashboardWelcome';
import { QuickActionCard } from '../components/QuickActionCard';

export function MaintenanceDashboardPage() {
  const { authError, isLoading, user } = useAuth();
  const dashboard = DASHBOARD_BY_ROLE.maintenance_staff;

  return (
    <DashboardPageState
      hasError={Boolean(authError && !user)}
      isLoading={isLoading}
      user={user}
    >
      <PageContainer className="space-y-8">
        <DashboardWelcome
          message={dashboard.welcomeMessage}
          name={user?.full_name}
          roleLabel={dashboard.roleLabel}
          title={dashboard.title}
        />

        <DashboardSection
          description="Real request totals will appear after the maintenance endpoints are available."
          title="Work summary"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboard.summaryCards.map((card) => (
              <DashboardStatCard
                description="This information will appear after the maintenance module is connected."
                key={card.title}
                {...card}
              />
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          description="Open your approved maintenance work areas."
          title="Quick actions"
        >
          <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
            {dashboard.quickActions.map((action) => (
              <QuickActionCard key={action.path} {...action} />
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          description="Requests assigned to your account will be listed here later."
          title="Assigned work"
        >
          <DashboardEmptyState
            description="Assigned maintenance requests will appear after the maintenance module is connected."
            Icon={LuClipboardList}
            title="No assigned request data available"
          />
        </DashboardSection>

        <DashboardSection
          description="These labels explain the approved maintenance workflow. They are not current request records."
          title="Maintenance label guide"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="font-semibold text-text">Priority explanation</h3>
              <p className="mt-1 text-sm text-muted">
                Priority indicates how quickly a request should be reviewed.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {MAINTENANCE_PRIORITIES.map((priority) => (
                  <StatusChip key={priority.label} variant={priority.variant}>
                    {priority.label}
                  </StatusChip>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-text">Status explanation</h3>
              <p className="mt-1 text-sm text-muted">
                Status describes where a request is in the maintenance workflow.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {MAINTENANCE_STATUSES.map((status) => (
                  <StatusChip key={status}>{status}</StatusChip>
                ))}
              </div>
            </Card>
          </div>
        </DashboardSection>
      </PageContainer>
    </DashboardPageState>
  );
}
