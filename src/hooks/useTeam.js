import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

const useTeamStore = create((set, get) => ({
    members: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    toastMessage: null,
    toastType: 'success',
    _loaded: false,

    showToast: (message, type = 'success') => set({ toastMessage: message, toastType: type }),
    dismissToast: () => set({ toastMessage: null }),

    fetchData: async (companyId, force = false) => {
        if (!companyId) return;
        if (get()._loaded && !force) return;

        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Fetch counts separately to avoid multiple relationships error
            const membersWithCounts = await Promise.all((data || []).map(async (profile) => {
                const { count: requestCount } = await supabase
                    .from('tool_requests')
                    .select('*', { count: 'exact', head: true })
                    .eq('requested_by', profile.id);

                const { count: seatCount } = await supabase
                    .from('seat_assignments')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', profile.id);

                return {
                    ...profile,
                    tool_requests_count: [{ count: requestCount || 0 }],
                    seat_assignments_count: [{ count: seatCount || 0 }]
                };
            }));

            set({ members: membersWithCounts, _loaded: true });
        } catch (err) {
            const msg = err.message || 'Failed to fetch team members';
            set({ error: msg });
            get().showToast(msg, 'error');
        } finally {
            set({ isLoading: false });
        }
    },

    updateRole: async (companyId, currentUserId, targetProfileId, newRole, memberName, memberEmail) => {
        if (!companyId || !currentUserId || !targetProfileId) return false;

        // Cannot change own role
        if (currentUserId === targetProfileId) {
            get().showToast("You cannot change your own role", "error");
            return false;
        }

        set({ isSubmitting: true });
        try {
            // Update role
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', targetProfileId);

            if (updateError) throw updateError;

            // Audit log
            const { error: logError } = await supabase
                .from('audit_logs')
                .insert({
                    company_id: companyId,
                    actor_id: currentUserId,
                    action: 'modified',
                    entity_type: 'profile',
                    entity_id: targetProfileId,
                    entity_name: memberName,
                    metadata: { role: newRole, email: memberEmail }
                });

            if (logError) console.warn('Failed to insert audit log', logError);

            get().showToast(`Role updated to ${newRole} for ${memberName}`, 'success');
            await get().fetchData(companyId, true);
            return true;
        } catch (err) {
            const msg = err.message || 'Failed to update role';
            get().showToast(msg, 'error');
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    },

    removeMember: async (companyId, currentUserId, targetProfileId, memberName, memberEmail) => {
        if (!companyId || !currentUserId || !targetProfileId) return false;

        // Cannot remove self
        if (currentUserId === targetProfileId) {
            get().showToast("You cannot remove yourself", "error");
            return false;
        }

        set({ isSubmitting: true });
        try {
            // Remove from company (lockout)
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ company_id: null, role: 'developer' })
                .eq('id', targetProfileId);

            if (updateError) throw updateError;

            // Audit log
            const { error: logError } = await supabase
                .from('audit_logs')
                .insert({
                    company_id: companyId,
                    actor_id: currentUserId,
                    action: 'removed',
                    entity_type: 'profile',
                    entity_id: targetProfileId,
                    entity_name: memberName,
                    metadata: { email: memberEmail }
                });

            if (logError) console.warn('Failed to insert audit log', logError);

            get().showToast(`${memberName} has been removed from the workspace.`, 'success');
            await get().fetchData(companyId, true);
            return true;
        } catch (err) {
            const msg = err.message || 'Failed to remove member';
            get().showToast(msg, 'error');
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    },

    inviteMember: async (companyId, currentUserId, email, role) => {
        if (!companyId || !currentUserId || !email) return false;

        set({ isSubmitting: true });
        try {
            // In a real app we might insert a record into an 'invites' table.
            // Here, per requirements, we just generate the link and log it.
            const inviteLink = `${window.location.origin}/register?company_id=${companyId}`;
            
            await navigator.clipboard.writeText(inviteLink);

            // Audit log
            const { error: logError } = await supabase
                .from('audit_logs')
                .insert({
                    company_id: companyId,
                    actor_id: currentUserId,
                    action: 'invited',
                    entity_type: 'invite',
                    entity_name: email,
                    metadata: { role, email }
                });

            if (logError) console.warn('Failed to insert audit log', logError);

            get().showToast(`Invite link copied! Share this with ${email}`, 'success');
            return true;
        } catch (err) {
            const msg = err.message || 'Failed to generate invite link';
            get().showToast(msg, 'error');
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    }
}));

export function useTeam() {
    const store = useTeamStore();
    const { user, company } = useAuthStore();

    useEffect(() => {
        if (company?.id) {
            store.fetchData(company.id);
        }
    }, [company?.id]);

    return {
        members: store.members,
        isLoading: store.isLoading,
        isSubmitting: store.isSubmitting,
        error: store.error,
        toastMessage: store.toastMessage,
        toastType: store.toastType,
        updateRole: (id, role, name, email) => store.updateRole(company?.id, user?.id, id, role, name, email),
        removeMember: (id, name, email) => store.removeMember(company?.id, user?.id, id, name, email),
        inviteMember: (email, role) => store.inviteMember(company?.id, user?.id, email, role),
        fetchData: (force) => store.fetchData(company?.id, force),
        dismissToast: store.dismissToast,
    };
}
