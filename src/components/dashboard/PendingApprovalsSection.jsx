import React from 'react';
import { Link } from 'react-router-dom';

const priorityConfig = {
    critical: { label: 'Critical', color: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30' },
    high:     { label: 'High',     color: 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30' },
    medium:   { label: 'Medium',   color: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30' },
    low:      { label: 'Low',      color: 'bg-[#6B7280]/15 text-[#9CA3AF] border-[#6B7280]/30' },
};

const PendingApprovalsSection = ({ requests, loading }) => {
    // Only show top 3
    const displayReqs = requests?.slice(0, 3) || [];

    if (loading) {
        return (
            <div className="space-y-sm">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-20 bg-[#2D3748] animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (displayReqs.length === 0) {
        return null; // Hidden if empty per spec
    }

    return (
        <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg flex flex-col">
            <div className="flex items-center justify-between mb-md pb-md border-b border-[#2D3748]">
                <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-[#EF4444]">pending_actions</span>
                    <h3 className="font-headline-sm text-[16px] text-on-surface font-bold">Action Required</h3>
                </div>
                <Link to="/approval-queue" className="text-primary text-[12px] font-semibold hover:underline">
                    View All
                </Link>
            </div>

            <div className="space-y-sm">
                {displayReqs.map(req => {
                    const priority = priorityConfig[req.priority] || priorityConfig.medium;
                    const requesterName = req.requested_by_profile?.full_name || 'Unknown';
                    const dateStr = new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    return (
                        <div key={req.id} className="bg-[#10131A] border border-[#2D3748] rounded-lg p-md flex items-center justify-between gap-md">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-sm mb-xs flex-wrap">
                                    <p className="font-headline-sm text-[14px] text-on-surface font-bold truncate">
                                        {req.tool_name}
                                    </p>
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${priority.color}`}>
                                        {priority.label}
                                    </span>
                                </div>
                                <p className="font-body-md text-[12px] text-on-surface-variant truncate">
                                    {requesterName} <span className="mx-1">·</span> {dateStr}
                                </p>
                            </div>
                            <div className="flex items-center gap-md shrink-0">
                                <p className="font-headline-sm text-[16px] text-on-surface font-bold">
                                    ${Number(req.monthly_cost || 0).toLocaleString()}
                                </p>
                                <Link 
                                    to="/approval-queue" 
                                    className="px-sm py-1 bg-primary text-white rounded text-[12px] font-semibold hover:bg-primary/90 transition-colors"
                                >
                                    Review
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PendingApprovalsSection;
