import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAnalytics } from '../../hooks/useAnalytics';

// Components
import MonthlyTrendChart from '../../components/analytics/MonthlyTrendChart';
import SpendByCategoryChart from '../../components/analytics/SpendByCategoryChart';
import UtilizationDonutChart from '../../components/analytics/UtilizationDonutChart';
import ToolsCostTable from '../../components/analytics/ToolsCostTable';
import InsightsSection from '../../components/analytics/InsightsSection';

const AnalyticsPage = () => {
    const { profile } = useAuthStore();
    const {
        vendors,
        isLoading,
        dateRange,
        setDateRange,
        totalAnnualSpend,
        avgMonthlySpend,
        mostExpensiveTool,
        potentialSavings,
        spendByCategory,
        utilizationData,
        monthlyTrendData,
        toastMessage,
        toastType,
        dismissToast
    } = useAnalytics();

    const [categoryFilter, setCategoryFilter] = useState(null);

    // Access control: only admin/manager
    if (profile && profile.role !== 'admin' && profile.role !== 'manager') {
        return <Navigate to="/" replace />;
    }

    useEffect(() => { document.title = 'Analytics | StackTracker'; }, []);

    // Prepare data for insights
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const renewalsThisMonth = vendors.filter(v => {
        if (!v.renewal_date) return false;
        const d = new Date(v.renewal_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const upcomingRenewalsValue = renewalsThisMonth.reduce((sum, v) => sum + (Number(v.monthly_cost) || 0) * 12, 0);

    return (
        <div className="flex-1 flex flex-col pb-xl">
            {/* Toast */}
            {toastMessage && (
                <div
                    className={`fixed top-20 right-8 z-[200] flex items-center gap-sm px-md py-sm rounded-xl border shadow-2xl animate-slide-in ${
                        toastType === 'success'
                            ? 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
                            : 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {toastType === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span className="font-body-md text-body-md">{toastMessage}</span>
                    <button onClick={dismissToast} className="ml-sm hover:opacity-70">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Spend Analytics</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Track and optimize your engineering tool investments
                    </p>
                </div>
                <div className="flex items-center bg-[#161B28] border border-[#2D3748] rounded-lg p-1">
                    {[
                        { id: '3_months', label: '3M' },
                        { id: '6_months', label: '6M' },
                        { id: '12_months', label: '12M' },
                        { id: 'this_year', label: 'YTD' }
                    ].map(range => (
                        <button
                            key={range.id}
                            onClick={() => setDateRange(range.id)}
                            className={`px-3 py-1.5 rounded-md font-label-md text-[12px] transition-colors ${
                                dateRange === range.id
                                    ? 'bg-[#2D3748] text-white shadow-sm'
                                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-md mb-lg">
                {/* 1. Total Annual */}
                <div className="bg-[#161B28] border border-[#10B981]/20 rounded-xl p-md flex items-center gap-md">
                    <div className="w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px] text-[#10B981]">account_balance</span>
                    </div>
                    <div>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Total Annual Spend</p>
                        {isLoading ? (
                            <div className="h-8 bg-[#2D3748] rounded w-24 mt-1 animate-pulse" />
                        ) : (
                            <p className="font-display-lg text-[24px] font-bold text-[#10B981]">
                                ${totalAnnualSpend.toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* 2. Avg Monthly */}
                <div className="bg-[#161B28] border border-[#3B82F6]/20 rounded-xl p-md flex items-center gap-md">
                    <div className="w-12 h-12 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px] text-[#3B82F6]">date_range</span>
                    </div>
                    <div>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Average Monthly Spend</p>
                        {isLoading ? (
                            <div className="h-8 bg-[#2D3748] rounded w-24 mt-1 animate-pulse" />
                        ) : (
                            <p className="font-display-lg text-[24px] font-bold text-[#3B82F6]">
                                ${avgMonthlySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                        )}
                    </div>
                </div>

                {/* 3. Most Expensive */}
                <div className="bg-[#161B28] border border-[#F97316]/20 rounded-xl p-md flex items-center gap-md">
                    <div className="w-12 h-12 rounded-lg bg-[#F97316]/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px] text-[#F97316]">local_fire_department</span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Most Expensive Tool</p>
                        {isLoading ? (
                            <div className="h-8 bg-[#2D3748] rounded w-24 mt-1 animate-pulse" />
                        ) : mostExpensiveTool ? (
                            <div>
                                <p className="font-display-lg text-[20px] font-bold text-on-surface truncate">
                                    {mostExpensiveTool.name}
                                </p>
                                <p className="font-label-md text-[11px] text-[#F97316]">
                                    ${Number(mostExpensiveTool.monthly_cost).toLocaleString()}/mo
                                </p>
                            </div>
                        ) : (
                            <p className="font-display-lg text-[20px] font-bold text-on-surface-variant mt-1">-</p>
                        )}
                    </div>
                </div>

                {/* 4. Potential Savings */}
                <div className="bg-[#161B28] border border-[#EF4444]/20 rounded-xl p-md flex items-center gap-md relative group">
                    <div className="w-12 h-12 rounded-lg bg-[#EF4444]/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px] text-[#EF4444]">savings</span>
                    </div>
                    <div>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                            Potential Savings
                            <span className="material-symbols-outlined text-[12px] cursor-help">info</span>
                        </p>
                        {isLoading ? (
                            <div className="h-8 bg-[#2D3748] rounded w-24 mt-1 animate-pulse" />
                        ) : (
                            <p className="font-display-lg text-[24px] font-bold text-[#EF4444]">
                                ${potentialSavings.toLocaleString()}/mo
                            </p>
                        )}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute top-[-30px] right-0 bg-[#2D3748] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Tools with less than 50% seat utilization
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="space-y-lg mb-lg">
                {/* Full Width Trend Line Chart */}
                <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg">
                    <h3 className="font-headline-sm text-[16px] text-on-surface font-bold mb-md">Monthly Spend Trend</h3>
                    <MonthlyTrendChart data={monthlyTrendData} loading={isLoading} />
                </div>

                {/* Two Column Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-lg">
                    {/* Bar Chart - 60% */}
                    <div className="lg:col-span-3 bg-[#161B28] border border-[#2D3748] rounded-xl p-lg">
                        <div className="flex items-center justify-between mb-md">
                            <h3 className="font-headline-sm text-[16px] text-on-surface font-bold">Spend by Category</h3>
                            <span className="font-label-md text-[11px] text-on-surface-variant">Click bar to filter table</span>
                        </div>
                        <SpendByCategoryChart 
                            data={spendByCategory} 
                            loading={isLoading} 
                            onCategoryClick={(cat) => setCategoryFilter(cat)}
                        />
                    </div>

                    {/* Donut Chart - 40% */}
                    <div className="lg:col-span-2 bg-[#161B28] border border-[#2D3748] rounded-xl p-lg">
                        <h3 className="font-headline-sm text-[16px] text-on-surface font-bold mb-md">Seat Utilization Health</h3>
                        <UtilizationDonutChart data={utilizationData} loading={isLoading} totalTools={vendors.length} />
                    </div>
                </div>
            </div>

            {/* Bottom Row: Table and Insights */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-lg">
                {/* Table - 75% */}
                <div className="xl:col-span-3 bg-[#161B28] border border-[#2D3748] rounded-xl p-lg flex flex-col h-full min-h-[500px]">
                    <h3 className="font-headline-sm text-[16px] text-on-surface font-bold mb-md">Tools Cost Breakdown</h3>
                    <div className="flex-1">
                        <ToolsCostTable 
                            vendors={vendors} 
                            loading={isLoading} 
                            categoryFilter={categoryFilter}
                            onClearCategory={() => setCategoryFilter(null)}
                        />
                    </div>
                </div>

                {/* Insights - 25% */}
                <div className="xl:col-span-1 min-h-[400px] xl:min-h-[500px]">
                    {isLoading ? (
                        <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg h-full animate-pulse" />
                    ) : (
                        <InsightsSection 
                            mostExpensiveTool={mostExpensiveTool}
                            potentialSavings={potentialSavings}
                            monthlyTrendData={monthlyTrendData}
                            upcomingRenewalsCount={renewalsThisMonth.length}
                            upcomingRenewalsValue={upcomingRenewalsValue}
                        />
                    )}
                </div>
            </div>

        </div>
    );
};

export default AnalyticsPage;
