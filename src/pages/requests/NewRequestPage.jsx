import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRequests } from '../../hooks/useRequests';
import RequestPreviewCard from '../../components/requests/RequestPreviewCard';

const NewRequestPage = () => {
    const navigate = useNavigate();
    const { submitRequest, isSubmitting, toastMessage, toastType, dismissToast, showToast } = useRequests();

    const [form, setForm] = useState({
        toolName: '',
        vendorUrl: '',
        category: 'other',
        monthlyCost: '',
        seatsNeeded: '1',
        priority: 'medium',
        justification: '',
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validation
    const validate = (fields = form) => {
        const newErrors = {};

        if (!fields.toolName.trim() || fields.toolName.trim().length < 2) {
            newErrors.toolName = 'Tool name is required (min 2 characters)';
        }

        if (!fields.monthlyCost || Number(fields.monthlyCost) <= 0) {
            newErrors.monthlyCost = 'Monthly cost must be a positive number';
        }

        if (!fields.seatsNeeded || Number(fields.seatsNeeded) < 1) {
            newErrors.seatsNeeded = 'At least 1 seat is required';
        }

        if (!fields.justification.trim() || fields.justification.trim().length < 50) {
            newErrors.justification = `Business justification is required (min 50 characters — ${fields.justification.trim().length}/50)`;
        }

        return newErrors;
    };

    const isFormValid = Object.keys(validate()).length === 0;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...form, [name]: value };
        setForm(updated);

        // Clear error on change if field was touched
        if (touched[name]) {
            const newErrors = validate(updated);
            setErrors((prev) => ({
                ...prev,
                [name]: newErrors[name] || '',
            }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const newErrors = validate();
        setErrors((prev) => ({
            ...prev,
            [name]: newErrors[name] || '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        setErrors(newErrors);
        setTouched({
            toolName: true,
            monthlyCost: true,
            seatsNeeded: true,
            justification: true,
        });

        if (Object.keys(newErrors).length > 0) {
            showToast('Please fix the errors above before submitting.', 'error');
            return;
        }

        const success = await submitRequest(form);
        if (success) {
            setTimeout(() => navigate('/requests'), 800);
        }
    };

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

            {/* Breadcrumb */}
            <div className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant mb-md">
                <Link to="/requests" className="hover:text-primary transition-colors">Requests</Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-on-surface">New Tool Request</span>
            </div>

            {/* Header */}
            <div className="mb-lg">
                <h2 className="font-headline-md text-headline-md text-on-surface">New Internal Tool Request</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs max-w-2xl">
                    Submit a request to procure a new software tool or service for the engineering organization.
                    All requests above $500/mo require secondary approval.
                </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start flex-1">
                {/* Form Column */}
                <div className="lg:col-span-8">
                    <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg">
                        <form onSubmit={handleSubmit} className="space-y-lg">
                            {/* Section 1 — Basic Details */}
                            <div className="space-y-md">
                                <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs">
                                    <span className="material-symbols-outlined text-[20px]">info</span>
                                    Basic Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                    {/* Tool Name */}
                                    <div className="flex flex-col gap-sm">
                                        <label
                                            className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider"
                                            htmlFor="toolName"
                                        >
                                            Tool Name <span className="text-[#EF4444]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="toolName"
                                            name="toolName"
                                            value={form.toolName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="e.g. Datadog, Figma, GitHub Copilot"
                                            className={`w-full bg-[#10131A] border ${
                                                errors.toolName && touched.toolName
                                                    ? 'border-[#EF4444]'
                                                    : 'border-[#2D3748]'
                                            } focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface transition-colors`}
                                        />
                                        {errors.toolName && touched.toolName && (
                                            <p className="text-[#EF4444] font-label-md text-[11px] flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">error</span>
                                                {errors.toolName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Vendor Link */}
                                    <div className="flex flex-col gap-sm">
                                        <label
                                            className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider"
                                            htmlFor="vendorUrl"
                                        >
                                            Vendor Link
                                        </label>
                                        <input
                                            type="url"
                                            id="vendorUrl"
                                            name="vendorUrl"
                                            value={form.vendorUrl}
                                            onChange={handleChange}
                                            placeholder="https://..."
                                            className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface transition-colors"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div className="flex flex-col gap-sm md:col-span-2">
                                        <label
                                            className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider"
                                            htmlFor="category"
                                        >
                                            Category <span className="text-[#EF4444]">*</span>
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                            className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface cursor-pointer"
                                        >
                                            <option value="devops">DevOps & CI/CD</option>
                                            <option value="design">Design Tools</option>
                                            <option value="ai">AI & ML</option>
                                            <option value="monitoring">Monitoring</option>
                                            <option value="communication">Communication</option>
                                            <option value="security">Security</option>
                                            <option value="analytics">Analytics</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[#2D3748]" />

                            {/* Section 2 — Financials & Scale */}
                            <div className="space-y-md">
                                <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs">
                                    <span className="material-symbols-outlined text-[20px]">payments</span>
                                    Financials &amp; Scale
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                                    {/* Monthly Cost */}
                                    <div className="flex flex-col gap-sm">
                                        <label
                                            className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider"
                                            htmlFor="monthlyCost"
                                        >
                                            Est. Monthly Cost (USD) <span className="text-[#EF4444]">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-body-md">
                                                $
                                            </span>
                                            <input
                                                type="number"
                                                id="monthlyCost"
                                                name="monthlyCost"
                                                value={form.monthlyCost}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                className={`w-full bg-[#10131A] border ${
                                                    errors.monthlyCost && touched.monthlyCost
                                                        ? 'border-[#EF4444]'
                                                        : 'border-[#2D3748]'
                                                } focus:border-[#3B82F6] focus:ring-0 rounded-lg pl-8 pr-md py-sm font-body-md text-body-md text-on-surface transition-colors`}
                                            />
                                        </div>
                                        {errors.monthlyCost && touched.monthlyCost && (
                                            <p className="text-[#EF4444] font-label-md text-[11px] flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">error</span>
                                                {errors.monthlyCost}
                                            </p>
                                        )}
                                    </div>

                                    {/* Seats Needed */}
                                    <div className="flex flex-col gap-sm">
                                        <label
                                            className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider"
                                            htmlFor="seatsNeeded"
                                        >
                                            Seats Needed <span className="text-[#EF4444]">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="seatsNeeded"
                                            name="seatsNeeded"
                                            value={form.seatsNeeded}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="1"
                                            min="1"
                                            className={`w-full bg-[#10131A] border ${
                                                errors.seatsNeeded && touched.seatsNeeded
                                                    ? 'border-[#EF4444]'
                                                    : 'border-[#2D3748]'
                                            } focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface transition-colors`}
                                        />
                                        {errors.seatsNeeded && touched.seatsNeeded && (
                                            <p className="text-[#EF4444] font-label-md text-[11px] flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">error</span>
                                                {errors.seatsNeeded}
                                            </p>
                                        )}
                                    </div>

                                    {/* Priority Level */}
                                    <div className="flex flex-col gap-sm">
                                        <label
                                            className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider"
                                            htmlFor="priority"
                                        >
                                            Priority Level
                                        </label>
                                        <select
                                            id="priority"
                                            name="priority"
                                            value={form.priority}
                                            onChange={handleChange}
                                            className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface cursor-pointer"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium - This Quarter</option>
                                            <option value="high">High - This Month</option>
                                            <option value="critical">Critical - This Week</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[#2D3748]" />

                            {/* Section 3 — Business Justification */}
                            <div className="space-y-md">
                                <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs">
                                    <span className="material-symbols-outlined text-[20px]">description</span>
                                    Business Justification
                                </h3>
                                <div className="flex flex-col gap-sm">
                                    <label
                                        className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider"
                                        htmlFor="justification"
                                    >
                                        Why is this tool necessary? <span className="text-[#EF4444]">*</span>
                                    </label>
                                    <textarea
                                        id="justification"
                                        name="justification"
                                        value={form.justification}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Detail the specific problem this solves, alternatives evaluated, and expected ROI..."
                                        rows={4}
                                        className={`w-full bg-[#10131A] border ${
                                            errors.justification && touched.justification
                                                ? 'border-[#EF4444]'
                                                : 'border-[#2D3748]'
                                        } focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface transition-colors resize-none`}
                                    />
                                    {errors.justification && touched.justification && (
                                        <p className="text-[#EF4444] font-label-md text-[11px] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">error</span>
                                            {errors.justification}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-md pt-sm border-t border-[#2D3748]">
                                <button
                                    type="button"
                                    onClick={() => navigate('/vendor-directory')}
                                    className="px-xl py-sm border border-[#2D3748] hover:bg-surface-container-high rounded-lg text-on-surface-variant font-headline-sm text-headline-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`${isFormValid ? 'bg-[#3B82F6] hover:bg-[#2563EB]' : 'bg-[#3B82F6]/60'} disabled:bg-[#3B82F6]/30 disabled:cursor-not-allowed text-white font-headline-sm text-headline-sm px-xl py-sm rounded-lg flex items-center gap-xs transition-all active:scale-95 min-w-[170px] justify-center`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]">send</span>
                                            Submit Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Preview Column */}
                <RequestPreviewCard
                    toolName={form.toolName}
                    monthlyCost={form.monthlyCost}
                    seats={form.seatsNeeded}
                    priority={form.priority}
                    category={form.category}
                />
            </div>
        </div>
    );
};

export default NewRequestPage;
