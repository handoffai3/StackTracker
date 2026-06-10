import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export function useAuditLog() {
    const { company } = useAuthStore();
    
    // Data
    const [logs, setLogs] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [thisWeekCount, setThisWeekCount] = useState(0);
    const [mostActiveMember, setMostActiveMember] = useState(null);

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 20;

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedAction, setSelectedAction] = useState('All');
    const [selectedUserId, setSelectedUserId] = useState('All');
    const [selectedEntityType, setSelectedEntityType] = useState('All');

    // Stats fetching
    useEffect(() => {
        const fetchStats = async () => {
            if (!company?.id) return;

            try {
                // Total Count
                const { count: total, error: totalErr } = await supabase
                    .from('audit_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('company_id', company.id);
                if (totalErr) throw totalErr;
                setTotalCount(total || 0);

                // This Week Count
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const { count: weekCount, error: weekErr } = await supabase
                    .from('audit_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('company_id', company.id)
                    .gte('created_at', sevenDaysAgo.toISOString());
                if (weekErr) throw weekErr;
                setThisWeekCount(weekCount || 0);

                // Most Active Member (fetch all actor_ids to group)
                const { data: allActors, error: actorErr } = await supabase
                    .from('audit_logs')
                    .select('actor_id, actor:profiles!actor_id(full_name)')
                    .eq('company_id', company.id);
                if (actorErr) throw actorErr;

                if (allActors && allActors.length > 0) {
                    const counts = {};
                    let maxCount = 0;
                    let maxMember = null;
                    allActors.forEach(log => {
                        if (!log.actor_id) return;
                        counts[log.actor_id] = (counts[log.actor_id] || 0) + 1;
                        if (counts[log.actor_id] > maxCount) {
                            maxCount = counts[log.actor_id];
                            maxMember = log.actor?.full_name || 'Unknown';
                        }
                    });
                    setMostActiveMember(maxMember);
                }

                // Profiles for filter
                const { data: profilesData, error: profErr } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .eq('company_id', company.id);
                if (profErr) throw profErr;
                setProfiles(profilesData || []);

            } catch (err) {
                console.warn('Error fetching audit stats:', err);
            }
        };

        fetchStats();
    }, [company?.id]);

    // Logs fetching
    const fetchLogs = async (isLoadMore = false) => {
        if (!company?.id) return;

        const currentPage = isLoadMore ? page + 1 : 0;
        const from = currentPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        if (isLoadMore) setIsLoadingMore(true);
        else setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('audit_logs')
                .select(`
                    *,
                    actor:profiles!actor_id(full_name, avatar_url)
                `)
                .eq('company_id', company.id)
                .order('created_at', { ascending: false })
                .range(from, to);

            // Apply Filters
            if (searchTerm) query = query.ilike('entity_name', `%${searchTerm}%`);
            if (selectedAction !== 'All') query = query.eq('action', selectedAction.toLowerCase());
            if (selectedUserId !== 'All') query = query.eq('actor_id', selectedUserId);
            if (selectedEntityType !== 'All') query = query.eq('entity_type', selectedEntityType.toLowerCase());
            if (dateFrom) query = query.gte('created_at', new Date(dateFrom).toISOString());
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                query = query.lte('created_at', toDate.toISOString());
            }

            const { data, error: fetchErr } = await query;
            if (fetchErr) throw fetchErr;

            const newLogs = data || [];
            
            if (isLoadMore) {
                setLogs(prev => [...prev, ...newLogs]);
            } else {
                setLogs(newLogs);
            }

            setHasMore(newLogs.length === PAGE_SIZE);
            setPage(currentPage);

        } catch (err) {
            setError(err.message || 'Failed to fetch audit logs');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    // Refetch when filters change
    useEffect(() => {
        fetchLogs(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [company?.id, searchTerm, selectedAction, selectedUserId, selectedEntityType, dateFrom, dateTo]);

    const clearFilters = () => {
        setSearchTerm('');
        setDateFrom('');
        setDateTo('');
        setSelectedAction('All');
        setSelectedUserId('All');
        setSelectedEntityType('All');
    };

    return {
        logs,
        profiles,
        totalCount,
        thisWeekCount,
        mostActiveMember,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        
        // Filter states
        searchTerm, setSearchTerm,
        dateFrom, setDateFrom,
        dateTo, setDateTo,
        selectedAction, setSelectedAction,
        selectedUserId, setSelectedUserId,
        selectedEntityType, setSelectedEntityType,
        
        // Actions
        fetchLogs,
        clearFilters,
        loadMore: () => fetchLogs(true)
    };
}
