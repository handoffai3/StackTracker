import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export interface VendorOwner {
    full_name: string;
    avatar_url: string | null;
}

export interface Vendor {
    id: string;
    company_id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    website_url: string | null;
    category: string;
    status: string;
    monthly_cost: number;
    billing_cycle: string;
    payment_method: string | null;
    total_seats: number;
    used_seats: number;
    renewal_date: string | null;
    start_date: string | null;
    owner_id: string | null;
    approved_by: string | null;
    approval_date: string | null;
    business_justification: string | null;
    created_at: string;
    owner: VendorOwner | null;
    approved_by_profile: { full_name: string } | null;
}

export interface ProfileOption {
    id: string;
    full_name: string;
    avatar_url: string | null;
}

export interface VendorFormData {
    name: string;
    website_url: string;
    category: string;
    monthly_cost: number;
    billing_cycle: string;
    total_seats: number;
    renewal_date: string;
    start_date: string;
    owner_id: string;
    payment_method: string;
    business_justification: string;
    status: string;
}

export function useVendors() {
    const { company, profile } = useAuthStore();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [profiles, setProfiles] = useState<ProfileOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Fetch vendors
    const fetchVendors = useCallback(async () => {
        if (!company?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('vendors')
                .select(`
                    *,
                    owner:profiles!owner_id(full_name, avatar_url),
                    approved_by_profile:profiles!approved_by(full_name)
                `)
                .eq('company_id', company.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setVendors((data as Vendor[]) || []);
        } catch (err: any) {
            const msg = err.message || 'Failed to fetch vendors';
            setError(msg);
            setToastMessage(msg);
        } finally {
            setIsLoading(false);
        }
    }, [company?.id]);

    // Fetch profiles for dropdowns
    const fetchProfiles = useCallback(async () => {
        if (!company?.id) return;
        try {
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('company_id', company.id);

            if (fetchError) throw fetchError;
            setProfiles((data as ProfileOption[]) || []);
        } catch (err: any) {
            console.error('Error fetching profiles:', err);
        }
    }, [company?.id]);

    useEffect(() => {
        fetchVendors();
        fetchProfiles();
    }, [fetchVendors, fetchProfiles]);

    // Add vendor
    const addVendor = async (formData: VendorFormData) => {
        if (!company?.id) return;
        try {
            const { error: insertError } = await supabase
                .from('vendors')
                .insert({
                    ...formData,
                    monthly_cost: Number(formData.monthly_cost),
                    total_seats: Number(formData.total_seats),
                    company_id: company.id,
                    owner_id: formData.owner_id || profile?.id || null,
                });

            if (insertError) throw insertError;
            setToastMessage('Vendor added successfully');
            await fetchVendors();
        } catch (err: any) {
            const msg = err.message || 'Failed to add vendor';
            setToastMessage(msg);
            throw err;
        }
    };

    // Update vendor
    const updateVendor = async (vendorId: string, formData: Partial<VendorFormData>) => {
        try {
            const { error: updateError } = await supabase
                .from('vendors')
                .update({
                    ...formData,
                    monthly_cost: Number(formData.monthly_cost),
                    total_seats: Number(formData.total_seats),
                })
                .eq('id', vendorId);

            if (updateError) throw updateError;
            setToastMessage('Vendor updated successfully');
            await fetchVendors();
        } catch (err: any) {
            const msg = err.message || 'Failed to update vendor';
            setToastMessage(msg);
            throw err;
        }
    };

    // Cancel vendor
    const cancelVendor = async (vendorId: string) => {
        try {
            const { error: cancelError } = await supabase
                .from('vendors')
                .update({ status: 'cancelled' })
                .eq('id', vendorId);

            if (cancelError) throw cancelError;
            setToastMessage('Vendor subscription cancelled');
            await fetchVendors();
        } catch (err: any) {
            const msg = err.message || 'Failed to cancel vendor';
            setToastMessage(msg);
        }
    };

    // Computed values
    const totalMonthlySpend = useMemo(() => {
        return vendors
            .filter(v => v.status === 'active')
            .reduce((sum, v) => sum + Number(v.monthly_cost), 0);
    }, [vendors]);

    const activeCount = useMemo(() => {
        return vendors.filter(v => v.status === 'active').length;
    }, [vendors]);

    const dismissToast = () => setToastMessage(null);

    return {
        vendors,
        profiles,
        isLoading,
        error,
        toastMessage,
        totalMonthlySpend,
        activeCount,
        fetchVendors,
        addVendor,
        updateVendor,
        cancelVendor,
        dismissToast,
    };
}
