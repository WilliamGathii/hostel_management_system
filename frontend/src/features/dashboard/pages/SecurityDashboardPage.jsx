import { LuShieldCheck } from 'react-icons/lu';

import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import {
  DASHBOARD_BY_ROLE,
  VISITOR_WORKFLOW,
} from '../../../config/dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { DashboardEmptyState } from '../components/DashboardEmptyState';
import { DashboardNotice } from '../components/DashboardNotice';
import { DashboardSection } from '../components/DashboardSection';
import { DashboardStatCard } from '../components/DashboardStatCard';
import { DashboardWelcome } from '../components/DashboardWelcome';
import { QuickActionCard } from '../components/QuickActionCard';

export function SecurityDashboardPage() {
  const { user } = useAuth();
  const dashboard = DASHBOARD_BY_ROLE.security_staff;

  return (
    <PageContainer className="space-y-8">
      <DashboardWelcome
        message={dashboard.welcomeMessage}
        name={user?.full_name}
        roleLabel={dashboard.roleLabel}
        title={dashboard.title}
      />

      <DashboardSection
        description="Real visitor totals will appear after visitor verification endpoints are available."
        title="Visitor summary"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboard.summaryCards.map((card) => (
            <DashboardStatCard
              description="This information will appear after the visitor module is connected."
              key={card.title}
              {...card}
            />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        description="Use these areas for approved visitor checks and history."
        title="Quick actions"
      >
        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
          {dashboard.quickActions.map((action) => (
            <QuickActionCard key={action.path} {...action} />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        description="This is the approved visitor process for the first version."
        title="Visitor verification process"
      >
        <Card>
          <ol className="grid gap-5 md:grid-cols-5">
            {VISITOR_WORKFLOW.map((step, index) => (
              <li className="flex gap-3 md:block" key={step}>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-text md:mt-3 md:pt-0">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </Card>
      </DashboardSection>

      <DashboardSection
        description="Only visitors approved by an Admin will be available for entry or exit verification."
        title="Approved visitors"
      >
        <DashboardEmptyState
          description="Approved visitor records will appear after the visitor module is connected."
          Icon={LuShieldCheck}
          title="No approved visitor data available"
        />
      </DashboardSection>

      <DashboardNotice title="Security Staff permissions" variant="information">
        Security Staff can verify visitor entry and exit. Security Staff cannot
        approve or reject visitors and cannot manage rooms or room allocations.
      </DashboardNotice>
    </PageContainer>
  );
}
