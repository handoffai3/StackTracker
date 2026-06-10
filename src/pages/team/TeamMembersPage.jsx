import React, { useState, useMemo, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTeam } from '../../hooks/useTeam';

// Components
import MemberRow from '../../components/team/MemberRow';
import InviteModal from '../../components/team/InviteModal';
import RemoveConfirmDialog from '../../components/team/RemoveConfirmDialog';

const TeamMembersPage = () => {
    const { profile, user } = useAuthStore();
    const {
        members,
        isLoading,
        isSubmitting,
        toastMessage,
        toastType,
        dismissToast,
        updateRole,
        removeMember,
        inviteMember
    } = useTeam();

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    
    const [removeModalOpen, setRemoveModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);

    // Access control: only admin
    if (profile && profile.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    useEffect(() => { document.title = 'Team | StackTracker'; }, []);

    const handleOpenRemove = (member) => {
        setMemberToRemove(member);
        setRemoveModalOpen(true);
    };

    const handleConfirmRemove = async (member) => {
        const success = await removeMember(member.id, member.full_name, member.email);
        if (success) {
            setRemoveModalOpen(false);
            setMemberToRemove(null);
        }
    };

    // Stats Computation
    const totalMembers = members.length;
    const adminCount = members.filter(m => m.role === 'admin').length;
    
    let pendingCount = 0;
    const now = new Date();
    members.forEach(m => {
        if (!m.last_sign_in_at) {
            const joined = new Date(m.created_at);
            const hours = (now - joined) / (1000 * 60 * 60);
            if (hours < 24) pendingCount++;
        }
    });

    // Filtering
    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            // Search
            if (searchTerm) {
                const lower = searchTerm.toLowerCase();
                const nameMatch = (m.full_name || '').toLowerCase().includes(lower);
                const emailMatch = (m.email || '').toLowerCase().includes(lower);
                if (!nameMatch && !emailMatch) return false;
            }
            // Role Filter
            if (roleFilter !== 'All') {
                if ((m.role || 'developer').toLowerCase() !== roleFilter.toLowerCase()) return false;
            }
            return true;
        });
    }, [members, searchTerm, roleFilter]);

    return (
        <div className="flex-1 flex flex-col pb-xl">
            {/* Toast */}
            {toastMessage && (
                <div
                    className={`fixed top-20 right-8 z-[200] flex items-center gap-sm px-md py-sm rounded-xl border shadow-2xl animate-slide-in ${
                        toastType === 'success'
                            ? 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
                            : 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {toastType === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span className="font-body-md text-body-md">{toastMessage}</span>
                    <button onClick={dismissToast} className="ml-sm hover:opacity-70">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Team Members</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Manage your team's access and roles
                    </p>
                </div>
                <div>
                    <button
                        onClick={() => setInviteModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white font-label-md py-2 px-md rounded-lg flex items-center gap-xs transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Invite Member
                    </button>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
                <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-xl p-md flex items-center gap-md">
                    <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px] text-[#3B82F6]">group</span>
                    </div>
                    <div>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Total Members</p>
                        <p className="font-display-lg text-[28px] font-bold text-[#3B82F6]">{totalMembers}</p>
                    </div>
                </div>

                <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-md flex items-center gap-md">
                    <div className="w-10 h-10 rounded-lg bg-[#EF4444]/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px] text-[#EF4444]">admin_panel_settings</span>
                    </div>
                    <div>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Admins</p>
                        <p className="font-display-lg text-[28px] font-bold text-[#EF4444]">{adminCount}</p>
                    </div>
                </div>

                <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl p-md flex items-center gap-md">
                    <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px] text-[#F59E0B]">pending_actions</span>
                    </div>
                    <div>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Pending Invites</p>
                        <p className="font-display-lg text-[28px] font-bold text-[#F59E0B]">{pendingCount}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-md mb-lg flex flex-col md:flex-row gap-md">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg pl-10 pr-md py-sm font-body-md text-body-md text-on-surface transition-colors"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">filter_list</span>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg pl-9 pr-8 py-sm font-body-md text-body-md text-on-surface cursor-pointer appearance-none"
                    >
                        {['All', 'Admin', 'Manager', 'Developer'].map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">arrow_drop_down</span>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl overflow-hidden flex-1 flex flex-col min-h-[400px]">
                {isLoading ? (
                    <div className="p-lg space-y-md">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-14 bg-[#2D3748] animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : members.length === 1 && !searchTerm ? (
                    /* Empty State - Only Admin exists */
                    <div className="flex-1 flex flex-col items-center justify-center p-xl text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-md border border-primary/20">
                            <span className="material-symbols-outlined text-[32px] text-primary">group_add</span>
                        </div>
                        <h3 className="font-headline-sm text-[20px] text-on-surface mb-xs">Build Your Team</h3>
                        <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mb-md">
                            Invite your team to get started with tracking tool requests and spend.
                        </p>
                        <button
                            onClick={() => setInviteModalOpen(true)}
                            className="bg-primary hover:bg-primary/90 text-white font-label-md py-2 px-xl rounded-lg transition-colors"
                        >
                            Invite Member
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#2D3748] bg-[#10131A]">
                                    <th className="p-md font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Member</th>
                                    <th className="p-md font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Role</th>
                                    <th className="p-md font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Date Joined</th>
                                    <th className="p-md font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Tools Requested</th>
                                    <th className="p-md font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Seats Assigned</th>
                                    <th className="p-md font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Status</th>
                                    <th className="p-md text-right font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2D3748]/50">
                                {filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-xl text-center text-on-surface-variant font-body-md">
                                            No members match your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map(member => (
                                        <MemberRow 
                                            key={member.id}
                                            member={member}
                                            currentUserId={user?.id}
                                            onUpdateRole={updateRole}
                                            onRemove={handleOpenRemove}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <InviteModal
                isOpen={inviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onInvite={inviteMember}
                isSubmitting={isSubmitting}
            />

            <RemoveConfirmDialog
                isOpen={removeModalOpen}
                member={memberToRemove}
                onClose={() => { setRemoveModalOpen(false); setMemberToRemove(null); }}
                onConfirm={handleConfirmRemove}
                isSubmitting={isSubmitting}
            />

        </div>
    );
};

export default TeamMembersPage;
