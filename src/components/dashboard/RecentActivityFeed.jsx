import React from 'react';

const ACTION_CONFIG = {
    approved:  { icon: 'check_circle', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
    rejected:  { icon: 'cancel', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' },
    added:     { icon: 'add_circle', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
    cancelled: { icon: 'block', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' },
    modified:  { icon: 'edit', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
    renewed:   { icon: 'autorenew', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
    removed:   { icon: 'person_remove', color: 'text-[#9CA3AF]', bg: 'bg-[#1F2937]' },
    invited:   { icon: 'person_add', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
    noted:     { icon: 'sticky_note_2', color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/10' },
    default:   { icon: 'info', color: 'text-on-surface-variant', bg: 'bg-surface-container' },
};

const ACTION_LABELS = {
    approved: 'approved',
    rejected: 'rejected',
    added: 'added',
    cancelled: 'cancelled',
    modified: 'modified',
    renewed: 'renewed',
    removed: 'removed',
    invited: 'invited',
    noted: 'added note to',
    more_info_needed: 'requested more info for',
};

const ENTITY_LABELS = {
    vendor: 'vendor',
    tool_request: 'tool request for',
    profile: 'team member',
    invite: 'invite for',
    seat_assignment: 'seat for',
};

const getRelativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const buildDescription = (log) => {
    const actionLabel = ACTION_LABELS[log.action] || log.action;
    const entityLabel = ENTITY_LABELS[log.entity_type] || log.entity_type;
    const entityName = log.entity_name || '';
    return { actionLabel, entityLabel, entityName };
};

const RecentActivityFeed = ({ logs, loading }) => {
    if (loading) {
        return (
            <div className="space-y-sm">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 bg-[#2D3748] animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="py-xl text-center">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant mb-xs">history</span>
                <p className="font-body-md text-on-surface-variant">No recent activity.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pr-sm custom-scrollbar max-h-[400px] overflow-y-auto">
            {logs.map((log, index) => {
                const isLast = index === logs.length - 1;
                const conf = ACTION_CONFIG[log.action] || ACTION_CONFIG.default;
                const actorName = log.actor?.full_name || 'System';
                const { actionLabel, entityLabel, entityName } = buildDescription(log);

                return (
                    <div key={log.id} className="relative pl-6">
                        {/* Timeline line */}
                        {!isLast && (
                            <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-[#2D3748]" />
                        )}
                        
                        {/* Icon */}
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${conf.bg} border border-[#2D3748]`}>
                            <span className={`material-symbols-outlined text-[12px] ${conf.color}`}>
                                {conf.icon}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="bg-[#10131A] border border-[#2D3748] rounded-lg p-sm hover:border-[#3B82F6]/30 transition-colors">
                            <p className="font-body-md text-[13px] text-on-surface leading-relaxed">
                                <span className="font-semibold text-primary">{actorName}</span>{' '}
                                <span className="text-on-surface-variant">{actionLabel}</span>{' '}
                                <span className="text-on-surface-variant">{entityLabel}</span>{' '}
                                {entityName && <span className="font-semibold text-on-surface">{entityName}</span>}
                            </p>
                            <p className="font-label-md text-[10px] text-on-surface-variant mt-1">
                                {getRelativeTime(log.created_at)}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RecentActivityFeed;
