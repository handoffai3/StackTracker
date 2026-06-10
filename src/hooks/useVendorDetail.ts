import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export interface VendorDetail {
    id: string; company_id: string; name: string; description: string | null;
    logo_url: string | null; website_url: string | null; category: string;
    status: string; monthly_cost: number; billing_cycle: string;
    payment_method: string | null; total_seats: number; used_seats: number;
    renewal_date: string | null; start_date: string | null;
    owner_id: string | null; approved_by: string | null;
    approval_date: string | null; business_justification: string | null;
    created_at: string;
    owner: { id: string; full_name: string; avatar_url: string | null } | null;
    approved_by_profile: { full_name: string } | null;
}
export interface VendorDocument { id: string; name: string; url: string; created_at: string; uploaded_by: { full_name: string } | null; }
export interface VendorNote { id: string; content: string; created_at: string; author: { full_name: string; avatar_url: string | null } | null; }
export interface CostRecord { id: string; monthly_cost: number; recorded_at: string; recorded_by: { full_name: string } | null; }
export interface SeatAssignment { id: string; assigned_at: string; user: { full_name: string; email: string; avatar_url: string | null } | null; assigned_by: { full_name: string } | null; }
export interface AuditEntry { id: string; action: string; entity_type: string; entity_name: string; metadata: any; created_at: string; actor_id: string; actor: { full_name: string; avatar_url: string | null } | null; }
export interface ProfileOption { id: string; full_name: string; avatar_url: string | null; }

export function useVendorDetail(vendorId: string | undefined) {
    const { company, profile } = useAuthStore();
    const [vendor, setVendor] = useState<VendorDetail | null>(null);
    const [documents, setDocuments] = useState<VendorDocument[]>([]);
    const [notes, setNotes] = useState<VendorNote[]>([]);
    const [costHistory, setCostHistory] = useState<CostRecord[]>([]);
    const [seats, setSeats] = useState<SeatAssignment[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [companyProfiles, setCompanyProfiles] = useState<ProfileOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const fetchVendor = useCallback(async () => {
        if (!vendorId) return;
        try {
            const { data, error } = await supabase.from('vendors')
                .select('*, owner:profiles!owner_id(id, full_name, avatar_url), approved_by_profile:profiles!approved_by(full_name)')
                .eq('id', vendorId).single();
            if (error) { setNotFound(true); throw error; }
            setVendor(data as VendorDetail);
        } catch (e: any) { if (!notFound) setToast(e.message); }
    }, [vendorId]);

    const fetchDocs = useCallback(async () => {
        if (!vendorId) return;
        const { data } = await supabase.from('vendor_documents').select('*, uploaded_by:profiles(full_name)').eq('vendor_id', vendorId);
        setDocuments((data || []) as VendorDocument[]);
    }, [vendorId]);

    const fetchNotes = useCallback(async () => {
        if (!vendorId) return;
        const { data } = await supabase.from('vendor_notes').select('*, author:profiles(full_name, avatar_url)').eq('vendor_id', vendorId).order('created_at', { ascending: false });
        setNotes((data || []) as VendorNote[]);
    }, [vendorId]);

    const fetchCostHistory = useCallback(async () => {
        if (!vendorId) return;
        const { data } = await supabase.from('vendor_cost_history').select('*, recorded_by:profiles(full_name)').eq('vendor_id', vendorId).order('recorded_at', { ascending: true });
        setCostHistory((data || []) as CostRecord[]);
    }, [vendorId]);

    const fetchSeats = useCallback(async () => {
        if (!vendorId) return;
        const { data } = await supabase.from('seat_assignments').select('*, user:profiles!user_id(full_name, email, avatar_url), assigned_by:profiles!assigned_by(full_name)').eq('vendor_id', vendorId);
        setSeats((data || []) as SeatAssignment[]);
    }, [vendorId]);

    const fetchAudit = useCallback(async () => {
        if (!vendorId) return;
        const { data } = await supabase.from('audit_logs').select('*, actor:profiles!actor_id(full_name, avatar_url)').eq('entity_id', vendorId).order('created_at', { ascending: false });
        setAuditLogs((data || []) as AuditEntry[]);
    }, [vendorId]);

    const fetchProfiles = useCallback(async () => {
        if (!company?.id) return;
        const { data } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('company_id', company.id);
        setCompanyProfiles((data || []) as ProfileOption[]);
    }, [company?.id]);

    useEffect(() => {
        setIsLoading(true); setNotFound(false);
        Promise.all([fetchVendor(), fetchDocs(), fetchNotes(), fetchCostHistory(), fetchSeats(), fetchAudit(), fetchProfiles()])
            .finally(() => setIsLoading(false));
    }, [fetchVendor, fetchDocs, fetchNotes, fetchCostHistory, fetchSeats, fetchAudit, fetchProfiles]);

    const addNote = async (content: string) => {
        if (!vendorId || !profile) return;
        const { error } = await supabase.from('vendor_notes').insert({ vendor_id: vendorId, content, author_id: profile.id });
        if (error) { setToast(error.message); return; }
        setToast('Note added'); fetchNotes();
    };

    const assignSeat = async (userId: string) => {
        if (!vendorId || !profile) return;
        const { error } = await supabase.from('seat_assignments').insert({ vendor_id: vendorId, user_id: userId, assigned_by: profile.id });
        if (error) { setToast(error.message); return; }
        setToast('Seat assigned'); fetchSeats();
        await supabase.from('vendors').update({ used_seats: seats.length + 1 }).eq('id', vendorId);
        fetchVendor();
    };

    const removeSeat = async (assignmentId: string) => {
        const { error } = await supabase.from('seat_assignments').delete().eq('id', assignmentId);
        if (error) { setToast(error.message); return; }
        setToast('Seat removed'); fetchSeats();
        await supabase.from('vendors').update({ used_seats: Math.max(0, seats.length - 1) }).eq('id', vendorId);
        fetchVendor();
    };

    const renewVendor = async () => {
        if (!vendorId || !vendor || !profile || !company) return;
        const oldDate = vendor.renewal_date;
        const newDate = new Date(vendor.renewal_date || Date.now());
        newDate.setFullYear(newDate.getFullYear() + 1);
        const newDateStr = newDate.toISOString().split('T')[0];
        const { error } = await supabase.from('vendors').update({ renewal_date: newDateStr, status: 'active' }).eq('id', vendorId);
        if (error) { setToast(error.message); return; }
        await supabase.from('audit_logs').insert({ company_id: company.id, actor_id: profile.id, action: 'renewed', entity_type: 'vendor', entity_id: vendorId, entity_name: vendor.name, metadata: { old_renewal_date: oldDate, new_renewal_date: newDateStr } });
        setToast('Subscription renewed successfully'); fetchVendor(); fetchAudit();
    };

    const cancelVendor = async () => {
        if (!vendorId || !vendor || !profile || !company) return;
        const { error } = await supabase.from('vendors').update({ status: 'cancelled' }).eq('id', vendorId);
        if (error) { setToast(error.message); return; }
        await supabase.from('audit_logs').insert({ company_id: company.id, actor_id: profile.id, action: 'cancelled', entity_type: 'vendor', entity_id: vendorId, entity_name: vendor.name, metadata: { cancelled_at: new Date().toISOString(), monthly_cost: vendor.monthly_cost } });
        setToast('Subscription cancelled'); fetchVendor(); fetchAudit();
    };

    return { vendor, documents, notes, costHistory, seats, auditLogs, companyProfiles, isLoading, notFound, toast, setToast, addNote, assignSeat, removeSeat, renewVendor, cancelVendor, fetchVendor, fetchNotes, fetchAudit };
}
