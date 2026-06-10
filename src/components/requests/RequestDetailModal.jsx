import React, { useState } from 'react';
import { PriorityBadge, StatusBadge } from './PriorityBadge';

const RequestDetailModal = ({ request, onClose, onUpdateStatus, isAdmin }) => {
    const [reviewNote, setReviewNote] = useState('');
    const [isActioning, setIsActioning] = useState(false);

    if (!request) return null;

    const handleAction = async (status) => {
        setIsActioning(true);
        await onUpdateStatus(request.id, status, reviewNote);
        setIsActioning(false);
        onClose();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-md"
            onClick={onClose}
        >
            <div
                className="bg-[#161B28] border border-[#2D3748] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-lg border-b border-[#2D3748]">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-sm flex-wrap mb-xs">
                            <h2 className="font-headline-md text-headline-md text-on-surface truncate">
                                {request.tool_name}
                            </h2>
                            <StatusBadge status={request.status} />
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            Requested by{' '}
                            <span className="text-on-surface font-semibold">
                                {request.requested_by_profile?.full_name || 'Unknown'}
                            </span>
                            {' · '}
                            {formatDate(request.created_at)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors shrink-0 ml-md"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-lg space-y-lg">
                    {/* Key metrics row */}
                    <div className="grid grid-cols-3 gap-md">
                        <div className="bg-[#10131A] rounded-lg p-md border border-[#2D3748]">
                            <p className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider mb-1">
                                Monthly Cost
                            </p>
                            <p className="font-headline-md text-headline-md text-primary">
                                ${Number(request.monthly_cost || 0).toLocaleString('en-US')}
                            </p>
                        </div>
                        <div className="bg-[#10131A] rounded-lg p-md border border-[#2D3748]">
                            <p className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider mb-1">
                                Seats
                            </p>
                            <p className="font-headline-md text-headline-md text-on-surface">
                                {request.seats_needed || '—'}
                            </p>
                        </div>
                        <div className="bg-[#10131A] rounded-lg p-md border border-[#2D3748]">
                            <p className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider mb-1">
                                Priority
                            </p>
                            <div className="mt-1">
                                <PriorityBadge priority={request.priority} />
                            </div>
                        </div>
                    </div>

                    {/* Vendor URL */}
                    {request.vendor_url && (
                        <div>
                            <p className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider mb-xs">
                                Vendor Link
                            </p>
                            <a
                                href={request.vendor_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-body-md text-body-md flex items-center gap-xs"
                            >
                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                {request.vendor_url}
                            </a>
                        </div>
                    )}

                    {/* Business Justification */}
                    <div>
                        <p className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider mb-xs">
                            Business Justification
                        </p>
                        <div className="bg-[#10131A] border border-[#2D3748] rounded-lg p-md">
                            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                                {request.business_justification || 'No justification provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Review note (if already reviewed) */}
                    {request.review_note && (
                        <div>
                            <p className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider mb-xs">
                                Review Note
                            </p>
                            <div className={`rounded-lg p-md flex items-start gap-sm border ${
                                request.status === 'approved'
                                    ? 'bg-[#10B981]/10 border-[#10B981]/20'
                                    : request.status === 'rejected'
                                    ? 'bg-[#EF4444]/10 border-[#EF4444]/20'
                                    : 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20'
                            }`}>
                                <span className={`material-symbols-outlined text-[20px] mt-0.5 shrink-0 ${
                                    request.status === 'approved'
                                        ? 'text-[#10B981]'
                                        : request.status === 'rejected'
                                        ? 'text-[#EF4444]'
                                        : 'text-[#8B5CF6]'
                                }`}>
                                    {request.status === 'approved' ? 'check_circle' : request.status === 'rejected' ? 'cancel' : 'info'}
                                </span>
                                <div>
                                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                                        {request.review_note}
                                    </p>
                                    {request.reviewed_by_profile && (
                                        <p className="font-label-md text-label-md text-on-surface-variant mt-xs">
                                            — {request.reviewed_by_profile.full_name}
                                            {request.reviewed_at && `, ${formatDate(request.reviewed_at)}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin action area */}
                    {isAdmin && request.status === 'pending' && (
                        <div className="border-t border-[#2D3748] pt-lg">
                            <p className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider mb-sm">
                                Admin Review
                            </p>
                            <textarea
                                value={reviewNote}
                                onChange={(e) => setReviewNote(e.target.value)}
                                placeholder="Add a review note (optional for approval, recommended for rejection)..."
                                rows={3}
                                className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface transition-colors mb-md"
                            />
                            <div className="flex items-center justify-end gap-sm">
                                <button
                                    disabled={isActioning}
                                    onClick={() => handleAction('more_info_needed')}
                                    className="px-md py-sm border border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-lg font-body-md text-body-md transition-colors active:scale-95 flex items-center gap-xs disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">help</span>
                                    Request More Info
                                </button>
                                <button
                                    disabled={isActioning}
                                    onClick={() => handleAction('rejected')}
                                    className="px-md py-sm border border-[#EF4444]/30 hover:bg-[#EF4444]/10 text-[#EF4444] rounded-lg font-body-md text-body-md transition-colors active:scale-95 flex items-center gap-xs disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                    Reject
                                </button>
                                <button
                                    disabled={isActioning}
                                    onClick={() => handleAction('approved')}
                                    className="bg-[#10B981] hover:bg-[#059669] text-white font-body-md text-body-md px-md py-sm rounded-lg flex items-center gap-xs transition-colors active:scale-95 disabled:opacity-50"
                                >
                                    {isActioning ? (
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                    )}
                                    Approve
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestDetailModal;
