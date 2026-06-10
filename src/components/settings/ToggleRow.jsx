import React from 'react';

const ToggleRow = ({ label, description, checked, onChange, saving }) => {
    return (
        <div className="flex items-center justify-between py-md group">
            <div className="flex-1 pr-md">
                <p className="font-headline-sm text-[14px] text-on-surface font-semibold">{label}</p>
                {description && (
                    <p className="font-body-md text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">{description}</p>
                )}
            </div>
            <div className="flex items-center gap-sm shrink-0">
                {/* Saved indicator */}
                {saving && (
                    <span className="text-[#10B981] text-[11px] font-bold flex items-center gap-1 animate-fade-in">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        Saved
                    </span>
                )}
                {/* Toggle Switch */}
                <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={onChange}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        checked ? 'bg-[#3B82F6]' : 'bg-[#2D3748]'
                    }`}
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`}
                    />
                </button>
            </div>
        </div>
    );
};

export default ToggleRow;
