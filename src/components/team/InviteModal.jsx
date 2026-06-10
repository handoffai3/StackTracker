import React, { useState } from 'react';

const InviteModal = ({ isOpen, onClose, onInvite, isSubmitting }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('developer');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        const success = await onInvite(email, role);
        if (success) {
            setEmail('');
            setRole('developer');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-md">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-[#161B28] border border-[#2D3748] rounded-2xl w-full max-w-[450px] shadow-2xl animate-in">
                <div className="flex items-center justify-between p-lg border-b border-[#2D3748]">
                    <h2 className="font-headline-md text-[20px] text-on-surface font-bold">Invite Team Member</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-lg space-y-md">
                    <div>
                        <label className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-xs block">
                            Email Address <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] rounded-lg px-md py-sm font-body-md text-on-surface transition-colors outline-none"
                        />
                        {error && <p className="text-[#EF4444] text-[12px] mt-1">{error}</p>}
                    </div>

                    <div>
                        <label className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-xs block">
                            Role
                        </label>
                        <div className="relative">
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] rounded-lg pl-md pr-10 py-sm font-body-md text-on-surface transition-colors appearance-none cursor-pointer outline-none"
                            >
                                <option value="manager">Manager</option>
                                <option value="developer">Developer</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                                expand_more
                            </span>
                        </div>
                    </div>

                    <div className="pt-sm">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-body-md px-lg py-3 rounded-lg flex items-center justify-center gap-xs transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Generating Link...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                    Copy Invite Link
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteModal;
