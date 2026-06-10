import React, { useState } from 'react';

const DangerZone = ({ onExport, isExporting }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');

    return (
        <>
            <div className="border-2 border-[#EF4444]/30 rounded-xl p-lg bg-[#EF4444]/5">
                <div className="flex items-center gap-sm mb-md">
                    <span className="material-symbols-outlined text-[#EF4444]">warning</span>
                    <h3 className="font-headline-sm text-[16px] text-[#EF4444] font-bold">Danger Zone</h3>
                </div>

                <div className="space-y-md">
                    {/* Export All Data */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm py-sm">
                        <div>
                            <p className="font-headline-sm text-[14px] text-on-surface font-semibold">Export All Data</p>
                            <p className="font-body-md text-[12px] text-on-surface-variant">Download all vendor data as a CSV file.</p>
                        </div>
                        <button
                            onClick={onExport}
                            disabled={isExporting}
                            className="border border-[#6B7280] text-on-surface hover:bg-[#2D3748] font-label-md py-2 px-md rounded-lg flex items-center gap-xs transition-colors disabled:opacity-50 shrink-0"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            {isExporting ? 'Exporting...' : 'Export All Data'}
                        </button>
                    </div>

                    <div className="border-t border-[#EF4444]/20" />

                    {/* Delete Workspace */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm py-sm">
                        <div>
                            <p className="font-headline-sm text-[14px] text-on-surface font-semibold">Delete Workspace</p>
                            <p className="font-body-md text-[12px] text-on-surface-variant">Permanently delete this workspace and all data.</p>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10 font-label-md py-2 px-md rounded-lg flex items-center gap-xs transition-colors shrink-0"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                            Delete Workspace
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-md">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }} />
                    <div className="relative bg-[#161B28] border border-[#2D3748] rounded-2xl w-full max-w-[450px] shadow-2xl animate-in">
                        <div className="p-lg">
                            <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 flex items-center justify-center mb-md border border-[#EF4444]/20">
                                <span className="material-symbols-outlined text-[#EF4444] text-[24px]">delete_forever</span>
                            </div>
                            <h2 className="font-headline-md text-[20px] text-on-surface font-bold mb-sm">Delete Workspace</h2>
                            <p className="font-body-md text-on-surface-variant leading-relaxed mb-md">
                                This action cannot be undone. Type <strong className="text-[#EF4444]">DELETE</strong> below to confirm.
                            </p>
                            <input
                                type="text"
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                placeholder="Type DELETE to confirm"
                                className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] rounded-lg px-md py-sm font-body-md text-on-surface transition-colors outline-none"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-sm p-lg border-t border-[#2D3748] bg-[#10131A] rounded-b-2xl">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }}
                                className="px-lg py-sm rounded-lg text-on-surface-variant font-body-md hover:bg-[#2D3748] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={deleteInput !== 'DELETE'}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteInput('');
                                    alert('Please contact support to delete your workspace.');
                                }}
                                className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-body-md px-lg py-sm rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Delete Workspace
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DangerZone;
