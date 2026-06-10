import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendors, Vendor, VendorFormData, ProfileOption } from '../hooks/useVendors';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['all','devops','design','ai','monitoring','communication','security','analytics','other'];
const STATUSES = ['all','active','cancelled','pending','expired'];
const BILLING_CYCLES = ['monthly','annual','quarterly'];

const CAT_STYLES: Record<string,string> = {
    devops: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
    design: 'bg-purple-900/30 text-purple-400 border-purple-800/50',
    ai: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50',
    monitoring: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
    communication: 'bg-cyan-900/30 text-cyan-400 border-cyan-800/50',
    security: 'bg-red-900/30 text-red-400 border-red-800/50',
    analytics: 'bg-orange-900/30 text-orange-400 border-orange-800/50',
    other: 'bg-gray-800/50 text-gray-400 border-gray-700',
};

const STATUS_STYLES: Record<string,string> = {
    active: 'bg-green-900/20 text-green-400 border-green-800/30',
    cancelled: 'bg-red-900/20 text-red-400 border-red-800/30',
    pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-800/30',
    expired: 'bg-gray-900/50 text-gray-400 border-gray-800',
};
const STATUS_DOTS: Record<string,string> = {
    active:'bg-green-500', cancelled:'bg-red-500', pending:'bg-yellow-500', expired:'bg-gray-500',
};

function formatDate(d: string|null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}
function isWithin30Days(d: string|null): boolean {
    if (!d) return false;
    const diff = new Date(d).getTime() - Date.now();
    return diff > 0 && diff < 30*86400000;
}

const emptyForm: VendorFormData = {
    name:'', website_url:'', category:'devops', monthly_cost:0,
    billing_cycle:'monthly', total_seats:1, renewal_date:'', start_date:'',
    owner_id:'', payment_method:'', business_justification:'', status:'active',
};

/* ── Modal ─────────────────────────────────────────── */
const AddEditModal: React.FC<{
    isOpen:boolean; onClose:()=>void; onSubmit:(f:VendorFormData)=>void;
    profiles:ProfileOption[]; initial?:VendorFormData; title:string; saving:boolean;
}> = ({isOpen,onClose,onSubmit,profiles: unusedProfiles,initial,title,saving}) => {
    const { company } = useAuthStore();
    const [profiles, setProfiles] = useState<ProfileOption[]>([]);
    const [form,setForm] = useState<VendorFormData>(initial||emptyForm);

    useEffect(() => {
        if (isOpen && company?.id) {
            const fetchProfiles = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .eq('company_id', company.id);
                setProfiles((data || []) as ProfileOption[]);
            };
            fetchProfiles();
        }
    }, [isOpen, company?.id]);

    useEffect(()=>{setForm(initial||emptyForm)},[initial,isOpen]);
    if (!isOpen) return null;
    const set = (k:keyof VendorFormData,v:any)=>setForm(p=>({...p,[k]:v}));
    const inp = "w-full bg-[#10131A] border border-[#2D3748] rounded px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors";
    const lbl = "block text-xs text-on-surface-variant uppercase font-semibold mb-1";
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-[#2D3748]">
                    <h3 className="text-lg font-bold text-on-surface">{title}</h3>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={e=>{e.preventDefault();onSubmit(form)}} className="p-5 space-y-4">
                    <div><label className={lbl}>Tool Name *</label><input required className={inp} value={form.name} onChange={e=>set('name',e.target.value)}/></div>
                    <div><label className={lbl}>Website URL</label><input className={inp} value={form.website_url} onChange={e=>set('website_url',e.target.value)}/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={lbl}>Category</label><select className={inp} value={form.category} onChange={e=>set('category',e.target.value)}>{CATEGORIES.filter(c=>c!=='all').map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                        <div><label className={lbl}>Status</label><select className={inp} value={form.status} onChange={e=>set('status',e.target.value)}>{STATUSES.filter(s=>s!=='all').map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={lbl}>Monthly Cost *</label><input required type="number" min="0" step="0.01" className={inp} value={form.monthly_cost} onChange={e=>set('monthly_cost',e.target.value)}/></div>
                        <div><label className={lbl}>Billing Cycle</label><select className={inp} value={form.billing_cycle} onChange={e=>set('billing_cycle',e.target.value)}>{BILLING_CYCLES.map(b=><option key={b} value={b}>{b}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={lbl}>Total Seats</label><input type="number" min="0" className={inp} value={form.total_seats} onChange={e=>set('total_seats',e.target.value)}/></div>
                        <div><label className={lbl}>Owner</label><select className={inp} value={form.owner_id} onChange={e=>set('owner_id',e.target.value)}><option value="">Select…</option>{profiles.map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={lbl}>Renewal Date</label><input type="date" className={inp} value={form.renewal_date} onChange={e=>set('renewal_date',e.target.value)}/></div>
                        <div><label className={lbl}>Start Date</label><input type="date" className={inp} value={form.start_date} onChange={e=>set('start_date',e.target.value)}/></div>
                    </div>
                    <div><label className={lbl}>Payment Method</label><input className={inp} value={form.payment_method} onChange={e=>set('payment_method',e.target.value)}/></div>
                    <div><label className={lbl}>Business Justification</label><textarea rows={3} className={inp} value={form.business_justification} onChange={e=>set('business_justification',e.target.value)}/></div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#2D3748] text-on-surface-variant hover:text-on-surface text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors">{saving?'Saving…':'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── Confirm Dialog ───────────────────────────────── */
const ConfirmDialog: React.FC<{isOpen:boolean;onCancel:()=>void;onConfirm:()=>void;name:string}> = ({isOpen,onCancel,onConfirm,name}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={e=>e.stopPropagation()}>
                <span className="material-symbols-outlined text-error text-4xl mb-3 block">warning</span>
                <h3 className="text-on-surface font-bold text-lg mb-2">Cancel Subscription?</h3>
                <p className="text-on-surface-variant text-sm mb-5">Are you sure you want to cancel <strong className="text-on-surface">{name}</strong>? This action can be reversed later.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-[#2D3748] text-on-surface-variant text-sm hover:text-on-surface">Keep</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">Cancel It</button>
                </div>
            </div>
        </div>
    );
};

/* ── Toast ────────────────────────────────────────── */
const Toast: React.FC<{message:string|null;onDismiss:()=>void}> = ({message,onDismiss}) => {
    useEffect(()=>{if(message){const t=setTimeout(onDismiss,4000);return ()=>clearTimeout(t)}},[message,onDismiss]);
    if (!message) return null;
    return (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D2027] border border-[#2D3748] rounded-lg px-5 py-3 shadow-2xl flex items-center gap-3 animate-[slideUp_0.3s_ease-out]">
            <span className="material-symbols-outlined text-primary text-xl">info</span>
            <span className="text-on-surface text-sm">{message}</span>
            <button onClick={onDismiss} className="text-on-surface-variant hover:text-on-surface ml-2"><span className="material-symbols-outlined text-lg">close</span></button>
        </div>
    );
};

/* ── Skeleton Rows ────────────────────────────────── */
const SkeletonRows = () => (
    <>{[...Array(5)].map((_,i)=>(
        <tr key={i} className="border-b border-[#2D3748]">
            {[...Array(8)].map((_,j)=>(
                <td key={j} className="px-4 py-3"><div className="h-4 bg-[#1D2027] rounded animate-pulse" style={{width: j===0?'60%':'40%'}}/></td>
            ))}
        </tr>
    ))}</>
);

/* ── Main Component ───────────────────────────────── */
const VendorDirectory: React.FC = () => {
    const navigate = useNavigate();
    const { profile } = useAuthStore();
    const { vendors, profiles: teamProfiles, isLoading, totalMonthlySpend, activeCount, addVendor, updateVendor, cancelVendor, toastMessage, dismissToast } = useVendors();

    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortCol, setSortCol] = useState<string>('created_at');
    const [sortAsc, setSortAsc] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editVendor, setEditVendor] = useState<Vendor|null>(null);
    const [confirmVendor, setConfirmVendor] = useState<Vendor|null>(null);
    const [saving, setSaving] = useState(false);

    const isAdmin = profile?.role === 'admin' || profile?.role === 'manager';

    const filtered = useMemo(() => {
        let list = vendors.filter(v => {
            const q = search.toLowerCase();
            const matchSearch = !q || v.name.toLowerCase().includes(q) || (v.owner?.full_name||'').toLowerCase().includes(q);
            const matchCat = catFilter === 'all' || v.category === catFilter;
            const matchStatus = statusFilter === 'all' || v.status === statusFilter;
            return matchSearch && matchCat && matchStatus;
        });
        list.sort((a:any,b:any) => {
            let va = a[sortCol], vb = b[sortCol];
            if (sortCol === 'owner') { va = a.owner?.full_name||''; vb = b.owner?.full_name||''; }
            if (typeof va === 'number') return sortAsc ? va-vb : vb-va;
            return sortAsc ? String(va||'').localeCompare(String(vb||'')) : String(vb||'').localeCompare(String(va||''));
        });
        return list;
    }, [vendors, search, catFilter, statusFilter, sortCol, sortAsc]);

    const toggleSort = (col:string) => { if(sortCol===col){setSortAsc(!sortAsc)}else{setSortCol(col);setSortAsc(true)} };
    const sortIcon = (col:string) => sortCol===col ? (sortAsc?'arrow_upward':'arrow_downward') : 'unfold_more';

    const openAdd = () => { setEditVendor(null); setModalOpen(true); };
    const openEdit = (v:Vendor) => {
        setEditVendor(v);
        setModalOpen(true);
    };

    const handleSubmit = async (form: VendorFormData) => {
        setSaving(true);
        try {
            if (editVendor) { await updateVendor(editVendor.id, form); }
            else { await addVendor(form); }
            setModalOpen(false);
        } catch {} finally { setSaving(false); }
    };

    const handleCancel = async () => {
        if (!confirmVendor) return;
        await cancelVendor(confirmVendor.id);
        setConfirmVendor(null);
    };

    const editFormData = editVendor ? {
        name: editVendor.name,
        website_url: editVendor.website_url||'',
        category: editVendor.category,
        monthly_cost: editVendor.monthly_cost,
        billing_cycle: editVendor.billing_cycle,
        total_seats: editVendor.total_seats,
        renewal_date: editVendor.renewal_date||'',
        start_date: editVendor.start_date||'',
        owner_id: editVendor.owner_id||'',
        payment_method: editVendor.payment_method||'',
        business_justification: editVendor.business_justification||'',
        status: editVendor.status,
    } as VendorFormData : undefined;

    const thCls = "px-4 py-3 font-semibold text-xs text-[#94A3B8] uppercase tracking-wider cursor-pointer hover:text-on-surface select-none whitespace-nowrap";

    return (
        <div className="flex-1 flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-on-surface">Vendor Directory</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Manage software subscriptions, track renewals, and audit seat utilization.</p>
                </div>
                <div className="flex flex-col md:items-end gap-3">
                    <div className="bg-[#161B28] border border-[#2D3748] rounded-xl p-4 flex items-center gap-6 shadow-lg">
                        <div>
                            <p className="text-xs text-on-surface-variant uppercase tracking-wider">Total Active Spend / Mo</p>
                            <p className="text-xl text-primary font-bold mt-0.5">${totalMonthlySpend.toLocaleString('en-US',{minimumFractionDigits:0})}</p>
                        </div>
                        <div className="h-10 w-px bg-[#2D3748]"/>
                        <div>
                            <p className="text-xs text-on-surface-variant uppercase tracking-wider">Active Tools</p>
                            <p className="text-xl text-on-surface font-bold mt-0.5">{activeCount}</p>
                        </div>
                    </div>
                    {isAdmin && (
                        <button onClick={openAdd} className="bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors active:scale-95">
                            <span className="material-symbols-outlined text-lg">add</span>Add New Tool
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center justify-between bg-[#161B28] p-3 rounded-lg border border-[#2D3748]">
                <div className="flex flex-wrap gap-2">
                    <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="bg-[#10131A] border border-[#2D3748] text-on-surface text-xs px-3 py-1.5 rounded-full focus:border-primary focus:outline-none">
                        {CATEGORIES.map(c=><option key={c} value={c}>{c==='all'?'All Categories':c}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="bg-[#10131A] border border-[#2D3748] text-on-surface text-xs px-3 py-1.5 rounded-full focus:border-primary focus:outline-none">
                        {STATUSES.map(s=><option key={s} value={s}>{s==='all'?'All Statuses':s}</option>)}
                    </select>
                </div>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tools…"
                        className="w-48 bg-[#10131A] border border-[#2D3748] focus:border-primary focus:outline-none rounded-full pl-9 pr-4 py-1.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:w-64"/>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#161B28] rounded-xl border border-[#2D3748] overflow-hidden flex-1 flex flex-col shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#11141B] border-b border-[#2D3748]">
                                <th className={thCls} onClick={()=>toggleSort('name')}>Tool Name <span className="material-symbols-outlined text-xs align-middle ml-1">{sortIcon('name')}</span></th>
                                <th className={thCls} onClick={()=>toggleSort('category')}>Category <span className="material-symbols-outlined text-xs align-middle ml-1">{sortIcon('category')}</span></th>
                                <th className={thCls} onClick={()=>toggleSort('owner')}>Owner <span className="material-symbols-outlined text-xs align-middle ml-1">{sortIcon('owner')}</span></th>
                                <th className={`${thCls} text-right`} onClick={()=>toggleSort('monthly_cost')}>Monthly Cost <span className="material-symbols-outlined text-xs align-middle ml-1">{sortIcon('monthly_cost')}</span></th>
                                <th className={thCls} onClick={()=>toggleSort('renewal_date')}>Renewal Date <span className="material-symbols-outlined text-xs align-middle ml-1">{sortIcon('renewal_date')}</span></th>
                                <th className={`${thCls} text-right`}>Seats</th>
                                <th className={thCls}>Status</th>
                                <th className={`${thCls} text-right`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[#2D3748]">
                            {isLoading ? <SkeletonRows/> : filtered.length > 0 ? filtered.map(v => {
                                const isCancelled = v.status === 'cancelled';
                                const soon = isWithin30Days(v.renewal_date);
                                return (
                                    <tr key={v.id} className={`hover:bg-[#1a2030] transition-colors group ${isCancelled?'opacity-55':''}`}>
                                        <td onClick={()=>navigate(`/vendor-directory/${v.id}`)} className="px-4 py-3 font-semibold text-on-surface hover:text-primary cursor-pointer flex items-center gap-2">
                                            {v.logo_url ? <img src={v.logo_url} className="w-7 h-7 rounded object-cover" alt=""/> : <div className="w-7 h-7 rounded bg-[#1d2027] border border-[#2D3748] flex items-center justify-center text-primary text-xs font-bold">{v.name[0]}</div>}
                                            <span className={isCancelled?'line-through':''}>{v.name}</span>
                                        </td>
                                        <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${CAT_STYLES[v.category]||CAT_STYLES.other}`}>{v.category}</span></td>
                                        <td className="px-4 py-3 text-on-surface-variant flex items-center gap-1.5">
                                            {v.owner?.avatar_url ? <img src={v.owner.avatar_url} className="w-5 h-5 rounded-full object-cover" alt=""/> : <div className="w-5 h-5 rounded-full bg-[#1d2027] border border-[#2D3748] flex items-center justify-center text-[9px] font-bold text-on-surface">{(v.owner?.full_name||'?')[0]}</div>}
                                            {v.owner?.full_name||'Unassigned'}
                                        </td>
                                        <td className={`px-4 py-3 text-right font-mono ${isCancelled?'line-through text-on-surface-variant':'text-on-surface'}`}>${Number(v.monthly_cost).toLocaleString('en-US')}</td>
                                        <td className="px-4 py-3">{soon && !isCancelled ? <span className="text-yellow-400 flex items-center gap-1 font-semibold"><span className="material-symbols-outlined text-sm">warning</span>{formatDate(v.renewal_date)}</span> : <span className="text-on-surface-variant">{formatDate(v.renewal_date)}</span>}</td>
                                        <td className="px-4 py-3 text-right font-mono text-on-surface">{v.used_seats}/{v.total_seats}</td>
                                        <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${STATUS_STYLES[v.status]||STATUS_STYLES.expired}`}><span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS_DOTS[v.status]||STATUS_DOTS.expired}`}/>{v.status}</span></td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={e=>{e.stopPropagation();openEdit(v)}} className="text-on-surface-variant hover:text-primary px-1" title="Edit"><span className="material-symbols-outlined text-lg">edit</span></button>
                                            {v.status!=='cancelled' && <button onClick={e=>{e.stopPropagation();setConfirmVendor(v)}} className="text-on-surface-variant hover:text-red-400 px-1" title="Cancel"><span className="material-symbols-outlined text-lg">cancel</span></button>}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={8} className="px-4 py-16 text-center">
                                    <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3 block">inventory_2</span>
                                    <h3 className="text-on-surface font-bold text-lg mb-1">No tools found</h3>
                                    <p className="text-on-surface-variant text-sm mb-4">Get started by adding your first vendor subscription.</p>
                                    {isAdmin && <button onClick={openAdd} className="bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg inline-flex items-center gap-2"><span className="material-symbols-outlined text-lg">add</span>Add Tool</button>}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-[#11141B] border-t border-[#2D3748] px-4 py-2 flex items-center justify-between mt-auto">
                    <span className="text-on-surface-variant text-sm">Showing {filtered.length} of {vendors.length} entries</span>
                </div>
            </div>

            {/* Modals & Toast */}
            <AddEditModal isOpen={modalOpen} onClose={()=>setModalOpen(false)} onSubmit={handleSubmit} profiles={teamProfiles} initial={editFormData} title={editVendor?'Edit Vendor':'Add New Tool'} saving={saving}/>
            <ConfirmDialog isOpen={!!confirmVendor} onCancel={()=>setConfirmVendor(null)} onConfirm={handleCancel} name={confirmVendor?.name||''}/>
            <Toast message={toastMessage} onDismiss={dismissToast}/>
        </div>
    );
};

export default VendorDirectory;
