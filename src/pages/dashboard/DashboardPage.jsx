import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useDashboard } from '../../hooks/useDashboard';

// Components
import StatCard from '../../components/dashboard/StatCard';
import SpendDonutChart from '../../components/dashboard/SpendDonutChart';
import MonthlyTrendChart from '../../components/dashboard/MonthlyTrendChart';
import UpcomingRenewalsTable from '../../components/dashboard/UpcomingRenewalsTable';
import RecentActivityFeed from '../../components/dashboard/RecentActivityFeed';
import PendingApprovalsSection from '../../components/dashboard/PendingApprovalsSection';

const priorityConfig = {
    critical: { label: 'Critical', color: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30' },
    high:     { label: 'High',     color: 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30' },
    medium:   { label: 'Medium',   color: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30' },
    low:      { label: 'Low',      color: 'bg-[#6B7280]/15 text-[#9CA3AF] border-[#6B7280]/30' },
};

const statusConfig = {
    pending: { label: 'Pending', color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30' },
    approved: { label: 'Approved', color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30' },
    rejected: { label: 'Rejected', color: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30' },
    more_info_needed: { label: 'Needs Info', color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/30' },
};

const DashboardPage = () => {
    const { profile } = useAuthStore();
    const navigate = useNavigate();
    const {
        activeVendors,
        pendingApprovals,
        auditLogs,
        upcomingRenewals,
        myRequests,
        totalMonthlySpend,
        spendByCategory,
        monthlyTrend,
        renewalsThisMonthCount,
        pendingApprovalsCount,
        activeToolsCount,
        isLoading,
        error
    } = useDashboard();

    const isDev = profile?.role === 'developer';

    useEffect(() => { document.title = 'Dashboard | StackTracker'; }, []);

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 p-xl rounded-xl text-center max-w-md">
                    <span className="material-symbols-outlined text-[48px] text-[#EF4444] mb-md">error</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Failed to load dashboard</h3>
                    <p className="font-body-md text-[#EF4444]">{error}</p>
                </div>
            </div>
        );
    }

    // Welcome screen for zero vendors (admin/manager)
    if (!isLoading && !isDev && activeToolsCount === 0 && (activeVendors || []).length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-lg">
                    <div className="w-20 h-20 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-lg border border-[#3B82F6]/20">
                        <span className="material-symbols-outlined text-[40px] text-[#3B82F6]">rocket_launch</span>
                    </div>
                    <h2 className="font-headline-md text-[28px] text-on-surface font-bold mb-sm">Welcome to StackTracker 🎉</h2>
                    <p className="font-body-md text-on-surface-variant mb-lg leading-relaxed">
                        Start by adding your first engineering tool to track spend, manage seats, and stay on top of renewals.
                    </p>
                    <button
                        onClick={() => navigate('/vendor-directory')}
                        className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-label-md py-3 px-xl rounded-xl flex items-center gap-sm mx-auto transition-colors shadow-lg shadow-[#3B82F6]/20"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Add Your First Tool
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col pb-xl">
            {/* Header */}
            <div className="mb-lg">
                <h2 className="font-headline-md text-headline-md text-on-surface">Dashboard</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Welcome back, <span className="text-on-surface font-semibold">{profile?.full_name || 'User'}</span>
                </p>
            </div>

            {isDev ? (
                /* DEVELOPER VIEW */
                <div className="space-y-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                        <StatCard 
                            title="Active Tools" 
                            value={activeToolsCount} 
                            icon="inventory_2" 
                            colorClass="text-[#3B82F6]" 
                            bgClass="bg-[#3B82F6]/10" 
                            borderClass="border-[#3B82F6]/20"
                            loading={isLoading}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-md">
                            <h3 className="font-headline-sm text-[18px] text-on-surface font-bold">My Requests</h3>
                            <Link to="/requests/new" className="bg-primary hover:bg-primary/90 text-white px-md py-sm rounded-lg font-label-md text-[13px] flex items-center gap-xs transition-colors">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                New Request
                            </Link>
                        </div>
                        
                        <div className="bg-[#161B28] border border-[#2D3748] rounded-xl overflow-hidden">
                            {isLoading ? (
                                <div className="p-lg space-y-sm">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-16 bg-[#2D3748] animate-pulse rounded-lg" />
                                    ))}
                                </div>
                            ) : myRequests.length === 0 ? (
                                <div className="p-xl text-center">
                                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-md">inbox</span>
                                    <p className="font-body-md text-on-surface-variant">You haven't made any requests yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-[#2D3748] bg-[#10131A]">
                                                <th className="p-md font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Tool Name</th>
                                                <th className="p-md font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Cost / mo</th>
                                                <th className="p-md font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Status</th>
                                                <th className="p-md font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Submitted</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2D3748]/50">
                                            {myRequests.map(req => {
                                                const stat = statusConfig[req.status] || statusConfig.pending;
                                                return (
                                                    <tr key={req.id} className="hover:bg-surface-container-high transition-colors">
                                                        <td className="p-md font-headline-sm text-[14px] text-on-surface font-bold">{req.tool_name}</td>
                                                        <td className="p-md font-body-md text-on-surface">${Number(req.monthly_cost || 0).toLocaleString()}</td>
                                                        <td className="p-md">
                                                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${stat.color}`}>
                                                                {stat.label}
                                                            </span>
                                                        </td>
                                                        <td className="p-md font-body-md text-on-surface-variant">
                                                            {new Date(req.created_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* ADMIN / MANAGER VIEW */
                <div className="space-y-xl">
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                        <StatCard 
                            title="Total Monthly Spend" 
                            value={`$${totalMonthlySpend.toLocaleString()}`} 
                            icon="payments" 
                            colorClass="text-[#10B981]" 
                            bgClass="bg-[#10B981]/10" 
                            borderClass="border-[#10B981]/20"
                            loading={isLoading}
                        />
                        <StatCard 
                            title="Renewals This Month" 
                            value={renewalsThisMonthCount} 
                            icon="event_upcoming" 
                            colorClass="text-[#F59E0B]" 
                            bgClass="bg-[#F59E0B]/10" 
                            borderClass="border-[#F59E0B]/20"
                            linkTo="/renewals"
                            loading={isLoading}
                        />
                        <StatCard 
                            title="Pending Approvals" 
                            value={pendingApprovalsCount} 
                            icon="pending_actions" 
                            colorClass={pendingApprovalsCount > 0 ? "text-[#EF4444]" : "text-on-surface-variant"} 
                            bgClass={pendingApprovalsCount > 0 ? "bg-[#EF4444]/10" : "bg-surface-container"} 
                            borderClass={pendingApprovalsCount > 0 ? "border-[#EF4444]/20" : "border-[#2D3748]"}
                            linkTo="/approval-queue"
                            loading={isLoading}
                        />
                        <StatCard 
                            title="Active Tools" 
                            value={activeToolsCount} 
                            icon="inventory_2" 
                            colorClass="text-[#3B82F6]" 
                            bgClass="bg-[#3B82F6]/10" 
                            borderClass="border-[#3B82F6]/20"
                            loading={isLoading}
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                        
                        {/* Left Column (Charts & Renewals) */}
                        <div className="lg:col-span-2 space-y-lg">
                            {/* Charts Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                                {/* Category Spend Donut */}
                                <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg">
                                    <h3 className="font-headline-sm text-[16px] text-on-surface font-bold mb-md">Spend by Category</h3>
                                    <SpendDonutChart data={spendByCategory} loading={isLoading} />
                                </div>

                                {/* Monthly Trend Area */}
                                <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg">
                                    <h3 className="font-headline-sm text-[16px] text-on-surface font-bold mb-md">Spend Trend (6 Mo)</h3>
                                    <MonthlyTrendChart data={monthlyTrend} loading={isLoading} />
                                </div>
                            </div>

                            {/* Upcoming Renewals */}
                            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg">
                                <div className="flex items-center justify-between mb-md">
                                    <h3 className="font-headline-sm text-[16px] text-on-surface font-bold">Upcoming Renewals (30 Days)</h3>
                                    <Link to="/renewals" className="text-primary text-[12px] font-semibold hover:underline">
                                        View All
                                    </Link>
                                </div>
                                <UpcomingRenewalsTable renewals={upcomingRenewals} loading={isLoading} />
                            </div>
                        </div>

                        {/* Right Column (Actions & Activity) */}
                        <div className="space-y-lg">
                            {pendingApprovalsCount > 0 && (
                                <PendingApprovalsSection requests={pendingApprovals} loading={isLoading} />
                            )}

                            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg flex-1">
                                <h3 className="font-headline-sm text-[16px] text-on-surface font-bold mb-md">Recent Activity</h3>
                                <RecentActivityFeed logs={auditLogs} loading={isLoading} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
