import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
    company_id: string | null;
}

interface Company {
    id: string;
    name: string;
    logo_url: string | null;
    industry: string | null;
    currency: string;
    fiscal_year_start: number;
    timezone: string;
}

interface AuthState {
    user: User | null;
    profile: Profile | null;
    company: Company | null;
    isLoading: boolean;
    initialize: () => Promise<void>;
    fetchProfile: (userId: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    company: null,
    isLoading: true,

    initialize: async () => {
        try {
            // Get initial session
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;

            if (session?.user) {
                set({ user: session.user });
                await get().fetchProfile(session.user.id);
            } else {
                set({ user: null, profile: null, company: null, isLoading: false });
            }

            // Listen for auth changes — only show loading on actual user changes,
            // not on routine token refreshes (which fire on tab switch, etc.)
            supabase.auth.onAuthStateChange(async (event, currentSession) => {
                const currentUserId = get().user?.id;

                if (currentSession?.user) {
                    // Same user — just update the user object silently (no loading screen)
                    if (currentUserId === currentSession.user.id) {
                        set({ user: currentSession.user });
                        return;
                    }
                    // Different user (new sign-in) — show loading and fetch profile
                    set({ user: currentSession.user, isLoading: true });
                    await get().fetchProfile(currentSession.user.id);
                } else {
                    set({ user: null, profile: null, company: null, isLoading: false });
                }
            });

        } catch (error) {
            console.error('Error initializing auth:', error);
            set({ isLoading: false });
        }
    },

    fetchProfile: async (userId: string) => {
        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            set({ profile });

            if (profile?.company_id) {
                const { data: company, error: companyError } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('id', profile.company_id)
                    .single();

                if (companyError) throw companyError;
                set({ company });
            }
        } catch (error) {
            console.error('Error fetching profile or company:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            set({ user: null, profile: null, company: null, isLoading: false });
        }
    }
}));
