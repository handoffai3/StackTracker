import React from 'react';

const priorityConfig = {
    critical: {
        label: 'Critical',
        bg: 'bg-[#EF4444]/10',
        text: 'text-[#EF4444]',
        border: 'border-[#EF4444]/20',
        dot: 'bg-[#EF4444]',
    },
    high: {
        label: 'High',
        bg: 'bg-[#F97316]/10',
        text: 'text-[#F97316]',
        border: 'border-[#F97316]/20',
        dot: 'bg-[#F97316]',
    },
    medium: {
        label: 'Medium',
        bg: 'bg-[#3B82F6]/10',
        text: 'text-[#3B82F6]',
        border: 'border-[#3B82F6]/20',
        dot: 'bg-[#3B82F6]',
    },
    low: {
        label: 'Low',
        bg: 'bg-[#6B7280]/10',
        text: 'text-[#6B7280]',
        border: 'border-[#6B7280]/20',
        dot: 'bg-[#6B7280]',
    },
};

const statusConfig = {
    pending: {
        label: 'Pending',
        bg: 'bg-[#F59E0B]/10',
        text: 'text-[#F59E0B]',
        border: 'border-[#F59E0B]/20',
        icon: 'schedule',
    },
    approved: {
        label: 'Approved',
        bg: 'bg-[#10B981]/10',
        text: 'text-[#10B981]',
        border: 'border-[#10B981]/20',
        icon: 'check_circle',
    },
    rejected: {
        label: 'Rejected',
        bg: 'bg-[#EF4444]/10',
        text: 'text-[#EF4444]',
        border: 'border-[#EF4444]/20',
        icon: 'cancel',
    },
    more_info_needed: {
        label: 'More Info',
        bg: 'bg-[#8B5CF6]/10',
        text: 'text-[#8B5CF6]',
        border: 'border-[#8B5CF6]/20',
        icon: 'help',
    },
};

export const PriorityBadge = ({ priority }) => {
    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {config.label}
        </span>
    );
};

export const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}
        >
            <span className="material-symbols-outlined text-[13px]">{config.icon}</span>
            {config.label}
        </span>
    );
};

export default PriorityBadge;
