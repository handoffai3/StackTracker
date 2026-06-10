import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

const useSeatAuditStore = create((set, get) => ({
    vendors: [],
    companyProfiles: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    toastMessage: null,
    toastType: 'success',
    _loaded: false,
    _profilesLoaded: false,

    showToast: (message, type = 'success') => {
        set({ toastMessage: message, toastType: type });
    },

    dismissToast: () => set({ toastMessage: null }),

    fetchData: async (companyId, force = false) => {
        if (!companyId) return;
        if (get()._loaded && get()._profilesLoaded && !force) return;

        set({ isLoading: true, error: null });
        try {
            const [vendorsResponse, profilesResponse] = await Promise.all([
                supabase
                    .from('vendors')
                    .select(`
                        *,
                        owner:profiles!owner_id(full_name, avatar_url),
                        seat_assignments(
                            id,
                            assigned_at,
                            user:profiles!user_id(
                                id, full_name, email, avatar_url
                            ),
                            assigned_by:profiles!assigned_by(full_name)
                        )
                    `)
                    .eq('company_id', companyId)
                    .eq('status', 'active')
                    .order('name'),
                supabase
                    .from('profiles')
                    .select('id, full_name, email, avatar_url')
                    .eq('company_id', companyId)
            ]);

            if (vendorsResponse.error) throw vendorsResponse.error;
            if (profilesResponse.error) throw profilesResponse.error;

            set({
                vendors: vendorsResponse.data || [],
                companyProfiles: profilesResponse.data || [],
                _loaded: true,
                _profilesLoaded: true,
            });
        } catch (err) {
            const msg = err.message || 'Failed to fetch seat audit data';
            set({ error: msg });
            get().showToast(msg, 'error');
        } finally {
            set({ isLoading: false });
        }
    },

    addSeat: async (companyId, vendorId, selectedUserId, currentUserId) => {
        if (!companyId || !currentUserId) return false;
        
        set({ isSubmitting: true });
        try {
            // Get current vendor to know used_seats
            const vendor = get().vendors.find(v => v.id === vendorId);
            if (!vendor) throw new Error('Vendor not found');
            
            if (vendor.used_seats >= vendor.total_seats) {
                throw new Error('No seats available');
            }

            // 1. Add seat assignment
            const { error: insertError } = await supabase
                .from('seat_assignments')
                .insert({
                    vendor_id: vendorId,
                    user_id: selectedUserId,
                    assigned_by: currentUserId,
                });

            if (insertError) throw insertError;

            // 2. Increment used_seats
            const { error: updateError } = await supabase
                .from('vendors')
                .update({ used_seats: vendor.used_seats + 1 })
                .eq('id', vendorId);

            if (updateError) throw updateError;

            get().showToast('Seat assigned successfully', 'success');
            
            // Refetch to get the updated assignments
            await get().fetchData(companyId, true);
            return true;
        } catch (err) {
            const msg = err.message || 'Failed to assign seat';
            get().showToast(msg, 'error');
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    },

    removeSeat: async (companyId, vendorId, assignmentId) => {
        if (!companyId) return false;

        set({ isSubmitting: true });
        try {
            // Get current vendor
            const vendor = get().vendors.find(v => v.id === vendorId);
            if (!vendor) throw new Error('Vendor not found');

            // 1. Remove seat assignment
            const { error: deleteError } = await supabase
                .from('seat_assignments')
                .delete()
                .eq('id', assignmentId);

            if (deleteError) throw deleteError;

            // 2. Decrement used_seats
            const { error: updateError } = await supabase
                .from('vendors')
                .update({ used_seats: Math.max(0, vendor.used_seats - 1) })
                .eq('id', vendorId);

            if (updateError) throw updateError;

            get().showToast('Seat assignment removed', 'success');
            
            // Refetch
            await get().fetchData(companyId, true);
            return true;
        } catch (err) {
            const msg = err.message || 'Failed to remove seat assignment';
            get().showToast(msg, 'error');
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    }
}));

export function useSeatAudit() {
    const store = useSeatAuditStore();
    const { user, profile, company } = useAuthStore();
    
    // Auto-fetch
    useEffect(() => {
        if (company?.id) {
            store.fetchData(company.id);
        }
    }, [company?.id]);

    return {
        vendors: store.vendors,
        companyProfiles: store.companyProfiles,
        isLoading: store.isLoading,
        isSubmitting: store.isSubmitting,
        error: store.error,
        toastMessage: store.toastMessage,
        toastType: store.toastType,
        addSeat: (vendorId, selectedUserId) => 
            store.addSeat(company?.id, vendorId, selectedUserId, user?.id),
        removeSeat: (vendorId, assignmentId) =>
            store.removeSeat(company?.id, vendorId, assignmentId),
        fetchData: (force) => store.fetchData(company?.id, force),
        dismissToast: store.dismissToast,
        showToast: store.showToast,
    };
}
