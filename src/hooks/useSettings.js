import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

/* ───────── Company Settings ───────── */
export function useCompanySettings() {
    const { company, user } = useAuthStore();
    const [form, setForm] = useState({
        name: '',
        industry: '',
        currency: 'USD',
        fiscal_year_start: 1,
        timezone: 'UTC',
        logo_url: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');
    const [isDirty, setIsDirty] = useState(false);

    const dismissToast = () => setToastMessage(null);
    const showToast = (msg, type = 'success') => {
        setToastMessage(msg);
        setToastType(type);
    };

    // Load company data
    useEffect(() => {
        if (!company?.id) return;
        const load = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('id', company.id)
                    .single();
                if (error) throw error;
                setForm({
                    name: data.name || '',
                    industry: data.industry || '',
                    currency: data.currency || 'USD',
                    fiscal_year_start: data.fiscal_year_start || 1,
                    timezone: data.timezone || 'UTC',
                    logo_url: data.logo_url || ''
                });
            } catch (err) {
                showToast(err.message || 'Failed to load company settings', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [company?.id]);

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const saveSettings = async () => {
        if (!company?.id) return;
        if (!form.name.trim()) {
            showToast('Company name is required', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('companies')
                .update({
                    name: form.name,
                    industry: form.industry,
                    currency: form.currency,
                    fiscal_year_start: form.fiscal_year_start,
                    timezone: form.timezone,
                    logo_url: form.logo_url || null
                })
                .eq('id', company.id);
            if (error) throw error;

            // Refresh company data in the global auth store
            if (user?.id) {
                await useAuthStore.getState().fetchProfile(user.id);
            }
            setIsDirty(false);
            showToast('Settings saved');
        } catch (err) {
            showToast(err.message || 'Failed to save settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const exportAllData = async () => {
        if (!company?.id) return;
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select(`
                    name, category, monthly_cost,
                    renewal_date, status, total_seats,
                    used_seats,
                    owner:profiles!owner_id(full_name)
                `)
                .eq('company_id', company.id);
            if (error) throw error;
            if (!data || data.length === 0) {
                showToast('No vendor data to export', 'error');
                return;
            }
            const headers = ['Name', 'Category', 'Monthly Cost', 'Renewal Date', 'Status', 'Total Seats', 'Used Seats', 'Owner'];
            const rows = data.map(v => [
                `"${v.name}"`,
                `"${v.category || ''}"`,
                v.monthly_cost,
                `"${v.renewal_date || ''}"`,
                `"${v.status}"`,
                v.total_seats || 0,
                v.used_seats || 0,
                `"${v.owner?.full_name || 'Unassigned'}"`
            ].join(','));
            const csv = headers.join(',') + '\n' + rows.join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'stacktracker-export.csv';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Data exported successfully');
        } catch (err) {
            showToast(err.message || 'Export failed', 'error');
        }
    };

    return {
        form, updateField, saveSettings, exportAllData,
        isLoading, isSaving, isDirty,
        toastMessage, toastType, dismissToast
    };
}

/* ───────── Notification Preferences ───────── */
export function useNotificationPreferences() {
    const { user, profile } = useAuthStore();
    const [prefs, setPrefs] = useState({
        renew_30_days: true,
        renew_7_days: true,
        renew_on_day: false,
        request_approved: true,
        request_rejected: true,
        new_request_notify: true,
        weekly_report: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState({}); // per-field saving state
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');

    const dismissToast = () => setToastMessage(null);
    const showToast = (msg, type = 'success') => {
        setToastMessage(msg);
        setToastType(type);
    };

    useEffect(() => {
        if (!user?.id) return;
        const load = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('notification_preferences')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error) {
                    // Row might not exist yet — try to insert defaults
                    if (error.code === 'PGRST116') {
                        const { data: newPrefs, error: insertErr } = await supabase
                            .from('notification_preferences')
                            .insert({ user_id: user.id })
                            .select()
                            .single();
                        if (insertErr) {
                            console.warn('Failed to insert default notification prefs', insertErr);
                        } else if (newPrefs) {
                            setPrefs({
                                renew_30_days: newPrefs.renew_30_days ?? true,
                                renew_7_days: newPrefs.renew_7_days ?? true,
                                renew_on_day: newPrefs.renew_on_day ?? false,
                                request_approved: newPrefs.request_approved ?? true,
                                request_rejected: newPrefs.request_rejected ?? true,
                                new_request_notify: newPrefs.new_request_notify ?? true,
                                weekly_report: newPrefs.weekly_report ?? false
                            });
                        }
                    } else {
                        throw error;
                    }
                } else if (data) {
                    setPrefs({
                        renew_30_days: data.renew_30_days ?? true,
                        renew_7_days: data.renew_7_days ?? true,
                        renew_on_day: data.renew_on_day ?? false,
                        request_approved: data.request_approved ?? true,
                        request_rejected: data.request_rejected ?? true,
                        new_request_notify: data.new_request_notify ?? true,
                        weekly_report: data.weekly_report ?? false
                    });
                }
            } catch (err) {
                showToast(err.message || 'Failed to load notification preferences', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [user?.id]);

    const togglePref = useCallback(async (field) => {
        if (!user?.id) return;
        const newValue = !prefs[field];
        // Optimistically update
        setPrefs(prev => ({ ...prev, [field]: newValue }));
        setSaving(prev => ({ ...prev, [field]: true }));

        try {
            const { error } = await supabase
                .from('notification_preferences')
                .update({ [field]: newValue })
                .eq('user_id', user.id);
            if (error) throw error;
            // Show saved indicator briefly
            setTimeout(() => setSaving(prev => ({ ...prev, [field]: false })), 1200);
        } catch (err) {
            // Revert on failure
            setPrefs(prev => ({ ...prev, [field]: !newValue }));
            setSaving(prev => ({ ...prev, [field]: false }));
            showToast(err.message || `Failed to update ${field}`, 'error');
        }
    }, [user?.id, prefs]);

    return {
        prefs, togglePref, saving,
        isLoading, role: profile?.role,
        toastMessage, toastType, dismissToast
    };
}
