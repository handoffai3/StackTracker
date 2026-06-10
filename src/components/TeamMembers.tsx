import React, { useState, useMemo } from 'react';

interface Member {
    id: string;
    name?: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Developer';
    status: 'Active' | 'Pending';
    toolsCount: number | '-';
    dateJoined: string;
    avatarInitials?: string;
    avatarUrl?: string;
    inviteSentText?: string;
}

const TeamMembers: React.FC = () => {
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'Admin' | 'Manager' | 'Developer'>('Developer');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Initial mock team members database
    const [members, setMembers] = useState<Member[]>([
        {
            id: 'm1',
            name: 'Sarah Anderson',
            email: 'sarah.a@stacktracker.io',
            role: 'Admin',
            status: 'Active',
            toolsCount: 12,
            dateJoined: 'Oct 12, 2022',
            avatarInitials: 'SA'
        },
        {
            id: 'm2',
            name: 'Marcus Johnson',
            email: 'marcus.j@stacktracker.io',
            role: 'Manager',
            status: 'Active',
            toolsCount: 8,
            dateJoined: 'Jan 04, 2023',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPaE_Q3alIxet4n4kDBFbziMjoV7mqgGQ2BXJvTURpot9J-3WNYVHmROGOmCw3nlAMNRs67UKdA5fUDbNQzPUXaeKdOuJbH3fjGrHqewOx52af7GFfP9Q6qNDCAWGz6uqdxLQS3ueVetSzY8INDo-YBt_qtkHuLhJtEFaz2ri7g8CXGUXo4EzwM_xs1riO8QoVo3_G0auBcV9XPlrhKm8e5IXXe8PVim6hqFa7Wx4I7OLjduCWcmk_xRVeVK46vMj6NRGsT3cTxeA'
        },
        {
            id: 'm3',
            name: 'Elena Rostova',
            email: 'elena.r@stacktracker.io',
            role: 'Developer',
            status: 'Active',
            toolsCount: 5,
            dateJoined: 'Mar 15, 2023',
            avatarInitials: 'EL'
        },
        {
            id: 'm4',
            email: 'david.c@stacktracker.io',
            role: 'Developer',
            status: 'Pending',
            toolsCount: '-',
            dateJoined: '-',
            inviteSentText: 'Invite Sent (2d ago)'
        },
        {
            id: 'm5',
            name: 'John Doe',
            email: 'john.doe@stacktracker.io',
            role: 'Developer',
            status: 'Active',
            toolsCount: 3,
            dateJoined: 'May 10, 2023',
            avatarInitials: 'JD'
        },
        {
            id: 'm6',
            name: 'Emma Watson',
            email: 'emma.w@stacktracker.io',
            role: 'Manager',
            status: 'Active',
            toolsCount: 9,
            dateJoined: 'Jun 18, 2023',
            avatarInitials: 'EW'
        },
        {
            id: 'm7',
            email: 'clara.o@stacktracker.io',
            role: 'Developer',
            status: 'Pending',
            toolsCount: '-',
            dateJoined: '-',
            inviteSentText: 'Invite Sent (1h ago)'
        }
    ]);

    const handleSendInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        // Check if user already exists
        if (members.some(m => m.email.toLowerCase() === inviteEmail.toLowerCase())) {
            alert('A member with this email address already exists.');
            return;
        }

        const newMember: Member = {
            id: 'invite_' + Date.now(),
            email: inviteEmail,
            role: inviteRole,
            status: 'Pending',
            toolsCount: '-',
            dateJoined: '-',
            inviteSentText: 'Invite Sent (Just now)'
        };

        setMembers(prev => [newMember, ...prev]);
        setInviteEmail('');
        setIsInviteModalOpen(false);
    };

    const handleRevokeInvite = (id: string) => {
        if (confirm('Are you sure you want to revoke this pending invitation?')) {
            setMembers(prev => prev.filter(m => m.id !== id));
        }
    };

    const handleEditRole = (id: string, currentRole: Member['role']) => {
        const nextRoleMap: Record<Member['role'], Member['role']> = {
            Developer: 'Manager',
            Manager: 'Admin',
            Admin: 'Developer'
        };
        const newRole = nextRoleMap[currentRole];
        setMembers(prev =>
            prev.map(m => (m.id === id ? { ...m, role: newRole } : m))
        );
    };

    // Filter Logic
    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            if (selectedRoleFilter === 'all') return true;
            if (selectedRoleFilter === 'admin') return m.role === 'Admin';
            if (selectedRoleFilter === 'manager') return m.role === 'Manager';
            if (selectedRoleFilter === 'developer') return m.role === 'Developer';
            return true;
        });
    }, [members, selectedRoleFilter]);

    // Paginated items
    const paginatedMembers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredMembers, currentPage]);

    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div className="flex-1 flex flex-col gap-lg font-body-md text-on-surface">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Team Management</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Manage user access, roles, and software seat requests across the organization.
                    </p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-primary text-on-primary px-md py-2 rounded-md font-body-md text-body-md font-semibold hover:bg-primary-container transition-colors flex items-center gap-sm shadow-md active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Invite Member
                </button>
            </div>

            {/* Controls Filters bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low p-md border border-outline-variant rounded-lg">
                <div className="flex items-center gap-md w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                            filter_list
                        </span>
                        <select
                            value={selectedRoleFilter}
                            onChange={(e) => {
                                setSelectedRoleFilter(e.target.value);
                                setCurrentPage(1); // Reset page on filter
                            }}
                            className="w-full bg-background border border-[#2D3748] rounded-md py-1.5 pl-9 pr-8 text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Administrators</option>
                            <option value="manager">Managers</option>
                            <option value="developer">Developers</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                            expand_more
                        </span>
                    </div>
                </div>
                <div className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                    Total Members: {members.length}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#2D3748] bg-surface-container/50">
                                <th className="py-3 px-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Name</th>
                                <th className="py-3 px-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Role</th>
                                <th className="py-3 px-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold font-semibold">Status</th>
                                <th className="py-3 px-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right font-semibold">Tools</th>
                                <th className="py-3 px-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Date Joined</th>
                                <th className="py-3 px-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md divide-y divide-[#2D3748]/55">
                            {paginatedMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-surface-container-high/50 transition-colors group">
                                    <td className="py-3 px-md">
                                        <div className="flex items-center gap-3">
                                            {member.status === 'Pending' ? (
                                                <div className="h-8 w-8 rounded-full border border-dashed border-[#2D3748] flex items-center justify-center text-on-surface-variant shrink-0">
                                                    <span className="material-symbols-outlined text-[16px]">mail</span>
                                                </div>
                                            ) : member.avatarUrl ? (
                                                <img alt="Profile" className="h-8 w-8 rounded-full border border-outline-variant object-cover shrink-0" src={member.avatarUrl} />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                    {member.avatarInitials || '??'}
                                                </div>
                                            )}
                                            <div>
                                                {member.status === 'Pending' ? (
                                                    <>
                                                        <div className="text-on-surface font-semibold italic">{member.email}</div>
                                                        <div className="text-tertiary text-sm font-semibold">{member.inviteSentText}</div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-on-surface font-semibold">{member.name}</div>
                                                        <div className="text-on-surface-variant text-sm">{member.email}</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-md">
                                        {member.role === 'Admin' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-error-container/20 text-error border border-error/20">
                                                Admin
                                            </span>
                                        ) : member.role === 'Manager' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary-container/20 text-primary border border-primary/20">
                                                Manager
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-surface-variant text-on-surface-variant border border-outline-variant">
                                                Developer
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-md">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}></div>
                                            <span className="text-on-surface-variant font-medium">{member.status}</span>
                                        </div>
                                    </td>
                                    <td className={`py-3 px-md text-right font-semibold ${member.status === 'Pending' ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                                        {member.toolsCount}
                                    </td>
                                    <td className="py-3 px-md text-on-surface-variant">
                                        {member.dateJoined}
                                    </td>
                                    <td className="py-3 px-md text-right">
                                        {member.status === 'Pending' ? (
                                            <button
                                                onClick={() => handleRevokeInvite(member.id)}
                                                className="text-on-surface-variant hover:text-error transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Revoke Invite"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">close</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEditRole(member.id, member.role)}
                                                className="text-on-surface-variant hover:text-primary transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Cycle Role: Developer -> Manager -> Admin"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="border-t border-[#2D3748] p-md flex items-center justify-between bg-surface-container/30">
                    <span className="font-body-md text-on-surface-variant text-sm">
                        Showing {Math.min(filteredMembers.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
                        {Math.min(filteredMembers.length, currentPage * itemsPerPage)} of {filteredMembers.length} members
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-[#2D3748] rounded text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:hover:bg-transparent text-sm transition-colors cursor-pointer"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-[#2D3748] rounded text-on-surface hover:bg-surface-container-high disabled:opacity-30 disabled:hover:bg-transparent text-sm transition-colors cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => setIsInviteModalOpen(false)}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-surface-container-low border border-[#2D3748] rounded-xl shadow-2xl w-full max-w-md p-lg m-4 z-10">
                        <div className="flex justify-between items-start mb-md">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Invite New Member</h3>
                            <button
                                className="text-on-surface-variant hover:text-on-surface transition-colors"
                                onClick={() => setIsInviteModalOpen(false)}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSendInvite}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1 uppercase font-semibold">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full bg-[#10131A] border border-[#2D3748] rounded-md py-2 px-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/40"
                                        placeholder="name@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1 uppercase font-semibold">Assign Role</label>
                                    <div className="relative">
                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value as any)}
                                            className="w-full bg-[#10131A] border border-[#2D3748] rounded-md py-2 px-3 appearance-none text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                                        >
                                            <option value="Developer">Developer</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
                                            arrow_drop_down
                                        </span>
                                    </div>
                                    <p className="font-body-md text-xs text-on-surface-variant mt-1.5">
                                        {inviteRole === 'Developer'
                                            ? 'Developers have read-only access to spend data and can request software seats.'
                                            : inviteRole === 'Manager'
                                            ? 'Managers can request/approve seats and edit departmental vendor allocations.'
                                            : 'Administrators have full write privileges across invoices, budgets, and security configurations.'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-xl flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="px-md py-2 rounded-md font-body-md text-body-md border border-[#2D3748] text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                                    onClick={() => setIsInviteModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-md py-2 rounded-md font-body-md text-body-md bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors cursor-pointer"
                                >
                                    Send Invite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamMembers;
