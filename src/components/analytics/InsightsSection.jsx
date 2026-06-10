import React from 'react';

const InsightsSection = ({ mostExpensiveTool, potentialSavings, monthlyTrendData, upcomingRenewalsCount, upcomingRenewalsValue }) => {
    
    // Calculate month over month change
    let momChange = 0;
    if (monthlyTrendData && monthlyTrendData.length >= 2) {
        const lastMonth = monthlyTrendData[monthlyTrendData.length - 1].actual;
        const prevMonth = monthlyTrendData[monthlyTrendData.length - 2].actual;
        if (prevMonth > 0) {
            momChange = ((lastMonth - prevMonth) / prevMonth) * 100;
        }
    }

    return (
        <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg h-full flex flex-col">
            <div className="flex items-center gap-sm mb-md">
                <span className="material-symbols-outlined text-[#8B5CF6]">auto_awesome</span>
                <h3 className="font-headline-sm text-[16px] text-on-surface font-bold">Auto-Generated Insights</h3>
            </div>
            
            <div className="space-y-sm flex-1 overflow-y-auto custom-scrollbar pr-sm">
                
                {/* Insight 1: Highest Spend */}
                {mostExpensiveTool && (
                    <div className="bg-[#10131A] border border-[#2D3748] p-sm rounded-lg flex items-start gap-sm">
                        <span className="text-[18px] mt-0.5">💸</span>
                        <div>
                            <p className="font-body-md text-[13px] text-on-surface leading-tight">
                                Highest spend: <strong className="text-white">{mostExpensiveTool.name}</strong> costs 
                                <span className="text-primary font-bold"> ${Number(mostExpensiveTool.monthly_cost || 0).toLocaleString()}</span>/month.
                            </p>
                        </div>
                    </div>
                )}

                {/* Insight 2: Potential Savings */}
                {potentialSavings > 0 && (
                    <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 p-sm rounded-lg flex items-start gap-sm">
                        <span className="text-[18px] mt-0.5">⚠️</span>
                        <div>
                            <p className="font-body-md text-[13px] text-[#EF4444] leading-tight">
                                You have <span className="font-bold">${potentialSavings.toLocaleString()}/mo</span> tied up in tools with less than 50% seat utilization. Consider downgrading unused seats.
                            </p>
                        </div>
                    </div>
                )}

                {/* Insight 3: Month over Month Trend */}
                {momChange !== 0 && (
                    <div className="bg-[#10131A] border border-[#2D3748] p-sm rounded-lg flex items-start gap-sm">
                        <span className="text-[18px] mt-0.5">{momChange > 0 ? '📈' : '📉'}</span>
                        <div>
                            <p className="font-body-md text-[13px] text-on-surface leading-tight">
                                Spend {momChange > 0 ? 'increased' : 'decreased'} <strong className={momChange > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}>
                                    {Math.abs(momChange).toFixed(1)}%
                                </strong> compared to last month.
                            </p>
                        </div>
                    </div>
                )}

                {/* Insight 4: Upcoming Renewals */}
                {upcomingRenewalsCount > 0 && (
                    <div className="bg-[#10131A] border border-[#2D3748] p-sm rounded-lg flex items-start gap-sm">
                        <span className="text-[18px] mt-0.5">🔄</span>
                        <div>
                            <p className="font-body-md text-[13px] text-on-surface leading-tight">
                                <strong className="text-white">{upcomingRenewalsCount}</strong> tools renewing this month worth a total of 
                                <span className="font-bold text-[#F59E0B]"> ${upcomingRenewalsValue.toLocaleString()}</span>.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default InsightsSection;
