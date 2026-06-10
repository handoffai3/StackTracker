import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import CompanySettingsPage from './CompanySettingsPage';
import NotificationsPage from './NotificationsPage';

const SettingsLayout = () => {
    const { profile } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    const isAdmin = profile?.role === 'admin';

    // Determine active tab from the URL
    const getActiveTab = () => {
        if (location.pathname.includes('/settings/company') && isAdmin) return 'company';
        if (location.pathname.includes('/settings/notifications')) return 'notifications';
        // Default: admin goes to company, others go to notifications
        return isAdmin ? 'company' : 'notifications';
    };

    const [activeTab, setActiveTab] = useState(getActiveTab);

    // Sync tab with route
    useEffect(() => {
        setActiveTab(getActiveTab());
    }, [location.pathname, isAdmin]);

    useEffect(() => { document.title = 'Settings | StackTracker'; }, []);

    // Non-admins trying to hit /settings/company → redirect
    if (!isAdmin && location.pathname.includes('/settings/company')) {
        return <Navigate to="/settings/notifications" replace />;
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'company') navigate('/settings/company', { replace: true });
        else navigate('/settings/notifications', { replace: true });
    };

    const tabs = [];
    if (isAdmin) {
        tabs.push({ key: 'company', label: 'Company Profile', icon: 'apartment' });
    }
    tabs.push({ key: 'notifications', label: 'Notifications', icon: 'notifications' });

    return (
        <div className="flex-1 flex flex-col pb-xl">
            {/* Header */}
            <div className="mb-lg">
                <h2 className="font-headline-md text-headline-md text-on-surface">Settings</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Manage your workspace and personal preferences
                </p>
            </div>

            {/* Two-column layout: sidebar tabs + content */}
            <div className="flex gap-lg flex-1 min-h-0">
                {/* Left nav tabs */}
                <nav className="w-56 shrink-0 space-y-xs hidden md:block">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`w-full flex items-center gap-sm px-md py-sm rounded-lg text-left transition-colors ${
                                activeTab === tab.key
                                    ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
                                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest border border-transparent'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                            <span className="font-headline-sm text-[14px]">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Mobile tab bar */}
                <div className="md:hidden flex border-b border-[#2D3748] mb-md w-full">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`flex-1 py-sm font-headline-sm text-[14px] border-b-2 transition-colors ${
                                activeTab === tab.key
                                    ? 'border-primary text-primary font-bold'
                                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 bg-[#161B28] border border-[#2D3748] rounded-xl p-lg overflow-y-auto custom-scrollbar">
                    {activeTab === 'company' && isAdmin && <CompanySettingsPage />}
                    {activeTab === 'notifications' && <NotificationsPage />}
                </div>
            </div>
        </div>
    );
};

export default SettingsLayout;
