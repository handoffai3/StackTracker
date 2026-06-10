import React from 'react';
import EditRoleDropdown from './EditRoleDropdown';

const roleColors = {
    admin: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
    manager: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30',
    developer: 'bg-[#6B7280]/15 text-[#9CA3AF] border-[#6B7280]/30'
};

const MemberRow = ({ member, currentUserId, onUpdateRole, onRemove }) => {
    const isSelf = member.id === currentUserId;
    
    // Determine status
    // Invited = joined < 24hrs AND no last_sign_in_at
    const createdDate = new Date(member.created_at);
    const joinedStr = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const hoursSinceJoin = (new Date() - createdDate) / (1000 * 60 * 60);
    const isInvited = !member.last_sign_in_at && hoursSinceJoin < 24;

    const statusBadge = isInvited ? (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 uppercase tracking-wider">
            Invited
        </span>
    ) : (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 uppercase tracking-wider">
            Active
        </span>
    );

    const roleBadge = (
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${roleColors[member.role] || roleColors.developer}`}>
            {member.role || 'developer'}
        </span>
    );

    const requestsCount = member.tool_requests_count?.[0]?.count || 0;
    const seatsCount = member.seat_assignments_count?.[0]?.count || 0;

    return (
        <tr className="hover:bg-surface-container-high transition-colors group">
            <td className="p-md">
                <div className="flex items-center gap-sm">
                    {member.avatar_url ? (
                        <img src={member.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#2D3748]" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0 border border-primary/20">
                            {(member.full_name || member.email || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="font-headline-sm text-[14px] text-on-surface font-bold truncate flex items-center gap-2">
                            {member.full_name || 'Pending User'}
                            {isSelf && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">You</span>}
                        </p>
                        <p className="font-label-md text-[11px] text-on-surface-variant truncate">
                            {member.email}
                        </p>
                    </div>
                </div>
            </td>
            <td className="p-md">
                <div className="flex items-center gap-2">
                    {roleBadge}
                    <EditRoleDropdown 
                        currentRole={member.role}
                        onUpdateRole={(newRole) => onUpdateRole(member.id, newRole, member.full_name, member.email)}
                        disabled={isSelf}
                    />
                </div>
            </td>
            <td className="p-md font-body-md text-on-surface-variant">
                {joinedStr}
            </td>
            <td className="p-md font-body-md text-on-surface">
                {requestsCount}
            </td>
            <td className="p-md font-body-md text-on-surface">
                {seatsCount}
            </td>
            <td className="p-md">
                {statusBadge}
            </td>
            <td className="p-md text-right">
                <button
                    onClick={() => onRemove(member)}
                    disabled={isSelf}
                    className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-[#EF4444]/10 text-on-surface-variant hover:text-[#EF4444] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                    title={isSelf ? "Cannot remove yourself" : "Remove Member"}
                >
                    <span className="material-symbols-outlined text-[18px]">person_remove</span>
                </button>
            </td>
        </tr>
    );
};

export default MemberRow;
