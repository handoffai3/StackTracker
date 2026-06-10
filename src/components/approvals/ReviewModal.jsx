import React, { useState, useEffect } from 'react';

const ReviewModal = ({ isOpen, request, initialDecision, onClose, onConfirm, isSubmitting }) => {
    const [decision, setDecision] = useState(initialDecision || 'approved');
    const [reviewNote, setReviewNote] = useState('');
    const [noteError, setNoteError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDecision(initialDecision || 'approved');
            setReviewNote('');
            setNoteError('');
        }
    }, [isOpen, initialDecision]);

    if (!isOpen || !request) return null;

    const requiresNote = decision === 'rejected' || decision === 'more_info_needed';

    const handleConfirm = () => {
        if (requiresNote && !reviewNote.trim()) {
            setNoteError('A review note is required for this decision.');
            return;
        }
        setNoteError('');
        onConfirm(request, decision, reviewNote);
    };

    const priorityConfig = {
        critical: { label: 'Critical', color: 'text-[#EF4444]' },
        high:     { label: 'High',     color: 'text-[#F97316]' },
        medium:   { label: 'Medium',   color: 'text-[#3B82F6]' },
        low:      { label: 'Low',      color: 'text-[#9CA3AF]' },
    };

    const priority = priorityConfig[request.priority] || priorityConfig.medium;
    const requesterName = request.requested_by_profile?.full_name || 'Unknown User';
    const dateStr = request.created_at
        ? new Date(request.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
          })
        : '—';

    const confirmColors = {
        approved: 'bg-[#10B981] hover:bg-[#059669]',
        rejected: 'bg-[#EF4444] hover:bg-[#DC2626]',
        more_info_needed: 'bg-[#8B5CF6] hover:bg-[#7C3AED]',
    };

    const confirmLabels = {
        approved: 'Confirm Approval',
        rejected: 'Confirm Rejection',
        more_info_needed: 'Send Back for Info',
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-md">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-[#161B28] border border-[#2D3748] rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in">
                {/* Header */}
                <div className="flex items-center justify-between p-lg border-b border-[#2D3748]">
                    <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Review Request</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Take action on this tool request</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-lg space-y-md">
                    {/* Request Summary */}
                    <div className="bg-[#10131A] border border-[#2D3748] rounded-xl p-md space-y-sm">
                        <div className="flex items-start justify-between gap-md">
                            <div>
                                <h3 className="font-headline-sm text-[18px] text-on-surface font-bold">{request.tool_name}</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                                    Requested by <span className="text-on-surface font-semibold">{requesterName}</span>
                                    <span className="mx-1">·</span>
                                    {dateStr}
                                </p>
                            </div>
                            <span className={`font-bold text-[12px] ${priority.color}`}>{priority.label}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-sm pt-sm border-t border-[#2D3748]">
                            <div>
                                <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Monthly Cost</p>
                                <p className="font-headline-sm text-[20px] text-[#10B981] font-bold">
                                    ${Number(request.monthly_cost || 0).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Seats Needed</p>
                                <p className="font-headline-sm text-[20px] text-on-surface font-bold">
                                    {request.seats_needed || '—'}
                                </p>
                            </div>
                        </div>

                        {request.vendor_url && (
                            <div className="pt-sm border-t border-[#2D3748]">
                                <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mb-xs">Vendor</p>
                                <a
                                    href={request.vendor_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary text-[13px] hover:underline flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                    {request.vendor_url}
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Business Justification */}
                    <div>
                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mb-xs">Business Justification</p>
                        <div className="bg-[#10131A] border border-[#2D3748] rounded-lg p-sm font-body-md text-body-md text-on-surface-variant">
                            {request.business_justification || 'No justification provided.'}
                        </div>
                    </div>

                    {/* Decision Dropdown */}
                    <div>
                        <label className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mb-xs block">
                            Decision <span className="text-[#EF4444]">*</span>
                        </label>
                        <select
                            value={decision}
                            onChange={(e) => {
                                setDecision(e.target.value);
                                setNoteError('');
                            }}
                            className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface cursor-pointer"
                        >
                            <option value="approved">✅ Approve</option>
                            <option value="rejected">❌ Reject</option>
                            <option value="more_info_needed">💬 Request More Info</option>
                        </select>
                    </div>

                    {/* Review Note */}
                    <div>
                        <label className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mb-xs block">
                            Review Note {requiresNote && <span className="text-[#EF4444]">*</span>}
                        </label>
                        <textarea
                            value={reviewNote}
                            onChange={(e) => {
                                setReviewNote(e.target.value);
                                if (noteError) setNoteError('');
                            }}
                            placeholder="Explain your decision..."
                            rows={3}
                            className={`w-full bg-[#10131A] border ${
                                noteError ? 'border-[#EF4444]' : 'border-[#2D3748]'
                            } focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface transition-colors resize-none`}
                        />
                        {noteError && (
                            <p className="text-[#EF4444] font-label-md text-[11px] flex items-center gap-1 mt-1">
                                <span className="material-symbols-outlined text-[12px]">error</span>
                                {noteError}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-sm p-lg border-t border-[#2D3748]">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-lg py-sm border border-[#2D3748] hover:bg-surface-container-high rounded-lg text-on-surface-variant font-body-md text-body-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className={`${confirmColors[decision]} disabled:opacity-50 disabled:cursor-not-allowed text-white font-body-md text-body-md px-lg py-sm rounded-lg flex items-center gap-xs transition-all active:scale-95 min-w-[160px] justify-center`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </>
                        ) : (
                            confirmLabels[decision]
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
