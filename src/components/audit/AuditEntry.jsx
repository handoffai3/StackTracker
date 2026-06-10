import React, { useState } from 'react';
import ActionBadge from './ActionBadge';

const buildDescription = (log) => {
    const actionMap = {
        approved: 'Approved',
        rejected: 'Rejected',
        added: 'Added',
        cancelled: 'Cancelled',
        modified: 'Modified',
        invited: 'Invited',
        removed: 'Removed',
        renewed: 'Renewed',
        noted: 'Added note to'
    };

    const entityMap = {
        vendor: 'vendor',
        tool_request: 'tool request for',
        profile: 'team member',
        invite: ''
    };

    const actionText = actionMap[log.action?.toLowerCase()] || log.action;
    const entityText = entityMap[log.entity_type?.toLowerCase()] !== undefined 
        ? entityMap[log.entity_type?.toLowerCase()] 
        : log.entity_type;

    // Filter out extra spaces if entityText is empty
    return `${actionText} ${entityText ? entityText + ' ' : ''}${log.entity_name || 'an item'}`;
};

const getRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const AuditEntry = ({ log }) => {
    const [expanded, setExpanded] = useState(false);

    const description = buildDescription(log);
    const relativeTime = getRelativeTime(log.created_at);
    const absoluteTime = new Date(log.created_at).toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
    });

    const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;
    const actorName = log.actor?.full_name || 'System';
    const actorInitial = actorName.charAt(0).toUpperCase();

    return (
        <div className="flex gap-md py-md relative group">
            {/* Timeline Line (drawn by parent, but we can ensure spacing here) */}
            
            {/* Avatar */}
            <div className="relative z-10 shrink-0">
                {log.actor?.avatar_url ? (
                    <img src={log.actor.avatar_url} alt="actor" className="w-8 h-8 rounded-full border-2 border-[#161B28] object-cover" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container border-2 border-[#161B28] flex items-center justify-center font-bold text-[12px]">
                        {actorInitial}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 bg-[#10131A] border border-[#2D3748] rounded-lg p-md hover:border-[#3B82F6]/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-sm mb-2">
                    <div>
                        <div className="flex items-center gap-xs flex-wrap mb-1">
                            <span className="font-headline-sm text-[14px] text-on-surface font-bold">{actorName}</span>
                            <ActionBadge action={log.action} />
                        </div>
                        <p className="font-body-md text-[13px] text-on-surface-variant leading-relaxed">
                            {description}
                        </p>
                    </div>
                    <div 
                        className="text-[11px] text-[#6B7280] whitespace-nowrap cursor-help shrink-0" 
                        title={absoluteTime}
                    >
                        {relativeTime}
                    </div>
                </div>

                {hasMetadata && (
                    <div className="mt-sm pt-sm border-t border-[#2D3748]/50">
                        <button 
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                            <span className="material-symbols-outlined text-[14px]">
                                {expanded ? 'expand_less' : 'expand_more'}
                            </span>
                            {expanded ? 'Hide Details' : 'View Details'}
                        </button>
                        
                        {expanded && (
                            <div className="mt-sm bg-[#161B28] rounded border border-[#2D3748] p-sm overflow-x-auto">
                                <pre className="text-[11px] text-[#9CA3AF] font-mono whitespace-pre-wrap m-0">
                                    {Object.entries(log.metadata).map(([key, val]) => (
                                        <div key={key} className="mb-1 last:mb-0">
                                            <span className="text-[#3B82F6]">{key}:</span> {
                                                typeof val === 'object' ? JSON.stringify(val) : String(val)
                                            }
                                        </div>
                                    ))}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditEntry;
