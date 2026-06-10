import React from 'react';

const RequestPreviewCard = ({ toolName, monthlyCost, seats, priority }) => {
    const cost = Number(monthlyCost) || 0;
    const isHighCost = cost > 500;

    const getPriorityLabel = (val) => {
        switch (val) {
            case 'low': return 'Low';
            case 'medium': return 'Medium';
            case 'high': return 'High';
            case 'critical': return 'Critical';
            default: return 'Medium';
        }
    };

    const getPriorityColor = (val) => {
        switch (val) {
            case 'critical': return 'text-[#EF4444]';
            case 'high': return 'text-[#F97316]';
            case 'medium': return 'text-[#3B82F6]';
            case 'low': return 'text-[#6B7280]';
            default: return 'text-[#3B82F6]';
        }
    };

    const getPriorityBg = (val) => {
        switch (val) {
            case 'critical': return 'bg-[#EF4444]/10 border-[#EF4444]/20';
            case 'high': return 'bg-[#F97316]/10 border-[#F97316]/20';
            case 'medium': return 'bg-[#3B82F6]/10 border-[#3B82F6]/20';
            case 'low': return 'bg-[#6B7280]/10 border-[#6B7280]/20';
            default: return 'bg-[#3B82F6]/10 border-[#3B82F6]/20';
        }
    };

    return (
        <div className="lg:col-span-4 sticky top-[104px]">
            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-md flex flex-col relative overflow-hidden">
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

                {/* Header */}
                <h3 className="font-label-md text-label-md text-[#94A3B8] uppercase tracking-wider mb-lg flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    Request Preview
                </h3>

                <div className="flex-1 space-y-lg">
                    {/* Vendor Name */}
                    <div>
                        <p className="font-label-md text-label-md text-on-surface-variant mb-1">Target Vendor</p>
                        <p className="font-headline-md text-headline-md text-on-surface truncate">
                            {toolName || 'Untitled Tool'}
                        </p>
                    </div>

                    {/* Estimated MRR */}
                    <div className="border-b border-[#2D3748] pb-md">
                        <p className="font-label-md text-label-md text-on-surface-variant mb-1">Estimated MRR</p>
                        <p className="text-[32px] font-bold text-primary leading-tight">
                            ${cost.toLocaleString('en-US')}
                            <span className="text-body-md font-body-md text-on-surface-variant ml-1 font-normal">/mo</span>
                        </p>
                    </div>

                    {/* Seats & Priority grid */}
                    <div className="grid grid-cols-2 gap-md">
                        <div className="bg-[#10131A] rounded-lg p-sm border border-[#2D3748]">
                            <p className="font-label-md text-label-md text-on-surface-variant mb-1 flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[14px]">group</span>
                                Seats
                            </p>
                            <p className="font-headline-sm text-headline-sm text-on-surface">
                                {seats || '--'}
                            </p>
                        </div>
                        <div className={`rounded-lg p-sm border ${getPriorityBg(priority)}`}>
                            <p className="font-label-md text-label-md text-on-surface-variant mb-1 flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[14px]">flag</span>
                                Priority
                            </p>
                            <p className={`font-headline-sm text-headline-sm ${getPriorityColor(priority)}`}>
                                {getPriorityLabel(priority)}
                            </p>
                        </div>
                    </div>

                    {/* Approval SLA info */}
                    <div className="pt-xs">
                        {isHighCost ? (
                            <div className="bg-[#F59E0B]/10 rounded-lg p-sm flex items-start gap-sm border border-[#F59E0B]/20">
                                <span className="material-symbols-outlined text-[#F59E0B] text-[20px] mt-0.5 shrink-0">warning</span>
                                <p className="font-body-md text-body-md text-on-surface-variant text-[12px] leading-relaxed">
                                    Requests over $500/mo require VP approval. Typical SLA is 3-5 business days.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-primary/10 rounded-lg p-sm flex items-start gap-sm border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">verified_user</span>
                                <p className="font-body-md text-body-md text-on-surface-variant text-[12px] leading-relaxed">
                                    Standard approval. Typical SLA is 1-2 business days.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestPreviewCard;
