import React, { useState } from 'react';
import AddMemberDropdown from './AddMemberDropdown';

const SeatCard = ({ vendor, companyProfiles, onAddSeat, onRemoveSeat, isSubmitting }) => {
    const [showAll, setShowAll] = useState(false);

    const totalSeats = vendor.total_seats || 0;
    const usedSeats = vendor.used_seats || 0;
    const utilization = totalSeats > 0 ? (usedSeats / totalSeats) * 100 : 0;
    const ownerName = vendor.owner?.full_name || 'Unknown';

    // Utilization styling
    let utilColor = 'bg-[#10B981]'; // Green (good utilization)
    if (utilization <= 50) utilColor = 'bg-[#EF4444]'; // Red (wasted money)
    else if (utilization <= 80) utilColor = 'bg-[#F59E0B]'; // Yellow (ok)

    const assignments = vendor.seat_assignments || [];
    const displayedAssignments = showAll ? assignments : assignments.slice(0, 3);
    const hasMore = assignments.length > 3;

    // Profiles NOT currently assigned to this vendor
    const assignedUserIds = new Set(assignments.map(a => a.user.id));
    const unassignedProfiles = companyProfiles.filter(p => !assignedUserIds.has(p.id));

    return (
        <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg flex flex-col transition-colors hover:border-[#3B82F6]/40">
            {/* Header */}
            <div className="flex items-start justify-between gap-md mb-md">
                <div className="flex items-center gap-sm min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 border border-[#2D3748]">
                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">build</span>
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-sm mb-xs flex-wrap">
                            <h3 className="font-headline-sm text-[16px] text-on-surface font-bold truncate">
                                {vendor.name}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-[#1F2937] text-on-surface-variant font-bold border border-[#2D3748] uppercase">
                                {vendor.category}
                            </span>
                        </div>
                        <p className="font-label-md text-[11px] text-on-surface-variant truncate">
                            Owner: <span className="text-on-surface">{ownerName}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-md">
                <div className="flex items-end justify-between mb-xs">
                    <p className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider">Utilization</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        <strong className="text-on-surface">{usedSeats}</strong> / {totalSeats} seats used
                    </p>
                </div>
                <div className="h-2 w-full bg-[#10131A] border border-[#2D3748] rounded-full overflow-hidden">
                    <div
                        className={`h-full ${utilColor} transition-all duration-500`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                </div>
            </div>

            {/* Assigned Members List */}
            <div className="flex-1 border-t border-[#2D3748] pt-md">
                <p className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-sm">Assigned Members</p>
                
                {assignments.length > 0 ? (
                    <div className="space-y-sm mb-sm">
                        {displayedAssignments.map(assignment => {
                            const user = assignment.user;
                            return (
                                <div key={assignment.id} className="flex items-center justify-between gap-sm p-sm rounded-lg hover:bg-[#10131A] transition-colors group border border-transparent hover:border-[#2D3748]">
                                    <div className="flex items-center gap-sm min-w-0">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-[12px] font-bold shrink-0">
                                                {(user.full_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-body-md text-body-md text-on-surface truncate">
                                                {user.full_name || 'Unknown User'}
                                            </p>
                                            <p className="font-label-md text-[10px] text-on-surface-variant truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemoveSeat(vendor.id, assignment.id)}
                                        disabled={isSubmitting}
                                        className="w-6 h-6 flex items-center justify-center rounded text-on-surface-variant hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                        title="Remove seat assignment"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-md bg-[#10131A] rounded-lg border border-[#2D3748] mb-sm">
                        <p className="font-body-md text-body-md text-on-surface-variant">No seats assigned yet.</p>
                    </div>
                )}

                {hasMore && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-primary text-[12px] font-semibold hover:underline block text-center w-full"
                    >
                        {showAll ? 'Show Less' : `Show ${assignments.length - 3} More`}
                    </button>
                )}
            </div>

            {/* Add Member Dropdown */}
            <div className="mt-auto pt-md">
                <AddMemberDropdown 
                    unassignedProfiles={unassignedProfiles}
                    onAddSeat={(userId) => onAddSeat(vendor.id, userId)}
                    disabled={isSubmitting || usedSeats >= totalSeats}
                />
            </div>
        </div>
    );
};

export default SeatCard;
