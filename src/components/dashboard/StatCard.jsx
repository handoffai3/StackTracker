import React from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, colorClass, bgClass, borderClass, linkTo, loading }) => {
    const content = (
        <div className={`bg-[#161B28] border ${borderClass || 'border-[#2D3748]'} rounded-xl p-md flex items-center gap-md h-full transition-all hover:bg-surface-container-high`}>
            <div className={`w-12 h-12 rounded-lg ${bgClass || 'bg-surface-container-highest'} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[24px] ${colorClass || 'text-on-surface-variant'}`}>
                    {icon}
                </span>
            </div>
            <div>
                <p className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-xs">
                    {title}
                </p>
                {loading ? (
                    <div className="h-8 bg-[#2D3748] rounded w-24 animate-pulse" />
                ) : (
                    <p className={`font-display-lg text-[28px] font-bold ${colorClass || 'text-on-surface'}`}>
                        {value}
                    </p>
                )}
            </div>
        </div>
    );

    if (linkTo) {
        return <Link to={linkTo} className="block h-full">{content}</Link>;
    }
    
    return content;
};

export default StatCard;
