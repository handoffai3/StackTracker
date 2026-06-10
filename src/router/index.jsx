import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import VendorDirectory from '../components/VendorDirectory';
import VendorDetail from '../components/VendorDetail';
import RequestsListPage from '../pages/requests/RequestsListPage';
import NewRequestPage from '../pages/requests/NewRequestPage';
import ApprovalsPage from '../pages/approvals/ApprovalsPage';
import SeatAuditPage from '../pages/seat-audit/SeatAuditPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import RenewalsPage from '../pages/renewals/RenewalsPage';
import TeamMembersPage from '../pages/team/TeamMembersPage';
import AuditLogPage from '../pages/audit/AuditLogPage';
import SettingsLayout from '../pages/settings/SettingsLayout';
import Login from '../components/Login';
import Register from '../components/Register';
import { useAuthStore } from '../stores/authStore';

// Role constants
const ALL_ROLES = ['admin', 'manager', 'developer'];
const ADMIN_MANAGER = ['admin', 'manager'];
const ADMIN_ONLY = ['admin'];

// Redirects logged-in users away from login/register
const AuthRoute = ({ children }) => {
    const { user, isLoading } = useAuthStore();
    if (isLoading) return <FullPageSpinner />;
    if (user) return <Navigate to="/" replace />;
    return <>{children}</>;
};

const FullPageSpinner = () => (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#3B82F6] flex items-center justify-center text-white font-bold text-[14px] animate-pulse shadow-lg shadow-[#3B82F6]/20">
                ST
            </div>
            <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-[#64748B] text-[13px]">Loading StackTracker...</p>
            </div>
        </div>
    </div>
);

// Smart settings redirect — admin goes to company, others to notifications
const SettingsRedirect = () => {
    const { profile } = useAuthStore();
    if (profile?.role === 'admin') {
        return <Navigate to="/settings/company" replace />;
    }
    return <Navigate to="/settings/notifications" replace />;
};

const AppRouter = () => {
    return (
        <Routes>
            {/* Protected App Routes — wrapped in AppLayout (sidebar + content) */}
            <Route
                path="/"
                element={
                    <ProtectedRoute allowedRoles={ALL_ROLES}>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                {/* All roles */}
                <Route index element={<DashboardPage />} />
                <Route path="vendor-directory" element={<VendorDirectory />} />
                <Route path="vendor-directory/:id" element={<VendorDetail />} />
                <Route path="requests" element={<RequestsListPage />} />
                <Route path="requests/new" element={<NewRequestPage />} />

                {/* Admin + Manager */}
                <Route path="approval-queue" element={
                    <ProtectedRoute allowedRoles={ADMIN_MANAGER}><ApprovalsPage /></ProtectedRoute>
                } />
                <Route path="seat-audit" element={
                    <ProtectedRoute allowedRoles={ADMIN_MANAGER}><SeatAuditPage /></ProtectedRoute>
                } />
                <Route path="spend-analytics" element={
                    <ProtectedRoute allowedRoles={ADMIN_MANAGER}><AnalyticsPage /></ProtectedRoute>
                } />
                <Route path="renewals" element={
                    <ProtectedRoute allowedRoles={ADMIN_MANAGER}><RenewalsPage /></ProtectedRoute>
                } />

                {/* Admin only */}
                <Route path="team-members" element={
                    <ProtectedRoute allowedRoles={ADMIN_ONLY}><TeamMembersPage /></ProtectedRoute>
                } />
                <Route path="audit-log" element={
                    <ProtectedRoute allowedRoles={ADMIN_ONLY}><AuditLogPage /></ProtectedRoute>
                } />

                {/* Settings */}
                <Route path="settings" element={<SettingsRedirect />} />
                <Route path="settings/company" element={
                    <ProtectedRoute allowedRoles={ADMIN_ONLY}><SettingsLayout /></ProtectedRoute>
                } />
                <Route path="settings/notifications" element={
                    <ProtectedRoute allowedRoles={ALL_ROLES}><SettingsLayout /></ProtectedRoute>
                } />
            </Route>

            {/* Public auth routes */}
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;
