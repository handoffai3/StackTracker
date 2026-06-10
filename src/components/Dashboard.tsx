import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface RenewalItem {
    id: string;
    name: string;
    icon: string;
    iconColor: string;
    owner: string;
    cost: number;
    date: string;
    status: 'Review' | 'Approved' | 'Pending';
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const initialRenewals: RenewalItem[] = [
        {
            id: 'datadog',
            name: 'Datadog',
            icon: 'analytics',
            iconColor: '#F59E0B',
            owner: 'S. Connor',
            cost: 12450.00,
            date: 'Oct 14, 2024',
            status: 'Review',
        },
        {
            id: 'aws',
            name: 'AWS Hosting',
            icon: 'cloud',
            iconColor: '#A78BFA',
            owner: 'S. Connor',
            cost: 1200.00,
            date: 'Oct 12, 2023',
            status: 'Review',
        },
        {
            id: 'github',
            name: 'GitHub Enterprise',
            icon: 'code',
            iconColor: '#34D399',
            owner: 'J. Doe',
            cost: 450.00,
            date: 'Oct 15, 2023',
            status: 'Approved',
        },
        {
            id: 'figma',
            name: 'Figma Org',
            icon: 'design_services',
            iconColor: '#F472B6',
            owner: 'M. Smith',
            cost: 320.00,
            date: 'Oct 22, 2023',
            status: 'Review',
        },
        {
            id: 'slack',
            name: 'Slack Pro',
            icon: 'hub',
            iconColor: '#60A5FA',
            owner: 'A. Mercer',
            cost: 370.00,
            date: 'Oct 28, 2023',
            status: 'Pending',
        },
    ];

    const [renewals, setRenewals] = useState<RenewalItem[]>(initialRenewals);

    const toggleDropdown = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveDropdown(activeDropdown === id ? null : id);
    };

    const updateStatus = (id: string, newStatus: 'Review' | 'Approved' | 'Pending') => {
        setRenewals(prev =>
            prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
        );
        setActiveDropdown(null);
    };

    // Close dropdowns on window click
    React.useEffect(() => {
        const closeAll = () => setActiveDropdown(null);
        window.addEventListener('click', closeAll);
        return () => window.removeEventListener('click', closeAll);
    }, []);

    return (
        <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-lg">
                <h2 className="font-headline-md text-headline-md text-on-surface">Overview</h2>
                <button
                    onClick={() => navigate('/requests')}
                    className="bg-[#3B82F6] hover:bg-primary-container text-white font-body-md text-body-md px-md py-sm rounded-lg flex items-center gap-sm transition-colors active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span> Add Software
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
                {/* Card 1: Spend */}
                <div
                    onClick={() => navigate('/vendor-directory')}
                    className="bg-[#161B28] border border-[#2D3748] rounded-xl p-md flex flex-col justify-between relative overflow-hidden group hover:border-[#3B82F6] transition-colors cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-sm relative z-10">
                        <span className="font-label-md text-label-md text-[#94A3B8] uppercase">Total Monthly Spend</span>
                        <span className="material-symbols-outlined text-[#10B981]">trending_up</span>
                    </div>
                    <div className="relative z-10">
                        <div className="font-display-lg text-display-lg text-on-surface">$2,340</div>
                        <div className="font-body-md text-body-md text-[#10B981] mt-xs flex items-center gap-xs">
                            <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +5.2% vs last month
                        </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#10B981]/10 rounded-full blur-2xl group-hover:bg-[#10B981]/20 transition-all"></div>
                </div>

                {/* Card 2: Renewals */}
                <div
                    onClick={() => navigate('/vendor-directory')}
                    className="bg-[#161B28] border border-[#2D3748] rounded-xl p-md flex flex-col justify-between relative overflow-hidden group hover:border-[#3B82F6] transition-colors cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-sm relative z-10">
                        <span className="font-label-md text-label-md text-[#94A3B8] uppercase">Renewals This Month</span>
                        <span className="material-symbols-outlined text-[#F59E0B]">event_repeat</span>
                    </div>
                    <div className="relative z-10">
                        <div className="font-display-lg text-display-lg text-on-surface">{renewals.filter(r => r.status === 'Review').length}</div>
                        <div className="font-body-md text-body-md text-on-surface-variant mt-xs flex items-center gap-xs">
                            Requiring review in next 14 days
                        </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-2xl group-hover:bg-[#F59E0B]/20 transition-all"></div>
                </div>

                {/* Card 3: Pending Approvals */}
                <div
                    onClick={() => navigate('/approval-queue')}
                    className="bg-[#161B28] border border-[#2D3748] rounded-xl p-md flex flex-col justify-between relative overflow-hidden group hover:border-[#3B82F6] transition-colors cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-sm relative z-10">
                        <span className="font-label-md text-label-md text-[#94A3B8] uppercase">Pending Approvals</span>
                        <span className="material-symbols-outlined text-[#EF4444]">gavel</span>
                    </div>
                    <div className="relative z-10">
                        <div className="font-display-lg text-display-lg text-on-surface">2</div>
                        <div className="font-body-md text-body-md text-[#EF4444] mt-xs flex items-center gap-xs">
                            <span className="material-symbols-outlined text-[14px]">warning</span> Action required
                        </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#EF4444]/10 rounded-full blur-2xl group-hover:bg-[#EF4444]/20 transition-all"></div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl overflow-visible">
                <div className="px-md py-lg border-b border-[#2D3748] flex justify-between items-center">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Upcoming Renewals (Next 30 Days)</h3>
                    <Link
                        to="/vendor-directory"
                        className="text-primary hover:text-primary-container font-body-md text-body-md transition-colors flex items-center gap-xs"
                    >
                        View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="font-label-md text-label-md text-[#94A3B8] uppercase px-md py-sm bg-surface-container-low/50">Tool Name</th>
                                <th className="font-label-md text-label-md text-[#94A3B8] uppercase px-md py-sm bg-surface-container-low/50">Owner</th>
                                <th className="font-label-md text-label-md text-[#94A3B8] uppercase px-md py-sm bg-surface-container-low/50">Monthly Cost</th>
                                <th className="font-label-md text-label-md text-[#94A3B8] uppercase px-md py-sm bg-surface-container-low/50">Renewal Date</th>
                                <th className="font-label-md text-label-md text-[#94A3B8] uppercase px-md py-sm bg-surface-container-low/50">Status</th>
                                <th className="font-label-md text-label-md text-[#94A3B8] uppercase px-md py-sm bg-surface-container-low/50 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-on-surface divide-y divide-[#2D3748]">
                            {renewals.map(item => (
                                <tr key={item.id} className="hover:bg-surface-container/50 transition-colors">
                                    <td
                                        onClick={() => navigate(`/vendor-directory/${item.id}`)}
                                        className="px-md py-md flex items-center gap-sm cursor-pointer hover:text-primary"
                                    >
                                        <div className="w-8 h-8 rounded bg-[#1F2937] flex items-center justify-center border border-[#2D3748]">
                                            <span
                                                className="material-symbols-outlined text-[16px]"
                                                style={{ color: item.iconColor }}
                                            >
                                                {item.icon}
                                            </span>
                                        </div>
                                        <span className="font-bold">{item.name}</span>
                                    </td>
                                    <td className="px-md py-md text-on-surface-variant">{item.owner}</td>
                                    <td className="px-md py-md font-label-md">${item.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="px-md py-md">{item.date}</td>
                                    <td className="px-md py-md">
                                        <span
                                            className={`inline-flex items-center gap-xs px-2 py-1 rounded text-[11px] font-bold tracking-wider uppercase border ${
                                                item.status === 'Approved'
                                                    ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                                                    : item.status === 'Review'
                                                    ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
                                                    : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-md py-md text-right relative overflow-visible">
                                        <button
                                            onClick={(e) => toggleDropdown(item.id, e)}
                                            className="text-on-surface-variant hover:text-primary p-1 rounded transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                        </button>
                                        
                                        {/* Action Dropdown Menu */}
                                        {activeDropdown === item.id && (
                                            <div className="absolute right-md mt-1 w-48 rounded-lg bg-[#1D2027] border border-[#2D3748] shadow-2xl z-30 py-1 text-left">
                                                <button
                                                    onClick={() => updateStatus(item.id, 'Approved')}
                                                    className="w-full text-left px-md py-2 text-body-md hover:bg-surface-container-high hover:text-on-surface flex items-center gap-sm text-[#34D399]"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                    Approve Renewal
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(item.id, 'Review')}
                                                    className="w-full text-left px-md py-2 text-body-md hover:bg-surface-container-high hover:text-on-surface flex items-center gap-sm text-[#F59E0B]"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">rate_review</span>
                                                    Mark For Review
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(item.id, 'Pending')}
                                                    className="w-full text-left px-md py-2 text-body-md hover:bg-surface-container-high hover:text-on-surface flex items-center gap-sm text-[#EF4444]"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                                                    Set to Pending
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
