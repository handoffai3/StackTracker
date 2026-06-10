import React, { useState } from 'react';

interface RequestTicket {
    id: string;
    toolName: string;
    category: string;
    cost: number;
    seats: number;
    requester: string;
    date: string;
    justification: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    notes?: string;
}

const ApprovalQueue: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Pending' | 'History'>('Pending');
    const [actioningId, setActioningId] = useState<string | null>(null);

    const initialTickets: RequestTicket[] = [
        {
            id: 'req1',
            toolName: 'OpenAI API Team Access',
            category: 'Development',
            cost: 150.00,
            seats: 5,
            requester: 'S. Connor',
            date: 'Jun 04, 2026',
            justification: 'Required for building AI-based auto-tagging feature in core ingestion module.',
            status: 'Pending',
        },
        {
            id: 'req2',
            toolName: 'Sentry Performance Tier',
            category: 'Hosting',
            cost: 99.00,
            seats: 10,
            requester: 'J. Doe',
            date: 'Jun 05, 2026',
            justification: 'Performance profiling needed to diagnose FastAPI backend database hangs.',
            status: 'Pending',
        },
        {
            id: 'req3',
            toolName: 'Lucidchart Enterprise',
            category: 'Design',
            cost: 120.00,
            seats: 4,
            requester: 'M. Smith',
            date: 'May 28, 2026',
            justification: 'Designing entity relationship diagrams and microservice communication flows.',
            status: 'Approved',
            notes: 'Approved. Standard team diagram tool.',
        },
        {
            id: 'req4',
            toolName: 'Postman Professional',
            category: 'Development',
            cost: 160.00,
            seats: 8,
            requester: 'A. Mercer',
            date: 'May 24, 2026',
            justification: 'API workspace sharing, team mocks, and endpoints testing collections.',
            status: 'Rejected',
            notes: 'Rejected. Please use Bruno or alternative free collaborative API tooling.',
        },
    ];

    const [tickets, setTickets] = useState<RequestTicket[]>(initialTickets);

    const handleAction = (id: string, action: 'Approved' | 'Rejected', notes?: string) => {
        setActioningId(id);
        // Simulate delay
        setTimeout(() => {
            setTickets(prev =>
                prev.map(t =>
                    t.id === id ? { ...t, status: action, notes: notes || `${action} by Admin` } : t
                )
            );
            setActioningId(null);
        }, 800);
    };

    const pendingTickets = tickets.filter(t => t.status === 'Pending');
    const historyTickets = tickets.filter(t => t.status !== 'Pending');

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Approval Queue</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Review and manage incoming software requests and upgrade allocations.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2D3748] mb-lg">
                <button
                    onClick={() => setActiveTab('Pending')}
                    className={`px-md py-sm font-headline-sm text-body-md font-semibold border-b-2 transition-colors duration-200 flex items-center gap-xs ${
                        activeTab === 'Pending'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    Pending Requests
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'Pending' ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {pendingTickets.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('History')}
                    className={`px-md py-sm font-headline-sm text-body-md font-semibold border-b-2 transition-colors duration-200 flex items-center gap-xs ${
                        activeTab === 'History'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    History
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-bold">
                        {historyTickets.length}
                    </span>
                </button>
            </div>

            {/* List */}
            {activeTab === 'Pending' ? (
                pendingTickets.length > 0 ? (
                    <div className="space-y-md">
                        {pendingTickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className={`bg-[#161B28] border border-[#2D3748] rounded-xl p-md transition-all duration-300 relative overflow-hidden ${
                                    actioningId === ticket.id ? 'opacity-50 scale-[0.98]' : 'hover:border-[#3B82F6]'
                                }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-md mb-md">
                                    <div>
                                        <div className="flex items-center gap-sm mb-xs">
                                            <h3 className="font-headline-sm text-[18px] text-on-surface font-bold">{ticket.toolName}</h3>
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-[#1F2937] text-on-surface-variant font-bold border border-[#2D3748]">
                                                {ticket.category}
                                            </span>
                                        </div>
                                        <p className="font-body-md text-body-md text-on-surface-variant">
                                            Requested by <span className="text-on-surface font-semibold">{ticket.requester}</span> on {ticket.date}
                                        </p>
                                    </div>
                                    <div className="flex items-baseline gap-sm">
                                        <div className="text-right">
                                            <p className="font-display-lg text-[22px] font-bold text-on-surface">${ticket.cost}</p>
                                            <p className="font-label-md text-label-md text-on-surface-variant">/month for {ticket.seats} seats</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#10131A] border border-[#2D3748] rounded-lg p-sm font-body-md text-body-md text-on-surface-variant mb-md">
                                    <strong className="text-on-surface block text-[11px] font-bold uppercase tracking-wider mb-xs">Justification</strong>
                                    {ticket.justification}
                                </div>

                                <div className="flex items-center justify-end gap-md">
                                    <button
                                        disabled={actioningId !== null}
                                        onClick={() => handleAction(ticket.id, 'Rejected')}
                                        className="px-md py-sm border border-error-container/40 hover:bg-error-container/10 text-error hover:text-white rounded-lg font-body-md text-body-md transition-colors active:scale-95 flex items-center gap-xs"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                        Reject
                                    </button>
                                    <button
                                        disabled={actioningId !== null}
                                        onClick={() => handleAction(ticket.id, 'Approved')}
                                        className="bg-[#10B981] hover:bg-[#059669] text-white font-body-md text-body-md px-md py-sm rounded-lg flex items-center gap-xs transition-colors active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-xl text-center">
                        <span className="material-symbols-outlined text-[48px] text-[#10B981] mb-md">verified_user</span>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">All Caught Up!</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
                            No requests are currently pending approval. Nice job!
                        </p>
                    </div>
                )
            ) : (
                historyTickets.length > 0 ? (
                    <div className="space-y-md">
                        {historyTickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="bg-[#161B28] border border-[#2D3748] rounded-xl p-md"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-md mb-md">
                                    <div>
                                        <div className="flex items-center gap-sm mb-xs">
                                            <h3 className="font-headline-sm text-[16px] text-on-surface font-bold">{ticket.toolName}</h3>
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-[#1F2937] text-on-surface-variant font-bold border border-[#2D3748]">
                                                {ticket.category}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-xs px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                                    ticket.status === 'Approved'
                                                        ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                                                        : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                                                }`}
                                            >
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p className="font-body-md text-body-md text-on-surface-variant">
                                            Requested by <span className="text-on-surface font-semibold">{ticket.requester}</span> on {ticket.date}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-headline-sm text-[18px] font-bold text-on-surface">${ticket.cost}</p>
                                        <p className="font-label-md text-label-md text-on-surface-variant">/month for {ticket.seats} seats</p>
                                    </div>
                                </div>

                                <div className="text-body-md text-on-surface-variant">
                                    <p className="mb-xs"><strong>Justification:</strong> {ticket.justification}</p>
                                    <p className={`mt-sm text-[12px] flex items-center gap-xs ${ticket.status === 'Approved' ? 'text-[#10B981]' : 'text-error'}`}>
                                        <span className="material-symbols-outlined text-[16px]">
                                            {ticket.status === 'Approved' ? 'check_circle' : 'cancel'}
                                        </span>
                                        <strong>Notes:</strong> {ticket.notes}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-xl text-center">
                        <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-md">history</span>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">No History</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
                            No requests have been approved or rejected yet.
                        </p>
                    </div>
                )
            )}
        </div>
    );
};

export default ApprovalQueue;
