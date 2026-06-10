import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_COLORS = {
    devops: '#3B82F6', // blue
    design: '#8B5CF6', // purple
    ai: '#10B981', // green
    monitoring: '#F59E0B', // yellow
    communication: '#06B6D4', // cyan
    security: '#EF4444', // red
    analytics: '#F97316', // orange
    other: '#9CA3AF' // grey
};

const SpendByCategoryChart = ({ data, loading, onCategoryClick }) => {
    if (loading) {
        return <div className="h-[300px] bg-[#2D3748] animate-pulse rounded-lg" />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center border border-dashed border-[#2D3748] rounded-lg">
                <p className="text-on-surface-variant font-body-md">No spend data available</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#161B28] border border-[#2D3748] p-3 rounded-lg shadow-xl">
                    <p className="text-on-surface font-headline-sm capitalize mb-1">{label}</p>
                    <p className="text-white font-bold">
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
                <BarChart 
                    data={data} 
                    layout="vertical" 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" horizontal={true} vertical={false} />
                    <XAxis 
                        type="number" 
                        stroke="#94A3B8" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                    />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#94A3B8" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                        tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2D3748', opacity: 0.4 }} />
                    <Bar 
                        dataKey="value" 
                        radius={[0, 4, 4, 0]}
                        onClick={(data) => onCategoryClick && onCategoryClick(data.name)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name?.toLowerCase()] || CATEGORY_COLORS.other} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendByCategoryChart;
