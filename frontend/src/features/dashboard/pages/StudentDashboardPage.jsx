import {
  LuBedDouble,
  LuMegaphone,
  LuUsersRound,
  LuWrench,
} from 'react-icons/lu';

import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { StatusChip } from '../../../components/common/StatusChip';
import { DASHBOARD_BY_ROLE } from '../../../config/dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { DashboardEmptyState } from '../components/DashboardEmptyState';
import { DashboardNotice } from '../components/DashboardNotice';
import { DashboardPageState } from '../components/DashboardPageState';
import { DashboardSection } from '../components/DashboardSection';
import { DashboardWelcome } from '../components/DashboardWelcome';
import { QuickActionCard } from '../components/QuickActionCard';

const displayValue = (value) => value || 'Not available';

const formatStatus = (status) =>
  status
    ? status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Not available';

export function StudentDashboardPage() {
  const { authError, isLoading, user } = useAuth();
  const dashboard = DASHBOARD_BY_ROLE.student;
  const accountDetails = [
    { label: 'Name', value: displayValue(user?.full_name) },
    {
      label: 'Student number',
      value: displayValue(user?.profile?.student_number),
    },
    { label: 'Email', value: displayValue(user?.email) },
    { label: 'Account status', value: formatStatus(user?.account_status) },
  ];

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
          description="Information currently available from your signed-in account."
          title="Student account summary"
        >
          <Card>
            <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {accountDetails.map((detail) => (
                <div className="min-w-0" key={detail.label}>
                  <dt className="text-xs font-semibold uppercase text-muted">
                    {detail.label}
                  </dt>
                  <dd className="mt-2 break-words text-sm font-semibold text-text">
                    {detail.label === 'Account status' &&
                    user?.account_status ? (
                      <StatusChip
                        variant={
                          user.account_status === 'active'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {detail.value}
                      </StatusChip>
                    ) : (
                      detail.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </DashboardSection>

        <DashboardSection
          description="Open the student services available from your navigation."
          title="Quick actions"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {dashboard.quickActions.map((action) => (
              <QuickActionCard key={action.path} {...action} />
            ))}
          </div>
        </DashboardSection>

        <div className="grid gap-8 xl:grid-cols-2">
          <DashboardSection
            description="Your room details will be shown when allocation data is connected."
            title="Room allocation"
          >
            <DashboardEmptyState
              description="No room information is available yet. Use the Room allocation quick action to open the future room page."
              Icon={LuBedDouble}
              title="Room allocation is not available yet"
            />
          </DashboardSection>

          <DashboardSection
            description="Track repair and maintenance work connected to your room."
            title="Maintenance"
          >
            <DashboardEmptyState
              description="Maintenance request information will appear after the maintenance module is connected."
              Icon={LuWrench}
              title="No maintenance information available"
            />
          </DashboardSection>

          <DashboardSection
            description="Review visitors registered under your student account."
            title="Visitors"
          >
            <DashboardEmptyState
              description="Visitor records will appear after the visitor module is connected."
              Icon={LuUsersRound}
              title="No visitor information available"
            />
          </DashboardSection>

          <DashboardSection
            description="Hostel notices will appear here when announcements are connected."
            title="Announcements"
          >
            <DashboardEmptyState
              description="There are no announcement records available from the backend yet."
              Icon={LuMegaphone}
              title="No announcements available"
            />
          </DashboardSection>
        </div>

        <DashboardNotice title="Simulated payment records" variant="warning">
          Payment records in this project are simulated. The system does not
          process real money or connect to a payment gateway.
        </DashboardNotice>
      </PageContainer>
    </DashboardPageState>
  );
}
