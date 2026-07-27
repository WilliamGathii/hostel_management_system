import {
  LuBedDouble,
  LuChartNoAxesCombined,
  LuHistory,
  LuReceiptText,
  LuUsersRound,
  LuWrench,
} from 'react-icons/lu';

import { PageContainer } from '../../../components/common/PageContainer';
import { DASHBOARD_BY_ROLE } from '../../../config/dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { DashboardEmptyState } from '../components/DashboardEmptyState';
import { DashboardNotice } from '../components/DashboardNotice';
import { DashboardSection } from '../components/DashboardSection';
import { DashboardStatCard } from '../components/DashboardStatCard';
import { DashboardWelcome } from '../components/DashboardWelcome';
import { QuickActionCard } from '../components/QuickActionCard';

const operations = [
  {
    title: 'Rooms and allocations',
    description:
      'Room availability, occupancy, and allocation records will appear after those modules are connected.',
    Icon: LuBedDouble,
  },
  {
    title: 'Maintenance overview',
    description:
      'Maintenance request and assignment records will appear after the maintenance module is connected.',
    Icon: LuWrench,
  },
  {
    title: 'Visitor approvals',
    description:
      'Visitor requests awaiting approval will appear after the visitor module is connected.',
    Icon: LuUsersRound,
  },
  {
    title: 'Payment records',
    description:
      'Simulated payment records will appear after the payment module is connected.',
    Icon: LuReceiptText,
  },
  {
    title: 'System reports',
    description:
      'Reports and statistics will appear after their source modules provide real data.',
    Icon: LuChartNoAxesCombined,
  },
];

export function AdminDashboardPage() {
  const { user } = useAuth();
  const dashboard = DASHBOARD_BY_ROLE.admin;

  return (
    <PageContainer className="space-y-8">
      <DashboardWelcome
        message={dashboard.welcomeMessage}
        name={user?.full_name}
        roleLabel={dashboard.roleLabel}
        title={dashboard.title}
      />

      <DashboardSection
        description="These cards are ready for real module totals. No values are shown until backend data is available."
        title="System overview"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dashboard.summaryCards.map((card) => (
            <DashboardStatCard key={card.title} {...card} />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        description="Open the main hostel management areas."
        title="Quick management actions"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboard.quickActions.map((action) => (
            <QuickActionCard key={action.path} {...action} />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        description="Detailed operational records will be connected during their feature steps."
        title="Hostel operations"
      >
        <div className="grid gap-6 xl:grid-cols-2">
          {operations.map((operation) => (
            <DashboardEmptyState
              description={operation.description}
              Icon={operation.Icon}
              key={operation.title}
              title={operation.title}
            />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        description="Important actions will be listed after audit logging and module activity are connected."
        title="Recent activity"
      >
        <DashboardEmptyState
          description="System activity will appear here after audit logging and module activity are connected."
          Icon={LuHistory}
          title="No system activity available"
        />
      </DashboardSection>

      <DashboardNotice title="Simulated payment limitation" variant="warning">
        The payment module records simulated payment information only. It does
        not process real money or connect to M-Pesa, cards, banks, PayPal,
        Stripe, or another payment provider.
      </DashboardNotice>

      <DashboardNotice title="Dashboard data">
        Dashboard figures will be connected only after the related backend
        modules provide real records. The planned dashboard summary endpoint is
        not implemented yet.
      </DashboardNotice>
    </PageContainer>
  );
}
