import React from 'react';

const CancelConfirmDialog = ({ isOpen, vendor, onClose, onConfirm, isSubmitting }) => {
    if (!isOpen || !vendor) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-md">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-[#161B28] border border-[#2D3748] rounded-2xl w-full max-w-[450px] shadow-2xl animate-in">
                <div className="p-lg">
                    <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 flex items-center justify-center mb-md border border-[#EF4444]/20">
                        <span className="material-symbols-outlined text-[#EF4444] text-[24px]">warning</span>
                    </div>
                    
                    <h2 className="font-headline-md text-[20px] text-on-surface font-bold mb-sm">
                        Cancel {vendor.name}?
                    </h2>
                    
                    <p className="font-body-md text-on-surface-variant leading-relaxed">
                        Are you sure you want to cancel <strong className="text-on-surface">{vendor.name}</strong>? 
                        This will mark it as cancelled and cannot be undone easily.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-sm p-lg border-t border-[#2D3748] bg-[#10131A] rounded-b-2xl">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-lg py-sm rounded-lg text-on-surface-variant font-body-md hover:bg-[#2D3748] transition-colors disabled:opacity-50"
                    >
                        Keep Tool
                    </button>
                    <button
                        onClick={() => onConfirm(vendor)}
                        disabled={isSubmitting}
                        className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-body-md px-lg py-sm rounded-lg flex items-center gap-xs transition-colors disabled:opacity-50 min-w-[120px] justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Cancelling...
                            </>
                        ) : (
                            'Yes, Cancel Tool'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelConfirmDialog;
