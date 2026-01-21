import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { AppNotification } from '../types';
import { Bell, LogOut, Layout, User, Moon, Sun, X, Settings, Home, Search, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const MainLayout: React.FC = () => {
    const {
        currentUser,
        notifications,
        logout,
        theme,
        toggleTheme,
        dismissNotification,
        markNotificationRead,
        markAllNotificationsRead,
        tasks,
        setGlobalTaskSearch,
        globalTaskSearch,
        projects
    } = useStore();

    const navigate = useNavigate();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(globalTaskSearch);

    // Debounce Search
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setGlobalTaskSearch(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, setGlobalTaskSearch]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (notif: AppNotification) => {
        markNotificationRead(notif.id);
        setIsNotifOpen(false);

        if (notif.link) {
            navigate(notif.link);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const handleProjectClick = () => {
        const lastProjectId = localStorage.getItem('lastProjectId');
        if (lastProjectId) {
            navigate(`/project/${lastProjectId}`);
        } else if (projects.length > 0) {
            navigate(`/project/${projects[0].id}`);
        } else {
            // Optional: Show a notification or just stay on workspace
            navigate('/workspace');
        }
    };

    return (
        <div className={`flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
            {/* Sidebar - Hidden on mobile */}
            <aside className="hidden sm:flex w-16 sm:w-20 bg-[#0f172a] text-slate-400 flex-col items-center py-6 flex-shrink-0 z-30 shadow-2xl border-r border-white/5">
                <div
                    onClick={() => navigate('/workspace')}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold mb-8 shadow-lg shadow-blue-900/50 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                    M
                </div>

                <nav className="flex flex-col gap-5 w-full">
                    <SidebarItem icon={<Home size={22} />} active={window.location.pathname === '/workspace'} label="Workspace" onClick={() => navigate('/workspace')} />
                    <SidebarItem icon={<Layout size={22} />} active={window.location.pathname.startsWith('/project')} label="Project" onClick={handleProjectClick} />
                    <SidebarItem icon={<User size={22} />} active={window.location.pathname === '/profile'} label="Profile" onClick={() => navigate('/profile')} />
                </nav>

                <div className="mt-auto flex flex-col items-center gap-6 pb-2">
                    <button onClick={toggleTheme} className="p-2.5 hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-yellow-400 hover:rotate-12">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={handleLogout} className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all text-slate-500 hover:text-red-500" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-4 z-40 pb-safe">
                <MobileNavItem icon={<Home size={22} />} active={window.location.pathname === '/workspace'} onClick={() => navigate('/workspace')} />
                <MobileNavItem icon={<Layout size={22} />} active={window.location.pathname.startsWith('/project')} onClick={handleProjectClick} />
                <MobileNavItem icon={<User size={22} />} active={window.location.pathname === '/profile'} onClick={() => navigate('/profile')} />
                <button onClick={toggleTheme} className="p-2 text-slate-500">
                    {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0 z-20">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        {window.location.pathname.startsWith('/project') && (
                            <div className="relative w-full max-w-md hidden sm:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search tasks..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 hidden md:block text-sm">
                            Welcome back, {currentUser?.name.split(' ')[0] || 'User'}
                        </span>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors ${isNotifOpen ? 'bg-blue-50 text-blue-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-300'}`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                                )}
                            </button>
                            {isNotifOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                                    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={() => markAllNotificationsRead()}
                                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-[450px] overflow-y-auto scrollbar-thin">
                                            {notifications.length > 0 ? (
                                                <div className="py-2">
                                                    {notifications.map((n, idx) => (
                                                        <div
                                                            key={n.id}
                                                            className={`px-5 py-3.5 flex gap-4 transition-all duration-200 relative group border-b border-slate-50 last:border-0 dark:border-slate-800/30 ${n.link ? 'cursor-pointer' : ''} ${!n.read ? 'bg-blue-50/40 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                                            onClick={() => n.link && handleNotificationClick(n)}
                                                        >
                                                            {/* Status Indicator */}
                                                            {!n.read && (
                                                                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                                                            )}

                                                            {/* Left Content: Type Icon */}
                                                            <div className="flex-shrink-0 mt-0.5">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${n.type === 'SUCCESS' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                                                                    n.type === 'ERROR' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                                                                        n.type === 'WARNING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                                                                            'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                                                    }`}>
                                                                    {n.type === 'ERROR' ? <AlertCircle size={20} /> : n.type === 'WARNING' ? <AlertCircle size={20} /> : <Info size={20} />}
                                                                </div>
                                                            </div>

                                                            {/* Center Content: Message */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start mb-0.5">
                                                                    <h4 className={`text-xs uppercase tracking-wider font-bold truncate pr-6 ${!n.read ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                                                        {n.title || 'Notification'}
                                                                    </h4>
                                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5 italic">
                                                                        {getRelativeTime(n.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <p className={`text-sm leading-relaxed ${!n.read ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                    {n.message}
                                                                </p>
                                                            </div>

                                                            {/* Right Content: Actions */}
                                                            <div className="flex flex-col gap-2 flex-shrink-0 self-center">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                                                                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                                    title="Dismiss"
                                                                >
                                                                    <X size={15} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-700">
                                                        <Bell size={32} />
                                                    </div>
                                                    <h3 className="text-slate-900 dark:text-white font-bold mb-1">No notifications yet</h3>
                                                    <p className="text-sm text-slate-400">When you have new updates, they'll show up here.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/30 dark:bg-slate-800/30">
                                            <button className="text-sm font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                View Archive
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* User Profile */}
                        <div className="relative">
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors">
                                <img src={currentUser?.avatar} alt="User" className="w-full h-full object-cover" />
                            </button>
                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="flex items-center gap-3 p-3 mb-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <img src={currentUser?.avatar} alt="" className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{currentUser?.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors">
                                            <User size={16} /> Edit Profile
                                        </button>
                                        <button className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors">
                                            <Settings size={16} /> Preferences
                                        </button>
                                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors">
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-hidden relative mb-16 sm:mb-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, active = false, label, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all mx-auto relative group
      ${active
                ? 'bg-blue-600/20 text-blue-400 shadow-inner'
                : 'hover:bg-slate-800 hover:text-white text-slate-500'
            }`}
    >
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>}
        {icon}
        <span className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/5">
            {label}
        </span>
    </button>
);

const MobileNavItem = ({ icon, active = false, onClick }: any) => (
    <button
        onClick={onClick}
        className={`p-3 rounded-xl transition-all ${active ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-110' : 'text-slate-400 dark:text-slate-500'}`}
    >
        {icon}
    </button>
);

const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
};
