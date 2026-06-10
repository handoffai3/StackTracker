import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRequests } from '../../hooks/useRequests';
import { PriorityBadge, StatusBadge } from '../../components/requests/PriorityBadge';
import RequestDetailModal from '../../components/requests/RequestDetailModal';

const SkeletonRow = () => (
    <tr className="animate-pulse">
        {Array.from({ length: 7 }).map((_, i) => (
            <td key={i} className="px-md py-sm">
                <div className="h-4 bg-[#2D3748] rounded w-full"></div>
            </td>
        ))}
    </tr>
);

const RequestsListPage = () => {
    const {
        myRequests,
        allRequests,
        isLoading,
        isAdmin,
        toastMessage,
        toastType,
        dismissToast,
        updateRequestStatus,
    } = useRequests();

    const [activeTab, setActiveTab] = useState('my');
    const [selectedRequest, setSelectedRequest] = useState(null);

    const requests = activeTab === 'my' ? myRequests : allRequests;

    useEffect(() => { document.title = 'Requests | StackTracker'; }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount) => {
        return `$${Number(amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Toast */}
            {toastMessage && (
                <div
                    className={`fixed top-20 right-8 z-[200] flex items-center gap-sm px-md py-sm rounded-xl border shadow-2xl ${
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-md">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Tool Requests</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Track and manage software procurement requests across your organization.
                    </p>
                </div>
                <Link
                    to="/requests/new"
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-headline-sm text-headline-sm px-md py-sm rounded-lg flex items-center gap-xs transition-colors active:scale-95 shrink-0"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    New Request
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2D3748] mb-lg">
                <button
                    onClick={() => setActiveTab('my')}
                    className={`px-md py-sm font-headline-sm text-body-md font-semibold border-b-2 transition-colors duration-200 flex items-center gap-xs ${
                        activeTab === 'my'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    My Requests
                    <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                            activeTab === 'my'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-surface-container-highest text-on-surface-variant'
                        }`}
                    >
                        {myRequests.length}
                    </span>
                </button>
                {isAdmin && (
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-md py-sm font-headline-sm text-body-md font-semibold border-b-2 transition-colors duration-200 flex items-center gap-xs ${
                            activeTab === 'all'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                        All Requests
                        <span
                            className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                                activeTab === 'all'
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-surface-container-highest text-on-surface-variant'
                            }`}
                        >
                            {allRequests.length}
                        </span>
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl overflow-hidden flex-1">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#2D3748]">
                                <th className="px-md py-sm font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider">
                                    Tool Name
                                </th>
                                <th className="px-md py-sm font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider">
                                    Monthly Cost
                                </th>
                                <th className="px-md py-sm font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider">
                                    Seats
                                </th>
                                <th className="px-md py-sm font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider">
                                    Priority
                                </th>
                                <th className="px-md py-sm font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-md py-sm font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider">
                                    Requested By
                                </th>
                                <th className="px-md py-sm font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-md py-sm font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2D3748]/50">
                            {isLoading ? (
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </>
                            ) : requests.length > 0 ? (
                                requests.map((req) => (
                                    <tr
                                        key={req.id}
                                        className="hover:bg-surface-container-high/50 transition-colors group"
                                    >
                                        <td className="px-md py-sm">
                                            <div className="flex items-center gap-sm">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <span className="material-symbols-outlined text-[16px]">
                                                        deployed_code
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-body-md text-body-md text-on-surface font-semibold truncate max-w-[180px]">
                                                        {req.tool_name}
                                                    </p>
                                                    {req.vendor_url && (
                                                        <p className="font-label-md text-[10px] text-on-surface-variant truncate max-w-[180px]">
                                                            {req.vendor_url}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-md py-sm">
                                            <span className="font-body-md text-body-md text-on-surface font-semibold">
                                                {formatCurrency(req.monthly_cost)}
                                            </span>
                                            <span className="text-on-surface-variant text-[11px] ml-0.5">/mo</span>
                                        </td>
                                        <td className="px-md py-sm font-body-md text-body-md text-on-surface">
                                            {req.seats_needed}
                                        </td>
                                        <td className="px-md py-sm">
                                            <PriorityBadge priority={req.priority} />
                                        </td>
                                        <td className="px-md py-sm">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-md py-sm">
                                            <div className="flex items-center gap-sm">
                                                {req.requested_by_profile?.avatar_url && (
                                                    <img
                                                        src={req.requested_by_profile.avatar_url}
                                                        alt=""
                                                        className="w-6 h-6 rounded-full object-cover"
                                                    />
                                                )}
                                                <span className="font-body-md text-body-md text-on-surface-variant">
                                                    {req.requested_by_profile?.full_name || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-md py-sm font-body-md text-body-md text-on-surface-variant">
                                            {formatDate(req.created_at)}
                                        </td>
                                        <td className="px-md py-sm text-right">
                                            <button
                                                onClick={() => setSelectedRequest(req)}
                                                className="text-primary hover:text-[#60A5FA] font-body-md text-body-md transition-colors flex items-center gap-xs ml-auto opacity-70 group-hover:opacity-100"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">
                                                    visibility
                                                </span>
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-md py-xl text-center">
                                        <div className="flex flex-col items-center gap-md py-xl">
                                            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
                                                    inbox
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-headline-sm text-headline-sm text-on-surface mb-xs">
                                                    No requests found
                                                </p>
                                                <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
                                                    {activeTab === 'my'
                                                        ? "You haven't submitted any tool requests yet."
                                                        : 'No tool requests have been submitted for your organization.'}
                                                </p>
                                            </div>
                                            <Link
                                                to="/requests/new"
                                                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-body-md text-body-md px-md py-sm rounded-lg flex items-center gap-xs transition-colors active:scale-95 mt-sm"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                                Submit Your First Request
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRequest && (
                <RequestDetailModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onUpdateStatus={updateRequestStatus}
                    isAdmin={isAdmin}
                />
            )}
        </div>
    );
};

export default RequestsListPage;
