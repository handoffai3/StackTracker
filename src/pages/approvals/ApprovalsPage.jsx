import React, { useState, useMemo, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useApprovals } from '../../hooks/useApprovals';
import RequestCard from '../../components/approvals/RequestCard';
import ReviewModal from '../../components/approvals/ReviewModal';

const TABS = [
    { key: 'pending',  label: 'Pending',  icon: 'schedule' },
    { key: 'all',      label: 'All Requests', icon: 'list' },
    { key: 'approved', label: 'Approved', icon: 'check_circle' },
    { key: 'rejected', label: 'Rejected', icon: 'cancel' },
];

const SkeletonCard = () => (
    <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg animate-pulse">
        <div className="flex justify-between mb-md">
            <div className="space-y-sm flex-1">
                <div className="h-5 bg-[#2D3748] rounded w-48" />
                <div className="h-4 bg-[#2D3748] rounded w-64" />
            </div>
            <div className="flex gap-md">
                <div className="h-8 bg-[#2D3748] rounded w-24" />
                <div className="h-8 bg-[#2D3748] rounded w-16" />
            </div>
        </div>
        <div className="h-16 bg-[#10131A] rounded-lg mb-md" />
        <div className="flex justify-end gap-sm">
            <div className="h-9 bg-[#2D3748] rounded w-20" />
            <div className="h-9 bg-[#2D3748] rounded w-32" />
            <div className="h-9 bg-[#2D3748] rounded w-24" />
        </div>
    </div>
);

const ApprovalsPage = () => {
    const { profile } = useAuthStore();
    const {
        requests,
        isLoading,
        isSubmitting,
        toastMessage,
        toastType,
        dismissToast,
        reviewRequest,
    } = useApprovals();

    const [activeTab, setActiveTab] = useState('pending');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [initialDecision, setInitialDecision] = useState('approved');

    // Access control
    if (profile && profile.role !== 'admin' && profile.role !== 'manager') {
        return <Navigate to="/" replace />;
    }

    useEffect(() => { document.title = 'Approvals | StackTracker'; }, []);

    // Filter requests by tab
    const filtered = useMemo(() => {
        switch (activeTab) {
            case 'pending':  return requests.filter(r => r.status === 'pending');
            case 'approved': return requests.filter(r => r.status === 'approved');
            case 'rejected': return requests.filter(r => r.status === 'rejected');
            default:         return requests;
        }
    }, [requests, activeTab]);

    // Stats
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const approvedThisMonth = requests.filter(r => {
        if (r.status !== 'approved' || !r.reviewed_at) return false;
        const d = new Date(r.reviewed_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const rejectedThisMonth = requests.filter(r => {
        if (r.status !== 'rejected' || !r.reviewed_at) return false;
        const d = new Date(r.reviewed_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const handleOpenReview = (request, decision) => {
        setSelectedRequest(request);
        setInitialDecision(decision);
        setModalOpen(true);
    };

    const handleConfirmReview = async (request, decision, reviewNote) => {
        const success = await reviewRequest(request, decision, reviewNote);
        if (success) {
            setModalOpen(false);
            setSelectedRequest(null);
        }
    };

    const stats = [
        {
            label: 'Pending Reviews',
            value: pendingCount,
            icon: 'schedule',
            color: 'text-[#F59E0B]',
            bgColor: 'bg-[#F59E0B]/10',
            borderColor: 'border-[#F59E0B]/20',
        },
        {
            label: 'Approved This Month',
            value: approvedThisMonth,
            icon: 'check_circle',
            color: 'text-[#10B981]',
            bgColor: 'bg-[#10B981]/10',
            borderColor: 'border-[#10B981]/20',
        },
        {
            label: 'Rejected This Month',
            value: rejectedThisMonth,
            icon: 'cancel',
            color: 'text-[#EF4444]',
            bgColor: 'bg-[#EF4444]/10',
            borderColor: 'border-[#EF4444]/20',
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
                    <h2 className="font-headline-md text-headline-md text-on-surface">Approval Queue</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Review and action pending tool requests
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

            {/* Filter Tabs */}
            <div className="flex border-b border-[#2D3748] mb-lg overflow-x-auto">
                {TABS.map((tab) => {
                    const count = tab.key === 'pending'
                        ? pendingCount
                        : tab.key === 'approved'
                        ? requests.filter(r => r.status === 'approved').length
                        : tab.key === 'rejected'
                        ? requests.filter(r => r.status === 'rejected').length
                        : requests.length;

                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-md py-sm font-headline-sm text-body-md font-semibold border-b-2 transition-colors duration-200 flex items-center gap-xs whitespace-nowrap ${
                                activeTab === tab.key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            {tab.label}
                            <span
                                className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                                    activeTab === tab.key
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-surface-container-highest text-on-surface-variant'
                                }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-md">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            ) : filtered.length > 0 ? (
                <div className="space-y-md">
                    {filtered.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            onReview={handleOpenReview}
                            isPending={request.status === 'pending'}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-xl text-center">
                    <span className="material-symbols-outlined text-[48px] text-[#10B981] mb-md block">
                        {activeTab === 'pending' ? 'verified_user' : 'inbox'}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">
                        {activeTab === 'pending' ? 'All Caught Up!' : `No ${activeTab} requests`}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
                        {activeTab === 'pending'
                            ? 'No pending requests to review. Nice job!'
                            : 'No requests match this filter.'}
                    </p>
                </div>
            )}

            {/* Review Modal */}
            <ReviewModal
                isOpen={modalOpen}
                request={selectedRequest}
                initialDecision={initialDecision}
                onClose={() => { setModalOpen(false); setSelectedRequest(null); }}
                onConfirm={handleConfirmReview}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default ApprovalsPage;
