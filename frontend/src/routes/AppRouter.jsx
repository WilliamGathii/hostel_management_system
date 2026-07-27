import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from '../features/authentication/pages/LoginPage';
import { AdminDashboardPage } from '../features/dashboard/pages/AdminDashboardPage';
import { MaintenanceDashboardPage } from '../features/dashboard/pages/MaintenanceDashboardPage';
import { SecurityDashboardPage } from '../features/dashboard/pages/SecurityDashboardPage';
import { StudentDashboardPage } from '../features/dashboard/pages/StudentDashboardPage';
import { MaintenanceDetailPage } from '../features/maintenance/pages/MaintenanceDetailPage';
import { MaintenancePage } from '../features/maintenance/pages/MaintenancePage';
import { AdminAllocationPage } from '../features/rooms/pages/AdminAllocationPage';
import { AdminRoomDetailPage } from '../features/rooms/pages/AdminRoomDetailPage';
import { AdminRoomListPage } from '../features/rooms/pages/AdminRoomListPage';
import { StudentRoomPage } from '../features/rooms/pages/StudentRoomPage';
import { AdminStudentCreatePage } from '../features/students/pages/AdminStudentCreatePage';
import { AdminStudentDetailPage } from '../features/students/pages/AdminStudentDetailPage';
import { AdminStudentListPage } from '../features/students/pages/AdminStudentListPage';
import { StudentProfilePage } from '../features/students/pages/StudentProfilePage';
import { VisitorDetailPage } from '../features/visitors/pages/VisitorDetailPage';
import { VisitorPage } from '../features/visitors/pages/VisitorPage';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { FeaturePlaceholderPage } from '../pages/FeaturePlaceholderPage';
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';
import { UnauthorizedPage } from '../pages/public/UnauthorizedPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { RoleRoute } from './RoleRoute';

const Placeholder = ({ title, description }) => (
  <FeaturePlaceholderPage description={description} title={title} />
);

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/login" />} path="/" />

      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route element={<LoginPage />} path="/login" />
          <Route element={<ForgotPasswordPage />} path="/forgot-password" />
        </Route>
      </Route>

      <Route element={<UnauthorizedPage />} path="/unauthorized" />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleRoute allowedRoles={['student']} />}>
            <Route
              element={<StudentDashboardPage />}
              path="/student/dashboard"
            />
            <Route element={<StudentProfilePage />} path="/student/profile" />
            <Route element={<StudentRoomPage />} path="/student/room" />
            <Route element={<MaintenancePage />} path="/student/maintenance" />
            <Route
              element={<MaintenanceDetailPage />}
              path="/student/maintenance/:requestId"
            />
            <Route element={<VisitorPage />} path="/student/visitors" />
            <Route
              element={<VisitorDetailPage />}
              path="/student/visitors/:visitorId"
            />
            <Route
              element={
                <Placeholder
                  description="Read hostel announcements."
                  title="Announcements"
                />
              }
              path="/student/announcements"
            />
            <Route
              element={
                <Placeholder
                  description="View your in-app notifications."
                  title="Notifications"
                />
              }
              path="/student/notifications"
            />
            <Route
              element={
                <Placeholder
                  description="View your simulated payment records."
                  title="Payment records"
                />
              }
              path="/student/payments"
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route element={<AdminDashboardPage />} path="/admin/dashboard" />
            <Route element={<AdminStudentListPage />} path="/admin/students" />
            <Route
              element={<AdminStudentCreatePage />}
              path="/admin/students/new"
            />
            <Route
              element={<AdminStudentDetailPage />}
              path="/admin/students/:studentId"
            />
            <Route element={<AdminRoomListPage />} path="/admin/rooms" />
            <Route
              element={<AdminRoomDetailPage />}
              path="/admin/rooms/:roomId"
            />
            <Route
              element={<AdminAllocationPage />}
              path="/admin/allocations"
            />
            <Route element={<MaintenancePage />} path="/admin/maintenance" />
            <Route
              element={<MaintenanceDetailPage />}
              path="/admin/maintenance/:requestId"
            />
            <Route element={<VisitorPage />} path="/admin/visitors" />
            <Route
              element={<VisitorDetailPage />}
              path="/admin/visitors/:visitorId"
            />
            <Route
              element={
                <Placeholder
                  description="Create and manage hostel announcements."
                  title="Announcement management"
                />
              }
              path="/admin/announcements"
            />
            <Route
              element={
                <Placeholder
                  description="Manage simulated payment records."
                  title="Payment records"
                />
              }
              path="/admin/payments"
            />
            <Route
              element={
                <Placeholder
                  description="View planned hostel reports."
                  title="Reports"
                />
              }
              path="/admin/reports"
            />
            <Route
              element={
                <Placeholder
                  description="Review important recorded system actions."
                  title="Audit logs"
                />
              }
              path="/admin/audit-logs"
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={['maintenance_staff']} />}>
            <Route
              element={<MaintenanceDashboardPage />}
              path="/maintenance/dashboard"
            />
            <Route element={<MaintenancePage />} path="/maintenance/requests" />
            <Route
              element={<MaintenanceDetailPage />}
              path="/maintenance/requests/:requestId"
            />
            <Route
              element={<MaintenancePage historyOnly />}
              path="/maintenance/history"
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={['security_staff']} />}>
            <Route
              element={<SecurityDashboardPage />}
              path="/security/dashboard"
            />
            <Route element={<VisitorPage />} path="/security/visitors" />
            <Route
              element={<VisitorDetailPage />}
              path="/security/visitors/:visitorId"
            />
            <Route
              element={<VisitorPage historyOnly />}
              path="/security/history"
            />
          </Route>
        </Route>
      </Route>

      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
}
