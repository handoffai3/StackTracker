import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inviteCompanyId = searchParams.get('company_id');
    const { fetchProfile } = useAuthStore();

    // Tab selection for mobile or focus highlight for desktop
    // 'invite' = Accept Invitation, 'create' = Create Workspace
    const [activeTab, setActiveTab] = useState<'invite' | 'create'>(inviteCompanyId ? 'invite' : 'create');

    // Form States
    const [inviteName, setInviteName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [invitePassword, setInvitePassword] = useState('');

    const [workspaceName, setWorkspaceName] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAcceptInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!inviteCompanyId) {
            setErrorMsg('Invalid invite link. Missing company ID.');
            return;
        }

        if (!inviteName.trim() || !invitePassword.trim() ||
            !inviteEmail.trim()) {
            setErrorMsg('Please fill out all required fields.');
            return;
        }

        setIsLoading(true);
        try {
            // Step 1 — Sign up
            const { data: authData, error: authError } =
                await supabase.auth.signUp({
                    email: inviteEmail,
                    password: invitePassword,
                    options: {
                        data: {
                            full_name: inviteName,
                            role: 'developer',
                            company_id: inviteCompanyId
                        }
                    }
                });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Signup failed');

            // Step 2 — Sign in immediately to activate session
            const { error: signInError } =
                await supabase.auth.signInWithPassword({
                    email: inviteEmail,
                    password: invitePassword
                });

            if (signInError) throw signInError;

            // Step 3 — RPC sets company_id + role
            const { error: rpcError } = await supabase.rpc(
                'join_workspace', {
                p_company_id: inviteCompanyId,
                p_full_name: inviteName,
                p_user_id: authData.user.id
            }
            );

            if (rpcError) throw rpcError;

            // Step 4 — Fetch profile
            await fetchProfile(authData.user.id);

            navigate('/');
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!workspaceName.trim() || !adminEmail.trim() ||
            !adminPassword.trim() || !adminName.trim()) {
            setErrorMsg('Please fill out all required fields.');
            return;
        }

        if (adminPassword.length < 12) {
            setErrorMsg('Admin password must be at least 12 characters.');
            return;
        }

        setIsLoading(true);
        try {
            // Step 1 — Sign up
            const { data: authData, error: authError } =
                await supabase.auth.signUp({
                    email: adminEmail,
                    password: adminPassword,
                    options: {
                        data: { full_name: adminName, role: 'admin' }
                    }
                });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Signup failed');

            // Step 2 — Sign in immediately so session is active
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: adminEmail,
                password: adminPassword
            });

            if (signInError) throw signInError;

            // Step 3 — RPC handles company + profile in one shot
            const { error: rpcError } = await supabase.rpc('create_workspace', {
                p_company_name: workspaceName,
                p_full_name: adminName,
                p_user_id: authData.user.id
            });

            if (rpcError) throw rpcError;

            // Step 4 — Fetch profile
            await fetchProfile(authData.user.id);

            navigate('/');
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#0B0F19] text-on-surface min-h-screen flex flex-col items-center justify-center p-md font-body-md relative overflow-hidden w-full">

            {/* Ambient Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-container opacity-5 blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-container opacity-5 blur-[100px]"></div>
            </div>

            {/* Main Wrapper */}
            <div className="w-full max-w-[1000px] z-10 flex flex-col gap-lg relative">

                {/* Logo Header */}
                <div className="text-center mb-sm">
                    <h1 className="font-display-lg text-[42px] text-primary tracking-tight font-bold">StackTracker</h1>
                    <p className="font-label-md text-label-md text-on-surface-variant uppercase mt-1">Engineering Spend Management</p>
                </div>

                {/* Toggle Switch Mobile Only */}
                <div className="md:hidden flex justify-center w-full">
                    <div className="bg-surface-container-low p-xs rounded-lg flex border border-outline-variant w-full max-w-[320px]">
                        <button
                            type="button"
                            onClick={() => setActiveTab('invite')}
                            className={`flex-1 py-sm text-center font-label-md text-label-md rounded-md transition-colors cursor-pointer ${activeTab === 'invite'
                                    ? 'bg-surface-container-highest text-primary font-bold'
                                    : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                        >
                            Accept Invite
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('create')}
                            className={`flex-1 py-sm text-center font-label-md text-label-md rounded-md transition-colors cursor-pointer ${activeTab === 'create'
                                    ? 'bg-surface-container-highest text-primary font-bold'
                                    : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                        >
                            Create Workspace
                        </button>
                    </div>
                </div>

                {/* Grid Container */}
                {errorMsg && (
                    <div className="bg-error-container/20 border border-error-container text-error rounded-md p-md mb-md font-body-md text-center">
                        {errorMsg}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg items-stretch">

                    {/* Left Card: Accept Invitation */}
                    <div
                        onClick={() => setActiveTab('invite')}
                        className={`bg-[#161b28]/70 backdrop-blur-xl border border-outline-variant rounded-xl p-xl shadow-2xl flex flex-col justify-between h-full transition-all duration-300 cursor-pointer ${activeTab === 'invite' ? 'opacity-100 ring-2 ring-primary ring-offset-4 ring-offset-[#0B0F19]' : 'opacity-40 hover:opacity-75'
                            }`}
                    >
                        <div>
                            <div className="flex items-center gap-sm mb-lg">
                                <span className="material-symbols-outlined text-primary text-[32px]">mail</span>
                                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Accept Invitation</h2>
                            </div>

                            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-md mb-xl">
                                <p className="font-body-md text-body-md text-on-surface-variant mb-xs">You have been invited to join</p>
                                <div className="flex items-center gap-sm">
                                    <div className="w-8 h-8 rounded-md bg-primary-container flex items-center justify-center text-on-primary-container font-headline-sm font-bold text-sm shrink-0">S</div>
                                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">StackTracker Eng</span>
                                </div>
                            </div>

                            <form onSubmit={handleAcceptInvite} className="space-y-md">
                                <div>
                                    <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-xs font-semibold">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full bg-[#10131A] border border-outline-variant rounded px-md py-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div>
                                    <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-xs font-semibold">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={inviteName}
                                        onChange={(e) => setInviteName(e.target.value)}
                                        className="w-full bg-[#10131A] border border-outline-variant rounded px-md py-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-xs font-semibold">Password</label>
                                    <input
                                        required
                                        type="password"
                                        value={invitePassword}
                                        onChange={(e) => setInvitePassword(e.target.value)}
                                        className="w-full bg-[#10131A] border border-outline-variant rounded px-md py-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Create a strong password"
                                    />
                                </div>

                                {activeTab === 'invite' && (
                                    <div className="mt-xl pt-lg border-t border-outline-variant">
                                        <button
                                            type="submit"
                                            className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-headline-sm text-headline-sm py-md rounded transition-colors flex justify-center items-center gap-sm font-bold active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Processing...' : 'Join Workspace'}
                                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Right Card: Create Workspace */}
                    <div
                        onClick={() => setActiveTab('create')}
                        className={`bg-[#161b28]/70 backdrop-blur-xl border border-outline-variant rounded-xl p-xl shadow-2xl flex flex-col justify-between h-full transition-all duration-300 cursor-pointer ${activeTab === 'create' ? 'opacity-100 ring-2 ring-primary ring-offset-4 ring-offset-[#0B0F19]' : 'opacity-40 hover:opacity-75'
                            }`}
                    >
                        <div>
                            <div className="flex items-center gap-sm mb-lg">
                                <span className="material-symbols-outlined text-primary text-[32px]">domain_add</span>
                                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Create Workspace</h2>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface-variant mb-xl font-medium">
                                Set up a new command center for your engineering team's financial oversight.
                            </p>

                            <form onSubmit={handleCreateWorkspace} className="space-y-md">
                                <div>
                                    <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-xs font-semibold">Company / Workspace Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={workspaceName}
                                        onChange={(e) => setWorkspaceName(e.target.value)}
                                        className="w-full bg-[#10131A] border border-outline-variant rounded px-md py-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                                        placeholder="e.g. Acme Corp Eng"
                                    />
                                </div>
                                <div>
                                    <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-xs font-semibold">Admin Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={adminName}
                                        onChange={(e) => setAdminName(e.target.value)}
                                        className="w-full bg-[#10131A] border border-outline-variant rounded px-md py-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Admin Name"
                                    />
                                </div>
                                <div>
                                    <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-xs font-semibold">Admin Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                        className="w-full bg-[#10131A] border border-outline-variant rounded px-md py-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                                        placeholder="admin@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-xs font-semibold">Admin Password</label>
                                    <input
                                        required
                                        type="password"
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        className="w-full bg-[#10131A] border border-outline-variant rounded px-md py-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Must be at least 12 characters"
                                    />
                                </div>

                                {activeTab === 'create' && (
                                    <div className="mt-xl pt-lg border-t border-outline-variant">
                                        <button
                                            type="submit"
                                            className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-headline-sm text-headline-sm py-md rounded transition-colors flex justify-center items-center gap-sm font-bold active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Processing...' : 'Create New Workspace'}
                                            <span className="material-symbols-outlined text-[20px]">add</span>
                                        </button>
                                        <p className="text-center mt-md font-body-md text-body-md text-on-surface-variant text-[12px] font-semibold">
                                            By creating a workspace, you agree to our Terms of Service.
                                        </p>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                {/* Back to Login Anchor */}
                <div className="text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-primary hover:text-primary-container text-sm font-semibold transition-colors cursor-pointer active:scale-95"
                    >
                        Already have an account? Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;
