import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
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
        tasks,
        setGlobalTaskSearch,
        globalTaskSearch
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

    const handleNotificationClick = (notif: any) => {
        markNotificationRead(notif.id);
        setIsNotifOpen(false);

        if (notif.actionType === 'VIEW_TASK' && notif.targetId) {
            // We need to know which project the task belongs to. 
            // If the task is in the store, we can find it.
            const task = tasks.find(t => t.id === notif.targetId);
            if (task) {
                navigate(`/project/${task.projectId}/board?selectedIssue=${task.id}`);
            } else {
                // If not in store, we might need a better way to find the project ID
                // For now, if we are in a project, we can try to stay there
                navigate(`?selectedIssue=${notif.targetId}`);
            }
        } else if (notif.actionType === 'VIEW_PROJECT' && notif.targetId) {
            navigate(`/project/${notif.targetId}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <div className={`flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
            {/* Sidebar */}
            <aside className="w-16 sm:w-20 bg-[#0f172a] text-slate-400 flex flex-col items-center py-6 flex-shrink-0 z-30 shadow-xl">
                <div
                    onClick={() => navigate('/workspace')}
                    className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold mb-8 shadow-lg shadow-blue-900/50 cursor-pointer hover:bg-blue-500 transition-colors"
                >
                    M
                </div>

                <nav className="flex flex-col gap-4 w-full">
                    <SidebarItem icon={<Home size={20} />} active={window.location.pathname === '/workspace'} label="Workspace" onClick={() => navigate('/workspace')} />
                    <SidebarItem icon={<Layout size={20} />} active={window.location.pathname.startsWith('/project')} label="Project" />
                    <SidebarItem icon={<User size={20} />} active={window.location.pathname === '/profile'} label="Profile" onClick={() => navigate('/profile')} />
                </nav>

                <div className="mt-auto flex flex-col items-center gap-6 pb-2">
                    <button onClick={toggleTheme} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-yellow-400">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={handleLogout} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-white" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>

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
                                    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="p-3 border-b border-slate-100 dark:border-slate-800 font-semibold text-sm dark:text-white flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                            Notifications
                                            {unreadCount > 0 && <span className="text-xs font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                                            {notifications.length > 0 ? notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    className={`p-4 border-b border-slate-50 dark:border-slate-800/50 flex gap-3 transition-colors ${n.actionType !== 'NONE' ? 'hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group' : ''
                                                        } ${!n.read ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}
                                                    onClick={() => n.actionType !== 'NONE' && handleNotificationClick(n)}
                                                >
                                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'SUCCESS' ? 'bg-green-500' :
                                                        n.type === 'ERROR' ? 'bg-red-500' :
                                                            n.type === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'
                                                        }`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                                            {n.message}
                                                        </p>
                                                        {n.targetName && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-1 rounded">
                                                                    {n.actionType.replace('VIEW_', '')}
                                                                </span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{n.targetName}</span>
                                                            </div>
                                                        )}
                                                        <p className="text-[11px] text-slate-400 mt-1.5">{new Date(n.createdAt).toLocaleString()}</p>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                                        {!n.read && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }}
                                                                className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                                                title="Mark as read"
                                                            >
                                                                <CheckCircle2 size={14} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                                                            className="text-slate-300 hover:text-red-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Dismiss"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                                    <Bell className="w-8 h-8 mb-2 opacity-20" />
                                                    <p className="text-sm">No notifications</p>
                                                </div>
                                            )}
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
                <main className="flex-1 overflow-hidden relative">
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
                ? 'bg-blue-600/10 text-blue-500 after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-8 after:bg-blue-500 after:rounded-l-full'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
    >
        {icon}
        <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            {label}
        </span>
    </button>
);
