import React from 'react';
import { useNavigate } from 'react-router-dom';

const RenewalCard = ({ vendor, onRenew, onCancel, onSnooze, isSubmitting }) => {
    const navigate = useNavigate();

    const daysLeft = Math.ceil((new Date(vendor.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    // Determine status colors based on days left
    let timeColor = 'text-[#10B981]'; // Green > 30
    let warningIconColor = null;
    
    if (daysLeft <= 7) {
        timeColor = 'text-[#EF4444]'; // Red
        warningIconColor = 'text-[#EF4444]';
    } else if (daysLeft <= 30) {
        timeColor = 'text-[#F59E0B]'; // Yellow
        warningIconColor = 'text-[#F59E0B]';
    }

    const isAnnual = vendor.billing_cycle?.toLowerCase() === 'annual';
    const costLabel = isAnnual ? 'Annual Cost' : 'Est. Monthly Cost';
    const displayCost = isAnnual 
        ? Number(vendor.monthly_cost || 0) * 12 
        : Number(vendor.monthly_cost || 0);

    const ownerName = vendor.owner?.full_name || 'Unassigned';

    // Action Buttons configuration
    let actions = [];
    
    if (daysLeft <= 7) {
        actions = [
            <button 
                key="renew" 
                onClick={() => onRenew(vendor)}
                disabled={isSubmitting}
                className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-label-md py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
            >
                Renew
            </button>,
            <button 
                key="cancel" 
                onClick={() => onCancel(vendor)}
                disabled={isSubmitting}
                className="flex-1 border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10 font-label-md py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
            >
                Cancel
            </button>
        ];
    } else if (daysLeft <= 30) {
        actions = [
            <button 
                key="review" 
                onClick={() => navigate(`/vendor-directory/${vendor.id}`)}
                className="flex-1 border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10 font-label-md py-2 px-3 rounded-lg transition-colors"
            >
                Review Terms
            </button>,
            <button 
                key="modify" 
                onClick={() => navigate(`/vendor-directory/${vendor.id}`)}
                className="flex-1 border border-[#6B7280] text-on-surface hover:bg-[#2D3748] font-label-md py-2 px-3 rounded-lg transition-colors"
            >
                Modify
            </button>
        ];
    } else {
        actions = [
            <button 
                key="renew_early" 
                onClick={() => navigate(`/vendor-directory/${vendor.id}`)}
                className="w-full border border-[#6B7280] text-on-surface hover:bg-[#2D3748] font-label-md py-2 px-3 rounded-lg transition-colors"
            >
                Renew Early
            </button>
        ];
    }

    return (
        <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg flex flex-col hover:border-[#3B82F6]/40 transition-colors group">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-md mb-md">
                <div className="flex items-center gap-sm min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 border border-[#2D3748]">
                        <span className="material-symbols-outlined text-[24px] text-on-surface-variant">build</span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-headline-sm text-[18px] text-on-surface font-bold truncate">
                            {vendor.name}
                        </h3>
                        <p className="font-label-md text-[11px] text-on-surface-variant truncate mt-0.5">
                            Owner: <span className="text-on-surface">{ownerName}</span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-[#1F2937] text-on-surface-variant font-bold border border-[#2D3748] uppercase">
                        {vendor.category}
                    </span>
                    {warningIconColor && (
                        <span className={`material-symbols-outlined ${warningIconColor} text-[20px] mt-1`} title="Attention needed">
                            warning
                        </span>
                    )}
                </div>
            </div>

            {/* Time Remaining & Cost */}
            <div className="bg-[#10131A] border border-[#2D3748] rounded-lg p-md mb-md">
                <div className="flex justify-between items-center mb-sm pb-sm border-b border-[#2D3748]">
                    <span className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider">Time Remaining</span>
                    <span className={`font-display-lg text-[24px] font-bold ${timeColor}`}>
                        {daysLeft} Days
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider">{costLabel}</span>
                    <span className="font-headline-sm text-[16px] font-bold text-on-surface">
                        ${displayCost.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-auto flex items-center gap-sm pt-sm">
                {actions}
                
                {/* Snooze Button */}
                <button
                    onClick={() => onSnooze(vendor.id)}
                    className="w-10 h-10 rounded-lg border border-[#2D3748] hover:bg-[#2D3748] text-on-surface-variant flex items-center justify-center shrink-0 transition-colors"
                    title="Snooze for 7 days"
                >
                    <span className="material-symbols-outlined text-[18px]">snooze</span>
                </button>
            </div>
        </div>
    );
};

export default RenewalCard;
