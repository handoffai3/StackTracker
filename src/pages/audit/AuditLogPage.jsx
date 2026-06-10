import React, { useMemo, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAuditLog } from '../../hooks/useAuditLog';

// Components
import AuditEntry from '../../components/audit/AuditEntry';
import AuditFilters from '../../components/audit/AuditFilters';

const AuditLogPage = () => {
    const { profile } = useAuthStore();
    const {
        logs,
        profiles,
        totalCount,
        thisWeekCount,
        mostActiveMember,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        
        searchTerm, setSearchTerm,
        dateFrom, setDateFrom,
        dateTo, setDateTo,
        selectedAction, setSelectedAction,
        selectedUserId, setSelectedUserId,
        selectedEntityType, setSelectedEntityType,
        
        clearFilters,
        loadMore
    } = useAuditLog();

    // Access control: only admin
    if (profile && profile.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    useEffect(() => { document.title = 'Audit Log | StackTracker'; }, []);

    // Group logs by date
    const groupedLogs = useMemo(() => {
        const groups = {};
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        logs.forEach(log => {
            const logDate = new Date(log.created_at);
            logDate.setHours(0, 0, 0, 0);
            
            let dateKey = '';
            if (logDate.getTime() === today.getTime()) {
                dateKey = 'Today';
            } else if (logDate.getTime() === yesterday.getTime()) {
                dateKey = 'Yesterday';
            } else {
                dateKey = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(log);
        });

        return groups;
    }, [logs]);

    const handleExportCSV = () => {
        const headers = ['Date', 'Time', 'Actor', 'Action', 'Entity Type', 'Entity Name', 'Metadata'];
        
        const rows = logs.map(log => {
            const date = new Date(log.created_at);
            const metadataStr = log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : '';
            return [
                `"${date.toLocaleDateString()}"`,
                `"${date.toLocaleTimeString()}"`,
                `"${log.actor?.full_name || 'System'}"`,
                `"${log.action}"`,
                `"${log.entity_type}"`,
                `"${log.entity_name || ''}"`,
                `"${metadataStr}"`
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_log_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 flex flex-col pb-xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Audit Log</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Complete history of all actions taken in your workspace
                    </p>
                </div>
                <div>
                    <button
                        onClick={handleExportCSV}
                        disabled={logs.length === 0}
                        className="bg-[#161B28] hover:bg-[#2D3748] border border-[#2D3748] text-on-surface font-label-md py-2 px-md rounded-lg flex items-center gap-xs transition-colors disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export to CSV
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] px-md py-sm rounded-lg mb-lg flex items-center gap-sm">
                    <span className="material-symbols-outlined text-[20px]">error</span>
                    <span className="font-body-md">{error}</span>
                </div>
            )}

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
                <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-xl p-md flex items-center gap-md">
                    <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px] text-[#3B82F6]">history</span>
                    </div>
                    <div>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Total Actions</p>
                        <p className="font-display-lg text-[28px] font-bold text-[#3B82F6]">{totalCount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-md flex items-center gap-md">
                    <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px] text-[#10B981]">today</span>
                    </div>
                    <div>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Actions This Week</p>
                        <p className="font-display-lg text-[28px] font-bold text-[#10B981]">{thisWeekCount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-[#F97316]/10 border border-[#F97316]/20 rounded-xl p-md flex items-center gap-md">
                    <div className="w-10 h-10 rounded-lg bg-[#F97316]/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px] text-[#F97316]">local_fire_department</span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Most Active Member</p>
                        <p className="font-display-lg text-[22px] font-bold text-[#F97316] truncate">
                            {mostActiveMember || '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <AuditFilters 
                profiles={profiles}
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                dateFrom={dateFrom} setDateFrom={setDateFrom}
                dateTo={dateTo} setDateTo={setDateTo}
                selectedAction={selectedAction} setSelectedAction={setSelectedAction}
                selectedUserId={selectedUserId} setSelectedUserId={setSelectedUserId}
                selectedEntityType={selectedEntityType} setSelectedEntityType={setSelectedEntityType}
                onClear={clearFilters}
            />

            {/* Timeline Feed */}
            <div className="flex-1 bg-[#161B28] border border-[#2D3748] rounded-xl p-lg min-h-[400px]">
                {isLoading ? (
                    <div className="space-y-lg">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-md animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-[#2D3748] shrink-0" />
                                <div className="flex-1 bg-[#10131A] rounded-lg h-24 border border-[#2D3748]" />
                            </div>
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-xl">
                        <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-md border border-[#2D3748]">
                            <span className="material-symbols-outlined text-[32px] text-on-surface-variant">history</span>
                        </div>
                        <h3 className="font-headline-sm text-[20px] text-on-surface mb-xs">No activity recorded yet.</h3>
                        <p className="font-body-md text-on-surface-variant max-w-sm mx-auto">
                            Actions will appear here as your team uses StackTracker.
                        </p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-4 top-4 bottom-4 w-px bg-[#2D3748] z-0 hidden sm:block" />

                        {Object.entries(groupedLogs).map(([dateLabel, dateLogs]) => (
                            <div key={dateLabel} className="mb-lg last:mb-0 relative z-10">
                                <div className="sticky top-0 bg-[#161B28] py-sm mb-sm inline-block sm:ml-12 z-20">
                                    <h3 className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant bg-[#10131A] px-3 py-1 rounded-full border border-[#2D3748]">
                                        {dateLabel}
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    {dateLogs.map(log => (
                                        <AuditEntry key={log.id} log={log} />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Load More */}
                        {hasMore && (
                            <div className="pt-md pb-sm text-center relative z-10">
                                <button
                                    onClick={loadMore}
                                    disabled={isLoadingMore}
                                    className="bg-[#10131A] hover:bg-[#2D3748] text-on-surface border border-[#2D3748] px-xl py-sm rounded-lg font-label-md text-[13px] transition-colors disabled:opacity-50"
                                >
                                    {isLoadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};

export default AuditLogPage;
