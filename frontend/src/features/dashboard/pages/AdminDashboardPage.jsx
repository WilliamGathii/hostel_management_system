import {
  LuActivity,
  LuArrowRight,
  LuBedDouble,
  LuClipboardCheck,
  LuGraduationCap,
  LuUsersRound,
  LuWrench,
} from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { DASHBOARD_BY_ROLE } from '../../../config/dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { DashboardEmptyState } from '../components/DashboardEmptyState';
import { DashboardNotice } from '../components/DashboardNotice';
import { DashboardPageState } from '../components/DashboardPageState';
import { DashboardStatCard } from '../components/DashboardStatCard';
import { DashboardWelcome } from '../components/DashboardWelcome';
import { useDashboardStats } from '../hooks/useDashboardStats';

const summaries = [
  {
    key: 'students',
    title: 'Students',
    Icon: LuGraduationCap,
    tone: 'information',
  },
  { key: 'rooms', title: 'Rooms', Icon: LuBedDouble, tone: 'primary' },
  {
    key: 'active_allocations',
    title: 'Active allocations',
    Icon: LuClipboardCheck,
    tone: 'success',
  },
  {
    key: 'open_maintenance',
    title: 'Maintenance requests',
    Icon: LuWrench,
    tone: 'warning',
  },
];

const operations = [
  {
    label: 'Room allocations',
    path: '/admin/allocations',
    Icon: LuClipboardCheck,
  },
  {
    label: 'Visitor approvals',
    path: '/admin/visitors',
    Icon: LuUsersRound,
  },
  {
    label: 'Maintenance',
    path: '/admin/maintenance',
    Icon: LuWrench,
  },
  {
    label: 'Recent activity',
    path: '/admin/audit-logs',
    Icon: LuActivity,
  },
];

function OperationLink({ label, path, Icon }) {
  return (
    <Link
      className="group flex min-h-12 items-center gap-3 rounded-card px-2 py-2 text-sm font-semibold text-text hover:bg-page focus-visible:outline-primary"
      to={path}
    >
      <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 flex-1">{label}</span>
      <LuArrowRight
        className="size-4 shrink-0 text-muted group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  );
}

export function AdminDashboardPage() {
  const { authError, isLoading, user } = useAuth();
  const {
    stats,
    isLoading: statsLoading,
    hasError: statsError,
    reload,
  } = useDashboardStats();
  const dashboard = DASHBOARD_BY_ROLE.admin;

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

        {statsError ? (
          <Card>
            <ErrorState
              description="Live dashboard statistics could not be loaded."
              onRetry={reload}
              title="Statistics unavailable"
            />
          </Card>
        ) : null}

        <section
          aria-label="Hostel summary"
          className="grid grid-cols-2 gap-4 xl:grid-cols-4"
        >
          {summaries.map((summary) => (
            <DashboardStatCard
              key={summary.title}
              isLoading={statsLoading}
              value={stats?.[summary.key]}
              {...summary}
            />
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.75fr)]">
          <Card className="min-h-[24rem]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-information">Rooms</p>
                <h2 className="mt-1 text-lg font-bold text-text">
                  Hostel Occupancy
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Capacity and room use across the hostel.
                </p>
              </div>
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-card bg-periwinkle-light px-3 text-sm font-semibold text-primary hover:bg-periwinkle focus-visible:outline-primary"
                to="/admin/rooms"
              >
                Manage rooms
                <LuArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-8">
              {statsLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : Number(stats?.rooms) > 0 ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-3xl font-bold text-text">
                          {stats.occupancy_rate}%
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {stats.current_occupancy} of {stats.total_capacity}{' '}
                          beds occupied
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-success">
                        {stats.available_beds} beds available
                      </p>
                    </div>
                    <div
                      aria-label={`${stats.occupancy_rate}% hostel occupancy`}
                      className="mt-4 h-3 overflow-hidden rounded-full bg-periwinkle-light"
                      role="progressbar"
                      aria-valuemax="100"
                      aria-valuemin="0"
                      aria-valuenow={stats.occupancy_rate}
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${stats.occupancy_rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <DashboardEmptyState
                  description="Occupancy information will appear when room records are available."
                  Icon={LuBedDouble}
                  title="No rooms have been added."
                />
              )}
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold text-information">
              Daily workspace
            </p>
            <h2 className="mt-1 text-lg font-bold text-text">Operations</h2>
            <p className="mt-1 text-sm text-muted">
              Open the areas that need regular review.
            </p>
            <nav className="mt-5 space-y-1" aria-label="Admin operations">
              {operations.map((operation) => (
                <OperationLink key={operation.path} {...operation} />
              ))}
            </nav>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Card>
            <h2 className="text-lg font-bold text-text">
              Maintenance overview
            </h2>
            {Number(stats?.open_maintenance) > 0 ? (
              <p className="mt-6 text-sm text-muted">
                <span className="text-2xl font-bold text-text">
                  {stats.open_maintenance}
                </span>{' '}
                open maintenance requests need review or progress.
              </p>
            ) : (
              <DashboardEmptyState
                description="New maintenance requests will appear here for review and assignment."
                Icon={LuWrench}
                title="No maintenance requests are available."
              />
            )}
          </Card>
          <Card>
            <h2 className="text-lg font-bold text-text">Allocation overview</h2>
            {Number(stats?.active_allocations) > 0 ? (
              <p className="mt-6 text-sm text-muted">
                <span className="text-2xl font-bold text-text">
                  {stats.active_allocations}
                </span>{' '}
                {stats.active_allocations === 1
                  ? 'student currently has'
                  : 'students currently have'}{' '}
                active room allocations.
              </p>
            ) : (
              <DashboardEmptyState
                description="Current room allocations will appear here."
                Icon={LuClipboardCheck}
                title="No room allocations are available."
              />
            )}
          </Card>
        </div>

        <DashboardNotice title="Simulated payments" variant="warning">
          Payment records demonstrate the hostel payment workflow only. No real
          money is transferred.
        </DashboardNotice>
      </PageContainer>
    </DashboardPageState>
  );
}
