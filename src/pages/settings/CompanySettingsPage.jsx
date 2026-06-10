import React, { useState } from 'react';
import { useCompanySettings } from '../../hooks/useSettings';
import DangerZone from '../../components/settings/DangerZone';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const TIMEZONES = [
    'UTC', 'America/New_York', 'America/Los_Angeles',
    'America/Chicago', 'Europe/London', 'Europe/Paris',
    'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney'
];

const CompanySettingsPage = () => {
    const {
        form, updateField, saveSettings, exportAllData,
        isLoading, isSaving, isDirty,
        toastMessage, toastType, dismissToast
    } = useCompanySettings();

    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        await exportAllData();
        setIsExporting(false);
    };

    if (isLoading) {
        return (
            <div className="space-y-lg animate-pulse">
                <div className="h-10 bg-[#2D3748] rounded-lg w-48" />
                <div className="h-10 bg-[#2D3748] rounded-lg w-full" />
                <div className="h-10 bg-[#2D3748] rounded-lg w-full" />
                <div className="h-10 bg-[#2D3748] rounded-lg w-64" />
                <div className="h-10 bg-[#2D3748] rounded-lg w-64" />
                <div className="h-10 bg-[#2D3748] rounded-lg w-64" />
            </div>
        );
    }

    return (
        <div className="relative">
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

            <div className="space-y-xl pb-24">
                {/* Section 1 — Company Profile */}
                <div>
                    <h3 className="font-headline-sm text-[18px] text-on-surface font-bold mb-sm">Company Profile</h3>
                    <p className="font-body-md text-on-surface-variant mb-md">Basic information about your workspace.</p>

                    <div className="space-y-md">
                        <div>
                            <label className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-xs block">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                className="w-full max-w-md bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] rounded-lg px-md py-sm font-body-md text-on-surface transition-colors outline-none"
                            />
                        </div>

                        <div>
                            <label className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-xs block">
                                Company Logo URL
                            </label>
                            <div className="flex items-center gap-md">
                                <div className="w-16 h-16 rounded-xl bg-surface-container-highest border border-[#2D3748] flex items-center justify-center overflow-hidden shrink-0">
                                    {form.logo_url ? (
                                        <img src={form.logo_url} alt="Company logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[32px] text-on-surface-variant">apartment</span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={form.logo_url}
                                    onChange={(e) => updateField('logo_url', e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="flex-1 max-w-md bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] rounded-lg px-md py-sm font-body-md text-on-surface transition-colors outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-xs block">
                                Industry
                            </label>
                            <input
                                type="text"
                                value={form.industry}
                                onChange={(e) => updateField('industry', e.target.value)}
                                placeholder="e.g. SaaS, Healthcare, Finance"
                                className="w-full max-w-md bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] rounded-lg px-md py-sm font-body-md text-on-surface transition-colors outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#2D3748]" />

                {/* Section 2 — Preferences */}
                <div>
                    <h3 className="font-headline-sm text-[18px] text-on-surface font-bold mb-sm">Preferences</h3>
                    <p className="font-body-md text-on-surface-variant mb-md">Configure regional and fiscal preferences.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-md max-w-3xl">
                        <div>
                            <label className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-xs block">
                                Currency
                            </label>
                            <div className="relative">
                                <select
                                    value={form.currency}
                                    onChange={(e) => updateField('currency', e.target.value)}
                                    className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-on-surface appearance-none cursor-pointer outline-none"
                                >
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        <div>
                            <label className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-xs block">
                                Fiscal Year Start
                            </label>
                            <div className="relative">
                                <select
                                    value={form.fiscal_year_start}
                                    onChange={(e) => updateField('fiscal_year_start', parseInt(e.target.value))}
                                    className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-on-surface appearance-none cursor-pointer outline-none"
                                >
                                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                </select>
                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        <div>
                            <label className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-xs block">
                                Timezone
                            </label>
                            <div className="relative">
                                <select
                                    value={form.timezone}
                                    onChange={(e) => updateField('timezone', e.target.value)}
                                    className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-on-surface appearance-none cursor-pointer outline-none"
                                >
                                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                </select>
                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#2D3748]" />

                {/* Section 3 — Danger Zone */}
                <DangerZone onExport={handleExport} isExporting={isExporting} />
            </div>

            {/* Sticky Save Button */}
            {isDirty && (
                <div className="sticky bottom-0 left-0 right-0 bg-[#161B28]/95 backdrop-blur-md border-t border-[#2D3748] p-md flex justify-end z-30">
                    <button
                        onClick={saveSettings}
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90 text-white font-label-md py-2.5 px-xl rounded-lg flex items-center gap-xs transition-colors disabled:opacity-50 min-w-[150px] justify-center"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CompanySettingsPage;
