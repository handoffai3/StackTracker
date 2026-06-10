import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/index';
import ToastProvider from './components/ui/Toast';
import { useAuthStore } from './stores/authStore';

const App = () => {
    const { initialize, isLoading } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    // Full-screen branded spinner while auth is initializing
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white font-bold text-[16px] shadow-lg shadow-[#3B82F6]/25 animate-pulse">
                        ST
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="text-[#64748B] text-[13px] font-medium">Loading StackTracker...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <ToastProvider />
            <AppRouter />
        </BrowserRouter>
    );
};

export default App;
