import React, { useState } from 'react';

const priorityConfig = {
    critical: { label: 'Critical', color: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30' },
    high:     { label: 'High',     color: 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30' },
    medium:   { label: 'Medium',   color: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30' },
    low:      { label: 'Low',      color: 'bg-[#6B7280]/15 text-[#9CA3AF] border-[#6B7280]/30' },
};

const statusConfig = {
    pending:          { label: 'Pending',       color: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30', icon: 'schedule' },
    approved:         { label: 'Approved',      color: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30', icon: 'check_circle' },
    rejected:         { label: 'Rejected',      color: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30', icon: 'cancel' },
    more_info_needed: { label: 'More Info',     color: 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30', icon: 'help' },
};

const RequestCard = ({ request, onReview, isPending }) => {
    const [expanded, setExpanded] = useState(false);

    const priority = priorityConfig[request.priority] || priorityConfig.medium;
    const status = statusConfig[request.status] || statusConfig.pending;
    const requesterName = request.requested_by_profile?.full_name || 'Unknown User';
    const avatarUrl = request.requested_by_profile?.avatar_url;
    const reviewerName = request.reviewed_by_profile?.full_name;

    const dateStr = request.created_at
        ? new Date(request.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
          })
        : '—';

    const justification = request.business_justification || '';
    const isLong = justification.length > 180;

    return (
        <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg transition-all duration-300 hover:border-[#3B82F6]/40 group">
            {/* Top row */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-md mb-md">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-sm mb-xs flex-wrap">
                        <h3 className="font-headline-sm text-[18px] text-on-surface font-bold truncate">
                            {request.tool_name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${priority.color}`}>
                            {priority.label}
                        </span>
                        {!isPending && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${status.color}`}>
                                <span className="material-symbols-outlined text-[12px]">{status.icon}</span>
                                {status.label}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-sm mt-sm">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={requesterName} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-[10px] font-bold shrink-0">
                                {requesterName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            <span className="text-on-surface font-semibold">{requesterName}</span>
                            <span className="mx-1">·</span>
                            {dateStr}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-lg shrink-0">
                    <div className="text-right">
                        <p className="font-display-lg text-[24px] font-bold text-[#10B981]">
                            ${Number(request.monthly_cost || 0).toLocaleString()}
                        </p>
                        <p className="font-label-md text-label-md text-on-surface-variant">/month</p>
                    </div>
                    <div className="text-center px-md py-sm bg-[#10131A] rounded-lg border border-[#2D3748]">
                        <p className="font-headline-sm text-[18px] text-on-surface font-bold">{request.seats_needed || '—'}</p>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Seats</p>
                    </div>
                </div>
            </div>

            {/* Justification */}
            <div className="bg-[#10131A] border border-[#2D3748] rounded-lg p-sm font-body-md text-body-md text-on-surface-variant mb-md">
                <strong className="text-on-surface block text-[11px] font-bold uppercase tracking-wider mb-xs">Justification</strong>
                <p className={!expanded && isLong ? 'line-clamp-3' : ''}>
                    {justification || 'No justification provided.'}
                </p>
                {isLong && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-primary text-[12px] font-semibold mt-xs hover:underline"
                    >
                        {expanded ? 'Show Less' : 'View Full Details'}
                    </button>
                )}
            </div>

            {/* Review note for non-pending */}
            {!isPending && request.review_note && (
                <div className="bg-[#10131A]/50 border border-[#2D3748] rounded-lg p-sm font-body-md text-body-md text-on-surface-variant mb-md">
                    <strong className="text-on-surface block text-[11px] font-bold uppercase tracking-wider mb-xs">
                        Review Note {reviewerName ? `by ${reviewerName}` : ''}
                    </strong>
                    <p>{request.review_note}</p>
                </div>
            )}

            {/* Action Buttons (only for pending) */}
            {isPending && (
                <div className="flex items-center justify-end gap-sm pt-sm border-t border-[#2D3748]">
                    <button
                        onClick={() => onReview(request, 'rejected')}
                        className="px-md py-sm border border-[#EF4444]/30 hover:bg-[#EF4444]/10 text-[#EF4444] rounded-lg font-body-md text-body-md transition-all active:scale-95 flex items-center gap-xs"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                        Reject
                    </button>
                    <button
                        onClick={() => onReview(request, 'more_info_needed')}
                        className="px-md py-sm border border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-lg font-body-md text-body-md transition-all active:scale-95 flex items-center gap-xs"
                    >
                        <span className="material-symbols-outlined text-[18px]">help</span>
                        Request More Info
                    </button>
                    <button
                        onClick={() => onReview(request, 'approved')}
                        className="bg-[#10B981] hover:bg-[#059669] text-white font-body-md text-body-md px-md py-sm rounded-lg flex items-center gap-xs transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                        Approve
                    </button>
                </div>
            )}
        </div>
    );
};

export default RequestCard;
