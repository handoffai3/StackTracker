import React, { useState } from 'react';

interface AlertItem {
    id: string;
    name: string;
    logoUrl?: string;
    logoIcon?: string;
    logoIconColor?: string;
    category: string;
    daysRemaining: number;
    costText: string;
    costType: 'Annual' | 'Monthly';
    ownerName: string;
    ownerAvatar?: string;
    isUrgent: boolean;
}

const RenewalAlerts: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'7days' | '30days' | 'all'>('7days');
    const [alerts, setAlerts] = useState<AlertItem[]>([
        {
            id: 'github',
            name: 'GitHub Enterprise',
            logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoFMIwopn84AVGAh5tQ7lykYMQ9f7deP8vknbgRpdm-MYE-PSHvjAX8OoyiwqRCgG81R9jPTNBxfAWusDHsbPmEqQPF-KVoUEyiI6tPsy1lZQsxVBdeOc5vaaF_VYaaFBZBaZtN-ncGfu_WSZ4bVRwcyCW95mZ7xY0N17BQGlkyOE5YaIyb8_6o_LdIwqu2ngL8TXXkjrRgCeiyIKmdRfwKf_hxLM6eFtyhYpHHd2cu3ZZmzQIq7fflnD5ph2_tCvdj_PXVsxoifk',
            category: 'DevOps & CI/CD',
            daysRemaining: 2,
            costText: '$45,000',
            costType: 'Annual',
            ownerName: 'Sarah Chen',
            ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0uSqn5OxexQcMozHpldmYyPk3fs03QhLCbVGiRZKWfQVXQuNU3a0Bfo5BY2WoUHWy23Q8l4ow8tt9AoYAPoL-z2--60pdjjBfj6oNQMjqgH3X2iiueELQhUf3bK1-l0uMyUQps4DkoZZmsyWoPpuBWSSTYdvy8I34Rup3odrG_t4Xp6JgH5nQNvMLRSo0y2qZzZJM0udko31CWMCz-z_nrpkISsmMWhHHX7cjJsHNB-rF52PFFplCokKDA8RUzUi3llErozsNxgs',
            isUrgent: true
        },
        {
            id: 'aws',
            name: 'AWS Prod Account',
            logoIcon: 'cloud',
            logoIconColor: '#adc6ff',
            category: 'Cloud Infrastructure',
            daysRemaining: 4,
            costText: '$120,500',
            costType: 'Monthly',
            ownerName: 'Marcus Johnson',
            ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdPVdut2OI6ek6hV28URy6TKK_YfuLphIPBsIGMk-JFzQgg4GDTgiItlRNXGJc3Z9h_P-Gs-1Hfqo7i0AtKbcpZYWDdJjuDkMr26OEYwqRMd4MjEKc3lVp17kAegbMOI8KE2xDWeIXXHUkgEk63DeD-15cZ1q27bA3zeZ4K9tIr4Okh27myiCu36uSy39rmD12-4uk76OzsbeAAKos7bJ-KfzY1JwgnnDZ6tbPbH2_JAzPHveJ7mrnsVJDYoBMMcaRkHSWIQZiCJg',
            isUrgent: true
        },
        {
            id: 'figma',
            name: 'Figma Enterprise',
            logoIcon: 'design_services',
            logoIconColor: '#F24E1E',
            category: 'Design Tools',
            daysRemaining: 6,
            costText: '$82,000',
            costType: 'Annual',
            ownerName: 'Elena Rodriguez',
            ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdI2fMCv0cYSxrIpW8F-V6oEgk9iTDwGVANC7VBnlFv5nVcCmxL4StAqhg-rpF7Nut90d2ahI3tyZg1r1R1lUWzbJSWEK9RPej_n-eM3shSf2X6iMgnzGz2e9RzUugsMkTXFqkjHze8TqkP2DSsNgfnqdzqkd-Umy2HrdukTbBmCyOgkmvR08-pc3Npqihuu1Xh46qkep7vIjmM1karxhn0uyicM87t6RT0aqX_wL1jz5XxtDQqRbtasuyn--QasqSP2bLde115y4',
            isUrgent: true
        },
        {
            id: 'slack',
            name: 'Slack Pro',
            logoIcon: 'hub',
            logoIconColor: '#38BDF8',
            category: 'Productivity & Comms',
            daysRemaining: 15,
            costText: '$18,400',
            costType: 'Annual',
            ownerName: 'Alex Mercer',
            isUrgent: false
        },
        {
            id: 'datadog',
            name: 'Datadog observability',
            logoIcon: 'analytics',
            logoIconColor: '#F59E0B',
            category: 'Monitoring & Ops',
            daysRemaining: 24,
            costText: '$149,400',
            costType: 'Annual',
            ownerName: 'Sarah Connor',
            isUrgent: false
        },
        {
            id: 'openai',
            name: 'OpenAI API Suite',
            logoIcon: 'smart_toy',
            logoIconColor: '#34D399',
            category: 'Artificial Intelligence',
            daysRemaining: 45,
            costText: '$148,800',
            costType: 'Annual',
            ownerName: 'Elena Rodriguez',
            isUrgent: false
        }
    ]);

    const handleSnooze = (id: string) => {
        setAlerts(prev =>
            prev.map(alert => {
                if (alert.id === id) {
                    const extraDays = 7;
                    const newDays = alert.daysRemaining + extraDays;
                    return {
                        ...alert,
                        daysRemaining: newDays,
                        isUrgent: newDays <= 7
                    };
                }
                return alert;
            })
        );
    };

    const handleRenew = (id: string) => {
        alert(`Renewal request initiated for ${alerts.find(a => a.id === id)?.name}.`);
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const handleCancel = (id: string) => {
        if (confirm(`Are you sure you want to cancel subscription alerts for ${alerts.find(a => a.id === id)?.name}?`)) {
            setAlerts(prev => prev.filter(a => a.id !== id));
        }
    };

    // Filter alerts based on active tab
    const filteredAlerts = alerts.filter(alert => {
        if (activeTab === '7days') return alert.daysRemaining <= 7;
        if (activeTab === '30days') return alert.daysRemaining > 7 && alert.daysRemaining <= 30;
        return true; // All upcoming
    });

    const count7Days = alerts.filter(a => a.daysRemaining <= 7).length;
    const count30Days = alerts.filter(a => a.daysRemaining > 7 && a.daysRemaining <= 30).length;

    return (
        <div className="flex-1 flex flex-col gap-lg font-body-md text-on-surface">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
                <div>
                    <h2 className="font-display-lg text-display-lg text-on-surface mb-xs">Renewal Alerts</h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">Action required on upcoming SaaS contract renewals.</p>
                </div>
                <div className="flex gap-sm">
                    <button
                        onClick={() => alert('Filter applied')}
                        className="px-md py-2 bg-surface-container-low border border-outline-variant rounded-md text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-sm active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                        Filter
                    </button>
                    <button
                        onClick={() => alert('Alert exports prepared')}
                        className="px-md py-2 bg-surface-container-low border border-outline-variant rounded-md text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-sm active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-md border-b border-outline-variant/50 pb-xs overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('7days')}
                    className={`px-md py-2 font-label-md text-label-md border-b-2 whitespace-nowrap flex items-center gap-sm transition-colors ${
                        activeTab === '7days'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    Expiring in 7 Days
                    <span className="bg-error/20 text-error px-1.5 py-0.5 rounded text-[10px] ml-1 font-bold">{count7Days}</span>
                </button>
                <button
                    onClick={() => setActiveTab('30days')}
                    className={`px-md py-2 font-label-md text-label-md border-b-2 whitespace-nowrap flex items-center gap-sm transition-colors ${
                        activeTab === '30days'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    Expiring in 30 Days
                    <span className="bg-tertiary-container/20 text-tertiary px-1.5 py-0.5 rounded text-[10px] ml-1 font-bold">{count30Days}</span>
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-md py-2 font-label-md text-label-md border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'all'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    All Upcoming
                </button>
            </div>

            {/* Alerts Grid */}
            {filteredAlerts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-md">
                    {filteredAlerts.map(alert => (
                        <div
                            key={alert.id}
                            className={`bg-surface-container-low border-y border-r border-l-[3px] border-y-outline-variant border-r-outline-variant rounded-r-lg p-md flex flex-col gap-md relative overflow-hidden group shadow-md ${
                                alert.isUrgent ? 'border-l-error' : 'border-l-primary'
                            }`}
                        >
                            {/* Decorative background icon */}
                            <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-[120px] text-on-surface-variant">
                                    {alert.logoIcon || 'warning'}
                                </span>
                            </div>

                            <div className="flex justify-between items-start z-10">
                                <div className="flex items-center gap-md">
                                    <div className="w-12 h-12 bg-surface-bright rounded-md flex items-center justify-center border border-outline-variant shrink-0">
                                        {alert.logoUrl ? (
                                            <img alt={`${alert.name} Logo`} className="w-8 h-8 filter invert opacity-80 object-contain" src={alert.logoUrl} />
                                        ) : (
                                            <span
                                                className="material-symbols-outlined text-2xl"
                                                style={{ color: alert.logoIconColor || '#adc6ff' }}
                                            >
                                                {alert.logoIcon || 'layers'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{alert.name}</h3>
                                        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">
                                            {alert.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-md py-md border-y border-outline-variant/30 z-10">
                                <div>
                                    <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Time Remaining</p>
                                    <p className={`font-headline-md text-headline-md flex items-baseline gap-xs font-bold ${
                                        alert.isUrgent ? 'text-error' : 'text-on-surface'
                                    }`}>
                                        {alert.daysRemaining} <span className="text-body-sm font-normal text-on-surface-variant">Days</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="font-label-md text-label-md text-on-surface-variant mb-xs">
                                        {alert.costType === 'Annual' ? 'Annual Cost' : 'Est. Monthly Cost'}
                                    </p>
                                    <p className="font-headline-sm text-headline-sm text-on-surface font-bold">{alert.costText}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between z-10 mt-auto">
                                <div className="flex items-center gap-sm">
                                    {alert.ownerAvatar ? (
                                        <img alt={alert.ownerName} className="w-6 h-6 rounded-full border border-outline-variant object-cover" src={alert.ownerAvatar} />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-surface-container-high border border-outline flex items-center justify-center text-[10px] font-bold text-on-surface">
                                            {alert.ownerName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                    )}
                                    <span className="font-body-md text-body-md text-on-surface-variant text-[12px]">{alert.ownerName} (Owner)</span>
                                </div>
                            </div>

                            <div className="flex gap-sm mt-xs z-10">
                                {alert.id === 'github' ? (
                                    <>
                                        <button
                                            onClick={() => handleRenew(alert.id)}
                                            className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-2 rounded-md hover:bg-primary-container font-semibold transition-colors active:scale-95"
                                        >
                                            Renew
                                        </button>
                                        <button
                                            onClick={() => handleCancel(alert.id)}
                                            className="flex-1 bg-transparent border border-outline-variant text-on-surface font-label-md text-label-md py-2 rounded-md hover:bg-surface-container-high transition-colors active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleSnooze(alert.id)}
                                            className="px-3 bg-surface-bright text-on-surface border border-outline-variant rounded-md hover:bg-surface-container-high transition-colors flex items-center justify-center active:scale-95"
                                            title="Snooze alert by 7 days"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">snooze</span>
                                        </button>
                                    </>
                                ) : alert.id === 'aws' ? (
                                    <>
                                        <button
                                            onClick={() => handleRenew(alert.id)}
                                            className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-2 rounded-md hover:bg-primary-container font-semibold transition-colors active:scale-95"
                                        >
                                            Review Terms
                                        </button>
                                        <button
                                            onClick={() => alert('AWS budget adjustments initialized')}
                                            className="flex-1 bg-transparent border border-outline-variant text-on-surface font-label-md text-label-md py-2 rounded-md hover:bg-surface-container-high transition-colors active:scale-95"
                                        >
                                            Modify
                                        </button>
                                        <button
                                            onClick={() => handleSnooze(alert.id)}
                                            className="px-3 bg-surface-bright text-on-surface border border-outline-variant rounded-md hover:bg-surface-container-high transition-colors flex items-center justify-center active:scale-95"
                                            title="Snooze alert by 7 days"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">snooze</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleRenew(alert.id)}
                                            className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-2 rounded-md hover:bg-primary-container font-semibold transition-colors active:scale-95"
                                        >
                                            Renew (142 Seats)
                                        </button>
                                        <button
                                            onClick={() => alert('Additional configurations loaded')}
                                            className="px-3 bg-surface-bright text-on-surface border border-outline-variant rounded-md hover:bg-surface-container-high transition-colors flex items-center justify-center active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[#161b28] border border-outline-variant rounded-lg p-xl text-center shadow-md">
                    <span className="material-symbols-outlined text-[48px] text-[#4ade80] mb-md">check_circle</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">All Clear!</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                        No upcoming SaaS contract renewals match the selected filter timeframe. All active subscriptions are configured optimally.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RenewalAlerts;
