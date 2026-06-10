import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

// Zustand store — state persists across component mounts/unmounts
const useRequestsStore = create((set, get) => ({
    myRequests: [],
    allRequests: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    toastMessage: null,
    toastType: 'success',
    _myLoaded: false,
    _allLoaded: false,

    showToast: (message, type = 'success') => {
        set({ toastMessage: message, toastType: type });
    },

    dismissToast: () => set({ toastMessage: null }),

    fetchMyRequests: async (companyId, userId, force = false) => {
        if (!companyId || !userId) return;
        // Skip refetch if already loaded (unless forced)
        if (get()._myLoaded && !force) return;

        set({ isLoading: true, error: null });
        try {
            const { data, error: fetchError } = await supabase
                .from('tool_requests')
                .select(`
                    *,
                    requested_by_profile:profiles!requested_by(
                        full_name, avatar_url
                    ),
                    reviewed_by_profile:profiles!reviewed_by(
                        full_name
                    )
                `)
                .eq('company_id', companyId)
                .eq('requested_by', userId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            set({ myRequests: data || [], _myLoaded: true });
        } catch (err) {
            const msg = err.message || 'Failed to fetch your requests';
            set({ error: msg });
            get().showToast(msg, 'error');
        } finally {
            set({ isLoading: false });
        }
    },

    fetchAllRequests: async (companyId, force = false) => {
        if (!companyId) return;
        if (get()._allLoaded && !force) return;

        set({ isLoading: true, error: null });
        try {
            const { data, error: fetchError } = await supabase
                .from('tool_requests')
                .select(`
                    *,
                    requested_by_profile:profiles!requested_by(
                        full_name, avatar_url
                    ),
                    reviewed_by_profile:profiles!reviewed_by(
                        full_name
                    )
                `)
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            set({ allRequests: data || [], _allLoaded: true });
        } catch (err) {
            const msg = err.message || 'Failed to fetch all requests';
            set({ error: msg });
            get().showToast(msg, 'error');
        } finally {
            set({ isLoading: false });
        }
    },

    submitRequest: async (companyId, userId, formData) => {
        if (!companyId || !userId) {
            get().showToast('Session error: missing company or user. Please refresh and try again.', 'error');
            return false;
        }
        set({ isSubmitting: true });
        try {
            const { error: insertError } = await supabase
                .from('tool_requests')
                .insert({
                    company_id: companyId,
                    tool_name: formData.toolName,
                    vendor_url: formData.vendorUrl || null,
                    category: formData.category || 'other',
                    monthly_cost: Number(formData.monthlyCost),
                    seats_needed: Number(formData.seatsNeeded),
                    priority: formData.priority,
                    business_justification: formData.justification,
                    status: 'pending',
                    requested_by: userId,
                });

            if (insertError) throw insertError;
            get().showToast('Request submitted successfully!', 'success');
            // Force refetch so new request appears in lists
            set({ _myLoaded: false, _allLoaded: false });
            await get().fetchMyRequests(companyId, userId, true);
            await get().fetchAllRequests(companyId, true);
            return true;
        } catch (err) {
            const msg = err.message || 'Failed to submit request';
            get().showToast(msg, 'error');
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    },

    updateRequestStatus: async (companyId, userId, requestId, status, reviewNote = '') => {
        if (!userId) return false;
        try {
            const { error: updateError } = await supabase
                .from('tool_requests')
                .update({
                    status,
                    review_note: reviewNote,
                    reviewed_by: userId,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', requestId);

            if (updateError) throw updateError;
            get().showToast(`Request ${status.replace('_', ' ')} successfully`, 'success');
            // Force refetch both lists
            set({ _myLoaded: false, _allLoaded: false });
            await get().fetchMyRequests(companyId, userId, true);
            await get().fetchAllRequests(companyId, true);
            return true;
        } catch (err) {
            const msg = err.message || 'Failed to update request';
            get().showToast(msg, 'error');
            return false;
        }
    },
}));

// Public hook — auto-fetches on first mount, returns stable API
export function useRequests() {
    const store = useRequestsStore();
    const { user, profile, company } = useAuthStore();
    const isAdmin = profile?.role === 'admin' || profile?.role === 'manager';

    // Auto-fetch on mount (skips if already loaded thanks to _myLoaded/_allLoaded flags)
    useEffect(() => {
        if (company?.id && user?.id) {
            store.fetchMyRequests(company.id, user.id);
            if (isAdmin) store.fetchAllRequests(company.id);
        }
    }, [company?.id, user?.id, isAdmin]);

    return {
        myRequests: store.myRequests,
        allRequests: store.allRequests,
        isLoading: store.isLoading,
        isSubmitting: store.isSubmitting,
        error: store.error,
        toastMessage: store.toastMessage,
        toastType: store.toastType,
        isAdmin,
        submitRequest: (formData) => store.submitRequest(company?.id, user?.id, formData),
        updateRequestStatus: (requestId, status, reviewNote) =>
            store.updateRequestStatus(company?.id, user?.id, requestId, status, reviewNote),
        fetchMyRequests: (force) => store.fetchMyRequests(company?.id, user?.id, force),
        fetchAllRequests: (force) => store.fetchAllRequests(company?.id, force),
        dismissToast: store.dismissToast,
        showToast: store.showToast,
    };
}
