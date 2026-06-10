import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonthlyTrendChart = ({ data, loading }) => {
    if (loading) {
        return <div className="h-[300px] bg-[#2D3748] animate-pulse rounded-lg" />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center border border-dashed border-[#2D3748] rounded-lg">
                <p className="text-on-surface-variant font-body-md">No trend data available</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#161B28] border border-[#2D3748] p-3 rounded-lg shadow-xl">
                    <p className="text-on-surface-variant font-label-md uppercase mb-1">{label}</p>
                    <p className="text-primary font-bold text-[16px]">
                        ${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                    <XAxis 
                        dataKey="month" 
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
                        tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                        type="monotone" 
                        dataKey="spend" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSpend)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyTrendChart;
