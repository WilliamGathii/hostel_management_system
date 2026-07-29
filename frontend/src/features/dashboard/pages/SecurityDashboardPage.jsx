import {
  LuArrowRight,
  LuCircleCheck,
  LuClock3,
  LuDoorOpen,
  LuShieldCheck,
} from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { DASHBOARD_BY_ROLE } from '../../../config/dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { DashboardEmptyState } from '../components/DashboardEmptyState';
import { DashboardNotice } from '../components/DashboardNotice';
import { DashboardPageState } from '../components/DashboardPageState';
import { DashboardWelcome } from '../components/DashboardWelcome';
import { useDashboardStats } from '../hooks/useDashboardStats';

const timelineStages = [
  {
    key: 'expected_today',
    title: 'Expected visitors',
    message: 'No approved visitors are expected.',
    Icon: LuClock3,
  },
  {
    key: 'currently_inside',
    title: 'Currently inside',
    message: 'No visitors are currently inside.',
    Icon: LuDoorOpen,
  },
  {
    key: 'completed_today',
    title: 'Completed visits',
    message: 'No completed visits are available.',
    Icon: LuCircleCheck,
  },
];

const workflow = [
  'Open an approved visitor record.',
  'Confirm the visitor identity.',
  'Record entry or exit time.',
];

export function SecurityDashboardPage() {
  const { authError, isLoading, user } = useAuth();
  const { stats } = useDashboardStats();
  const dashboard = DASHBOARD_BY_ROLE.security_staff;

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
                <p className="text-xs font-semibold text-information">Today</p>
                <h2 className="mt-1 text-xl font-bold text-text">
                  Visitor Timeline
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Approved visitors moving through the hostel.
                </p>
              </div>
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-card bg-periwinkle-light px-3 text-sm font-semibold text-primary hover:bg-periwinkle focus-visible:outline-primary"
                to="/security/visitors"
              >
                Approved visitors
                <LuArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-8 divide-y divide-border">
              {timelineStages.map(({ Icon, key, message, title }) => (
                <div
                  className="grid gap-3 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                  key={title}
                >
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-bold text-text">{title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {Number(stats?.[key]) > 0
                        ? `${stats[key]} visitor record${
                            stats[key] === 1 ? '' : 's'
                          } in this stage.`
                        : message}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-muted">
                    {Number(stats?.[key]) > 0 ? stats[key] : 'No records'}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <LuShieldCheck className="size-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold text-text">
              Entry and exit workflow
            </h2>
            <ol className="mt-6 space-y-5">
              {workflow.map((step, index) => (
                <li className="flex gap-3" key={step}>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-periwinkle-light text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-5 text-text">{step}</p>
                </li>
              ))}
            </ol>
            <Link
              className="mt-7 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-primary"
              to="/security/history"
            >
              Visitor history
              <LuArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Card>
        </div>

        <Card>
          <h2 className="text-lg font-bold text-text">Approved visitor list</h2>
          {Number(stats?.expected_today) > 0 ? (
            <p className="mt-6 text-sm text-muted">
              <span className="text-2xl font-bold text-text">
                {stats.expected_today}
              </span>{' '}
              approved visitors are expected today.
            </p>
          ) : (
            <DashboardEmptyState
              description="Visitors approved by an Admin will appear here for verification."
              Icon={LuShieldCheck}
              title="No approved visitors are available."
            />
          )}
        </Card>

        <DashboardNotice
          title="Security Staff permissions"
          variant="information"
        >
          Security Staff verify entry and exit. They cannot approve or reject
          visitor requests.
        </DashboardNotice>
      </PageContainer>
    </DashboardPageState>
  );
}
