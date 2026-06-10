import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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

const SpendDonutChart = ({ data, loading }) => {
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

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#161B28] border border-[#2D3748] p-3 rounded-lg shadow-xl">
                    <p className="text-on-surface font-headline-sm capitalize mb-1">{payload[0].name}</p>
                    <p className="text-[#10B981] font-bold">
                        ${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderLegendText = (value, entry) => {
        return <span className="text-on-surface-variant capitalize ml-1">{value}</span>;
    };

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name?.toLowerCase()] || CATEGORY_COLORS.other} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        formatter={renderLegendText}
                        wrapperStyle={{ paddingLeft: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendDonutChart;
