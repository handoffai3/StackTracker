import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useVendorDetail, VendorDetail as VendorDetailType, ProfileOption } from '../hooks/useVendorDetail';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CS: Record<string,string> = { devops:'bg-blue-900/30 text-blue-400 border-blue-800/50', design:'bg-purple-900/30 text-purple-400 border-purple-800/50', ai:'bg-emerald-900/30 text-emerald-400 border-emerald-800/50', monitoring:'bg-yellow-900/30 text-yellow-400 border-yellow-800/50', communication:'bg-cyan-900/30 text-cyan-400 border-cyan-800/50', security:'bg-red-900/30 text-red-400 border-red-800/50', analytics:'bg-orange-900/30 text-orange-400 border-orange-800/50', other:'bg-gray-800/50 text-gray-400 border-gray-700' };
const SS: Record<string,string> = { active:'bg-green-900/20 text-green-400 border-green-800/30', cancelled:'bg-red-900/20 text-red-400 border-red-800/30', pending:'bg-yellow-900/20 text-yellow-400 border-yellow-800/30', expired:'bg-gray-900/50 text-gray-400 border-gray-800' };
const SD: Record<string,string> = { active:'bg-green-500', cancelled:'bg-red-500', pending:'bg-yellow-500', expired:'bg-gray-500' };
const AA: Record<string,string> = { approved:'bg-green-900/30 text-green-400', rejected:'bg-red-900/30 text-red-400', added:'bg-blue-900/30 text-blue-400', cancelled:'bg-red-900/30 text-red-400', modified:'bg-yellow-900/30 text-yellow-400', renewed:'bg-emerald-900/30 text-emerald-400', removed:'bg-gray-800 text-gray-400', invited:'bg-cyan-900/30 text-cyan-400', noted:'bg-purple-900/30 text-purple-400' };
const fmt = (d:string|null) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
const fmtTime = (d:string) => new Date(d).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const card = "bg-[#161B28] border border-[#2D3748] rounded-xl p-5 shadow-lg";

const CATEGORIES = ['devops','design','ai','monitoring','communication','security','analytics','other'];
const STATUSES = ['active','cancelled','pending','expired'];
const BILLING_CYCLES = ['monthly','annual','quarterly'];

interface EditVendorForm {
    name: string; website_url: string; category: string; monthly_cost: number;
    billing_cycle: string; total_seats: number; renewal_date: string;
    start_date: string; owner_id: string; payment_method: string;
    business_justification: string; status: string;
}

const EditVendorModal: React.FC<{
    vendor: VendorDetailType | null; isOpen: boolean; onClose: () => void;
    onSave: (form: EditVendorForm) => Promise<void>; profiles: ProfileOption[]; saving: boolean;
}> = ({ vendor, isOpen, onClose, onSave, profiles, saving }) => {
    const [form, setForm] = useState<EditVendorForm>({
        name:'', website_url:'', category:'other', monthly_cost:0,
        billing_cycle:'monthly', total_seats:1, renewal_date:'', start_date:'',
        owner_id:'', payment_method:'', business_justification:'', status:'active',
    });

    useEffect(() => {
        if (vendor) {
            setForm({
                name: vendor.name || '',
                website_url: vendor.website_url || '',
                category: vendor.category || 'other',
                monthly_cost: vendor.monthly_cost || 0,
                billing_cycle: vendor.billing_cycle || 'monthly',
                total_seats: vendor.total_seats || 1,
                renewal_date: vendor.renewal_date || '',
                start_date: vendor.start_date || '',
                owner_id: vendor.owner_id || '',
                payment_method: vendor.payment_method || '',
                business_justification: vendor.business_justification || '',
                status: vendor.status || 'active',
            });
        }
    }, [vendor]);

    if (!isOpen || !vendor) return null;
    const set = (k: keyof EditVendorForm, v: any) => setForm(p => ({ ...p, [k]: v }));
    const inp = "w-full bg-[#10131A] border border-[#2D3748] rounded px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors";
    const lbl = "block text-xs text-on-surface-variant uppercase font-semibold mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-[#2D3748]">
                    <h3 className="text-lg font-bold text-on-surface">Edit Vendor Details</h3>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-5 space-y-4">
                    <div><label className={lbl}>Tool Name *</label><input required className={inp} value={form.name} onChange={e => set('name', e.target.value)} /></div>
                    <div><label className={lbl}>Website URL</label><input className={inp} value={form.website_url} onChange={e => set('website_url', e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={lbl}>Category</label><select className={inp} value={form.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div><label className={lbl}>Status</label><select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={lbl}>Monthly Cost *</label><input required type="number" min="0" step="0.01" className={inp} value={form.monthly_cost} onChange={e => set('monthly_cost', e.target.value)} /></div>
                        <div><label className={lbl}>Billing Cycle</label><select className={inp} value={form.billing_cycle} onChange={e => set('billing_cycle', e.target.value)}>{BILLING_CYCLES.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={lbl}>Total Seats</label><input type="number" min="0" className={inp} value={form.total_seats} onChange={e => set('total_seats', e.target.value)} /></div>
                        <div><label className={lbl}>Owner</label><select className={inp} value={form.owner_id} onChange={e => set('owner_id', e.target.value)}><option value="">Select…</option>{profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={lbl}>Renewal Date</label><input type="date" className={inp} value={form.renewal_date} onChange={e => set('renewal_date', e.target.value)} /></div>
                        <div><label className={lbl}>Start Date</label><input type="date" className={inp} value={form.start_date} onChange={e => set('start_date', e.target.value)} /></div>
                    </div>
                    <div><label className={lbl}>Payment Method</label><input className={inp} value={form.payment_method} onChange={e => set('payment_method', e.target.value)} /></div>
                    <div><label className={lbl}>Business Justification</label><textarea rows={3} className={inp} value={form.business_justification} onChange={e => set('business_justification', e.target.value)} /></div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#2D3748] text-on-surface-variant hover:text-on-surface text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors">{saving ? 'Saving…' : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function Countdown({ date }: { date: string|null }) {
    const [countdown, setCountdown] = useState<{ days: number; hours: number; expired: boolean }>({ days: 0, hours: 0, expired: true });
    useEffect(() => {
        const calc = () => {
            if (!date) return { days: 0, hours: 0, expired: true };
            const diff = new Date(date).getTime() - Date.now();
            if (diff <= 0) return { days: 0, hours: 0, expired: true };
            return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), expired: false };
        };
        setCountdown(calc());
        const t = setInterval(() => setCountdown(calc()), 60000);
        return () => clearInterval(t);
    }, [date]);
    if (!date) return <span className="text-on-surface-variant">No date set</span>;
    if (countdown.expired) return (
        <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-red-400 text-3xl">error</span>
            <span className="text-red-400 font-bold text-lg">EXPIRED</span>
            <span className="text-red-400/70 text-xs">Action Required</span>
        </div>
    );
    const color = countdown.days <= 7 ? 'text-red-400' : countdown.days <= 30 ? 'text-yellow-400' : 'text-on-surface';
    return <span className={`font-bold text-2xl ${color}`}>{countdown.days}d {countdown.hours}h</span>;
}

/* ── Negotiate Terms Modal ─────────────────────────── */
const NegotiateModal: React.FC<{
    vendor: VendorDetailType; isOpen: boolean; onClose: () => void;
    onSubmit: (cost: number, seats: number, notes: string) => Promise<void>; saving: boolean;
}> = ({ vendor, isOpen, onClose, onSubmit, saving }) => {
    const [desiredCost, setDesiredCost] = useState(0);
    const [desiredSeats, setDesiredSeats] = useState(1);
    const [notes, setNotes] = useState('');
    useEffect(() => {
        if (vendor && isOpen) {
            setDesiredCost(vendor.monthly_cost || 0);
            setDesiredSeats(vendor.total_seats || 1);
            setNotes('');
        }
    }, [vendor, isOpen]);
    if (!isOpen) return null;
    const inp = "w-full bg-[#10131A] border border-[#2D3748] rounded px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors";
    const lbl = "block text-xs text-on-surface-variant uppercase font-semibold mb-1";
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-[#2D3748]">
                    <h3 className="text-lg font-bold text-on-surface">Negotiate Terms — {vendor.name}</h3>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={e => { e.preventDefault(); onSubmit(desiredCost, desiredSeats, notes); }} className="p-5 space-y-4">
                    <div><label className={lbl}>Desired Monthly Cost ($)</label><input type="number" min="0" step="0.01" className={inp} value={desiredCost} onChange={e => setDesiredCost(Number(e.target.value))} /></div>
                    <div><label className={lbl}>Desired Seats</label><input type="number" min="1" className={inp} value={desiredSeats} onChange={e => setDesiredSeats(Number(e.target.value))} /></div>
                    <div><label className={lbl}>Notes for Negotiation</label><textarea rows={4} className={inp} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Request 20% discount for annual commitment..." /></div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#2D3748] text-on-surface-variant hover:text-on-surface text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors">{saving ? 'Saving…' : 'Save Notes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── Cancel Confirm Dialog ─────────────────────────── */
const CancelConfirmDialog: React.FC<{
    vendorName: string; isOpen: boolean; onCancel: () => void;
    onConfirm: () => Promise<void>; confirming: boolean;
}> = ({ vendorName, isOpen, onCancel, onConfirm, confirming }) => {
    const [typed, setTyped] = useState('');
    useEffect(() => { if (isOpen) setTyped(''); }, [isOpen]);
    if (!isOpen) return null;
    const canConfirm = typed === 'CANCEL';
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onCancel}>
            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl w-full max-w-sm shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <span className="material-symbols-outlined text-red-400 text-4xl mb-3 block text-center">warning</span>
                <h3 className="text-on-surface font-bold text-lg mb-2 text-center">Cancel {vendorName}?</h3>
                <p className="text-on-surface-variant text-sm mb-4 text-center leading-relaxed">This will mark the subscription as cancelled. Team members will lose access. This action can be reversed by editing the vendor status.</p>
                <div className="mb-4">
                    <label className="block text-xs text-on-surface-variant uppercase font-semibold mb-1">Type CANCEL to confirm</label>
                    <input value={typed} onChange={e => setTyped(e.target.value)} className="w-full bg-[#10131A] border border-[#2D3748] rounded px-3 py-2 text-sm text-on-surface focus:border-red-500 focus:outline-none transition-colors" placeholder="CANCEL" autoFocus />
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-[#2D3748] text-on-surface-variant hover:text-on-surface text-sm">Keep Subscription</button>
                    <button onClick={onConfirm} disabled={!canConfirm || confirming} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-40 transition-colors">{confirming ? 'Cancelling…' : 'Cancel It'}</button>
                </div>
            </div>
        </div>
    );
};

/* ── Renew Confirm Dialog ──────────────────────────── */
const RenewConfirmDialog: React.FC<{
    vendorName: string; isOpen: boolean; onCancel: () => void;
    onConfirm: () => Promise<void>; confirming: boolean;
}> = ({ vendorName, isOpen, onCancel, onConfirm, confirming }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onCancel}>
            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl w-full max-w-sm shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <span className="material-symbols-outlined text-blue-400 text-4xl mb-3 block text-center">autorenew</span>
                <h3 className="text-on-surface font-bold text-lg mb-2 text-center">Renew {vendorName}?</h3>
                <p className="text-on-surface-variant text-sm mb-5 text-center leading-relaxed">This will extend the subscription by 1 year from the current renewal date.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-[#2D3748] text-on-surface-variant hover:text-on-surface text-sm">Not Now</button>
                    <button onClick={onConfirm} disabled={confirming} className="px-5 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors">{confirming ? 'Renewing…' : 'Confirm Renewal'}</button>
                </div>
            </div>
        </div>
    );
};

function Toast({ msg, onClose }: { msg:string|null; onClose:()=>void }) {
    useEffect(()=>{ if(msg){const t=setTimeout(onClose,4000);return()=>clearTimeout(t)} },[msg,onClose]);
    if (!msg) return null;
    return <div className="fixed bottom-6 right-6 z-50 bg-[#1D2027] border border-[#2D3748] rounded-lg px-5 py-3 shadow-2xl flex items-center gap-3"><span className="material-symbols-outlined text-primary">info</span><span className="text-on-surface text-sm">{msg}</span><button onClick={onClose} className="text-on-surface-variant hover:text-on-surface ml-2"><span className="material-symbols-outlined text-lg">close</span></button></div>;
}

const VendorDetail: React.FC = () => {
    const { id } = useParams<{id:string}>();
    const navigate = useNavigate();
    const { profile, company } = useAuthStore();
    const d = useVendorDetail(id);
    const [tab, setTab] = useState(0);
    const [noteText, setNoteText] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [addSeatOpen, setAddSeatOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<VendorDetailType | null>(null);
    const [editSaving, setEditSaving] = useState(false);
    // Renewal Decision state
    const [showRenewConfirm, setShowRenewConfirm] = useState(false);
    const [renewing, setRenewing] = useState(false);
    const [showNegotiate, setShowNegotiate] = useState(false);
    const [negotiateSaving, setNegotiateSaving] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const tabs = ['Overview','Seats & Usage','Cost History','Activity'];

    const costChange = useMemo(() => {
        if (d.costHistory.length < 2) return null;
        const cur = d.costHistory[d.costHistory.length-1].monthly_cost;
        const prev = d.costHistory[d.costHistory.length-2].monthly_cost;
        if (!prev) return null;
        const pct = ((cur-prev)/prev*100).toFixed(1);
        return { pct, up: cur >= prev };
    }, [d.costHistory]);

    const chartData = useMemo(() => d.costHistory.map(c => ({ date: new Date(c.recorded_at).toLocaleDateString('en-US',{month:'short',year:'2-digit'}), cost: Number(c.monthly_cost) })), [d.costHistory]);
    const miniChart = chartData.slice(-6);

    const assignedIds = new Set(d.seats.map(s => (s as any).user_id || s.user?.email));
    const availableProfiles = d.companyProfiles.filter(p => !d.seats.some(s => s.user?.full_name === p.full_name));

    if (d.isLoading) return <div className="flex-1 flex flex-col gap-5 animate-pulse"><div className="h-8 w-48 bg-[#1D2027] rounded"/><div className="h-40 bg-[#1D2027] rounded-xl"/><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-24 bg-[#1D2027] rounded-xl"/>)}</div><div className="h-96 bg-[#1D2027] rounded-xl"/></div>;
    if (d.notFound || !d.vendor) return <div className="flex-1 flex items-center justify-center flex-col gap-4"><span className="material-symbols-outlined text-6xl text-on-surface-variant">search_off</span><h2 className="text-xl text-on-surface font-bold">Vendor Not Found</h2><Link to="/vendor-directory" className="text-primary hover:underline text-sm">← Back to Directory</Link></div>;

    const v = d.vendor;

    return (
        <div className="flex-1 flex flex-col gap-5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Link to="/vendor-directory" className="hover:text-primary transition-colors">Vendor Directory</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-on-surface font-semibold">{v.name}</span>
            </div>

            {/* Hero */}
            <div className={`${card} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                    {v.logo_url ? <img src={v.logo_url} className="w-14 h-14 rounded-xl object-cover" alt=""/> : <div className="w-14 h-14 rounded-xl bg-[#1d2027] border border-[#2D3748] flex items-center justify-center text-primary text-2xl font-bold">{v.name[0]}</div>}
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-on-surface">{v.name}</h1>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${CS[v.category]||CS.other}`}>{v.category}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${SS[v.status]||SS.expired}`}><span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${SD[v.status]||SD.expired}`}/>{v.status}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-on-surface-variant flex-wrap">
                            <span className="text-green-400 font-bold text-xl">${Number(v.monthly_cost).toLocaleString()}/mo</span>
                            <span>Renews {fmt(v.renewal_date)}</span>
                            <span className="flex items-center gap-1">{v.owner?.avatar_url ? <img src={v.owner.avatar_url} className="w-4 h-4 rounded-full"/> : <span className="w-4 h-4 rounded-full bg-[#1d2027] border border-[#2D3748] text-[8px] flex items-center justify-center font-bold text-on-surface">{(v.owner?.full_name||'?')[0]}</span>}{v.owner?.full_name||'Unassigned'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {v.website_url && <a href={v.website_url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border border-[#2D3748] text-on-surface-variant hover:text-on-surface text-sm flex items-center gap-1.5"><span className="material-symbols-outlined text-base">open_in_new</span>Go to App</a>}
                    <button onClick={() => setEditingVendor(v)} className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-semibold flex items-center gap-1.5"><span className="material-symbols-outlined text-base">edit</span>Edit Details</button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={card}><p className="text-xs text-on-surface-variant uppercase mb-1">Monthly Cost</p><p className="text-xl font-bold text-on-surface">${Number(v.monthly_cost).toLocaleString()}</p>{costChange && <p className={`text-xs mt-1 ${costChange.up?'text-red-400':'text-green-400'}`}>{costChange.up?'↑':'↓'} {costChange.pct}% vs last</p>}</div>
                <div className={card}><p className="text-xs text-on-surface-variant uppercase mb-1">Active Seats</p><p className="text-xl font-bold text-on-surface">{v.used_seats}<span className="text-on-surface-variant text-sm font-normal">/{v.total_seats}</span></p><div className="w-full bg-[#10131A] rounded-full h-1.5 mt-2"><div className="bg-primary rounded-full h-1.5" style={{width:`${v.total_seats?Math.min(100,v.used_seats/v.total_seats*100):0}%`}}/></div></div>
                <div className={card}><p className="text-xs text-on-surface-variant uppercase mb-1">Next Renewal</p><p className="text-xl font-bold text-on-surface">{fmt(v.renewal_date)}</p></div>
                <div className={card}><p className="text-xs text-on-surface-variant uppercase mb-1">Internal Owner</p><p className="text-lg font-bold text-on-surface">{v.owner?.full_name||'Unassigned'}</p></div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-[#2D3748]">
                {tabs.map((t,i)=><button key={t} onClick={()=>setTab(i)} className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${tab===i?'text-primary':'text-on-surface-variant hover:text-on-surface'}`}>{t}{tab===i&&<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t"/>}</button>)}
            </div>

            {/* Tab Content */}
            {tab === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 flex flex-col gap-5">
                        {/* Contract Info */}
                        <div className={card}><h3 className="text-on-surface font-bold mb-4">Contract Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-on-surface-variant block text-xs uppercase mb-1">Billing Cycle</span><span className="text-on-surface capitalize">{v.billing_cycle}</span></div>
                                <div><span className="text-on-surface-variant block text-xs uppercase mb-1">Payment Method</span><span className="text-on-surface">{v.payment_method||'—'}</span></div>
                                <div><span className="text-on-surface-variant block text-xs uppercase mb-1">Approved By</span><span className="text-on-surface">{v.approved_by_profile?.full_name||'—'}</span></div>
                                <div><span className="text-on-surface-variant block text-xs uppercase mb-1">Approval Date</span><span className="text-on-surface">{fmt(v.approval_date)}</span></div>
                            </div>
                        </div>
                        {/* Justification */}
                        {v.business_justification && <div className={card}><h3 className="text-on-surface font-bold mb-3">Business Justification</h3><p className="text-on-surface-variant text-sm leading-relaxed">{v.business_justification}</p></div>}
                        {/* Documents */}
                        <div className={card}><div className="flex items-center justify-between mb-3"><h3 className="text-on-surface font-bold">Documents</h3><button className="text-primary text-xs font-semibold hover:underline">Upload</button></div>
                            {d.documents.length?d.documents.map(doc=><div key={doc.id} className="flex items-center justify-between py-2 border-t border-[#2D3748] first:border-t-0"><div className="flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-primary text-base">description</span><a href={doc.url} target="_blank" rel="noreferrer" className="text-on-surface hover:text-primary">{doc.name}</a></div><span className="text-on-surface-variant text-xs">{doc.uploaded_by?.full_name}</span></div>):<p className="text-on-surface-variant text-sm">No documents uploaded.</p>}
                        </div>
                        {/* Notes */}
                        <div className={card}><div className="flex items-center justify-between mb-3"><h3 className="text-on-surface font-bold">Admin Notes</h3><button onClick={()=>setShowNoteInput(!showNoteInput)} className="text-primary text-xs font-semibold hover:underline">{showNoteInput?'Cancel':'Add Note'}</button></div>
                            {showNoteInput && <div className="mb-4"><textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3} className="w-full bg-[#10131A] border border-[#2D3748] rounded px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none mb-2" placeholder="Write a note…"/><button onClick={async()=>{if(!noteText.trim())return;await d.addNote(noteText);setNoteText('');setShowNoteInput(false)}} className="bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded">Save Note</button></div>}
                            {d.notes.length?d.notes.map(n=><div key={n.id} className="py-3 border-t border-[#2D3748] first:border-t-0"><div className="flex items-center gap-2 mb-1"><span className="text-on-surface text-sm font-semibold">{n.author?.full_name||'Unknown'}</span><span className="text-on-surface-variant text-xs">{fmtTime(n.created_at)}</span></div><p className="text-on-surface-variant text-sm">{n.content}</p></div>):<p className="text-on-surface-variant text-sm">No notes yet.</p>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-5">
                        {/* Renewal Decision */}
                        <div className={card}><h3 className="text-on-surface font-bold mb-3">Renewal Decision</h3>
                            <div className="text-center py-4"><p className="text-xs text-on-surface-variant uppercase mb-1">Time Remaining</p><Countdown date={v.renewal_date}/></div>
                            <div className="flex flex-col gap-2 mt-4">
                                <button onClick={() => setShowRenewConfirm(true)} className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"><span className="material-symbols-outlined text-base">autorenew</span>Renew Subscription</button>
                                <button onClick={() => setShowNegotiate(true)} className="w-full border border-[#2D3748] text-on-surface-variant hover:text-on-surface text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"><span className="material-symbols-outlined text-base">handshake</span>Negotiate Terms</button>
                                <button onClick={() => setShowCancelConfirm(true)} className="text-red-400 hover:text-red-300 text-xs mt-2 text-center flex items-center justify-center gap-1"><span className="material-symbols-outlined text-sm">cancel</span>Cancel Subscription</button>
                            </div>
                        </div>
                        {/* Mini Cost Chart */}
                        {miniChart.length > 1 && <div className={card}><h3 className="text-on-surface font-bold mb-3">Cost Trend</h3>
                            <ResponsiveContainer width="100%" height={150}><LineChart data={miniChart}><CartesianGrid strokeDasharray="3 3" stroke="#2D3748"/><XAxis dataKey="date" tick={{fontSize:10,fill:'#94A3B8'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#94A3B8'}} axisLine={false} tickLine={false} width={40}/><Tooltip contentStyle={{background:'#161B28',border:'1px solid #2D3748',borderRadius:8,fontSize:12}} labelStyle={{color:'#94A3B8'}}/><Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2} dot={{r:3,fill:'#3B82F6'}}/></LineChart></ResponsiveContainer>
                        </div>}
                    </div>
                </div>
            )}

            {tab === 1 && (
                <div className="flex flex-col gap-5">
                    <div className={card}><div className="flex items-center justify-between mb-4"><h3 className="text-on-surface font-bold">Seat Utilization</h3><span className="text-on-surface-variant text-sm">{v.used_seats} / {v.total_seats} seats</span></div><div className="w-full bg-[#10131A] rounded-full h-3"><div className="bg-primary rounded-full h-3 transition-all" style={{width:`${v.total_seats?Math.min(100,v.used_seats/v.total_seats*100):0}%`}}/></div></div>
                    <div className={card}>
                        <div className="flex items-center justify-between mb-4"><h3 className="text-on-surface font-bold">Assigned Members</h3>
                            <div className="relative"><button onClick={()=>setAddSeatOpen(!addSeatOpen)} className="bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"><span className="material-symbols-outlined text-sm">person_add</span>Add Member</button>
                                {addSeatOpen && <div className="absolute right-0 mt-1 w-56 bg-[#1D2027] border border-[#2D3748] rounded-lg shadow-2xl z-30 max-h-48 overflow-y-auto">{availableProfiles.length?availableProfiles.map(p=><button key={p.id} onClick={async()=>{await d.assignSeat(p.id);setAddSeatOpen(false)}} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-[#252a38] flex items-center gap-2">{p.full_name}</button>):<p className="px-4 py-3 text-on-surface-variant text-xs">No available members</p>}</div>}
                            </div>
                        </div>
                        <table className="w-full text-sm"><thead><tr className="border-b border-[#2D3748] text-xs text-[#94A3B8] uppercase"><th className="text-left py-2 px-3">Name</th><th className="text-left py-2 px-3">Email</th><th className="text-left py-2 px-3">Assigned By</th><th className="text-left py-2 px-3">Date</th><th className="text-right py-2 px-3">Action</th></tr></thead>
                            <tbody className="divide-y divide-[#2D3748]">{d.seats.length?d.seats.map(s=><tr key={s.id} className="hover:bg-[#1a2030]"><td className="py-2.5 px-3 text-on-surface font-medium">{s.user?.full_name||'—'}</td><td className="py-2.5 px-3 text-on-surface-variant">{s.user?.email||'—'}</td><td className="py-2.5 px-3 text-on-surface-variant">{s.assigned_by?.full_name||'—'}</td><td className="py-2.5 px-3 text-on-surface-variant">{fmt(s.assigned_at)}</td><td className="py-2.5 px-3 text-right"><button onClick={()=>d.removeSeat(s.id)} className="text-red-400 hover:text-red-300 text-xs">Remove</button></td></tr>):<tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">No seats assigned</td></tr>}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 2 && (
                <div className="flex flex-col gap-5">
                    {chartData.length > 1 && <div className={card}><h3 className="text-on-surface font-bold mb-4">Cost Over Time</h3>
                        <ResponsiveContainer width="100%" height={280}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#2D3748"/><XAxis dataKey="date" tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false} width={50}/><Tooltip contentStyle={{background:'#161B28',border:'1px solid #2D3748',borderRadius:8}} labelStyle={{color:'#94A3B8'}}/><Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2} dot={{r:4,fill:'#3B82F6'}}/></LineChart></ResponsiveContainer>
                    </div>}
                    <div className={card}><h3 className="text-on-surface font-bold mb-4">Cost Records</h3>
                        <table className="w-full text-sm"><thead><tr className="border-b border-[#2D3748] text-xs text-[#94A3B8] uppercase"><th className="text-left py-2 px-3">Date</th><th className="text-right py-2 px-3">Cost</th><th className="text-left py-2 px-3">Recorded By</th></tr></thead>
                            <tbody className="divide-y divide-[#2D3748]">{d.costHistory.length?[...d.costHistory].reverse().map(c=><tr key={c.id} className="hover:bg-[#1a2030]"><td className="py-2.5 px-3 text-on-surface">{fmtTime(c.recorded_at)}</td><td className="py-2.5 px-3 text-right text-on-surface font-mono">${Number(c.monthly_cost).toLocaleString()}</td><td className="py-2.5 px-3 text-on-surface-variant">{c.recorded_by?.full_name||'—'}</td></tr>):<tr><td colSpan={3} className="py-8 text-center text-on-surface-variant">No cost records</td></tr>}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 3 && (
                <div className={card}>
                    <h3 className="text-on-surface font-bold mb-4">Activity Timeline</h3>
                    {d.auditLogs.length ? <div className="relative pl-6 border-l-2 border-[#2D3748] space-y-6">
                        {d.auditLogs.map(log => (
                            <div key={log.id} className="relative">
                                <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-[#1D2027] border-2 border-[#2D3748]"/>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-on-surface text-sm font-semibold">{log.actor?.full_name||'System'}</span>
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${AA[log.action]||'bg-gray-800 text-gray-400'}`}>{log.action}</span>
                                            <span className="text-on-surface-variant text-sm">{log.entity_name}</span>
                                        </div>
                                        {log.metadata && <p className="text-on-surface-variant text-xs">{JSON.stringify(log.metadata)}</p>}
                                    </div>
                                    <span className="text-on-surface-variant text-xs whitespace-nowrap ml-4">{fmtTime(log.created_at)}</span>
                                </div>
                            </div>
                        ))}
                    </div> : <p className="text-on-surface-variant text-sm text-center py-8">No activity recorded yet.</p>}
                </div>
            )}

            <EditVendorModal
                vendor={editingVendor}
                isOpen={!!editingVendor}
                onClose={() => setEditingVendor(null)}
                onSave={async (form) => {
                    if (!editingVendor) return;
                    setEditSaving(true);
                    try {
                        const { error } = await supabase
                            .from('vendors')
                            .update({
                                ...form,
                                monthly_cost: Number(form.monthly_cost),
                                total_seats: Number(form.total_seats),
                                renewal_date: form.renewal_date || null,
                                start_date: form.start_date || null,
                                owner_id: form.owner_id || null,
                            })
                            .eq('id', editingVendor.id);
                        if (error) throw error;
                        d.setToast('Vendor updated successfully');
                        setEditingVendor(null);
                        d.fetchVendor();
                    } catch (err: any) {
                        d.setToast(err.message || 'Failed to update vendor');
                    } finally {
                        setEditSaving(false);
                    }
                }}
                profiles={d.companyProfiles}
                saving={editSaving}
            />

            {/* Renew Confirmation */}
            <RenewConfirmDialog
                vendorName={v.name}
                isOpen={showRenewConfirm}
                onCancel={() => setShowRenewConfirm(false)}
                onConfirm={async () => {
                    setRenewing(true);
                    try {
                        await d.renewVendor();
                        setShowRenewConfirm(false);
                    } finally { setRenewing(false); }
                }}
                confirming={renewing}
            />

            {/* Negotiate Terms Modal */}
            {d.vendor && <NegotiateModal
                vendor={d.vendor}
                isOpen={showNegotiate}
                onClose={() => setShowNegotiate(false)}
                onSubmit={async (cost, seats, notes) => {
                    if (!profile || !company) return;
                    setNegotiateSaving(true);
                    try {
                        const content = `NEGOTIATION NOTE:\nTarget Cost: $${cost}/mo\nTarget Seats: ${seats}\nNotes: ${notes}`;
                        const { error: noteErr } = await supabase.from('vendor_notes').insert({
                            vendor_id: v.id, content, author_id: profile.id,
                        });
                        if (noteErr) throw noteErr;
                        await supabase.from('audit_logs').insert({
                            company_id: company.id, actor_id: profile.id,
                            action: 'modified', entity_type: 'vendor',
                            entity_id: v.id, entity_name: v.name,
                            metadata: { type: 'negotiation', desired_cost: cost, desired_seats: seats },
                        });
                        d.setToast('Negotiation notes saved');
                        setShowNegotiate(false);
                        d.fetchNotes(); d.fetchAudit();
                    } catch (err: any) {
                        d.setToast(err.message || 'Failed to save negotiation notes');
                    } finally { setNegotiateSaving(false); }
                }}
                saving={negotiateSaving}
            />}

            {/* Cancel Confirm Dialog */}
            <CancelConfirmDialog
                vendorName={v.name}
                isOpen={showCancelConfirm}
                onCancel={() => setShowCancelConfirm(false)}
                onConfirm={async () => {
                    setCancelling(true);
                    try {
                        await d.cancelVendor();
                        setShowCancelConfirm(false);
                        navigate('/vendor-directory');
                    } finally { setCancelling(false); }
                }}
                confirming={cancelling}
            />

            <Toast msg={d.toast} onClose={()=>d.setToast(null)}/>
        </div>
    );
};

export default VendorDetail;
