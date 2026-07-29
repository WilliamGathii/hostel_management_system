import {
  LuArrowRight,
  LuCircleAlert,
  LuCircleCheck,
  LuClock3,
  LuClipboardList,
} from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { StatusChip } from '../../../components/common/StatusChip';
import {
  DASHBOARD_BY_ROLE,
  MAINTENANCE_PRIORITIES,
} from '../../../config/dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { DashboardEmptyState } from '../components/DashboardEmptyState';
import { DashboardPageState } from '../components/DashboardPageState';
import { DashboardWelcome } from '../components/DashboardWelcome';
import { useDashboardStats } from '../hooks/useDashboardStats';

const workStates = [
  {
    key: 'urgent',
    title: 'Urgent work',
    message: 'No urgent requests are assigned.',
    Icon: LuCircleAlert,
    tone: 'text-error',
  },
  {
    key: 'in_progress',
    title: 'In progress',
    message: 'No requests are in progress.',
    Icon: LuClock3,
    tone: 'text-warning',
  },
  {
    key: 'completed',
    title: 'Completed work',
    message: 'No completed requests are available.',
    Icon: LuCircleCheck,
    tone: 'text-success',
  },
];

export function MaintenanceDashboardPage() {
  const { authError, isLoading, user } = useAuth();
  const { stats } = useDashboardStats();
  const dashboard = DASHBOARD_BY_ROLE.maintenance_staff;

  return (
    <DashboardPageState
      hasError={Boolean(authError && !user)}
      isLoading={isLoading}
      user={user}
    >
      <PageContainer className="space-y-7">
        <DashboardWelcome
          message={dashboard.welcomeMessage}
          name={user?.full_name}
          roleLabel={dashboard.roleLabel}
          title={dashboard.title}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.7fr)]">
          <Card className="min-h-[25rem]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-information">
                  Assigned work
                </p>
                <h2 className="mt-1 text-xl font-bold text-text">
                  Maintenance Queue
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Requests assigned to your account.
                </p>
              </div>
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-card bg-periwinkle-light px-3 text-sm font-semibold text-primary hover:bg-periwinkle focus-visible:outline-primary"
                to="/maintenance/requests"
              >
                Assigned requests
                <LuArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            {Number(stats?.assigned_total) > 0 ? (
              <div className="mt-8 rounded-card bg-periwinkle-light p-6">
                <p className="text-3xl font-bold text-text">
                  {stats.assigned_total}
                </p>
                <p className="mt-2 text-sm text-muted">
                  requests are assigned to your account across active and
                  completed work.
                </p>
              </div>
            ) : (
              <DashboardEmptyState
                description="Assigned maintenance requests will appear here in priority order."
                Icon={LuClipboardList}
                title="No assigned maintenance requests are available."
              />
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-text">Priority guide</h2>
            <p className="mt-1 text-sm text-muted">
              Priority shows how quickly work should be reviewed.
            </p>
            <div className="mt-6 space-y-3">
              {MAINTENANCE_PRIORITIES.map((priority) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-card bg-page px-3 py-2.5"
                  key={priority.label}
                >
                  <span className="text-sm font-medium text-text">
                    {priority.label}
                  </span>
                  <StatusChip variant={priority.variant}>
                    {priority.label}
                  </StatusChip>
                </div>
              ))}
            </div>
            <Link
              className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-primary"
              to="/maintenance/history"
            >
              Maintenance history
              <LuArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Card>
        </div>

        <section aria-labelledby="work-status-heading">
          <h2
            className="mb-4 text-lg font-bold text-text"
            id="work-status-heading"
          >
            Work status
          </h2>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr_0.85fr]">
            {workStates.map(({ Icon, key, message, title, tone }) => (
              <Card key={title}>
                <Icon className={`size-5 ${tone}`} aria-hidden="true" />
                <h3 className="mt-4 font-bold text-text">{title}</h3>
                <p className="mt-2 text-sm text-muted">
                  {Number(stats?.[key]) > 0
                    ? `${stats[key]} request${
                        stats[key] === 1 ? '' : 's'
                      } in this group.`
                    : message}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </PageContainer>
    </DashboardPageState>
  );
}
