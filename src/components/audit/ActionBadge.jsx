import React from 'react';

const badgeColors = {
    approved: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30', // green
    rejected: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30', // red
    added: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30', // blue
    cancelled: 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30', // orange
    modified: 'bg-[#6B7280]/15 text-[#9CA3AF] border-[#6B7280]/30', // grey
    invited: 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30', // purple
    removed: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30', // red
    renewed: 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30', // cyan
    noted: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30', // yellow
};

const ActionBadge = ({ action }) => {
    const colorClass = badgeColors[action?.toLowerCase()] || badgeColors.modified;
    
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${colorClass}`}>
            {action || 'Unknown'}
        </span>
    );
};

export default ActionBadge;
