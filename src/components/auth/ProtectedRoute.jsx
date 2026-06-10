import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, profile, isLoading } = useAuthStore();

    // Loading state — full page spinner
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-md">
                    <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-on-surface-variant font-body-md text-body-md">Loading session...</p>
                </div>
            </div>
        );
    }

    // Not logged in → redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Profile still loading from DB — show spinner to prevent flash
    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-md">
                    <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-on-surface-variant font-body-md text-body-md">Loading session...</p>
                </div>
            </div>
        );
    }

    // Role not allowed → redirect to dashboard
    if (allowedRoles && !allowedRoles.includes(profile.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
