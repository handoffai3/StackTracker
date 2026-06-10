import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex bg-[#0f1117] text-white antialiased h-screen w-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:ml-[240px] h-full overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-[#0f1117] border-b border-[#1E2433] flex items-center h-14 px-md shrink-0 z-40">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#161B28] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[24px]">menu</span>
                    </button>
                    <div className="ml-sm flex items-center gap-xs">
                        <div className="w-7 h-7 rounded bg-[#3B82F6] flex items-center justify-center text-white font-bold text-[11px]">ST</div>
                        <span className="font-bold text-[14px] text-white">StackTracker</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-md md:p-lg w-full custom-scrollbar">
                    <div className="max-w-[1440px] mx-auto w-full h-full flex flex-col">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
