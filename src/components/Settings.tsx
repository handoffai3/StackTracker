import React, { useState, useRef } from 'react';

// Custom toggle switch component
const Switch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => {
    return (
        <div
            onClick={() => onChange(!checked)}
            className={`w-10 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ease-in-out ${
                checked ? 'bg-[#3B82F6]' : 'bg-outline-variant'
            }`}
        >
            <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    checked ? 'translate-x-4' : 'translate-x-0'
                }`}
            />
        </div>
    );
};

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');

    // Profile States
    const [companyName, setCompanyName] = useState('Acme Corp Engineering');
    const [industry, setIndustry] = useState('saas');
    const [currency, setCurrency] = useState('usd');
    const [fiscalYear, setFiscalYear] = useState('jan');
    const [timezone, setTimezone] = useState('pst');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Notification Preference States
    const [renewal30, setRenewal30] = useState(true);
    const [renewal7, setRenewal7] = useState(true);
    const [renewalDay, setRenewalDay] = useState(false);
    
    const [approvalNew, setApprovalNew] = useState(true);
    const [approvalApproved, setApprovalApproved] = useState(true);
    const [approvalRejected, setApprovalRejected] = useState(false);

    const [reportDigest, setReportDigest] = useState(true);

    // Notification / Modal status
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showExportToast, setShowExportToast] = useState(false);

    // Track original states for reset/discard actions
    const [originalState] = useState({
        companyName: 'Acme Corp Engineering',
        industry: 'saas',
        currency: 'usd',
        fiscalYear: 'jan',
        timezone: 'pst',
        logoUrl: null as string | null,
        renewal30: true,
        renewal7: true,
        renewalDay: false,
        approvalNew: true,
        approvalApproved: true,
        approvalRejected: false,
        reportDigest: true
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setLogoUrl(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
    };

    const handleCancel = () => {
        setCompanyName(originalState.companyName);
        setIndustry(originalState.industry);
        setCurrency(originalState.currency);
        setFiscalYear(originalState.fiscalYear);
        setTimezone(originalState.timezone);
        setLogoUrl(originalState.logoUrl);
        
        setRenewal30(originalState.renewal30);
        setRenewal7(originalState.renewal7);
        setRenewalDay(originalState.renewalDay);
        setApprovalNew(originalState.approvalNew);
        setApprovalApproved(originalState.approvalApproved);
        setApprovalRejected(originalState.approvalRejected);
        setReportDigest(originalState.reportDigest);
    };

    const handleExport = () => {
        setShowExportToast(true);
        setTimeout(() => setShowExportToast(false), 3000);
    };

    const handleDeleteWorkspace = () => {
        alert('Workspace deleted. (Simulation only)');
        setShowDeleteModal(false);
    };

    return (
        <div className="flex-1 flex flex-col gap-lg font-body-md text-on-surface pb-32">
            
            {/* Page Header */}
            <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-xs">Company Settings</h3>
                <p className="text-on-surface-variant font-body-lg text-body-lg">
                    {activeTab === 'profile'
                        ? "Manage your organization's core details and preferences."
                        : "Manage how StackTracker communicates critical alerts regarding renewals, approvals, and spend reporting."
                    }
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-outline-variant flex gap-lg mb-sm">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-sm font-semibold text-body-md border-b-2 cursor-pointer transition-all ${
                        activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    Company Profile
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`pb-sm font-semibold text-body-md border-b-2 cursor-pointer transition-all ${
                        activeTab === 'notifications' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    Notifications
                </button>
            </div>

            {/* Notification Toasts */}
            {showSaveToast && (
                <div className="fixed bottom-32 right-gutter bg-[#191C24] border border-[#2D3748] text-on-surface p-md rounded-xl shadow-2xl flex items-center gap-md z-50 animate-bounce">
                    <span className="material-symbols-outlined text-[#34D399]">check_circle</span>
                    <div>
                        <p className="font-body-md text-sm font-semibold">Settings Saved</p>
                        <p className="text-xs text-on-surface-variant">Your changes have been updated successfully.</p>
                    </div>
                </div>
            )}

            {showExportToast && (
                <div className="fixed bottom-32 right-gutter bg-[#191C24] border border-[#2D3748] text-on-surface p-md rounded-xl shadow-2xl flex items-center gap-md z-50 animate-bounce">
                    <span className="material-symbols-outlined text-[#60A5FA]">downloading</span>
                    <div>
                        <p className="font-body-md text-sm font-semibold">Preparing ZIP Archive</p>
                        <p className="text-xs text-on-surface-variant">Exporting workspace configs, database logs, and contracts.</p>
                    </div>
                </div>
            )}

            {/* Profile Tab View */}
            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                    {/* Left Columns - Forms */}
                    <div className="lg:col-span-2 space-y-lg">
                        
                        {/* Organization Profile */}
                        <section className="bg-surface-container-low border border-outline-variant rounded-lg p-md shadow-sm">
                            <div className="border-b border-outline-variant pb-sm mb-md">
                                <h4 className="font-headline-sm text-headline-sm flex items-center gap-sm font-semibold">
                                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span> 
                                    Organization Profile
                                </h4>
                            </div>
                            
                            <div className="space-y-md">
                                <div className="flex flex-col sm:flex-row gap-lg items-start">
                                    {/* Logo Upload Box */}
                                    <div className="flex-shrink-0 w-full sm:w-auto">
                                        <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs font-semibold">Company Logo</label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-32 h-32 rounded bg-surface-container-highest border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-surface-container-high transition-colors group relative overflow-hidden mx-auto sm:mx-0"
                                        >
                                            {logoUrl ? (
                                                <>
                                                    <img src={logoUrl} alt="Company logo preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <span className="text-xs text-white font-semibold">Change Logo</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-outline-variant group-hover:text-primary text-[32px] mb-xs transition-colors">upload_file</span>
                                                    <span className="text-[12px] text-on-surface-variant group-hover:text-primary transition-colors text-center font-medium">Upload PNG/JPG</span>
                                                </>
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 space-y-md w-full">
                                        {/* Company Name */}
                                        <div>
                                            <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs font-semibold" htmlFor="company_name">Company Legal Name</label>
                                            <input
                                                type="text"
                                                id="company_name"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                className="w-full bg-background border border-outline-variant rounded px-sm py-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                            />
                                        </div>
                                        
                                        {/* Industry */}
                                        <div>
                                            <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs font-semibold" htmlFor="industry">Industry</label>
                                            <div className="relative">
                                                <select
                                                    id="industry"
                                                    value={industry}
                                                    onChange={(e) => setIndustry(e.target.value)}
                                                    className="w-full bg-background border border-outline-variant rounded px-sm py-sm text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10 cursor-pointer"
                                                >
                                                    <option value="saas">Software as a Service (SaaS)</option>
                                                    <option value="fintech">Financial Technology</option>
                                                    <option value="ecommerce">E-Commerce</option>
                                                    <option value="hardware">Hardware / Infrastructure</option>
                                                    <option value="other">Other Technology</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Regional Preferences */}
                        <section className="bg-surface-container-low border border-outline-variant rounded-lg p-md shadow-sm">
                            <div className="border-b border-outline-variant pb-sm mb-md">
                                <h4 className="font-headline-sm text-headline-sm flex items-center gap-sm font-semibold">
                                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
                                    Regional Preferences
                                </h4>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                {/* Currency */}
                                <div>
                                    <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs font-semibold" htmlFor="currency">Base Currency</label>
                                    <div className="relative">
                                        <select
                                            id="currency"
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="w-full bg-background border border-outline-variant rounded px-sm py-sm text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10 cursor-pointer"
                                        >
                                            <option value="usd">USD ($) - US Dollar</option>
                                            <option value="eur">EUR (€) - Euro</option>
                                            <option value="inr">INR (₹) - Indian Rupee</option>
                                            <option value="gbp">GBP (£) - British Pound</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                                    </div>
                                    <p className="text-[12px] text-on-surface-variant mt-xs font-semibold">Used for all aggregate reporting.</p>
                                </div>
                                
                                {/* Fiscal Year */}
                                <div>
                                    <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs font-semibold" htmlFor="fiscal_year">Fiscal Year Start</label>
                                    <div className="relative">
                                        <select
                                            id="fiscal_year"
                                            value={fiscalYear}
                                            onChange={(e) => setFiscalYear(e.target.value)}
                                            className="w-full bg-background border border-outline-variant rounded px-sm py-sm text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10 cursor-pointer"
                                        >
                                            <option value="jan">January 1st</option>
                                            <option value="apr">April 1st</option>
                                            <option value="jul">July 1st</option>
                                            <option value="oct">October 1st</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                                
                                {/* Timezone */}
                                <div className="md:col-span-2">
                                    <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs font-semibold" htmlFor="timezone">System Timezone</label>
                                    <div className="relative">
                                        <select
                                            id="timezone"
                                            value={timezone}
                                            onChange={(e) => setTimezone(e.target.value)}
                                            className="w-full bg-background border border-outline-variant rounded px-sm py-sm text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10 cursor-pointer"
                                        >
                                            <option value="utc">UTC (Coordinated Universal Time)</option>
                                            <option value="pst">America/Los_Angeles (Pacific Time)</option>
                                            <option value="est">America/New_York (Eastern Time)</option>
                                            <option value="cet">Europe/Berlin (Central European Time)</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Danger Zone & Documentation */}
                    <div className="space-y-lg">
                        {/* Danger Zone */}
                        <section className="bg-surface-container-low border border-error/40 rounded-lg p-md relative overflow-hidden group shadow-sm">
                            <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
                            <div className="border-b border-outline-variant pb-sm mb-md">
                                <h4 className="font-headline-sm text-headline-sm text-error flex items-center gap-sm font-semibold">
                                    <span className="material-symbols-outlined text-error">warning</span> Danger Zone
                                </h4>
                            </div>
                            
                            <div className="space-y-lg">
                                <div>
                                    <p className="text-body-md font-body-md text-on-surface font-semibold mb-xs">Export Workspace Data</p>
                                    <p className="text-[12px] text-on-surface-variant mb-sm font-medium">Download all financial records, vendor contracts, and audit logs as a comprehensive ZIP archive.</p>
                                    <button
                                        onClick={handleExport}
                                        className="px-sm py-xs border border-outline-variant rounded text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-xs text-[14px] cursor-pointer active:scale-95 font-semibold"
                                        type="button"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">download</span> Export All Data
                                    </button>
                                </div>
                                
                                <div className="pt-md border-t border-outline-variant/30">
                                    <p className="text-body-md font-body-md text-on-surface font-semibold mb-xs">Delete Workspace</p>
                                    <p className="text-[12px] text-on-surface-variant mb-sm font-medium">Permanently remove this organization and all associated data. This action cannot be undone.</p>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="px-sm py-xs bg-error-container text-on-error-container rounded hover:opacity-90 transition-all flex items-center gap-xs text-[14px] font-bold cursor-pointer active:scale-95 shadow-sm"
                                        type="button"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete_forever</span> Delete Workspace
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Helper Card */}
                        <section className="bg-surface-container-highest border border-outline-variant rounded-lg p-md shadow-sm">
                            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm tracking-wider font-semibold">Need Help?</h4>
                            <p className="text-[13px] text-on-surface mb-sm font-medium">Changing core currency settings may affect historical data aggregation. Consult our documentation before modifying these fields.</p>
                            <a className="text-primary hover:text-primary-fixed transition-colors text-[13px] flex items-center gap-xs font-bold" href="#">
                                Read Documentation 
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </a>
                        </section>
                    </div>
                </div>
            )}

            {/* Notifications Preferences Tab View */}
            {activeTab === 'notifications' && (
                <div className="flex flex-col gap-lg max-w-[1024px] w-full">
                    {/* Section 1: Renewal Alerts */}
                    <div className="bg-[#161B28] border border-[#2D3748] rounded-xl overflow-hidden flex flex-col shadow-sm">
                        <div className="p-md border-b border-[#2D3748] bg-surface-container-lowest/50">
                            <div className="flex items-center gap-sm">
                                <span className="material-symbols-outlined text-primary">event_repeat</span>
                                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Renewal Alerts</h3>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Notifications regarding upcoming software subscription renewals.</p>
                        </div>
                        <div className="p-md flex flex-col">
                            {/* Row 1 */}
                            <div className="flex items-center justify-between py-md border-b border-[#2D3748]/50 last:border-0">
                                <div>
                                    <h4 className="font-body-md text-body-md font-semibold text-on-surface">30 Days Notice</h4>
                                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">Alert one month prior to renewal date.</p>
                                </div>
                                <Switch checked={renewal30} onChange={setRenewal30} />
                            </div>
                            {/* Row 2 */}
                            <div className="flex items-center justify-between py-md border-b border-[#2D3748]/50 last:border-0">
                                <div>
                                    <h4 className="font-body-md text-body-md font-semibold text-on-surface">7 Days Notice</h4>
                                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">Final week reminder for action items.</p>
                                </div>
                                <Switch checked={renewal7} onChange={setRenewal7} />
                            </div>
                            {/* Row 3 */}
                            <div className="flex items-center justify-between py-md border-b border-[#2D3748]/50 last:border-0">
                                <div>
                                    <h4 className="font-body-md text-body-md font-semibold text-on-surface">Day of Renewal</h4>
                                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">Confirmation of auto-renewal or expiration.</p>
                                </div>
                                <Switch checked={renewalDay} onChange={setRenewalDay} />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Approval Alerts */}
                    <div className="bg-[#161B28] border border-[#2D3748] rounded-xl overflow-hidden flex flex-col shadow-sm">
                        <div className="p-md border-b border-[#2D3748] bg-surface-container-lowest/50">
                            <div className="flex items-center gap-sm">
                                <span className="material-symbols-outlined text-primary">fact_check</span>
                                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Approval Alerts</h3>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Notifications for vendor request workflows.</p>
                        </div>
                        <div className="p-md flex flex-col">
                            {/* Row 1 */}
                            <div className="flex items-center justify-between py-md border-b border-[#2D3748]/50 last:border-0">
                                <div>
                                    <h4 className="font-body-md text-body-md font-semibold text-on-surface">New Requests</h4>
                                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">When a team member requests a new tool.</p>
                                </div>
                                <Switch checked={approvalNew} onChange={setApprovalNew} />
                            </div>
                            {/* Row 2 */}
                            <div className="flex items-center justify-between py-md border-b border-[#2D3748]/50 last:border-0">
                                <div>
                                    <h4 className="font-body-md text-body-md font-semibold text-on-surface">Approved</h4>
                                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">When an admin approves a request.</p>
                                </div>
                                <Switch checked={approvalApproved} onChange={setApprovalApproved} />
                            </div>
                            {/* Row 3 */}
                            <div className="flex items-center justify-between py-md border-b border-[#2D3748]/50 last:border-0">
                                <div>
                                    <h4 className="font-body-md text-body-md font-semibold text-on-surface">Rejected</h4>
                                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">When a request is denied or returned for changes.</p>
                                </div>
                                <Switch checked={approvalRejected} onChange={setApprovalRejected} />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Reports */}
                    <div className="bg-[#161B28] border border-[#2D3748] rounded-xl overflow-hidden flex flex-col shadow-sm">
                        <div className="p-md border-b border-[#2D3748] bg-surface-container-lowest/50">
                            <div className="flex items-center gap-sm">
                                <span className="material-symbols-outlined text-primary">assessment</span>
                                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Weekly Reports</h3>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Automated summaries of engineering spend.</p>
                        </div>
                        <div className="p-md flex flex-col">
                            {/* Row 1 */}
                            <div className="flex items-center justify-between py-md border-b border-[#2D3748]/50 last:border-0">
                                <div>
                                    <h4 className="font-body-md text-body-md font-semibold text-on-surface">Spend Summary Digest</h4>
                                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">Receive a Monday morning email with week-over-week spend changes.</p>
                                </div>
                                <Switch checked={reportDigest} onChange={setReportDigest} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-md z-50 backdrop-blur-sm">
                    <div className="bg-[#191C24] border border-[#2D3748] rounded-xl max-w-md w-full p-lg shadow-2xl relative">
                        <div className="flex items-center gap-sm text-error mb-md">
                            <span className="material-symbols-outlined text-[32px]">warning</span>
                            <h3 className="font-headline-sm text-headline-sm font-bold">Delete Workspace?</h3>
                        </div>
                        <p className="text-body-md text-on-surface-variant mb-lg font-semibold leading-relaxed">
                            This action is <strong className="text-error">irreversible</strong>. You will lose access to all contract history, seat optimization pipelines, and YTD cost breakdowns forever.
                        </p>
                        <div className="flex justify-end gap-md">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-md py-sm border border-outline-variant rounded hover:bg-surface-container-low transition-colors cursor-pointer text-sm font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteWorkspace}
                                className="px-md py-sm bg-error text-on-error rounded hover:opacity-90 transition-all cursor-pointer text-sm font-bold flex items-center gap-xs"
                            >
                                Yes, Delete Workspace
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Save Action Bar */}
            <div className="fixed bottom-0 left-0 md:left-[280px] right-0 bg-surface-container-low border-t border-outline-variant p-md flex justify-end gap-md z-30 shadow-[0_-8px_20px_rgba(0,0,0,0.3)]">
                <button
                    onClick={handleCancel}
                    className="px-lg py-sm border border-outline-variant rounded text-on-surface hover:bg-surface-container-high transition-colors font-bold cursor-pointer active:scale-95"
                    type="button"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="px-lg py-sm bg-primary text-on-primary rounded hover:opacity-90 transition-opacity font-bold flex items-center gap-xs cursor-pointer active:scale-95 shadow-md"
                    type="button"
                >
                    <span className="material-symbols-outlined text-[18px]">save</span> Save Changes
                </button>
            </div>
        </div>
    );
};

export default Settings;
