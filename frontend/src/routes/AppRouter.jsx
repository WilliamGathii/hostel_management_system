import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from '../features/authentication/pages/LoginPage';
import { AdminDashboardPage } from '../features/dashboard/pages/AdminDashboardPage';
import { MaintenanceDashboardPage } from '../features/dashboard/pages/MaintenanceDashboardPage';
import { SecurityDashboardPage } from '../features/dashboard/pages/SecurityDashboardPage';
import { StudentDashboardPage } from '../features/dashboard/pages/StudentDashboardPage';
import { AdminStudentCreatePage } from '../features/students/pages/AdminStudentCreatePage';
import { AdminStudentDetailPage } from '../features/students/pages/AdminStudentDetailPage';
import { AdminStudentListPage } from '../features/students/pages/AdminStudentListPage';
import { StudentProfilePage } from '../features/students/pages/StudentProfilePage';
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
            <Route
              element={
                <Placeholder
                  description="View your current room allocation."
                  title="Room allocation"
                />
              }
              path="/student/room"
            />
            <Route
              element={
                <Placeholder
                  description="Submit and track your maintenance requests."
                  title="Maintenance requests"
                />
              }
              path="/student/maintenance"
            />
            <Route
              element={
                <Placeholder
                  description="Register and review your visitor requests."
                  title="Visitor registration"
                />
              }
              path="/student/visitors"
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
            <Route
              element={
                <Placeholder
                  description="Manage hostel room information."
                  title="Room management"
                />
              }
              path="/admin/rooms"
            />
            <Route
              element={
                <Placeholder
                  description="Allocate students to available rooms."
                  title="Room allocation"
                />
              }
              path="/admin/allocations"
            />
            <Route
              element={
                <Placeholder
                  description="Review and assign maintenance requests."
                  title="Maintenance management"
                />
              }
              path="/admin/maintenance"
            />
            <Route
              element={
                <Placeholder
                  description="Approve or reject visitor requests."
                  title="Visitor approvals"
                />
              }
              path="/admin/visitors"
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
            <Route
              element={
                <Placeholder
                  description="View maintenance requests assigned to you."
                  title="Assigned requests"
                />
              }
              path="/maintenance/requests"
            />
            <Route
              element={
                <Placeholder
                  description="Review your maintenance request history."
                  title="Maintenance history"
                />
              }
              path="/maintenance/history"
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={['security_staff']} />}>
            <Route
              element={<SecurityDashboardPage />}
              path="/security/dashboard"
            />
            <Route
              element={
                <Placeholder
                  description="View approved visitors and record entry or exit."
                  title="Approved visitors"
                />
              }
              path="/security/visitors"
            />
            <Route
              element={
                <Placeholder
                  description="Review recorded visitor entry and exit history."
                  title="Visitor history"
                />
              }
              path="/security/history"
            />
          </Route>
        </Route>
      </Route>

      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
}
