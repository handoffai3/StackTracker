import React from 'react';
import { Link } from 'react-router-dom';

const UpcomingRenewalsTable = ({ renewals, loading }) => {
    if (loading) {
        return (
            <div className="space-y-sm">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-[#2D3748] animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (!renewals || renewals.length === 0) {
        return (
            <div className="py-xl text-center">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant mb-xs">event_available</span>
                <p className="font-body-md text-on-surface-variant">No upcoming renewals in the next 30 days.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-[#2D3748]">
                        <th className="pb-sm font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Tool</th>
                        <th className="pb-sm font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Cost</th>
                        <th className="pb-sm font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Renewal</th>
                        <th className="pb-sm font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">Owner</th>
                        <th className="pb-sm text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#2D3748]/50">
                    {renewals.map(vendor => {
                        const daysLeft = Math.ceil((new Date(vendor.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));
                        const isUrgent = daysLeft <= 7;
                        
                        return (
                            <tr key={vendor.id} className="hover:bg-surface-container-high transition-colors">
                                <td className="py-md pr-md">
                                    <div className="flex items-center gap-sm">
                                        <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center shrink-0 border border-[#2D3748]">
                                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">build</span>
                                        </div>
                                        <div>
                                            <p className="font-headline-sm text-[14px] text-on-surface font-bold">{vendor.name}</p>
                                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-[#1F2937] text-on-surface-variant font-bold border border-[#2D3748] uppercase mt-0.5">
                                                {vendor.category}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-md pr-md font-body-md text-on-surface">
                                    ${Number(vendor.monthly_cost || 0).toLocaleString()} <span className="text-[11px] text-on-surface-variant">/mo</span>
                                </td>
                                <td className="py-md pr-md">
                                    <p className={`font-body-md font-medium ${isUrgent ? 'text-[#EF4444]' : 'text-on-surface'}`}>
                                        {new Date(vendor.renewal_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className={`text-[11px] ${isUrgent ? 'text-[#EF4444]' : 'text-on-surface-variant'}`}>
                                        {daysLeft} days left
                                    </p>
                                </td>
                                <td className="py-md pr-md font-body-md text-on-surface-variant">
                                    {vendor.owner?.full_name || 'Unassigned'}
                                </td>
                                <td className="py-md text-right">
                                    <Link 
                                        to={`/vendor-directory/${vendor.id}`}
                                        className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-[#2D3748] text-on-surface-variant transition-colors"
                                        title="View Tool"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default UpcomingRenewalsTable;
