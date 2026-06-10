import React, { useState, useMemo, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useSeatAudit } from '../../hooks/useSeatAudit';
import SeatCard from '../../components/seat-audit/SeatCard';

const CATEGORIES = ['All', 'Development', 'Design', 'Productivity', 'Hosting', 'Marketing', 'Other'];
const UTILIZATION_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Under 50%', value: 'under_50' },
    { label: '50-80%', value: '50_80' },
    { label: 'Over 80%', value: 'over_80' },
    { label: 'Full (100%)', value: 'full' }
];

const SkeletonCard = () => (
    <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg h-[300px] animate-pulse flex flex-col">
        <div className="flex items-center gap-sm mb-md">
            <div className="w-10 h-10 rounded-lg bg-[#2D3748]" />
            <div className="space-y-sm flex-1">
                <div className="h-5 bg-[#2D3748] rounded w-32" />
                <div className="h-3 bg-[#2D3748] rounded w-24" />
            </div>
        </div>
        <div className="mb-md">
            <div className="h-3 bg-[#2D3748] rounded w-full mb-xs" />
            <div className="h-2 bg-[#2D3748] rounded-full w-full" />
        </div>
        <div className="flex-1 space-y-sm">
            <div className="h-10 bg-[#2D3748] rounded w-full" />
            <div className="h-10 bg-[#2D3748] rounded w-full" />
        </div>
    </div>
);

const SeatAuditPage = () => {
    const { profile } = useAuthStore();
    const {
        vendors,
        companyProfiles,
        isLoading,
        isSubmitting,
        toastMessage,
        toastType,
        dismissToast,
        addSeat,
        removeSeat
    } = useSeatAudit();

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [utilizationFilter, setUtilizationFilter] = useState('all');

    // Access control: only admin/manager
    if (profile && profile.role !== 'admin' && profile.role !== 'manager') {
        return <Navigate to="/" replace />;
    }

    useEffect(() => { document.title = 'Seat Audit | StackTracker'; }, []);

    // Compute Stats
    const totalSeats = vendors.reduce((sum, v) => sum + (v.total_seats || 0), 0);
    const usedSeats = vendors.reduce((sum, v) => sum + (v.used_seats || 0), 0);
    const unusedSeats = totalSeats - usedSeats;
    const unusedPercentage = totalSeats > 0 ? (unusedSeats / totalSeats) * 100 : 0;

    // Filter Vendors
    const filteredVendors = useMemo(() => {
        return vendors.filter(v => {
            // Search
            if (searchTerm && !v.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            
            // Category
            if (categoryFilter !== 'All' && v.category !== categoryFilter.toLowerCase()) return false;
            
            // Utilization
            if (utilizationFilter !== 'all') {
                const util = v.total_seats > 0 ? (v.used_seats / v.total_seats) * 100 : 0;
                if (utilizationFilter === 'under_50' && util >= 50) return false;
                if (utilizationFilter === '50_80' && (util < 50 || util > 80)) return false;
                if (utilizationFilter === 'over_80' && (util <= 80 || util >= 100)) return false;
                if (utilizationFilter === 'full' && util < 100) return false;
            }

            return true;
        });
    }, [vendors, searchTerm, categoryFilter, utilizationFilter]);

    const stats = [
        {
            label: 'Total Seats',
            value: totalSeats,
            icon: 'inventory_2',
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            borderColor: 'border-primary/20',
        },
        {
            label: 'Used Seats',
            value: usedSeats,
            icon: 'group',
            color: 'text-[#10B981]',
            bgColor: 'bg-[#10B981]/10',
            borderColor: 'border-[#10B981]/20',
        },
        {
            label: 'Unused Seats',
            value: unusedSeats,
            icon: 'chair',
            color: unusedPercentage > 20 ? 'text-[#EF4444]' : 'text-on-surface-variant',
            bgColor: unusedPercentage > 20 ? 'bg-[#EF4444]/10' : 'bg-surface-container',
            borderColor: unusedPercentage > 20 ? 'border-[#EF4444]/20' : 'border-[#2D3748]',
        },
    ];

    return (
        <div className="flex-1 flex flex-col">
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
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Seat Audit</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Track and manage software license seat assignments across all tools
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-md flex items-center gap-md`}
                    >
                        <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                            <span className={`material-symbols-outlined text-[22px] ${stat.color}`}>{stat.icon}</span>
                        </div>
                        <div>
                            <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
                            <p className={`font-display-lg text-[28px] font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-md mb-lg flex flex-col md:flex-row gap-md">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg pl-10 pr-md py-sm font-body-md text-body-md text-on-surface transition-colors"
                    />
                </div>
                <div className="flex gap-md">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">category</span>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg pl-9 pr-8 py-sm font-body-md text-body-md text-on-surface cursor-pointer appearance-none"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">arrow_drop_down</span>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">analytics</span>
                        <select
                            value={utilizationFilter}
                            onChange={(e) => setUtilizationFilter(e.target.value)}
                            className="bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg pl-9 pr-8 py-sm font-body-md text-body-md text-on-surface cursor-pointer appearance-none"
                        >
                            {UTILIZATION_FILTERS.map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">arrow_drop_down</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-md">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            ) : vendors.length === 0 ? (
                <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-xl text-center">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-md">inventory_2</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">No Active Tools</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
                        No active tools found. Add tools in the Vendor Directory first to track seat assignments.
                    </p>
                </div>
            ) : filteredVendors.length === 0 ? (
                <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-xl text-center">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-md">search_off</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">No Results</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
                        No tools match your current search and filter criteria.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-md">
                    {filteredVendors.map(vendor => (
                        <SeatCard
                            key={vendor.id}
                            vendor={vendor}
                            companyProfiles={companyProfiles}
                            onAddSeat={addSeat}
                            onRemoveSeat={removeSeat}
                            isSubmitting={isSubmitting}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SeatAuditPage;
