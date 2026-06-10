import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

const useApprovalsStore = create((set, get) => ({
    requests: [],
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

    fetchRequests: async (companyId, force = false) => {
        if (!companyId) return;
        if (get()._loaded && !force) return;

        set({ isLoading: true, error: null });
        try {
            const { data, error: fetchError } = await supabase
                .from('tool_requests')
                .select(`
                    *,
                    requested_by_profile:profiles!requested_by(
                        id, full_name, avatar_url
                    ),
                    reviewed_by_profile:profiles!reviewed_by(
                        full_name
                    )
                `)
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            set({ requests: data || [], _loaded: true });
        } catch (err) {
            const msg = err.message || 'Failed to fetch requests';
            set({ error: msg });
            get().showToast(msg, 'error');
        } finally {
            set({ isLoading: false });
        }
    },

    reviewRequest: async (companyId, userId, request, decision, reviewNote) => {
        if (!companyId || !userId) {
            get().showToast('Session error: missing company or user.', 'error');
            return false;
        }
        set({ isSubmitting: true });
        try {
            // 1. Update the tool_request status
            const { error: updateError } = await supabase
                .from('tool_requests')
                .update({
                    status: decision,
                    reviewed_by: userId,
                    review_note: reviewNote,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', request.id);

            if (updateError) throw updateError;

            // 2. If approved, also insert into vendors table
            if (decision === 'approved') {
                const { error: vendorError } = await supabase
                    .from('vendors')
                    .insert({
                        company_id: companyId,
                        name: request.tool_name,
                        website_url: request.vendor_url,
                        monthly_cost: request.monthly_cost,
                        total_seats: request.seats_needed,
                        status: 'active',
                        owner_id: request.requested_by,
                        business_justification: request.business_justification,
                        category: request.category || 'other',
                        renewal_date: (() => {
                            const d = new Date();
                            d.setFullYear(d.getFullYear() + 1);
                            return d.toISOString().split('T')[0];
                        })(),
                    });

                if (vendorError) throw vendorError;
            }

            // 3. Insert audit log
            const { error: auditError } = await supabase
                .from('audit_logs')
                .insert({
                    company_id: companyId,
                    actor_id: userId,
                    action: decision,
                    entity_type: 'tool_request',
                    entity_id: request.id,
                    entity_name: request.tool_name,
                    metadata: {
                        review_note: reviewNote,
                        cost: request.monthly_cost,
                    },
                });

            // Audit log errors are non-fatal
            if (auditError) console.warn('Audit log insert failed:', auditError.message);

            const labels = {
                approved: 'approved',
                rejected: 'rejected',
                more_info_needed: 'sent back for more info',
            };
            get().showToast(`Request ${labels[decision] || decision} successfully!`, 'success');

            // Force refetch
            set({ _loaded: false });
            await get().fetchRequests(companyId, true);
            return true;
        } catch (err) {
            const msg = err.message || 'Failed to review request';
            get().showToast(msg, 'error');
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    },
}));

// Public hook
export function useApprovals() {
    const store = useApprovalsStore();
    const { user, profile, company } = useAuthStore();
    const isAdmin = profile?.role === 'admin' || profile?.role === 'manager';

    useEffect(() => {
        if (company?.id) {
            store.fetchRequests(company.id);
        }
    }, [company?.id]);

    return {
        requests: store.requests,
        isLoading: store.isLoading,
        isSubmitting: store.isSubmitting,
        error: store.error,
        toastMessage: store.toastMessage,
        toastType: store.toastType,
        isAdmin,
        reviewRequest: (request, decision, reviewNote) =>
            store.reviewRequest(company?.id, user?.id, request, decision, reviewNote),
        fetchRequests: (force) => store.fetchRequests(company?.id, force),
        dismissToast: store.dismissToast,
        showToast: store.showToast,
    };
}
