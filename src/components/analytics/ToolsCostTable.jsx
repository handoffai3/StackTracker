import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const ToolsCostTable = ({ vendors, loading, categoryFilter, onClearCategory }) => {
    const navigate = useNavigate();
    const [sortField, setSortField] = useState('monthly_cost');
    const [sortDirection, setSortDirection] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc'); // default to desc on new field
        }
    };

    const sortedAndFiltered = useMemo(() => {
        let result = vendors;

        // Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(v => v.name.toLowerCase().includes(lower) || v.category?.toLowerCase().includes(lower));
        }

        // Category Filter
        if (categoryFilter) {
            result = result.filter(v => v.category?.toLowerCase() === categoryFilter.toLowerCase());
        }

        // Sort
        return result.sort((a, b) => {
            let valA, valB;

            switch (sortField) {
                case 'name':
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                    break;
                case 'monthly_cost':
                    valA = Number(a.monthly_cost || 0);
                    valB = Number(b.monthly_cost || 0);
                    break;
                case 'annual_cost':
                    valA = Number(a.monthly_cost || 0) * 12;
                    valB = Number(b.monthly_cost || 0) * 12;
                    break;
                case 'utilization':
                    valA = a.total_seats > 0 ? a.used_seats / a.total_seats : 0;
                    valB = b.total_seats > 0 ? b.used_seats / b.total_seats : 0;
                    break;
                case 'cost_per_seat':
                    valA = a.used_seats > 0 ? Number(a.monthly_cost || 0) / a.used_seats : 0;
                    valB = b.used_seats > 0 ? Number(b.monthly_cost || 0) / b.used_seats : 0;
                    break;
                default:
                    valA = a[sortField] || 0;
                    valB = b[sortField] || 0;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [vendors, sortField, sortDirection, searchTerm, categoryFilter]);

    if (loading) {
        return (
            <div className="space-y-sm p-lg">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-[#2D3748] animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    const renderSortIcon = (field) => {
        if (sortField !== field) return <span className="material-symbols-outlined text-[14px] text-[#2D3748] opacity-0 group-hover:opacity-100 transition-opacity">unfold_more</span>;
        return (
            <span className="material-symbols-outlined text-[14px] text-primary">
                {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            </span>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-md">
                <div className="relative w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg pl-10 pr-3 py-1.5 font-body-md text-body-md text-on-surface transition-colors"
                    />
                </div>
                {categoryFilter && (
                    <div className="flex items-center gap-2 bg-[#3B82F6]/10 text-[#3B82F6] px-3 py-1.5 rounded-lg border border-[#3B82F6]/20">
                        <span className="font-label-md text-[12px] uppercase">Category: {categoryFilter}</span>
                        <button onClick={onClearCategory} className="hover:text-white transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#2D3748] bg-[#10131A]">
                            <th className="p-md cursor-pointer group whitespace-nowrap" onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-1 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">
                                    Tool Name {renderSortIcon('name')}
                                </div>
                            </th>
                            <th className="p-md cursor-pointer group whitespace-nowrap" onClick={() => handleSort('monthly_cost')}>
                                <div className="flex items-center gap-1 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">
                                    Monthly Cost {renderSortIcon('monthly_cost')}
                                </div>
                            </th>
                            <th className="p-md cursor-pointer group whitespace-nowrap" onClick={() => handleSort('annual_cost')}>
                                <div className="flex items-center gap-1 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">
                                    Annual Cost {renderSortIcon('annual_cost')}
                                </div>
                            </th>
                            <th className="p-md cursor-pointer group whitespace-nowrap" onClick={() => handleSort('utilization')}>
                                <div className="flex items-center gap-1 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">
                                    Utilization {renderSortIcon('utilization')}
                                </div>
                            </th>
                            <th className="p-md cursor-pointer group whitespace-nowrap" onClick={() => handleSort('cost_per_seat')}>
                                <div className="flex items-center gap-1 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-normal">
                                    Cost Per Seat {renderSortIcon('cost_per_seat')}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D3748]/50">
                        {sortedAndFiltered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-xl text-center text-on-surface-variant font-body-md">
                                    No tools match your filters.
                                </td>
                            </tr>
                        ) : (
                            sortedAndFiltered.map(vendor => {
                                const mCost = Number(vendor.monthly_cost || 0);
                                const aCost = mCost * 12;
                                const total = vendor.total_seats || 0;
                                const used = vendor.used_seats || 0;
                                const utilRatio = total > 0 ? used / total : 0;
                                const utilPercent = Math.round(utilRatio * 100);
                                const costPerSeat = used > 0 ? mCost / used : 0;

                                const isUnderused = total > 0 && utilRatio < 0.5;

                                let utilColor = 'bg-[#10B981]';
                                if (utilRatio < 0.5) utilColor = 'bg-[#EF4444]';
                                else if (utilRatio < 0.8) utilColor = 'bg-[#F59E0B]';

                                return (
                                    <tr 
                                        key={vendor.id} 
                                        onClick={() => navigate(`/vendor-directory/${vendor.id}`)}
                                        className={`hover:bg-surface-container-high transition-colors cursor-pointer ${isUnderused ? 'bg-[#EF4444]/5 border-l-2 border-l-[#EF4444]' : 'border-l-2 border-l-transparent'}`}
                                    >
                                        <td className="p-md">
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
                                        <td className="p-md font-body-md text-on-surface font-semibold">
                                            ${mCost.toLocaleString()}
                                        </td>
                                        <td className="p-md font-body-md text-on-surface-variant">
                                            ${aCost.toLocaleString()}
                                        </td>
                                        <td className="p-md w-48">
                                            {total > 0 ? (
                                                <div>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-[11px] text-on-surface-variant">{used} / {total} seats</span>
                                                        <span className="text-[11px] font-bold text-on-surface">{utilPercent}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-[#10131A] rounded-full overflow-hidden">
                                                        <div className={`h-full ${utilColor}`} style={{ width: `${Math.min(utilPercent, 100)}%` }} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-on-surface-variant italic">No seats tracked</span>
                                            )}
                                        </td>
                                        <td className="p-md">
                                            {used > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-body-md text-on-surface font-semibold">
                                                        ${costPerSeat.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    </span>
                                                    <span className="text-[10px] text-on-surface-variant">/mo</span>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-on-surface-variant italic">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ToolsCostTable;
