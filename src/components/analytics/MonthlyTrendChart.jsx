import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonthlyTrendChart = ({ data, loading }) => {
    if (loading) {
        return <div className="h-[350px] bg-[#2D3748] animate-pulse rounded-lg" />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-[350px] flex items-center justify-center border border-dashed border-[#2D3748] rounded-lg">
                <p className="text-on-surface-variant font-body-md">No trend data available</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#161B28] border border-[#2D3748] p-sm rounded-lg shadow-xl">
                    <p className="text-on-surface-variant font-label-md uppercase mb-2">{label}</p>
                    
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                            <span className="text-on-surface text-[13px]">Actual Spend:</span>
                            <span className="text-white font-bold ml-auto">
                                ${Number(payload[0]?.value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        </div>
                        {payload[1] && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#6B7280]" />
                                <span className="text-on-surface-variant text-[13px]">Previous Year:</span>
                                <span className="text-on-surface-variant font-bold ml-auto">
                                    ${Number(payload[1]?.value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        stroke="#94A3B8" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis 
                        stroke="#94A3B8" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                        domain={[0, 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Previous Year (Grey Dashed) */}
                    <Line 
                        type="monotone" 
                        dataKey="previous" 
                        stroke="#6B7280" 
                        strokeWidth={2} 
                        strokeDasharray="5 5" 
                        dot={false}
                        activeDot={false}
                    />
                    
                    {/* Actual Spend (Blue Solid) */}
                    <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#3B82F6" 
                        strokeWidth={3} 
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyTrendChart;
