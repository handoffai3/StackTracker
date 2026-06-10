import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ScriptableContext
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ChurnItem {
    id: string;
    month: string;
    added: { name: string; letter: string }[];
    cancelled: { name: string; letter: string }[];
    netChange: number;
    impact: string;
    isPositive: boolean;
}

const SpendAnalytics: React.FC = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState<'12m' | '6m' | 'ytd'>('12m');
    const [showExportToast, setShowExportToast] = useState(false);

    // Initial mock statistics and charts datasets
    const stats = useMemo(() => {
        if (timeRange === '6m') {
            return {
                annualSpend: '$622K',
                avgMonthly: '$103.7K',
                spendChange: '+8.2%',
                changeIsPositive: false,
                avgChange: '-1.4%',
                avgIsPositive: true,
            };
        } else if (timeRange === 'ytd') {
            return {
                annualSpend: '$835K',
                avgMonthly: '$104.4K',
                spendChange: '+10.8%',
                changeIsPositive: false,
                avgChange: '-1.8%',
                avgIsPositive: true,
            };
        }
        return {
            annualSpend: '$1.24M',
            avgMonthly: '$103.5K',
            spendChange: '+12.4%',
            changeIsPositive: false,
            avgChange: '-2.1%',
            avgIsPositive: true,
        };
    }, [timeRange]);

    // Monthly expenditure data
    const monthlyLabels = {
        '12m': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        '6m': ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        'ytd': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    };

    const monthlyValues = {
        '12m': [85000, 88000, 92000, 89000, 95000, 98000, 102000, 105000, 110000, 108000, 115000, 120000],
        '6m': [102000, 105000, 110000, 108000, 115000, 120000],
        'ytd': [85000, 88000, 92000, 89000, 95000, 98000, 102000, 105000, 110000]
    };

    const lineChartData = {
        labels: monthlyLabels[timeRange],
        datasets: [
            {
                label: 'Actual Spend ($)',
                data: monthlyValues[timeRange],
                borderColor: '#4d8eff', // primary-container
                borderWidth: 2,
                pointBackgroundColor: '#10131a', // background
                pointBorderColor: '#4d8eff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4,
                backgroundColor: (context: ScriptableContext<'line'>) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
                    gradient.addColorStop(0, 'rgba(77, 142, 255, 0.4)');
                    gradient.addColorStop(1, 'rgba(77, 142, 255, 0.0)');
                    return gradient;
                }
            }
        ]
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1d2027',
                titleColor: '#e1e2ec',
                bodyColor: '#e1e2ec',
                borderColor: '#424754',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: function (context: any) {
                        return '$' + context.parsed.y.toLocaleString();
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#2d3748',
                },
                ticks: {
                    color: '#c2c6d6',
                    font: { family: 'Inter' },
                    callback: function (value: any) {
                        return '$' + (value / 1000) + 'k';
                    }
                }
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: '#c2c6d6',
                    font: { family: 'Inter' }
                }
            }
        }
    };

    // Category Breakdown Donut Chart
    const donutData = {
        labels: ['DevOps', 'AI/ML', 'Monitoring', 'Design'],
        datasets: [
            {
                data: [45, 25, 20, 10],
                backgroundColor: [
                    '#4d8eff', // primary-container
                    '#df7412', // tertiary-container
                    '#32353c', // surface-variant
                    '#c0c1ff'  // secondary
                ],
                borderColor: '#161b28', // card bg to act as separator
                borderWidth: 2,
                hoverOffset: 4
            }
        ]
    };

    const donutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1d2027',
                borderColor: '#424754',
                borderWidth: 1,
                callbacks: {
                    label: function (context: any) {
                        return context.label + ': ' + context.parsed + '%';
                    }
                }
            }
        }
    };

    // Top 5 Tools Bar Chart (Horizontal)
    const barData = {
        labels: ['AWS', 'Datadog', 'OpenAI', 'GCP', 'GitHub'],
        datasets: [
            {
                label: 'Spend YTD ($)',
                data: [542400, 125000, 85000, 62000, 48000],
                backgroundColor: '#adc6ff', // primary
                borderRadius: 4,
                barPercentage: 0.6
            }
        ]
    };

    const barOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1d2027',
                borderColor: '#424754',
                borderWidth: 1,
                callbacks: {
                    label: function (context: any) {
                        return '$' + context.parsed.x.toLocaleString();
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: '#2d3748',
                },
                ticks: {
                    color: '#c2c6d6',
                    font: { family: 'Inter' },
                    callback: function (value: any) {
                        return '$' + (value / 1000) + 'k';
                    }
                }
            },
            y: {
                grid: { display: false },
                ticks: {
                    color: '#c2c6d6',
                    font: { family: 'Inter' }
                }
            }
        }
    };

    const churnHistory: ChurnItem[] = [
        {
            id: 'ch1',
            month: 'Dec 2023',
            added: [
                { name: 'Figma', letter: 'F' },
                { name: 'Vercel', letter: 'V' }
            ],
            cancelled: [],
            netChange: 2,
            impact: '+$1,200/mo',
            isPositive: false
        },
        {
            id: 'ch2',
            month: 'Nov 2023',
            added: [],
            cancelled: [{ name: 'Zoom', letter: 'Z' }],
            netChange: -1,
            impact: '-$850/mo',
            isPositive: true
        },
        {
            id: 'ch3',
            month: 'Oct 2023',
            added: [{ name: 'Datadog', letter: 'D' }],
            cancelled: [{ name: 'New Relic', letter: 'N' }],
            netChange: 0,
            impact: '+$400/mo',
            isPositive: false
        },
        {
            id: 'ch4',
            month: 'Sep 2023',
            added: [{ name: 'OpenAI API', letter: 'O' }],
            cancelled: [],
            netChange: 1,
            impact: '+$5,000/mo',
            isPositive: false
        }
    ];

    const triggerExport = () => {
        setShowExportToast(true);
        setTimeout(() => setShowExportToast(false), 3000);
    };

    const toggleTimeRange = () => {
        const order: ('12m' | '6m' | 'ytd')[] = ['12m', '6m', 'ytd'];
        const currentIdx = order.indexOf(timeRange);
        const nextRange = order[(currentIdx + 1) % order.length];
        setTimeRange(nextRange);
    };

    const getRangeLabel = () => {
        if (timeRange === '12m') return 'Last 12 Months';
        if (timeRange === '6m') return 'Last 6 Months';
        return 'Year to Date';
    };

    return (
        <div className="flex-1 flex flex-col gap-lg font-body-md text-on-surface">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
                <div>
                    <h1 className="font-display-lg text-display-lg text-on-surface font-bold">Spend Analytics</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">Comprehensive overview of engineering tool expenditures.</p>
                </div>
                <div className="flex gap-sm">
                    <button
                        onClick={toggleTimeRange}
                        className="px-md py-[6px] bg-surface-container-low border border-[#2D3748] text-on-surface font-label-md rounded-md hover:bg-surface-container-high transition-colors flex items-center gap-xs uppercase font-semibold active:scale-95 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">calendar_month</span> 
                        {getRangeLabel()}
                    </button>
                    <button
                        onClick={triggerExport}
                        className="px-md py-[6px] bg-primary text-on-primary font-label-md rounded-md hover:bg-primary-container transition-colors flex items-center gap-xs uppercase font-semibold active:scale-95 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">download</span> 
                        Export Report
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            {showExportToast && (
                <div className="fixed bottom-gutter right-gutter bg-[#191C24] border border-[#2D3748] text-on-surface p-md rounded-xl shadow-2xl flex items-center gap-md z-50 animate-bounce">
                    <span className="material-symbols-outlined text-[#10B981]">check_circle</span>
                    <div>
                        <p className="font-body-md text-sm font-semibold">Report successfully generated</p>
                        <p className="text-xs text-on-surface-variant">Downloading CSV file to your directory.</p>
                    </div>
                </div>
            )}

            {/* Top Row: Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                
                {/* Stat Card 1 */}
                <div className="bg-[#161b28] border border-[#2d3748] rounded-lg p-md flex flex-col relative overflow-hidden group hover:border-[#424754] transition-colors shadow-md">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs tracking-wider font-semibold">Total Annual Spend</span>
                    <div className="flex items-baseline gap-sm mb-md">
                        <span className="font-display-lg text-display-lg text-on-surface font-bold">{stats.annualSpend}</span>
                        <span className={`font-label-md text-label-md flex items-center px-1.5 py-0.5 rounded-md font-bold ${
                            stats.changeIsPositive ? 'bg-[#4ade80]/10 text-[#4ade80]' : 'bg-error-container/20 text-error'
                        }`}>
                            <span className="material-symbols-outlined text-[14px]">
                                {stats.changeIsPositive ? 'trending_down' : 'trending_up'}
                            </span>
                            {stats.spendChange}
                        </span>
                    </div>
                    <div className="h-10 w-full mt-auto relative">
                        <div className="w-full h-full flex items-end gap-[2px] opacity-60">
                            <div className="w-full bg-primary/20 h-[30%] rounded-t-sm"></div>
                            <div className="w-full bg-primary/30 h-[40%] rounded-t-sm"></div>
                            <div className="w-full bg-primary/40 h-[35%] rounded-t-sm"></div>
                            <div className="w-full bg-primary/50 h-[50%] rounded-t-sm"></div>
                            <div className="w-full bg-primary/40 h-[45%] rounded-t-sm"></div>
                            <div className="w-full bg-primary/60 h-[70%] rounded-t-sm"></div>
                            <div className="w-full bg-primary/80 h-[65%] rounded-t-sm"></div>
                            <div className="w-full bg-error/80 h-[85%] rounded-t-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-[#161b28] border border-[#2d3748] rounded-lg p-md flex flex-col relative overflow-hidden group hover:border-[#424754] transition-colors shadow-md">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs tracking-wider font-semibold">Average Monthly Spend</span>
                    <div className="flex items-baseline gap-sm mb-md">
                        <span className="font-display-lg text-display-lg text-on-surface font-bold">{stats.avgMonthly}</span>
                        <span className={`font-label-md text-label-md flex items-center px-1.5 py-0.5 rounded-md font-bold ${
                            stats.avgIsPositive ? 'bg-[#4ade80]/10 text-[#4ade80]' : 'bg-error-container/20 text-error'
                        }`}>
                            <span className="material-symbols-outlined text-[14px]">
                                {stats.avgIsPositive ? 'trending_down' : 'trending_up'}
                            </span>
                            {stats.avgChange}
                        </span>
                    </div>
                    <div className="h-10 w-full mt-auto relative">
                        <div className="w-full h-full flex items-end gap-[2px] opacity-60">
                            <div className="w-full bg-[#4ade80]/60 h-[80%] rounded-t-sm"></div>
                            <div className="w-full bg-[#4ade80]/50 h-[75%] rounded-t-sm"></div>
                            <div className="w-full bg-[#4ade80]/40 h-[65%] rounded-t-sm"></div>
                            <div className="w-full bg-[#4ade80]/30 h-[70%] rounded-t-sm"></div>
                            <div className="w-full bg-[#4ade80]/40 h-[60%] rounded-t-sm"></div>
                            <div className="w-full bg-[#4ade80]/50 h-[50%] rounded-t-sm"></div>
                            <div className="w-full bg-[#4ade80]/60 h-[40%] rounded-t-sm"></div>
                            <div className="w-full bg-[#4ade80]/80 h-[35%] rounded-t-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-[#161b28] border border-[#2d3748] rounded-lg p-md flex flex-col relative overflow-hidden group hover:border-[#424754] transition-colors shadow-md">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs tracking-wider font-semibold">Most Expensive Tool</span>
                    <div className="flex items-center gap-sm mt-xs mb-md">
                        <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center p-1 border border-outline-variant shrink-0">
                            <span className="font-bold text-[#ff9900] text-sm">AWS</span>
                        </div>
                        <div>
                            <div className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">Amazon Web Services</div>
                            <div className="font-body-md text-body-md text-on-surface-variant mt-0.5">$45,200 / mo</div>
                        </div>
                    </div>
                    <div className="mt-auto pt-sm border-t border-[#2d3748] flex justify-between items-center text-label-md font-semibold">
                        <span className="text-on-surface-variant uppercase tracking-wider text-[11px]">Category: Cloud Infra</span>
                        <button
                            onClick={() => navigate('/vendor-directory/aws')}
                            className="text-primary hover:text-[#adc6ff] transition-colors flex items-center gap-xs cursor-pointer"
                        >
                            View Details 
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Middle: Main Line Chart */}
            <div className="bg-[#161b28] border border-[#2d3748] rounded-lg p-md flex flex-col h-[400px] shadow-md">
                <div className="flex justify-between items-center mb-md">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Monthly Expenditure Trend</h2>
                    <div className="flex items-center gap-sm text-label-md text-on-surface-variant uppercase font-semibold">
                        <span className="flex items-center gap-xs"><div className="w-2.5 h-2.5 rounded-full bg-[#4d8eff]"></div> Actual Spend</span>
                    </div>
                </div>
                <div className="flex-1 relative w-full h-full">
                    <Line data={lineChartData} options={lineChartOptions} />
                </div>
            </div>

            {/* Bottom: Donut Chart & Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
                
                {/* Donut Chart: Category Breakdown */}
                <div className="bg-[#161b28] border border-[#2d3748] rounded-lg p-md flex flex-col h-[350px] relative shadow-md">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md font-bold">Spend by Category</h2>
                    <div className="flex-1 flex items-center justify-between w-full h-full pr-[140px] pl-md">
                        <div className="w-[180px] h-[180px]">
                            <Doughnut data={donutData} options={donutOptions} />
                        </div>
                        {/* Custom Legend */}
                        <div className="flex flex-col gap-sm">
                            <div className="flex items-center gap-sm text-body-md text-on-surface font-semibold">
                                <div className="w-3.5 h-3.5 rounded bg-[#4d8eff]"></div> DevOps (45%)
                            </div>
                            <div className="flex items-center gap-sm text-body-md text-on-surface font-semibold">
                                <div className="w-3.5 h-3.5 rounded bg-[#df7412]"></div> AI/ML (25%)
                            </div>
                            <div className="flex items-center gap-sm text-body-md text-on-surface font-semibold">
                                <div className="w-3.5 h-3.5 rounded bg-[#32353c] border border-outline"></div> Monitoring (20%)
                            </div>
                            <div className="flex items-center gap-sm text-body-md text-on-surface font-semibold">
                                <div className="w-3.5 h-3.5 rounded bg-[#c0c1ff]"></div> Design (10%)
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bar Chart: Top 5 Tools */}
                <div className="bg-[#161b28] border border-[#2d3748] rounded-lg p-md flex flex-col h-[350px] shadow-md">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md font-bold">Top 5 Tools (YTD)</h2>
                    <div className="flex-1 relative w-full h-full">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* Foot: Table */}
            <div className="bg-[#161b28] border border-[#2d3748] rounded-lg overflow-hidden flex flex-col mb-xl shadow-md">
                <div className="p-md border-b border-[#2d3748] flex justify-between items-center bg-[#191b23]">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Tool Churn (Added vs Cancelled)</h2>
                    <button
                        onClick={() => alert('Full history loaded')}
                        className="text-primary hover:text-[#adc6ff] transition-colors font-label-md uppercase font-semibold cursor-pointer"
                    >
                        View Full History
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#2d3748] bg-surface-container-low text-on-surface-variant font-label-md uppercase tracking-wider font-semibold">
                                <th className="py-3 px-md font-semibold">Month</th>
                                <th className="py-3 px-md font-semibold">Tools Added</th>
                                <th className="py-3 px-md font-semibold">Tools Cancelled</th>
                                <th className="py-3 px-md font-semibold">Net Change</th>
                                <th className="py-3 px-md font-semibold text-right">Est. Impact</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-on-surface divide-y divide-[#2d3748]/55">
                            {churnHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-surface-container-high/50 transition-colors">
                                    <td className="py-3 px-md font-semibold">{item.month}</td>
                                    <td className="py-3 px-md">
                                        {item.added.length > 0 ? (
                                            <div className="flex items-center gap-xs">
                                                {item.added.map((add, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="w-6 h-6 rounded-sm bg-surface-container flex items-center justify-center text-xs border border-outline-variant font-bold text-primary"
                                                        title={add.name}
                                                    >
                                                        {add.letter}
                                                    </span>
                                                ))}
                                                <span className="text-xs text-on-surface-variant ml-xs">
                                                    {item.added.map(a => a.name).join(', ')}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-on-surface-variant">-</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-md">
                                        {item.cancelled.length > 0 ? (
                                            <div className="flex items-center gap-xs">
                                                {item.cancelled.map((cancel, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="w-6 h-6 rounded-sm bg-surface-container flex items-center justify-center text-xs border border-outline-variant font-bold text-error"
                                                        title={cancel.name}
                                                    >
                                                        {cancel.letter}
                                                    </span>
                                                ))}
                                                <span className="text-xs text-on-surface-variant ml-xs">
                                                    {item.cancelled.map(c => c.name).join(', ')}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-on-surface-variant">-</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-md">
                                        {item.netChange > 0 ? (
                                            <span className="text-[#4ade80] font-bold">+{item.netChange}</span>
                                        ) : item.netChange < 0 ? (
                                            <span className="text-error font-bold">{item.netChange}</span>
                                        ) : (
                                            <span className="text-on-surface-variant font-medium">0</span>
                                        )}
                                    </td>
                                    <td className={`py-3 px-md text-right font-bold ${item.isPositive ? 'text-[#4ade80]' : 'text-error'}`}>
                                        {item.impact}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SpendAnalytics;
