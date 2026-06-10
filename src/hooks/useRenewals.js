import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

const useRenewalsStore = create((set, get) => ({
    renewals: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    toastMessage: null,
    toastType: 'success',
    _loaded: false,

    showToast: (message, type = 'success') => {
        set({ toastMessage: message, toastType: type });
    },

    dismissToast: () => set({ toastMessage: null }),

    fetchData: async (companyId, force = false) => {
        if (!companyId) return;
        if (get()._loaded && !force) return;

        set({ isLoading: true, error: null });
        try {
            const todayStr = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('vendors')
                .select(`
                    *,
                    owner:profiles!owner_id(
                        full_name, avatar_url
                    )
                `)
                .eq('company_id', companyId)
                .neq('status', 'cancelled')
                .gte('renewal_date', todayStr)
                .order('renewal_date', { ascending: true });

            if (error) throw error;

            set({
                renewals: data || [],
                _loaded: true
            });
        } catch (err) {
            const msg = err.message || 'Failed to fetch upcoming renewals';
            set({ error: msg });
            get().showToast(msg, 'error');
        } finally {
            set({ isLoading: false });
        }
    },

    renewVendor: async (companyId, userId, vendor) => {
        if (!companyId || !userId || !vendor) return false;

        set({ isSubmitting: true });
        try {
            // Calculate next year's renewal date
            const currentRenewal = new Date(vendor.renewal_date);
            const newRenewal = new Date(currentRenewal.setFullYear(currentRenewal.getFullYear() + 1));
            const newRenewalStr = newRenewal.toISOString().split('T')[0];

            // Update vendor
            const { error: updateError } = await supabase
                .from('vendors')
                .update({
                    renewal_date: newRenewalStr,
                    status: 'active'
                })
                .eq('id', vendor.id);

            if (updateError) throw updateError;

            // Insert audit log
            const { error: logError } = await supabase
                .from('audit_logs')
                .insert({
                    company_id: companyId,
                    actor_id: userId,
                    action: 'renewed',
                    entity_type: 'vendor',
                    entity_id: vendor.id,
                    entity_name: vendor.name,
                    metadata: {
                        previous_renewal_date: vendor.renewal_date,
                        new_renewal_date: newRenewalStr,
                        monthly_cost: vendor.monthly_cost
                    }
                });
            
            if (logError) console.warn('Failed to insert audit log', logError);

            get().showToast(`${vendor.name} successfully renewed.`, 'success');
            await get().fetchData(companyId, true);
            return true;
        } catch (err) {
            const msg = err.message || 'Failed to renew vendor';
            get().showToast(msg, 'error');
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    },

    cancelVendor: async (companyId, userId, vendor) => {
        if (!companyId || !userId || !vendor) return false;

        set({ isSubmitting: true });
        try {
            // Update vendor status
            const { error: updateError } = await supabase
                .from('vendors')
                .update({ status: 'cancelled' })
                .eq('id', vendor.id);

            if (updateError) throw updateError;

            // Insert audit log
            const { error: logError } = await supabase
                .from('audit_logs')
                .insert({
                    company_id: companyId,
                    actor_id: userId,
                    action: 'cancelled',
                    entity_type: 'vendor',
                    entity_id: vendor.id,
                    entity_name: vendor.name,
                    metadata: {
                        renewal_date: vendor.renewal_date,
                        monthly_cost: vendor.monthly_cost
                    }
                });

            if (logError) console.warn('Failed to insert audit log', logError);

            get().showToast(`${vendor.name} has been cancelled.`, 'success');
            await get().fetchData(companyId, true);
            return true;
        } catch (err) {
            const msg = err.message || 'Failed to cancel vendor';
            get().showToast(msg, 'error');
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    }
}));

export function useRenewals() {
    const store = useRenewalsStore();
    const { user, company } = useAuthStore();

    useEffect(() => {
        if (company?.id) {
            store.fetchData(company.id);
        }
    }, [company?.id]);

    return {
        renewals: store.renewals,
        isLoading: store.isLoading,
        isSubmitting: store.isSubmitting,
        error: store.error,
        toastMessage: store.toastMessage,
        toastType: store.toastType,
        renewVendor: (vendor) => store.renewVendor(company?.id, user?.id, vendor),
        cancelVendor: (vendor) => store.cancelVendor(company?.id, user?.id, vendor),
        fetchData: (force) => store.fetchData(company?.id, force),
        dismissToast: store.dismissToast,
    };
}
