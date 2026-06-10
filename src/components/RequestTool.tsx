import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RequestForm {
    toolName: string;
    vendorUrl: string;
    cost: string;
    seats: string;
    priority: 'low' | 'medium' | 'high';
    justification: string;
}

const RequestTool: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<RequestForm>({
        toolName: '',
        vendorUrl: '',
        cost: '',
        seats: '',
        priority: 'medium',
        justification: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof RequestForm, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedData, setSubmittedData] = useState<RequestForm | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof RequestForm]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof RequestForm, string>> = {};
        if (!form.toolName.trim()) newErrors.toolName = 'Tool name is required';
        if (!form.cost || Number(form.cost) <= 0) newErrors.cost = 'Please enter a valid monthly cost';
        if (!form.seats || Number(form.seats) <= 0) newErrors.seats = 'Please enter seats count';
        if (!form.justification.trim()) newErrors.justification = 'Justification is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setSubmittedData(form);
            // Reset form
            setForm({
                toolName: '',
                vendorUrl: '',
                cost: '',
                seats: '',
                priority: 'medium',
                justification: '',
            });
        }, 1200);
    };

    const getPriorityLabel = (val: string) => {
        switch (val) {
            case 'low': return 'Low';
            case 'medium': return 'Medium';
            case 'high': return 'High';
            default: return 'Medium';
        }
    };

    const getPriorityColorClass = (val: string) => {
        switch (val) {
            case 'high': return 'text-error';
            case 'medium': return 'text-tertiary-container';
            default: return 'text-primary';
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Breadcrumb Header */}
            <div className="mb-lg">
                <h2 className="font-headline-md text-headline-md text-on-surface">New Internal Tool Request</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs max-w-2xl">
                    Submit a request to procure a new software tool or service for the engineering organization. All requests above $500/mo require secondary approval.
                </p>
            </div>

            {!isSuccess ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
                    {/* Form Column */}
                    <div className="lg:col-span-8">
                        <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-lg">
                            <form onSubmit={handleSubmit} className="space-y-lg">
                                {/* Basic Details */}
                                <div className="space-y-md">
                                    <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs">
                                        <span className="material-symbols-outlined text-[20px]">info</span> Basic Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                        <div className="flex flex-col gap-sm">
                                            <label className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider" htmlFor="tool-name">Tool Name</label>
                                            <input
                                                type="text"
                                                id="tool-name"
                                                name="toolName"
                                                value={form.toolName}
                                                onChange={handleChange}
                                                placeholder="e.g. Datadog, Figma, GitHub Copilot"
                                                className={`w-full bg-[#10131A] border ${errors.toolName ? 'border-error' : 'border-[#2D3748]'} focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface transition-colors`}
                                            />
                                            {errors.toolName && <p className="text-error font-label-md text-[11px]">{errors.toolName}</p>}
                                        </div>
                                        <div className="flex flex-col gap-sm">
                                            <label className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider" htmlFor="tool-url">Vendor Link</label>
                                            <input
                                                type="url"
                                                id="tool-url"
                                                name="vendorUrl"
                                                value={form.vendorUrl}
                                                onChange={handleChange}
                                                placeholder="https://..."
                                                className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-[#2D3748]" />

                                {/* Financials & Scale */}
                                <div className="space-y-md">
                                    <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs">
                                        <span className="material-symbols-outlined text-[20px]">payments</span> Financials & Scale
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                                        <div className="flex flex-col gap-sm">
                                            <label className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider" htmlFor="monthly-cost">Est. Monthly Cost (USD)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-body-md">$</span>
                                                <input
                                                    type="number"
                                                    id="monthly-cost"
                                                    name="cost"
                                                    value={form.cost}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    className={`w-full bg-[#10131A] border ${errors.cost ? 'border-error' : 'border-[#2D3748]'} focus:border-[#3B82F6] focus:ring-0 rounded-lg pl-8 pr-md py-sm font-body-md text-body-md text-on-surface transition-colors`}
                                                />
                                            </div>
                                            {errors.cost && <p className="text-error font-label-md text-[11px]">{errors.cost}</p>}
                                        </div>
                                        <div className="flex flex-col gap-sm">
                                            <label className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider" htmlFor="seats-needed">Seats Needed</label>
                                            <input
                                                type="number"
                                                id="seats-needed"
                                                name="seats"
                                                value={form.seats}
                                                onChange={handleChange}
                                                placeholder="1"
                                                className={`w-full bg-[#10131A] border ${errors.seats ? 'border-error' : 'border-[#2D3748]'} focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface transition-colors`}
                                            />
                                            {errors.seats && <p className="text-error font-label-md text-[11px]">{errors.seats}</p>}
                                        </div>
                                        <div className="flex flex-col gap-sm">
                                            <label className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider" htmlFor="urgency">Priority Level</label>
                                            <select
                                                id="urgency"
                                                name="priority"
                                                value={form.priority}
                                                onChange={handleChange}
                                                className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface cursor-pointer"
                                            >
                                                <option value="low">Low - Future Quarter</option>
                                                <option value="medium">Medium - This Quarter</option>
                                                <option value="high">High - Blocking Work</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-[#2D3748]" />

                                {/* Justification */}
                                <div className="space-y-md">
                                    <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs">
                                        <span className="material-symbols-outlined text-[20px]">description</span> Business Justification
                                    </h3>
                                    <div className="flex flex-col gap-sm">
                                        <label className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider" htmlFor="justification">Why is this tool necessary?</label>
                                        <textarea
                                            id="justification"
                                            name="justification"
                                            value={form.justification}
                                            onChange={handleChange}
                                            placeholder="Detail the specific problem this solves, alternatives evaluated, and expected ROI..."
                                            rows={4}
                                            className={`w-full bg-[#10131A] border ${errors.justification ? 'border-error' : 'border-[#2D3748]'} focus:border-[#3B82F6] focus:ring-0 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface transition-colors`}
                                        ></textarea>
                                        {errors.justification && <p className="text-error font-label-md text-[11px]">{errors.justification}</p>}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-md pt-sm">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        className="px-xl py-sm border border-[#2D3748] hover:bg-surface-container-high rounded-lg text-on-surface-variant font-headline-sm text-headline-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-[#3B82F6] hover:bg-primary-container disabled:bg-primary-container/50 text-white font-headline-sm text-headline-sm px-xl py-sm rounded-lg flex items-center gap-xs transition-colors active:scale-95 min-w-[150px] justify-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[20px]">send</span> Submit Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Preview Column */}
                    <div className="lg:col-span-4 sticky top-[104px]">
                        <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-md flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
                            
                            <h3 className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider mb-lg flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[16px]">visibility</span> Request Preview
                            </h3>

                            <div className="flex-1 space-y-lg">
                                <div>
                                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Target Vendor</p>
                                    <p className="font-headline-md text-headline-md text-on-surface truncate">
                                        {form.toolName || 'Untitled Tool'}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#2D3748] pb-md">
                                    <div>
                                        <p className="font-label-md text-label-md text-on-surface-variant mb-1">Estimated MRR</p>
                                        <p className="font-display-lg text-[32px] font-bold text-primary">
                                            ${form.cost ? Number(form.cost).toLocaleString('en-US') : '0'}
                                            <span className="text-body-md font-body-md text-on-surface-variant ml-1">/mo</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-md">
                                    <div className="bg-[#10131A] rounded-lg p-sm border border-[#2D3748]">
                                        <p className="font-label-md text-label-md text-on-surface-variant mb-1 flex items-center gap-xs">
                                            <span className="material-symbols-outlined text-[14px]">group</span> Seats
                                        </p>
                                        <p className="font-headline-sm text-headline-sm text-on-surface">
                                            {form.seats || '--'}
                                        </p>
                                    </div>
                                    <div className="bg-[#10131A] rounded-lg p-sm border border-[#2D3748]">
                                        <p className="font-label-md text-label-md text-on-surface-variant mb-1 flex items-center gap-xs">
                                            <span className="material-symbols-outlined text-[14px]">flag</span> Priority
                                        </p>
                                        <p className={`font-headline-sm text-headline-sm capitalize ${getPriorityColorClass(form.priority)}`}>
                                            {getPriorityLabel(form.priority)}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-md">
                                    <div className="bg-primary/10 rounded-lg p-sm flex items-start gap-sm border border-primary/20">
                                        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">verified_user</span>
                                        <p className="font-body-md text-body-md text-on-surface-variant text-[12px] leading-relaxed">
                                            Requests over $500/mo require VP approval. Typical SLA is 3-5 business days.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-xl text-center max-w-2xl mx-auto my-xl space-y-md relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 w-48 h-48 bg-[#10B981]/5 rounded-full blur-3xl"></div>
                    <div className="w-16 h-16 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mx-auto mb-lg border border-[#10B981]/30">
                        <span className="material-symbols-outlined text-[36px]">task_alt</span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Request Submitted Successfully!</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
                        Your request for <strong className="text-on-surface">{submittedData?.toolName}</strong> has been created and is waiting in the Approval Queue.
                    </p>
                    
                    {/* Summary Box */}
                    <div className="bg-[#10131A] border border-[#2D3748] rounded-xl p-md text-left max-w-md mx-auto space-y-xs my-lg font-body-md text-body-md">
                        <div className="flex justify-between border-b border-[#2D3748] pb-xs mb-xs">
                            <span className="text-on-surface font-bold">{submittedData?.toolName}</span>
                            <span className={`inline-block font-bold text-[10px] uppercase tracking-wider ${getPriorityColorClass(submittedData?.priority || '')}`}>
                                {getPriorityLabel(submittedData?.priority || '')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#94A3B8]">Est. Monthly Cost</span>
                            <span className="text-on-surface font-semibold">${Number(submittedData?.cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#94A3B8]">Seats Count</span>
                            <span className="text-on-surface font-semibold">{submittedData?.seats} seats</span>
                        </div>
                        {submittedData?.vendorUrl && (
                            <div className="flex justify-between overflow-hidden">
                                <span className="text-[#94A3B8] shrink-0">Vendor URL</span>
                                <span className="text-primary truncate font-semibold ml-2 max-w-[200px]">{submittedData?.vendorUrl}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-md pt-lg">
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="px-md py-sm border border-[#2D3748] hover:bg-surface-container-high rounded-lg text-on-surface-variant font-body-md text-body-md transition-colors"
                        >
                            Request Another Tool
                        </button>
                        <button
                            onClick={() => navigate('/approval-queue')}
                            className="bg-[#3B82F6] hover:bg-primary-container text-white font-body-md text-body-md px-md py-sm rounded-lg transition-colors active:scale-95"
                        >
                            View Approval Queue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestTool;
