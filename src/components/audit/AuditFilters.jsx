import React from 'react';

const ACTIONS = [
    'All Actions', 'Approved', 'Rejected', 'Added',
    'Cancelled', 'Modified', 'Invited', 'Removed',
    'Renewed', 'Noted'
];

const ENTITY_TYPES = ['All', 'Vendor', 'Request', 'Profile', 'Invite'];

const AuditFilters = ({
    profiles,
    searchTerm, setSearchTerm,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    selectedAction, setSelectedAction,
    selectedUserId, setSelectedUserId,
    selectedEntityType, setSelectedEntityType,
    onClear
}) => {
    
    return (
        <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-md mb-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-md items-end">
                
                {/* Search */}
                <div className="xl:col-span-2">
                    <label className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mb-1 block">
                        Search Log
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Search entities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg pl-9 pr-3 py-1.5 font-body-md text-on-surface transition-colors outline-none"
                        />
                    </div>
                </div>

                {/* Date From */}
                <div>
                    <label className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mb-1 block">
                        Date From
                    </label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-3 py-1.5 font-body-md text-on-surface transition-colors outline-none custom-date-input"
                    />
                </div>

                {/* Date To */}
                <div>
                    <label className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mb-1 block">
                        Date To
                    </label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-3 py-1.5 font-body-md text-on-surface transition-colors outline-none custom-date-input"
                    />
                </div>

                {/* Action Type */}
                <div>
                    <label className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mb-1 block">
                        Action Type
                    </label>
                    <div className="relative">
                        <select
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value)}
                            className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-3 py-1.5 font-body-md text-on-surface appearance-none outline-none cursor-pointer"
                        >
                            {ACTIONS.map(action => (
                                <option key={action} value={action === 'All Actions' ? 'All' : action}>{action}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
                    </div>
                </div>

                {/* User Filter */}
                <div>
                    <label className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mb-1 block">
                        Member
                    </label>
                    <div className="relative">
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-3 py-1.5 font-body-md text-on-surface appearance-none outline-none cursor-pointer"
                        >
                            <option value="All">All Members</option>
                            {profiles.map(p => (
                                <option key={p.id} value={p.id}>{p.full_name || 'Unknown User'}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
                    </div>
                </div>

                {/* Entity Type Filter */}
                <div>
                    <label className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mb-1 block">
                        Entity Type
                    </label>
                    <div className="relative">
                        <select
                            value={selectedEntityType}
                            onChange={(e) => setSelectedEntityType(e.target.value)}
                            className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-3 py-1.5 font-body-md text-on-surface appearance-none outline-none cursor-pointer"
                        >
                            {ENTITY_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
                    </div>
                </div>

                {/* Clear Filters Button */}
                <div className="xl:col-span-5 flex justify-end">
                    {(searchTerm || dateFrom || dateTo || selectedAction !== 'All' || selectedUserId !== 'All' || selectedEntityType !== 'All') && (
                        <button
                            onClick={onClear}
                            className="text-on-surface-variant hover:text-white font-label-md text-[12px] flex items-center gap-1 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">clear_all</span>
                            Clear Filters
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AuditFilters;
