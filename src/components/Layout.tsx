import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

interface LayoutProps {
    onLogout: () => void;
    user: { name: string; email: string; role: string } | null;
}

const Layout: React.FC<LayoutProps> = ({ onLogout, user }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: 'dashboard' },
        { path: '/vendor-directory', label: 'Vendor Directory', icon: 'storefront' },
        { path: '/requests', label: 'Requests', icon: 'pending_actions' },
        { path: '/approval-queue', label: 'Approval Queue', icon: 'gavel' },
        { path: '/seat-audit', label: 'Seat Audit', icon: 'person_search' },
        { path: '/renewals', label: 'Renewal Alerts', icon: 'notification_important' },
        { path: '/spend-analytics', label: 'Spend Analytics', icon: 'analytics' },
        { path: '/team-members', label: 'Team Members', icon: 'group' },
        { path: '/audit-log', label: 'Audit Log', icon: 'history' },
        { path: '/settings', label: 'Settings', icon: 'settings' },
    ];

    useEffect(() => {
        const closeMenu = () => setShowUserMenu(false);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    return (
        <div className="flex bg-background text-on-surface antialiased h-screen w-screen overflow-hidden">
            {/* SideNavBar */}
            <nav className="bg-surface-container-low fixed left-0 top-0 h-full w-[280px] border-r border-outline-variant flex flex-col py-lg z-50">
                <div className="px-gutter mb-xl flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
                        ST
                    </div>
                    <div>
                        <h1 className="font-headline-md text-[20px] font-bold text-on-surface leading-tight">StackTracker</h1>
                        <p className="font-label-md text-label-md text-on-surface-variant">Engineering Spend</p>
                    </div>
                </div>
                
                <ul className="flex-1 space-y-sm overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => {
                                    const isSubPath = item.path !== '/' && location.pathname.startsWith(item.path);
                                    return `flex items-center gap-md px-md py-sm border-l-[3px] transition-colors duration-200 ${
                                        isActive || isSubPath
                                            ? 'border-primary bg-surface-container-highest text-primary font-bold'
                                            : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                                    }`;
                                }}
                            >
                                {({ isActive }) => (
                                    <>
                                        <span
                                            className="material-symbols-outlined"
                                            style={{
                                                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                        <span className="font-body-md text-body-md">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="px-md mt-auto relative">
                    {showUserMenu && (
                        <div className="absolute bottom-16 left-md right-md bg-[#1D2027] border border-[#2D3748] rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                            <div className="px-md py-2 border-b border-[#2D3748] text-left">
                                <p className="font-body-md text-[11px] text-on-surface-variant truncate">{user?.email || 'admin@stacktracker.com'}</p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLogout();
                                }}
                                className="w-full text-left px-md py-sm text-body-md hover:bg-surface-container-high hover:text-on-surface flex items-center gap-sm text-[#EF4444] transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                Sign Out
                            </button>
                        </div>
                    )}

                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowUserMenu(!showUserMenu);
                        }}
                        className="flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant"
                    >
                        <img
                            alt="User avatar"
                            className="w-8 h-8 rounded-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD5wd7y6aC9e5FuR2wps72DK0vWAm167tqnwxtX2qDE6D0ui2M2D0AKkbgniH-Ejt-Ta_cUzyogxY56B_GzJdhP-AsxR0duvLjzhDkaBT0n-VqLeTIiHok3MTVKR3ZM_QhcjTJIAbvBiXMgV_aoFAxEJiJFtWff74rgkjbWpXRbKg-pNVuBZrs1Z7ktzC4C84lpCK7nqW59N_170Aov66KVpYT2neJ7_AAwuhKYWTOOvGO4keifheRPop504fboTH0gR-iSegNQlk"
                        />
                        <div className="flex-1 overflow-hidden">
                            <p className="font-body-md text-body-md truncate text-on-surface">{user?.name || 'Alex Mercer'}</p>
                            <p className="font-label-md text-label-md truncate text-on-surface-variant">{user?.role || 'Admin'}</p>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col ml-[280px] h-full overflow-hidden bg-background">
                {/* TopAppBar */}
                <header className="bg-background/80 backdrop-blur-md sticky top-0 z-40 w-full border-b border-outline-variant flex justify-between items-center h-16 px-gutter shrink-0">
                    <div className="flex-1 flex items-center gap-md text-on-surface-variant">
                        <span className="material-symbols-outlined">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant w-full max-w-md"
                            placeholder="Search vendors, software, or owners..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-md">
                        <button className="text-on-surface-variant hover:text-primary transition-colors active:scale-95 flex items-center justify-center p-2 rounded-full hover:bg-surface-container-high">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button className="text-on-surface-variant hover:text-primary transition-colors active:scale-95 flex items-center justify-center p-2 rounded-full hover:bg-surface-container-high">
                            <span className="material-symbols-outlined">help_outline</span>
                        </button>
                    </div>
                </header>

                {/* Main page content area */}
                <main className="flex-1 overflow-y-auto p-gutter w-full font-body-md text-body-md text-on-surface">
                    <div className="max-w-[1440px] mx-auto w-full h-full flex flex-col">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
