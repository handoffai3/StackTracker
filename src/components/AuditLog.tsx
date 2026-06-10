import React, { useState, useMemo } from 'react';

interface LogEntry {
    id: string;
    time: string;
    date: string;
    dateGroup: string;
    type: 'Approved' | 'Added' | 'Modified' | 'Rejected' | 'Cancelled';
    message: string;
    user: string;
    userAvatar?: string;
    userIcon?: string;
    metaId?: string;
    metaVal?: string;
    metaDetails?: {
        title: string;
        oldVal: string;
        newVal: string;
    };
    metaQuote?: string;
}

const AuditLog: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [dateRange, setDateRange] = useState('all');
    const [actionType, setActionType] = useState('All');
    const [userFilter, setUserFilter] = useState('All');
    const [showExportToast, setShowExportToast] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Mock logs database
    const [logs, setLogs] = useState<LogEntry[]>([
        {
            id: 'l1',
            time: '09:42 AM',
            date: 'Oct 24',
            dateGroup: 'Today, Oct 24',
            type: 'Approved',
            message: 'Approved AWS infrastructure expansion request for Q4.',
            user: 'Sarah Chen',
            userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqOXqCY3ICgXmLO0Opqewng6ix-W7Zxkh-NnhRVg2t5osPBCoqFvQ8JBBG1i52CABbhG1gO3HJ3KayWqqeeybkuNGMOEHnqxLV00t84patXbBzsuD7zb3DsqDdyhcMTzV-T97fgF2pusEyNOe7ejuefuD6loONAkNNx3W7DSdYA-4KWMo4nn5YUIFnjA2QegkZZdhbD4a0KopubkLYhw2Ja28jmDGCBo9JOaW3o1Cz19zRjwUXIo3bcIeyh0gj24f9VfgWk3KMUNk',
            metaId: 'REQ-8992',
            metaVal: '$12,400/mo'
        },
        {
            id: 'l2',
            time: '08:15 AM',
            date: 'Oct 24',
            dateGroup: 'Today, Oct 24',
            type: 'Added',
            message: 'Imported 42 new GitHub Copilot licenses via Okta sync.',
            user: 'System API',
            userIcon: 'smart_toy'
        },
        {
            id: 'l3',
            time: '16:30 PM',
            date: 'Oct 23',
            dateGroup: 'Yesterday, Oct 23',
            type: 'Modified',
            message: 'Updated team allocation rules for Datadog billing.',
            user: 'Alex Mercer',
            userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ12Om3UvAZUhYR7FjYEA2ElfZqOoulmpDN4nY8VitfBlDkYAjsLfP6DeFXuiDNJBw7mL_xC6zUvLnZXwcJTSpyVSNUsVJwJG3ZdetuB-vmB77kTt55AtFMIqZhvvYZ3Etsl8nzh0Ou6p6yL5HDS_bC2bOCsvmgrWixl9eEwLOGUSNmcsJiIRGQ-mP9nuCAqbjc2mF23PhKuw9ejnj5_EN4heg7UC91FNsKyjrLLiSpiZIHV1uSJ_3BfkvqwwYNdE5b168nDmuFLs',
            metaDetails: {
                title: 'Cost Center Mapping',
                oldVal: 'Frontend: 40%, Backend: 60%',
                newVal: 'Frontend: 30%, Backend: 50%, DevOps: 20%'
            }
        },
        {
            id: 'l4',
            time: '11:05 AM',
            date: 'Oct 23',
            dateGroup: 'Yesterday, Oct 23',
            type: 'Rejected',
            message: 'Denied Vercel Enterprise tier upgrade.',
            user: 'Marcus Johnson',
            userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvakLp7qgOb8THp50QK1kkznE0GtmsKKUeZw1yzu369rTe25EfCDet3bvx77ASJwgkkVK92Lk7zZ9tPk_-E09o4N4kUd7t-ygPROszdGT9_-efzO9sFgV2fbFsgqvSIKNP86CwnKkKfZMnfn1r31yoSqqE1yBSSHvtKjCLZ4yo1yWfyjmOXRajMx_-nYBy6IIGtcVXIo4TqCeymVFoIxR0ZImn5AYGXdPFKWT9jLFAFX0XGR2_PrNJE-ICs54b8d16HlAFD6bBBgk',
            metaQuote: 'Current usage metrics do not justify enterprise tier. Let\'s review next quarter.'
        },
        {
            id: 'l5',
            time: '09:12 AM',
            date: 'Oct 23',
            dateGroup: 'Yesterday, Oct 23',
            type: 'Cancelled',
            message: 'Cancelled scheduled auto-renewal for legacy AppDynamics instance.',
            user: 'Elena Rodriguez',
            userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGmccLymTNuwYxkGGbEopR0R4bqdJJGQAqZXJbGIvfgiAc6QZ1gSeRzXJLQhsNUlkSxlPXKJ1Anfohe9N7DXLjcHUpVWfVzjl5UnWKgsNqZwxrx3hopIWWrUNW7GostPnVxrbqDjtbxi3ftJf4dLDBcErBzDhxzyAJCeHQ-eXbQAVUMcBzhGkc05sp0H_H3KDUR4cz3Tz9wRZQOD9yc6o9MIiKmZc6bHaNsH4azKiXPq2aLzOGs7CqI6p11HtcCpgnZsMGWybWYuU',
            metaId: 'AppDynamics',
            metaVal: 'Saving: $4,200'
        },
        {
            id: 'l6',
            time: '14:22 PM',
            date: 'Oct 22',
            dateGroup: 'Oct 22, 2023',
            type: 'Approved',
            message: 'Approved Figma license seat requests for 8 additional UX hires.',
            user: 'Alex Mercer',
            userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ12Om3UvAZUhYR7FjYEA2ElfZqOoulmpDN4nY8VitfBlDkYAjsLfP6DeFXuiDNJBw7mL_xC6zUvLnZXwcJTSpyVSNUsVJwJG3ZdetuB-vmB77kTt55AtFMIqZhvvYZ3Etsl8nzh0Ou6p6yL5HDS_bC2bOCsvmgrWixl9eEwLOGUSNmcsJiIRGQ-mP9nuCAqbjc2mF23PhKuw9ejnj5_EN4heg7UC91FNsKyjrLLiSpiZIHV1uSJ_3BfkvqwwYNdE5b168nDmuFLs',
            metaId: 'REQ-8910',
            metaVal: '$360/mo'
        },
        {
            id: 'l7',
            time: '10:05 AM',
            date: 'Oct 22',
            dateGroup: 'Oct 22, 2023',
            type: 'Modified',
            message: 'Updated contract files for AWS renewal terms.',
            user: 'Sarah Chen',
            userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqOXqCY3ICgXmLO0Opqewng6ix-W7Zxkh-NnhRVg2t5osPBCoqFvQ8JBBG1i52CABbhG1gO3HJ3KayWqqeeybkuNGMOEHnqxLV00t84patXbBzsuD7zb3DsqDdyhcMTzV-T97fgF2pusEyNOe7ejuefuD6loONAkNNx3W7DSdYA-4KWMo4nn5YUIFnjA2QegkZZdhbD4a0KopubkLYhw2Ja28jmDGCBo9JOaW3o1Cz19zRjwUXIo3bcIeyh0gj24f9VfgWk3KMUNk'
        }
    ]);

    const handleClear = () => {
        setDateRange('all');
        setActionType('All');
        setUserFilter('All');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const handleExport = () => {
        setShowExportToast(true);
        setTimeout(() => setShowExportToast(false), 3000);
    };

    // Filters and search logic
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // Search query matches message or user
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchesMessage = log.message.toLowerCase().includes(query);
                const matchesUser = log.user.toLowerCase().includes(query);
                if (!matchesMessage && !matchesUser) return false;
            }

            // Action type
            if (actionType !== 'All') {
                if (actionType === 'Approvals' && log.type !== 'Approved' && log.type !== 'Rejected') return false;
                if (actionType === 'Modifications' && log.type !== 'Modified') return false;
                if (actionType === 'Additions' && log.type !== 'Added') return false;
            }

            // User filter
            if (userFilter !== 'All') {
                if (userFilter === 'Admin Only' && log.user !== 'Alex Mercer' && log.user !== 'Sarah Chen') return false;
                if (userFilter === 'Finance Team' && log.user !== 'Marcus Johnson' && log.user !== 'Elena Rodriguez') return false;
            }

            return true;
        });
    }, [logs, searchQuery, actionType, userFilter]);

    // Grouping filtered logs by date
    const groupedLogs = useMemo(() => {
        const paginated = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        
        const groups: { [key: string]: LogEntry[] } = {};
        paginated.forEach(log => {
            if (!groups[log.dateGroup]) {
                groups[log.dateGroup] = [];
            }
            groups[log.dateGroup].push(log);
        });
        
        return Object.entries(groups);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    return (
        <div className="flex-1 flex flex-col gap-lg font-body-md text-on-surface">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">System Activity</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Comprehensive record of all platform interactions.
                    </p>
                </div>
                <div className="flex gap-md">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-sm px-4 py-2 bg-transparent border rounded font-semibold text-body-md transition-colors cursor-pointer active:scale-95 ${
                            showFilters ? 'border-primary text-primary' : 'border-outline-variant text-on-surface hover:bg-surface-container-low'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                        Filters
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-sm px-4 py-2 bg-primary hover:bg-primary-container rounded transition-colors font-body-md text-body-md text-on-primary font-semibold cursor-pointer active:scale-95 shadow-md"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export to CSV
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            {showExportToast && (
                <div className="fixed bottom-gutter right-gutter bg-[#191C24] border border-[#2D3748] text-on-surface p-md rounded-xl shadow-2xl flex items-center gap-md z-50 animate-bounce">
                    <span className="material-symbols-outlined text-[#34D399]">check_circle</span>
                    <div>
                        <p className="font-body-md text-sm font-semibold">Audit logs exported</p>
                        <p className="text-xs text-on-surface-variant">CSV file containing filtered logs has been generated.</p>
                    </div>
                </div>
            )}

            {/* Search and Filters Bar */}
            {showFilters && (
                <div className="bg-[#161B28] border border-[#2D3748] rounded p-md flex flex-wrap gap-md items-end shadow-md">
                    {/* Search Field */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-2 font-semibold">Search Text</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-[#0B0F19] border border-[#2D3748] rounded pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant"
                                placeholder="Filter by message, ID..."
                            />
                        </div>
                    </div>
                    
                    {/* Date Range */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-2 font-semibold">Date Range</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">calendar_today</span>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full bg-[#0B0F19] border border-[#2D3748] rounded pl-10 pr-8 py-2 font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                            >
                                <option value="all">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="quarter">This Quarter</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                        </div>
                    </div>
                    
                    {/* Action Type */}
                    <div className="flex-1 min-w-[150px]">
                        <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-2 font-semibold">Action Type</label>
                        <div className="relative">
                            <select
                                value={actionType}
                                onChange={(e) => {
                                    setActionType(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-[#0B0F19] border border-[#2D3748] rounded px-4 py-2 font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                            >
                                <option value="All">All Actions</option>
                                <option value="Approvals">Approvals</option>
                                <option value="Modifications">Modifications</option>
                                <option value="Additions">Additions</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                        </div>
                    </div>
                    
                    {/* User */}
                    <div className="flex-1 min-w-[150px]">
                        <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-2 font-semibold">User</label>
                        <div className="relative">
                            <select
                                value={userFilter}
                                onChange={(e) => {
                                    setUserFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-[#0B0F19] border border-[#2D3748] rounded px-4 py-2 font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                            >
                                <option value="All">All Users</option>
                                <option value="Admin Only">Admin Only</option>
                                <option value="Finance Team">Finance Team</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                        </div>
                    </div>
                    
                    <div>
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 text-on-surface-variant hover:text-on-surface font-body-md text-body-md transition-colors border border-transparent cursor-pointer font-semibold"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Timeline Feed Container */}
            {groupedLogs.length > 0 ? (
                <div className="bg-[#161B28] border border-[#2D3748] rounded overflow-hidden shadow-sm flex flex-col">
                    {groupedLogs.map(([dateGroup, items]) => (
                        <div key={dateGroup} className="flex flex-col">
                            {/* Date Group Header */}
                            <div className="bg-surface-container-low px-md py-sm border-b border-[#2D3748]">
                                <h3 className="font-label-md text-label-md text-[#94A3B8] uppercase font-semibold">{dateGroup}</h3>
                            </div>
                            
                            {/* Group Log Entries */}
                            {items.map((log) => (
                                <div key={log.id} className="flex gap-md p-md border-b border-[#2D3748] hover:bg-surface-container-high transition-colors items-start group">
                                    <div className="w-20 text-right pt-1 shrink-0">
                                        <span className="font-label-md text-label-md text-on-surface-variant font-semibold">{log.time}</span>
                                    </div>
                                    <div className="relative flex items-center justify-center pt-1 shrink-0 px-2 h-full min-h-[44px]">
                                        <div className="w-px bg-[#2D3748] absolute top-6 bottom-[-24px] group-last:hidden"></div>
                                        <div className={`w-2 h-2 rounded-full z-10 ring-4 ring-[#161B28] ${
                                            log.type === 'Approved'
                                                ? 'bg-[#34d399]'
                                                : log.type === 'Rejected'
                                                ? 'bg-[#f87171]'
                                                : log.type === 'Modified'
                                                ? 'bg-[#9ca3af]'
                                                : log.type === 'Cancelled'
                                                ? 'bg-[#fbbf24]'
                                                : 'bg-[#60a5fa]'
                                        }`}></div>
                                    </div>
                                    <div className="flex items-start gap-md flex-1">
                                        {log.userAvatar ? (
                                            <img alt={`${log.user} avatar`} className="w-8 h-8 rounded-full border border-[#2D3748] shrink-0 object-cover" src={log.userAvatar} />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-[#2D3748] flex items-center justify-center text-on-surface-variant shrink-0">
                                                <span className="material-symbols-outlined text-[16px]">{log.userIcon || 'person'}</span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-sm mb-1">
                                                <span className="font-body-md text-body-md font-semibold text-on-surface">{log.user}</span>
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase border ${
                                                    log.type === 'Approved'
                                                        ? 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20'
                                                        : log.type === 'Rejected'
                                                        ? 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20'
                                                        : log.type === 'Modified'
                                                        ? 'bg-[#9ca3af]/10 text-[#9ca3af] border-[#9ca3af]/20'
                                                        : log.type === 'Cancelled'
                                                        ? 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20'
                                                        : 'bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/20'
                                                }`}>
                                                    {log.type}
                                                </span>
                                            </div>
                                            <p className="font-body-md text-body-md text-on-surface-variant font-medium">{log.message}</p>
                                            
                                            {/* Sub Details - Diff mapping */}
                                            {log.metaDetails && (
                                                <div className="mt-2 bg-[#0B0F19] rounded border border-[#2D3748] p-3 inline-block">
                                                    <div className="font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">{log.metaDetails.title}:</div>
                                                    <div className="text-xs font-mono leading-relaxed">
                                                        <span className="text-error line-through opacity-70">{log.metaDetails.oldVal}</span><br />
                                                        <span className="text-[#34d399] font-bold">{log.metaDetails.newVal}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Sub Details - Quote */}
                                            {log.metaQuote && (
                                                <div className="mt-1 text-sm text-outline italic font-medium">
                                                    "{log.metaQuote}"
                                                </div>
                                            )}

                                            {/* Sub Details - Request ID */}
                                            {log.metaId && (
                                                <div className="mt-2 text-xs font-label-md text-outline font-semibold">
                                                    Request ID: {log.metaId} • Value: {log.metaVal}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[#161B28] border border-[#2D3748] rounded p-xl text-center shadow-md">
                    <span className="material-symbols-outlined text-[48px] text-[#fbbf24] mb-md">info</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">No activity logs found</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                        We couldn't find any activities matching the filter parameters. Please adjust your criteria and try again.
                    </p>
                </div>
            )}

            {/* Pagination Footer */}
            <div className="flex items-center justify-between mt-md py-sm">
                <span className="font-body-md text-body-md text-on-surface-variant">
                    Showing {Math.min(filteredLogs.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredLogs.length, currentPage * itemsPerPage)} of {filteredLogs.length} logs
                </span>
                <div className="flex gap-sm">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded border border-[#2D3748] bg-[#161B28] text-outline hover:text-on-surface hover:border-outline disabled:opacity-30 cursor-pointer transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded border border-[#2D3748] bg-[#161B28] text-outline hover:text-on-surface hover:border-outline disabled:opacity-30 cursor-pointer transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
