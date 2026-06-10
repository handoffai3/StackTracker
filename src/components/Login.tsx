import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; auth?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (): boolean => {
        const newErrors: typeof errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            newErrors.email = 'Email address is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 4) {
            newErrors.password = 'Password must be at least 4 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setErrors((prev) => ({ ...prev, auth: '' }));

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setErrors({ auth: error.message });
            } else {
                navigate('/'); // Redirect to dashboard
            }
        } catch (error: any) {
            setErrors({ auth: error.message || 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-screen bg-background flex items-center justify-center font-body-md px-gutter overflow-y-auto py-lg">
            <div className="w-full max-w-[1200px] min-h-[700px] flex flex-col lg:flex-row bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant shadow-2xl relative z-10 mx-auto">
                
                {/* Left Side: Illustration / Stats */}
                <div className="hidden lg:flex w-1/2 bg-surface-container-lowest border-r border-outline-variant flex-col justify-between p-xl relative overflow-hidden bg-grid-pattern">
                    {/* Atmospheric Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-surface-container-lowest pointer-events-none"></div>
                    
                    {/* Top Content */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-sm mb-lg">
                            <img
                                alt="StackTracker Logo"
                                className="h-8 w-8 object-contain"
                                src="data:image/png;base64,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"
                            />
                            <span className="font-headline-md text-headline-md text-on-surface">StackTracker</span>
                        </div>
                        <h1 className="font-display-lg text-display-lg text-on-surface max-w-sm mb-md">
                            Master your engineering stack.
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                            The command center for engineering leaders to audit seats, track spend, and optimize tool utilization across the entire organization.
                        </p>
                    </div>

                    {/* Floating Stat Cards */}
                    <div className="relative z-10 flex flex-col gap-md">
                        {/* Stat 1 */}
                        <div className="bg-surface-container-high/80 backdrop-blur-md border border-outline-variant rounded-lg p-md flex items-start gap-md max-w-sm transform hover:-translate-y-1 transition-transform duration-300">
                            <div className="bg-primary/20 p-sm rounded-md flex-shrink-0">
                                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>trending_down</span>
                            </div>
                            <div>
                                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Quarterly Savings</p>
                                <p className="font-headline-sm text-headline-sm text-on-surface">$12,400 saved</p>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-xs text-xs">By identifying unused GitHub and Datadog seats.</p>
                            </div>
                        </div>

                        {/* Stat 2 */}
                        <div className="bg-surface-container-high/80 backdrop-blur-md border border-outline-variant rounded-lg p-md flex items-start gap-md max-w-sm ml-lg transform hover:-translate-y-1 transition-transform duration-300">
                            <div className="bg-[#c0c1ff]/20 p-sm rounded-md flex-shrink-0">
                                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>category</span>
                            </div>
                            <div>
                                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Active Stack</p>
                                <p className="font-headline-sm text-headline-sm text-on-surface">23 tools tracked</p>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-xs text-xs">Continuous monitoring across 4 engineering teams.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center p-xl relative bg-surface-container-low">
                    <div className="max-w-md w-full mx-auto">
                        
                        {/* Mobile Header (Hidden on Desktop) */}
                        <div className="flex lg:hidden items-center justify-center gap-sm mb-xl">
                            <img
                                alt="StackTracker Logo"
                                className="h-10 w-10 object-contain"
                                src="data:image/png;base64,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"
                            />
                            <span className="font-headline-md text-headline-md text-on-surface font-bold">StackTracker</span>
                        </div>

                        <div className="text-center mb-xl">
                            <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">Sign in to your account</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant">Control your engineering spend</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-md">
                            
                            {/* Auth Error Banner */}
                            {errors.auth && (
                                <div className="bg-error-container/20 border border-error-container/40 text-error rounded-lg p-sm text-body-md flex items-center gap-sm">
                                    <span className="material-symbols-outlined text-[20px]">error</span>
                                    {errors.auth}
                                </div>
                            )}

                            {/* Email Address */}
                            <div>
                                <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-xs" htmlFor="email">Work Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-on-surface-variant text-sm">mail</span>
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setErrors(prev => ({ ...prev, email: '', auth: '' }));
                                        }}
                                        placeholder="leader@company.com"
                                        className={`w-full bg-[#10131A] border ${errors.email ? 'border-error' : 'border-outline-variant'} rounded-lg pl-xl pr-md py-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-on-surface-variant/40`}
                                    />
                                </div>
                                {errors.email && <p className="text-error font-label-md text-[11px] mt-xs">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block font-label-md text-label-md text-on-surface-variant uppercase mb-xs" htmlFor="password">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-on-surface-variant text-sm">lock</span>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setErrors(prev => ({ ...prev, password: '', auth: '' }));
                                        }}
                                        placeholder="••••••••"
                                        className={`w-full bg-[#10131A] border ${errors.password ? 'border-error' : 'border-outline-variant'} rounded-lg pl-xl pr-xl py-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-on-surface-variant/40`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px] flex items-center justify-center">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                                {errors.password && <p className="text-error font-label-md text-[11px] mt-xs">{errors.password}</p>}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between mt-sm">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 bg-[#10131A] border-outline-variant rounded text-primary focus:ring-primary focus:ring-offset-background"
                                    />
                                    <label className="ml-2 block font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember-me">
                                        Remember me
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <a href="#" onClick={(e) => e.preventDefault()} className="font-body-md text-body-md text-primary hover:text-primary-fixed transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>

                            {/* Sign In Button */}
                            <div className="pt-sm">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center items-center py-sm px-md border border-transparent rounded-lg text-white bg-[#3B82F6] hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background font-label-md text-label-md uppercase tracking-wide transition-colors active:scale-95 disabled:bg-primary/50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-xl text-center">
                            <p className="font-body-md text-body-md text-on-surface-variant">
                                Don't have an account?{' '}
                                <button onClick={() => navigate('/register')} className="text-primary hover:text-primary-fixed font-semibold transition-colors cursor-pointer active:scale-95">
                                    Join or Register
                                </button>
                            </p>
                        </div>



                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
