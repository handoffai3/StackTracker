import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const UtilizationDonutChart = ({ data, loading, totalTools }) => {
    if (loading) {
        return <div className="h-[300px] bg-[#2D3748] animate-pulse rounded-lg" />;
    }

    if (!data || data.length === 0 || totalTools === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center border border-dashed border-[#2D3748] rounded-lg">
                <p className="text-on-surface-variant font-body-md">No utilization data</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#161B28] border border-[#2D3748] p-3 rounded-lg shadow-xl">
                    <p className="text-on-surface font-headline-sm mb-1">{payload[0].name}</p>
                    <p className="text-white font-bold text-[16px]">
                        {payload[0].value} Tool{payload[0].value !== 1 ? 's' : ''}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => <span className="text-on-surface-variant text-[12px]">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                <span className="font-display-lg text-[32px] text-on-surface font-bold leading-none">{totalTools}</span>
                <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Active Tools</span>
            </div>
        </div>
    );
};

export default UtilizationDonutChart;
