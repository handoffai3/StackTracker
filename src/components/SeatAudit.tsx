import React, { useState, useMemo } from 'react';

interface Member {
    id: string;
    name: string;
    avatarInitials: string;
    role: string;
    lastActiveText: string;
    isInactive: boolean;
    isOverage?: boolean;
}

interface ToolLicense {
    id: string;
    name: string;
    logoUrl?: string;
    logoIcon?: string;
    logoIconColor?: string;
    category: string;
    costPerMonth: number;
    seatsUsed: number;
    seatsTotal: number;
    members: Member[];
    hasCriticalLimit?: boolean;
}

const SeatAudit: React.FC = () => {
    // Initial Bento Grid License cards from mockup and more
    const initialLicenses: ToolLicense[] = [
        {
            id: 'copilot',
            name: 'GitHub Copilot Enterprise',
            logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcOwzZ8BNyeAYBhuI-hcn6CWz7E8dK4fkCuDVBBtj6QLMJvcrJjTPphKbjUZOxNzoKRpw3yIRb9ZUbk5_WBg6JvCpdbLJuck-nxWvylwbMi9UKOh5rIL3S8KHO6ImoCZc5ShFyiMQwrOZYAtSTrvUtzohJ6AWMV6-4uWJg_yoI-Qe7bnkjzwJK4z6F4dAMskO2LlQBJ1Ktgi-gqiNQHN1moJ0GhgbcAG9ipmF3cfI0aM3TnuK4t1o5llkIeJZ1_-taPEtEw5gAmLQ',
            category: 'DevTools',
            costPerMonth: 39,
            seatsUsed: 9,
            seatsTotal: 10,
            members: [
                { id: 'c1', name: 'Sarah Jenkins', avatarInitials: 'SJ', role: 'Frontend Eng', lastActiveText: '2h ago', isInactive: false },
                { id: 'c2', name: 'Mike Ross', avatarInitials: 'MR', role: 'Backend Lead', lastActiveText: '1d ago', isInactive: false },
                { id: 'c3', name: 'David Kim', avatarInitials: 'DK', role: 'David Kim', lastActiveText: 'Inactive > 30d', isInactive: true },
            ],
        },
        {
            id: 'figma',
            name: 'Figma Organization',
            logoIcon: 'draw',
            logoIconColor: '#F24E1E',
            category: 'Design',
            costPerMonth: 45,
            seatsUsed: 12,
            seatsTotal: 10,
            hasCriticalLimit: true,
            members: [
                { id: 'f1', name: 'Alex Lee', avatarInitials: 'AL', role: 'Contractor', lastActiveText: 'Overage', isInactive: false, isOverage: true },
                { id: 'f2', name: 'Tom Wong', avatarInitials: 'TW', role: 'Marketing', lastActiveText: 'Overage', isInactive: false, isOverage: true },
                { id: 'f3', name: 'Emma Jones', avatarInitials: 'EJ', role: 'Product Designer', lastActiveText: '3h ago', isInactive: false },
            ],
        },
        {
            id: 'slack',
            name: 'Slack Pro',
            logoIcon: 'hub',
            logoIconColor: '#38BDF8',
            category: 'Productivity',
            costPerMonth: 8,
            seatsUsed: 37,
            seatsTotal: 40,
            members: [
                { id: 's1', name: 'Sarah Connor', avatarInitials: 'SC', role: 'DevOps Lead', lastActiveText: '1h ago', isInactive: false },
                { id: 's2', name: 'Albert Einstein', avatarInitials: 'AE', role: 'Research', lastActiveText: 'Inactive > 30d', isInactive: true },
            ],
        },
        {
            id: 'github',
            name: 'GitHub Enterprise',
            logoIcon: 'code',
            logoIconColor: '#60A5FA',
            category: 'Development',
            costPerMonth: 21,
            seatsUsed: 18,
            seatsTotal: 20,
            members: [
                { id: 'g1', name: 'John Doe', avatarInitials: 'JD', role: 'Tech Lead', lastActiveText: '4h ago', isInactive: false },
                { id: 'g2', name: 'Marie Curie', avatarInitials: 'MC', role: 'Data Scientist', lastActiveText: 'Inactive > 30d', isInactive: true },
            ],
        },
    ];

    const [licenses, setLicenses] = useState<ToolLicense[]>(initialLicenses);
    const [filterOption, setFilterOption] = useState<'All' | 'Warning' | 'Over Limit'>('All');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Actions
    const handleRevokeSeat = (licenseId: string, memberId: string) => {
        setLicenses(prev =>
            prev.map(lic => {
                if (lic.id === licenseId) {
                    const updatedMembers = lic.members.filter(m => m.id !== memberId);
                    const isOverageMember = lic.members.find(m => m.id === memberId)?.isOverage;
                    const seatsUsedDiff = 1;
                    
                    return {
                        ...lic,
                        seatsUsed: Math.max(0, lic.seatsUsed - seatsUsedDiff),
                        members: updatedMembers,
                        hasCriticalLimit: lic.id === 'figma' && (lic.seatsUsed - seatsUsedDiff) > lic.seatsTotal,
                    };
                }
                return lic;
            })
        );
    };

    const handleResolveOverage = (licenseId: string, memberId: string) => {
        // Resolve overage by converting it to a regular seat and buying a seat capacity extension
        setLicenses(prev =>
            prev.map(lic => {
                if (lic.id === licenseId) {
                    const updatedMembers = lic.members.map(m =>
                        m.id === memberId ? { ...m, isOverage: false, lastActiveText: 'Just resolved' } : m
                    );
                    return {
                        ...lic,
                        seatsTotal: lic.seatsTotal + 1,
                        members: updatedMembers,
                        hasCriticalLimit: false, // overage resolved
                    };
                }
                return lic;
            })
        );
    };

    const handleAddMember = (licenseId: string) => {
        const names = ['Jordan P.', 'Taylor W.', 'Morgan K.', 'Alex R.'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const initials = randomName.split(' ').map(n => n[0]).join('');

        setLicenses(prev =>
            prev.map(lic => {
                if (lic.id === licenseId) {
                    if (lic.seatsUsed >= lic.seatsTotal && lic.id !== 'figma') {
                        alert('No available seats. Please expand capacity or revoke inactive seats first.');
                        return lic;
                    }
                    const newMember: Member = {
                        id: 'm_rand_' + Date.now(),
                        name: randomName,
                        avatarInitials: initials,
                        role: 'Engineer',
                        lastActiveText: 'Active now',
                        isInactive: false,
                    };
                    return {
                        ...lic,
                        seatsUsed: lic.seatsUsed + 1,
                        members: [newMember, ...lic.members],
                        hasCriticalLimit: lic.id === 'figma' && (lic.seatsUsed + 1) > lic.seatsTotal,
                    };
                }
                return lic;
            })
        );
    };

    const handleCreateLicense = () => {
        const newLic: ToolLicense = {
            id: 'lic_' + Date.now(),
            name: 'JetBrains IDE Suite',
            logoIcon: 'terminal',
            logoIconColor: '#F59E0B',
            category: 'DevTools',
            costPerMonth: 29,
            seatsUsed: 4,
            seatsTotal: 5,
            members: [
                { id: 'jb1', name: 'Code Master', avatarInitials: 'CM', role: 'Lead Architect', lastActiveText: '5m ago', isInactive: false },
                { id: 'jb2', name: 'Lazy Dev', avatarInitials: 'LD', role: 'Intern', lastActiveText: 'Inactive > 30d', isInactive: true },
            ],
        };
        setLicenses(prev => [...prev, newLic]);
    };

    // Filter Logic
    const filteredLicenses = useMemo(() => {
        return licenses.filter(lic => {
            const utilizationPercent = lic.seatsTotal > 0 ? (lic.seatsUsed / lic.seatsTotal) * 100 : 0;
            if (filterOption === 'Warning') {
                return utilizationPercent >= 90 && utilizationPercent <= 100 && !lic.hasCriticalLimit;
            }
            if (filterOption === 'Over Limit') {
                return lic.hasCriticalLimit || utilizationPercent > 100;
            }
            return true;
        });
    }, [licenses, filterOption]);

    return (
        <div className="flex-1 flex flex-col gap-lg" onClick={() => setShowFilterDropdown(false)}>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Seat Audit</h2>
                    <p className="text-on-surface-variant font-body-md mt-1">
                        Manage shared licenses and track utilization across engineering tools.
                    </p>
                </div>
                <div className="flex gap-sm relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowFilterDropdown(!showFilterDropdown);
                        }}
                        className="flex items-center gap-xs px-md py-2 border border-[#2D3748] text-on-surface rounded-lg hover:bg-[#161B28] transition-colors font-body-md text-sm active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                        Filter: {filterOption}
                    </button>
                    {showFilterDropdown && (
                        <div className="absolute right-[130px] top-[40px] w-40 bg-[#1D2027] border border-[#2D3748] rounded-lg shadow-2xl z-30 py-1">
                            {(['All', 'Warning', 'Over Limit'] as const).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setFilterOption(opt)}
                                    className="w-full text-left px-md py-2 text-body-md hover:bg-surface-container-high text-on-surface"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={handleCreateLicense}
                        className="flex items-center gap-xs px-md py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors font-body-md text-sm font-medium active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        New License
                    </button>
                </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-lg">
                {filteredLicenses.map(lic => {
                    const utilizationPercent = lic.seatsTotal > 0 ? (lic.seatsUsed / lic.seatsTotal) * 100 : 0;
                    const isOverage = lic.hasCriticalLimit || utilizationPercent > 100;
                    const isWarning = utilizationPercent >= 90 && utilizationPercent <= 100 && !isOverage;

                    return (
                        <article
                            key={lic.id}
                            className="bg-[#161B28] border border-[#2D3748] rounded-xl overflow-hidden flex flex-col relative shadow-xl"
                        >
                            {/* Critical Top Bar Indicator */}
                            {isOverage && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-error"></div>
                            )}

                            {/* Card Header */}
                            <div className="p-md border-b border-[#2D3748] flex justify-between items-start bg-surface-container-low/50">
                                <div className="flex items-center gap-md">
                                    <div className="w-12 h-12 rounded-lg bg-[#1D2027] border border-[#2D3748] flex items-center justify-center p-2 flex-shrink-0">
                                        {lic.logoUrl ? (
                                            <img
                                                alt={`${lic.name} Logo`}
                                                className="w-full h-full object-contain filter invert opacity-90"
                                                src={lic.logoUrl}
                                            />
                                        ) : (
                                            <span
                                                className="material-symbols-outlined text-3xl"
                                                style={{ color: lic.logoIconColor || '#adc6ff' }}
                                            >
                                                {lic.logoIcon || 'layers'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{lic.name}</h3>
                                        <p className="text-on-surface-variant font-label-md text-label-md mt-1 uppercase tracking-wider">
                                            {lic.category} • ${lic.costPerMonth}/user/mo
                                        </p>
                                    </div>
                                </div>
                                <button className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container transition-colors">
                                    <span className="material-symbols-outlined">more_vert</span>
                                </button>
                            </div>

                            {/* Utilization Progress area */}
                            <div className="p-md pb-sm">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="font-body-md text-on-surface-variant">Utilization</span>
                                    <span
                                        className={`font-label-md text-label-md uppercase tracking-wider font-semibold ${
                                            isOverage
                                                ? 'text-error'
                                                : isWarning
                                                ? 'text-[#df7412]'
                                                : 'text-primary'
                                        }`}
                                    >
                                        {isOverage ? 'Over Limit' : isWarning ? `${Math.round(utilizationPercent)}% Capacity` : 'Optimal'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-sm">
                                    <div className="flex-1 h-2 bg-[#0B0F19] rounded-full overflow-hidden border border-[#2D3748]">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                isOverage
                                                    ? 'bg-error'
                                                    : isWarning
                                                    ? 'bg-tertiary-container'
                                                    : 'bg-primary'
                                            }`}
                                            style={{ width: `${Math.min(100, utilizationPercent)}%` }}
                                        ></div>
                                    </div>
                                    <span
                                        className={`font-headline-sm text-headline-sm whitespace-nowrap font-bold ${
                                            isOverage ? 'text-error' : 'text-on-surface'
                                        }`}
                                    >
                                        {lic.seatsUsed} / {lic.seatsTotal}{' '}
                                        <span className="text-xs font-normal text-on-surface-variant">Seats</span>
                                    </span>
                                </div>
                            </div>

                            {/* Assigned Members Area */}
                            <div className="flex-1 p-md pt-0 flex flex-col">
                                <div className="flex justify-between items-center mb-sm">
                                    <h4 className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider font-semibold">Assigned Members</h4>
                                    <button
                                        onClick={() => handleAddMember(lic.id)}
                                        disabled={lic.seatsUsed >= lic.seatsTotal && !isOverage}
                                        className={`text-sm font-medium flex items-center gap-1 transition-colors ${
                                            lic.seatsUsed >= lic.seatsTotal && !isOverage
                                                ? 'text-on-surface-variant opacity-30 cursor-not-allowed'
                                                : 'text-primary hover:text-primary-fixed'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[16px]">person_add</span> Add
                                    </button>
                                </div>

                                <div className="bg-[#0B0F19] rounded-lg border border-[#2D3748] flex-1 overflow-y-auto max-h-[200px] custom-scrollbar">
                                    {lic.members.length > 0 ? (
                                        lic.members.map(member => (
                                            <div
                                                key={member.id}
                                                className={`flex items-center justify-between p-sm border-b border-[#2D3748] last:border-0 hover:bg-[#161B28] transition-colors group ${
                                                    member.isOverage ? 'bg-error/5 hover:bg-error/10' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-sm">
                                                    <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-[#2D3748] flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                                                        {member.avatarInitials}
                                                    </div>
                                                    <div>
                                                        <div className="font-body-md text-sm text-on-surface flex items-center gap-2">
                                                            {member.name}
                                                            {member.isOverage && (
                                                                <span className="text-[10px] bg-error/25 text-error px-1.5 py-0.5 rounded border border-error/35 font-bold uppercase tracking-wider">
                                                                    Overage
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div
                                                            className={`font-body-md text-xs ${
                                                                member.isInactive ? 'text-error font-semibold' : 'text-on-surface-variant'
                                                            }`}
                                                        >
                                                            {member.isInactive ? member.lastActiveText : member.role}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-sm">
                                                    {member.isOverage ? (
                                                        <button
                                                            onClick={() => handleResolveOverage(lic.id, member.id)}
                                                            className="text-xs border border-outline-variant text-on-surface px-2 py-1 rounded hover:bg-surface-variant transition-colors"
                                                        >
                                                            Resolve
                                                        </button>
                                                    ) : member.isInactive ? (
                                                        <button
                                                            onClick={() => handleRevokeSeat(lic.id, member.id)}
                                                            className="text-xs border border-error/50 text-error px-2 py-1 rounded hover:bg-error/10 transition-colors font-semibold"
                                                        >
                                                            Revoke
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-xs text-on-surface-variant">
                                                                Last active: {member.lastActiveText}
                                                            </span>
                                                            <button
                                                                onClick={() => handleRevokeSeat(lic.id, member.id)}
                                                                className="text-on-surface-variant hover:text-error transition-colors p-1"
                                                                title="Revoke Seat"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-md text-center text-on-surface-variant text-sm">
                                            No members assigned to this tool license.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default SeatAudit;
