import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
    const { profile, company, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [pendingApprovals, setPendingApprovals] = useState(0);
    const [urgentRenewals, setUrgentRenewals] = useState(0);

    const role = profile?.role || 'developer';
    const isAdmin = role === 'admin';
    const isAdminOrManager = role === 'admin' || role === 'manager';

    // Fetch badge counts
    useEffect(() => {
        if (!company?.id) return;

        const fetchBadges = async () => {
            try {
                // Pending approvals
                const { count: pendingCount } = await supabase
                    .from('tool_requests')
                    .select('*', { count: 'exact', head: true })
                    .eq('company_id', company.id)
                    .eq('status', 'pending');
                setPendingApprovals(pendingCount || 0);

                // Renewals within 7 days
                const sevenDaysOut = new Date();
                sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);
                const todayStr = new Date().toISOString().split('T')[0];
                const futureStr = sevenDaysOut.toISOString().split('T')[0];
                const { count: renewalCount } = await supabase
                    .from('vendors')
                    .select('*', { count: 'exact', head: true })
                    .eq('company_id', company.id)
                    .eq('status', 'active')
                    .gte('renewal_date', todayStr)
                    .lte('renewal_date', futureStr);
                setUrgentRenewals(renewalCount || 0);
            } catch (err) {
                console.warn('Failed to fetch sidebar badges:', err);
            }
        };

        fetchBadges();
        const interval = setInterval(fetchBadges, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, [company?.id]);

    // Close user menu on click outside
    useEffect(() => {
        const handler = () => setShowUserMenu(false);
        window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Build nav items based on role
    const navItems = [
        // ─── All Roles ───
        { path: '/', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'manager', 'developer'] },
        { path: '/vendor-directory', label: 'Vendor Directory', icon: 'storefront', roles: ['admin', 'manager', 'developer'] },
        { path: '/requests', label: 'Requests', icon: 'inbox', roles: ['admin', 'manager', 'developer'] },

        // ─── Divider ───
        { divider: true, roles: ['admin', 'manager'] },

        // ─── Admin + Manager ───
        { path: '/approval-queue', label: 'Approvals', icon: 'task_alt', roles: ['admin', 'manager'], badge: pendingApprovals, badgeColor: 'bg-[#EF4444]' },
        { path: '/seat-audit', label: 'Seat Audit', icon: 'people', roles: ['admin', 'manager'] },
        { path: '/spend-analytics', label: 'Spend Analytics', icon: 'bar_chart', roles: ['admin', 'manager'] },
        { path: '/renewals', label: 'Renewal Alerts', icon: 'schedule', roles: ['admin', 'manager'], badge: urgentRenewals, badgeColor: 'bg-[#F59E0B]' },

        // ─── Divider ───
        { divider: true, roles: ['admin'] },

        // ─── Admin Only ───
        { path: '/team-members', label: 'Team Members', icon: 'group', roles: ['admin'] },
        { path: '/audit-log', label: 'Audit Log', icon: 'history', roles: ['admin'] },

        // ─── Divider ───
        { divider: true, roles: ['admin', 'manager', 'developer'] },

        // ─── Settings ───
        { path: '/settings', label: 'Settings', icon: 'settings', roles: ['admin', 'manager', 'developer'] },
    ];

    const visibleItems = navItems.filter(item => item.roles.includes(role));

    const isActiveLink = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const renderNav = () => (
        <ul className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar px-sm">
            {visibleItems.map((item, idx) => {
                if (item.divider) {
                    return <li key={`div-${idx}`} className="my-md mx-md border-t border-[#1E2433]" />;
                }

                const active = isActiveLink(item.path);

                return (
                    <li key={item.path}>
                        <NavLink
                            to={item.path}
                            onClick={onCloseMobile}
                            className={`flex items-center gap-md px-md py-2 rounded-lg text-[13px] transition-all duration-200 relative ${
                                active
                                    ? 'bg-[#3B82F6]/10 text-[#3B82F6] font-bold border-l-[3px] border-[#3B82F6] ml-0'
                                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161B28] border-l-[3px] border-transparent'
                            }`}
                        >
                            <span
                                className="material-symbols-outlined text-[20px]"
                                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                {item.icon}
                            </span>
                            <span className="flex-1">{item.label}</span>
                            {item.badge > 0 && (
                                <span className={`${item.badgeColor} text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1`}>
                                    {item.badge}
                                </span>
                            )}
                        </NavLink>
                    </li>
                );
            })}
        </ul>
    );

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-lg pt-lg pb-md flex items-center gap-sm">
                <div className="w-9 h-9 rounded-lg bg-[#3B82F6] flex items-center justify-center text-white font-bold text-[14px] shrink-0 shadow-lg shadow-[#3B82F6]/20">
                    ST
                </div>
                <div className="overflow-hidden">
                    <h1 className="font-bold text-[16px] text-white leading-tight truncate">StackTracker</h1>
                    <p className="text-[11px] text-[#64748B] leading-tight truncate">Engineering Spend</p>
                </div>
            </div>

            {/* Company name */}
            {company?.name && (
                <div className="px-lg pb-md">
                    <div className="text-[10px] uppercase tracking-widest text-[#475569] font-bold mb-1">Workspace</div>
                    <div className="text-[12px] text-[#94A3B8] truncate">{company.name}</div>
                </div>
            )}

            {/* Navigation */}
            {renderNav()}

            {/* User section */}
            <div className="px-sm pb-lg pt-md mt-auto relative">
                {showUserMenu && (
                    <div className="absolute bottom-[72px] left-sm right-sm bg-[#161B28] border border-[#2D3748] rounded-xl shadow-2xl py-1 z-50 overflow-hidden animate-in">
                        <div className="px-md py-2 border-b border-[#2D3748]">
                            <p className="text-[11px] text-[#64748B] truncate">{profile?.email}</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                            className="w-full text-left px-md py-2 text-[13px] hover:bg-[#1E2433] flex items-center gap-sm text-[#EF4444] transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Sign Out
                        </button>
                    </div>
                )}

                <div
                    onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
                    className="flex items-center gap-sm p-2 rounded-lg hover:bg-[#161B28] transition-colors cursor-pointer border border-[#1E2433]"
                >
                    <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center font-bold text-[12px] shrink-0 border border-[#3B82F6]/30">
                        {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[13px] text-white truncate font-medium">{profile?.full_name || 'User'}</p>
                        <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold">{role}</p>
                    </div>
                    <span className="material-symbols-outlined text-[#475569] text-[18px]">expand_more</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <nav className="hidden md:flex fixed left-0 top-0 h-full w-[240px] bg-[#0f1117] border-r border-[#1E2433] flex-col z-50">
                {sidebarContent}
            </nav>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-[100]">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
                    <nav className="absolute left-0 top-0 h-full w-[260px] bg-[#0f1117] border-r border-[#1E2433] flex flex-col shadow-2xl animate-slide-in-left">
                        {sidebarContent}
                    </nav>
                </div>
            )}
        </>
    );
};

export default Sidebar;
