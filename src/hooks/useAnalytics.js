import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

const useAnalyticsStore = create((set, get) => ({
    // Data state
    vendors: [],
    costHistory: [],
    
    // UI state
    dateRange: '12_months', // '3_months', '6_months', '12_months', 'this_year'
    isLoading: false,
    error: null,
    toastMessage: null,
    toastType: 'success',
    _loaded: false,

    showToast: (message, type = 'success') => set({ toastMessage: message, toastType: type }),
    dismissToast: () => set({ toastMessage: null }),
    setDateRange: (range) => set({ dateRange: range }),

    fetchData: async (companyId, force = false) => {
        if (!companyId) return;
        if (get()._loaded && !force) return;

        set({ isLoading: true, error: null });

        try {
            // 1. Fetch active vendors with seat data
            const vendorsPromise = supabase
                .from('vendors')
                .select(`
                    *,
                    owner:profiles!owner_id(full_name)
                `)
                .eq('company_id', companyId)
                .eq('status', 'active')
                .order('monthly_cost', { ascending: false });

            // 2. Fetch all cost history for this company to allow computing trends
            const historyPromise = supabase
                .from('vendor_cost_history')
                .select(`
                    *,
                    vendor:vendors!inner(name, category, company_id)
                `)
                .eq('vendor.company_id', companyId)
                .order('recorded_at', { ascending: true });

            const [vendorsRes, historyRes] = await Promise.all([vendorsPromise, historyPromise]);

            if (vendorsRes.error) throw vendorsRes.error;
            // history error is non-fatal if table is missing or empty, handle gracefully
            if (historyRes.error) console.warn('Cost history fetch error:', historyRes.error);

            set({
                vendors: vendorsRes.data || [],
                costHistory: historyRes.data || [],
                _loaded: true
            });
        } catch (err) {
            const msg = err.message || 'Failed to fetch analytics data';
            set({ error: msg });
            get().showToast(msg, 'error');
        } finally {
            set({ isLoading: false });
        }
    }
}));

export function useAnalytics() {
    const store = useAnalyticsStore();
    const { company } = useAuthStore();

    useEffect(() => {
        if (company?.id) {
            store.fetchData(company.id);
        }
    }, [company?.id]);

    // Computed Stats
    const vendors = store.vendors;
    const history = store.costHistory;

    // Total Annual Spend
    const totalAnnualSpend = vendors.reduce((sum, v) => sum + (Number(v.monthly_cost || 0) * 12), 0);
    const avgMonthlySpend = totalAnnualSpend / 12;

    // Most Expensive Tool
    let mostExpensiveTool = null;
    if (vendors.length > 0) {
        mostExpensiveTool = vendors.reduce((prev, current) => 
            (Number(prev.monthly_cost || 0) > Number(current.monthly_cost || 0)) ? prev : current
        );
    }

    // Potential Savings (tools where utilization < 0.5)
    let potentialSavings = 0;
    vendors.forEach(v => {
        const total = v.total_seats || 0;
        const used = v.used_seats || 0;
        if (total > 0 && (used / total) < 0.5) {
            potentialSavings += Number(v.monthly_cost || 0);
        }
    });

    // Spend by category
    const catMap = {};
    vendors.forEach(v => {
        const cat = v.category || 'other';
        catMap[cat] = (catMap[cat] || 0) + Number(v.monthly_cost || 0);
    });
    const spendByCategory = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })).sort((a,b) => b.value - a.value);

    // Utilization Buckets
    let wellUsed = 0, moderate = 0, underused = 0;
    vendors.forEach(v => {
        const total = v.total_seats || 0;
        const used = v.used_seats || 0;
        if (total === 0) return; // skip if no seats

        const ratio = used / total;
        if (ratio >= 0.8) wellUsed++;
        else if (ratio >= 0.5) moderate++;
        else underused++;
    });

    const utilizationData = [
        { name: 'Well Used (>80%)', value: wellUsed, fill: '#10B981' }, // green
        { name: 'Moderate (50-80%)', value: moderate, fill: '#F59E0B' }, // yellow
        { name: 'Underused (<50%)', value: underused, fill: '#EF4444' } // red
    ];

    // Calculate months to show based on dateRange
    let monthsBack = 12;
    if (store.dateRange === '3_months') monthsBack = 3;
    if (store.dateRange === '6_months') monthsBack = 6;
    if (store.dateRange === 'this_year') {
        monthsBack = new Date().getMonth() + 1; // months since Jan
    }

    // Monthly Trend Data
    // We mock the trend based on current total monthly spend
    const monthlyTrendData = [];
    const totalSpend = vendors.reduce((sum, v) => sum + Number(v.monthly_cost || 0), 0);

    for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleString('default', { month: 'short' });
        
        monthlyTrendData.push({
            name: monthName,
            actual: totalSpend,
            previous: totalSpend * 0.85 // mock previous year if no data for visual effect
        });
    }

    return {
        ...store,
        totalAnnualSpend,
        avgMonthlySpend,
        mostExpensiveTool,
        potentialSavings,
        spendByCategory,
        utilizationData,
        monthlyTrendData,
        refetch: () => store.fetchData(company?.id, true)
    };
}
