import React, { useState, useMemo, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useRenewals } from '../../hooks/useRenewals';
import RenewalCard from '../../components/renewals/RenewalCard';
import CancelConfirmDialog from '../../components/renewals/CancelConfirmDialog';

const TABS = [
    { key: '7_days', label: 'Expiring in 7 Days' },
    { key: '30_days', label: 'Expiring in 30 Days' },
    { key: 'all', label: 'All Upcoming' }
];

const SkeletonCard = () => (
    <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg h-[250px] animate-pulse flex flex-col">
        <div className="flex items-center gap-sm mb-md">
            <div className="w-12 h-12 rounded-lg bg-[#2D3748]" />
            <div className="space-y-sm flex-1">
                <div className="h-5 bg-[#2D3748] rounded w-32" />
                <div className="h-3 bg-[#2D3748] rounded w-24" />
            </div>
        </div>
        <div className="h-20 bg-[#10131A] rounded-lg mb-md" />
        <div className="mt-auto flex gap-sm">
            <div className="h-10 bg-[#2D3748] rounded flex-1" />
            <div className="h-10 bg-[#2D3748] rounded flex-1" />
        </div>
    </div>
);

const RenewalsPage = () => {
    const { profile } = useAuthStore();
    const {
        renewals,
        isLoading,
        isSubmitting,
        toastMessage,
        toastType,
        dismissToast,
        renewVendor,
        cancelVendor
    } = useRenewals();

    const [activeTab, setActiveTab] = useState('all');
    const [snoozedIds, setSnoozedIds] = useState(new Set());
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [vendorToCancel, setVendorToCancel] = useState(null);

    // Access control
    if (profile && profile.role !== 'admin' && profile.role !== 'manager') {
        return <Navigate to="/" replace />;
    }

    useEffect(() => { document.title = 'Renewal Alerts | StackTracker'; }, []);

    // Load snoozed state on mount
    useEffect(() => {
        const checkSnoozes = () => {
            const now = Date.now();
            const snoozed = new Set();
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('snooze_')) {
                    const expiry = parseInt(localStorage.getItem(key), 10);
                    if (expiry > now) {
                        snoozed.add(key.replace('snooze_', ''));
                    } else {
                        localStorage.removeItem(key); // Cleanup expired
                    }
                }
            }
            setSnoozedIds(snoozed);
        };
        checkSnoozes();
        // Setup interval to clear expired snoozes periodically
        const interval = setInterval(checkSnoozes, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleSnooze = (vendorId) => {
        const snoozeDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
        const expiry = Date.now() + snoozeDuration;
        localStorage.setItem(`snooze_${vendorId}`, expiry.toString());
        setSnoozedIds(prev => new Set(prev).add(vendorId));
    };

    const handleOpenCancel = (vendor) => {
        setVendorToCancel(vendor);
        setCancelModalOpen(true);
    };

    const handleConfirmCancel = async (vendor) => {
        const success = await cancelVendor(vendor);
        if (success) {
            setCancelModalOpen(false);
            setVendorToCancel(null);
        }
    };

    // Derived Data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDaysLeft = (dateStr) => {
        return Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
    };

    const isAnnual = (v) => v.billing_cycle?.toLowerCase() === 'annual';
    const getAnnualCost = (v) => isAnnual(v) ? Number(v.monthly_cost) * 12 : Number(v.monthly_cost) * 12; // Assuming all are equivalent annual exposure

    const stats = useMemo(() => {
        let in7 = 0;
        let in30 = 0;
        let exposure = 0;

        renewals.forEach(v => {
            const daysLeft = getDaysLeft(v.renewal_date);
            if (daysLeft <= 7) in7++;
            if (daysLeft <= 30) in30++;
            
            // Count ALL upcoming vendors for total annual exposure
            exposure += getAnnualCost(v);
        });

        return { in7, in30, exposure };
    }, [renewals]);

    const filteredRenewals = useMemo(() => {
        return renewals.filter(v => {
            const daysLeft = getDaysLeft(v.renewal_date);
            
            // If it's snoozed, hide it unless we are in the 'all' tab
            if (snoozedIds.has(v.id) && activeTab !== 'all') {
                return false;
            }

            if (activeTab === '7_days') return daysLeft <= 7;
            if (activeTab === '30_days') return daysLeft <= 30;
            return true; // all
        });
    }, [renewals, activeTab, snoozedIds]);

    const handleExportCSV = () => {
        const headers = ['Tool Name', 'Category', 'Monthly Cost', 'Annual Cost', 'Renewal Date', 'Days Remaining', 'Owner', 'Status'];
        
        const rows = filteredRenewals.map(v => {
            const daysLeft = getDaysLeft(v.renewal_date);
            const annualCost = getAnnualCost(v);
            return [
                `"${v.name}"`,
                `"${v.category}"`,
                `"${v.monthly_cost || 0}"`,
                `"${annualCost}"`,
                `"${v.renewal_date}"`,
                `"${daysLeft}"`,
                `"${v.owner?.full_name || 'Unassigned'}"`,
                `"${snoozedIds.has(v.id) ? 'Snoozed' : v.status}"`
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `renewals_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                    <h2 className="font-headline-md text-headline-md text-on-surface">Renewal Alerts</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Action required on upcoming SaaS contract renewals.
                    </p>
                </div>
                <div className="flex gap-sm">
                    <button
                        onClick={handleExportCSV}
                        disabled={filteredRenewals.length === 0}
                        className="bg-[#161B28] hover:bg-[#2D3748] border border-[#2D3748] text-on-surface font-label-md py-2 px-md rounded-lg flex items-center gap-xs transition-colors disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-md flex items-center gap-md">
                    <div className="w-10 h-10 rounded-lg bg-[#EF4444]/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px] text-[#EF4444]">error</span>
                    </div>
                    <div>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Expiring in 7 Days</p>
                        <p className="font-display-lg text-[28px] font-bold text-[#EF4444]">{stats.in7}</p>
                    </div>
                </div>
                
                <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl p-md flex items-center gap-md">
                    <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px] text-[#F59E0B]">warning</span>
                    </div>
                    <div>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Expiring in 30 Days</p>
                        <p className="font-display-lg text-[28px] font-bold text-[#F59E0B]">{stats.in30}</p>
                    </div>
                </div>

                <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-xl p-md flex items-center gap-md">
                    <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px] text-[#3B82F6]">account_balance</span>
                    </div>
                    <div>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Total Annual Exposure</p>
                        <p className="font-display-lg text-[28px] font-bold text-[#3B82F6]">${stats.exposure.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-[#2D3748] mb-lg overflow-x-auto">
                {TABS.map((tab) => {
                    let count = tab.key === '7_days' ? stats.in7 : tab.key === '30_days' ? stats.in30 : renewals.length;
                    
                    let badgeColor = 'bg-surface-container-highest text-on-surface-variant';
                    if (tab.key === '7_days' && count > 0) badgeColor = 'bg-[#EF4444]/20 text-[#EF4444]';
                    if (tab.key === '30_days' && count > 0) badgeColor = 'bg-[#F59E0B]/20 text-[#F59E0B]';

                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-md py-sm font-headline-sm text-[14px] font-semibold border-b-2 transition-colors duration-200 flex items-center gap-xs whitespace-nowrap ${
                                activeTab === tab.key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            {tab.label}
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ml-1 ${badgeColor}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Main Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            ) : filteredRenewals.length === 0 ? (
                <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-xl text-center my-lg">
                    <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-md border border-[#10B981]/20">
                        <span className="material-symbols-outlined text-[32px] text-[#10B981]">check_circle</span>
                    </div>
                    <h3 className="font-headline-sm text-[20px] text-on-surface mb-xs">No upcoming renewals. You're all clear!</h3>
                    <p className="font-body-md text-on-surface-variant max-w-sm mx-auto">
                        There are no subscriptions expiring within this timeframe.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                    {filteredRenewals.map(vendor => (
                        <div key={vendor.id} className="relative">
                            <RenewalCard
                                vendor={vendor}
                                onRenew={renewVendor}
                                onCancel={handleOpenCancel}
                                onSnooze={handleSnooze}
                                isSubmitting={isSubmitting}
                            />
                            {/* Snoozed Overlay Badge in "All" view */}
                            {snoozedIds.has(vendor.id) && activeTab === 'all' && (
                                <div className="absolute top-2 left-2 bg-[#1F2937] border border-[#2D3748] px-2 py-1 rounded text-[10px] text-on-surface-variant uppercase font-bold z-10 flex items-center gap-1 shadow-lg opacity-90">
                                    <span className="material-symbols-outlined text-[12px]">snooze</span>
                                    Snoozed
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Cancel Modal */}
            <CancelConfirmDialog
                isOpen={cancelModalOpen}
                vendor={vendorToCancel}
                onClose={() => { setCancelModalOpen(false); setVendorToCancel(null); }}
                onConfirm={handleConfirmCancel}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default RenewalsPage;
