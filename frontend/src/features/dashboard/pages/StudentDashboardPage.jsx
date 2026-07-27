import {
  LuArrowRight,
  LuBedDouble,
  LuBell,
  LuMegaphone,
  LuReceiptText,
  LuUserRound,
  LuUsersRound,
  LuWrench,
} from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { StatusChip } from '../../../components/common/StatusChip';
import { DASHBOARD_BY_ROLE } from '../../../config/dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { DashboardEmptyState } from '../components/DashboardEmptyState';
import { DashboardNotice } from '../components/DashboardNotice';
import { DashboardPageState } from '../components/DashboardPageState';
import { DashboardWelcome } from '../components/DashboardWelcome';

const displayValue = (value) => value || 'Not provided';

function PanelLink({ children, to }) {
  return (
    <Link
      className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-primary"
      to={to}
    >
      {children}
      <LuArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

export function StudentDashboardPage() {
  const { authError, isLoading, user } = useAuth();
  const dashboard = DASHBOARD_BY_ROLE.student;

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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]">
          <Card className="min-h-[22rem]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-information">
                  Room allocation
                </p>
                <h2 className="mt-1 text-xl font-bold text-text">My Stay</h2>
                <p className="mt-1 text-sm text-muted">
                  Your current hostel room information.
                </p>
              </div>
              <LuBedDouble
                className="size-7 shrink-0 text-primary"
                aria-hidden="true"
              />
            </div>
            <DashboardEmptyState
              description="An Admin will assign your room. Your allocation will appear here."
              Icon={LuBedDouble}
              title="No room allocation is available."
            />
            <PanelLink to="/student/room">View room allocation</PanelLink>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <LuUserRound
                className="size-5 text-primary"
                aria-hidden="true"
              />
              <h2 className="text-lg font-bold text-text">Profile summary</h2>
            </div>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-xs font-semibold text-muted">
                  Student number
                </dt>
                <dd className="mt-1 text-sm font-semibold text-text">
                  {displayValue(user?.profile?.student_number)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted">Email</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-text">
                  {displayValue(user?.email)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted">
                  Account status
                </dt>
                <dd className="mt-2">
                  <StatusChip
                    variant={
                      user?.account_status === 'active' ? 'success' : 'warning'
                    }
                  >
                    {displayValue(user?.account_status)}
                  </StatusChip>
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <PanelLink to="/student/profile">View profile</PanelLink>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3">
              <LuWrench className="size-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-bold text-text">Maintenance</h2>
            </div>
            <DashboardEmptyState
              description="Submitted requests and progress updates will appear here."
              Icon={LuWrench}
              title="No maintenance requests are available."
            />
            <PanelLink to="/student/maintenance">
              Submit maintenance request
            </PanelLink>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <LuUsersRound
                className="size-5 text-primary"
                aria-hidden="true"
              />
              <h2 className="text-lg font-bold text-text">Visitors</h2>
            </div>
            <DashboardEmptyState
              description="Registered visitors and approval results will appear here."
              Icon={LuUsersRound}
              title="No visitor registrations are available."
            />
            <PanelLink to="/student/visitors">Register a visitor</PanelLink>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <LuMegaphone
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
                <h2 className="text-lg font-bold text-text">Announcements</h2>
              </div>
              <PanelLink to="/student/announcements">View all</PanelLink>
            </div>
            <DashboardEmptyState
              Icon={LuMegaphone}
              title="No announcements have been published."
            />
          </Card>

          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-3">
                <LuBell className="size-5 text-primary" aria-hidden="true" />
                <h2 className="text-base font-bold text-text">Notifications</h2>
              </div>
              <p className="mt-4 text-sm text-muted">
                No in-app notifications are available.
              </p>
              <div className="mt-3">
                <PanelLink to="/student/notifications">Open notifications</PanelLink>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <LuReceiptText
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
                <h2 className="text-base font-bold text-text">
                  Simulated payments
                </h2>
              </div>
              <p className="mt-4 text-sm text-muted">
                No simulated payment records have been added.
              </p>
              <div className="mt-3">
                <PanelLink to="/student/payments">View payment records</PanelLink>
              </div>
            </Card>
          </div>
        </div>

        <DashboardNotice title="Payment records" variant="warning">
          These records are simulated and do not represent real money
          transfers.
        </DashboardNotice>
      </PageContainer>
    </DashboardPageState>
  );
}
