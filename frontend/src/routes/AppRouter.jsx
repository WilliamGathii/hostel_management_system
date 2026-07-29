import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from '../features/authentication/pages/LoginPage';
import { AnnouncementPage } from '../features/communications/pages/AnnouncementPage';
import { NotificationPage } from '../features/communications/pages/NotificationPage';
import { AdminDashboardPage } from '../features/dashboard/pages/AdminDashboardPage';
import { MaintenanceDashboardPage } from '../features/dashboard/pages/MaintenanceDashboardPage';
import { SecurityDashboardPage } from '../features/dashboard/pages/SecurityDashboardPage';
import { StudentDashboardPage } from '../features/dashboard/pages/StudentDashboardPage';
import { MaintenanceDetailPage } from '../features/maintenance/pages/MaintenanceDetailPage';
import { MaintenancePage } from '../features/maintenance/pages/MaintenancePage';
import { PaymentPage } from '../features/payments/pages/PaymentPage';
import { ReportPage } from '../features/reports/pages/ReportPage';
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
              element={<AnnouncementPage />}
              path="/student/announcements"
            />
            <Route
              element={<NotificationPage />}
              path="/student/notifications"
            />
            <Route element={<PaymentPage />} path="/student/payments" />
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
            <Route element={<AnnouncementPage />} path="/admin/announcements" />
            <Route element={<NotificationPage />} path="/admin/notifications" />
            <Route element={<PaymentPage />} path="/admin/payments" />
            <Route element={<ReportPage />} path="/admin/reports" />
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
            <Route
              element={<AnnouncementPage />}
              path="/maintenance/announcements"
            />
            <Route
              element={<NotificationPage />}
              path="/maintenance/notifications"
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
            <Route
              element={<AnnouncementPage />}
              path="/security/announcements"
            />
            <Route
              element={<NotificationPage />}
              path="/security/notifications"
            />
          </Route>
        </Route>
      </Route>

      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
}
