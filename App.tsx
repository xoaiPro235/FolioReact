
import React, { useState, useEffect } from 'react';
import './styles.css';
import { useStore } from './store';
import { Auth } from './components/Auth';
import { Workspace } from './components/Workspace';
import { ProjectView } from './components/ProjectView';
import { Profile } from './components/Profile';
import { Bell, LogOut, Layout, User, Moon, Sun, X, Settings, Home, Search, CheckCircle2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Task } from './types';

export default function App() {
    const { currentView, currentUser, notifications, logout, theme, toggleTheme, dismissNotification, markNotificationRead, goToWorkspace, goToProfile, globalTaskSearch, setGlobalTaskSearch, setSelectedTask, tasks } = useStore();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [toastNotifications, setToastNotifications] = useState<any[]>([]);

    // Debounce Search
    const [searchTerm, setSearchTerm] = useState(globalTaskSearch);

    useEffect(() => {
        const handler = setTimeout(() => {
            setGlobalTaskSearch(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Handle toast notifications - show and auto dismiss after 4 seconds
    useEffect(() => {
        if (notifications.length === 0) return;

        const latestNotif = notifications[0]; // Most recent is first
        const alreadyShown = toastNotifications.some(t => t.id === latestNotif.id);

        if (!alreadyShown) {
            setToastNotifications(prev => [latestNotif, ...prev]);

            // Auto dismiss after 4 seconds
            setTimeout(() => {
                setToastNotifications(prev => prev.filter(t => t.id !== latestNotif.id));
            }, 4000);
        }
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Handle clicking a notification
    const handleNotificationClick = (n: any) => {
        markNotificationRead(n.id);

        // Handle different action types
        if (n.actionType === 'VIEW_PROJECT') {
            // Navigate to project (need to implement loadProjectData)
            console.log('Navigate to project:', n.targetId);
        } else if (n.actionType === 'VIEW_TASK') {
            // Open task modal
            setSelectedTask(n.targetId);
        } else if (n.actionType === 'VIEW_COMMENT') {
            // Find task with this comment and open modal
            const taskWithComment = tasks.find(t => t.comments.some(c => c.id === n.targetId));
            if (taskWithComment) {
                setSelectedTask(taskWithComment.id);
            }
        }
        setIsNotifOpen(false);
    };

    if (currentView === 'AUTH') {
        return <Auth />;
    }

    return (
        <div className={`flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>

            {/* Toast Notifications - Top Right */}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
                {toastNotifications.map(toast => (
                    <div
                        key={toast.id}
                        className="animate-in slide-in-from-right-full duration-300 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4 flex items-start gap-3"
                    >
                        <div className={`mt-0.5 flex-shrink-0 ${toast.type === 'SUCCESS' ? 'text-green-500' : toast.type === 'ERROR' ? 'text-red-500' : toast.type === 'WARNING' ? 'text-yellow-500' : 'text-blue-500'}`}>
                            {toast.type === 'SUCCESS' && <CheckCircle size={20} />}
                            {toast.type === 'ERROR' && <AlertCircle size={20} />}
                            {toast.type === 'WARNING' && <AlertCircle size={20} />}
                            {toast.type === 'INFO' && <Info size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight">{toast.message}</p>
                            {toast.targetName && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">📌 {toast.targetName}</p>}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setToastNotifications(prev => prev.filter(t => t.id !== toast.id));
                            }}
                            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Sidebar - Global */}
            <aside className="w-16 sm:w-20 bg-[#0f172a] text-slate-400 flex flex-col items-center py-6 flex-shrink-0 z-30 shadow-xl">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold mb-8 shadow-lg shadow-blue-900/50">
                    M
                </div>

                <nav className="flex flex-col gap-4 w-full">
                    <SidebarItem icon={<Home size={20} />} active={currentView === 'WORKSPACE'} label="Workspace" onClick={goToWorkspace} />
                    <SidebarItem icon={<Layout size={20} />} active={currentView === 'PROJECT'} label="Project" />
                    {/* Profile in Sidebar for quick access */}
                    <SidebarItem icon={<User size={20} />} active={currentView === 'PROFILE'} label="Profile" onClick={goToProfile} />
                </nav>

                <div className="mt-auto flex flex-col items-center gap-6 pb-2">
                    <button onClick={toggleTheme} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-yellow-400">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={logout} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-white" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">

                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0">

                    {/* Search Bar */}
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        {currentView === 'PROJECT' && (
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
                        <span className="font-semibold text-slate-700 dark:text-slate-200 hidden md:block text-sm">Welcome back, {currentUser?.name.split(' ')[0]}</span>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative text-slate-600 dark:text-slate-300 transition-colors"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {isNotifOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                                    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-3 border-b border-slate-100 dark:border-slate-800 font-semibold text-sm dark:text-white flex justify-between items-center">
                                            Notifications
                                            <span className="text-xs font-normal text-slate-400">{unreadCount} unread</span>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {notifications.length > 0 ? notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    className={`p-4 border-b border-slate-50 dark:border-slate-800 flex gap-3 ${n.actionType !== 'NONE' ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer' : ''} ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                    onClick={() => n.actionType !== 'NONE' && handleNotificationClick(n)}
                                                >
                                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'SUCCESS' ? 'bg-green-500' : n.type === 'ERROR' ? 'bg-red-500' : n.type === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{n.message}</p>
                                                        {n.targetName && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">📌 {n.targetName}</p>}
                                                        <p className="text-xs text-slate-400 mt-1.5">{new Date(n.createdAt).toLocaleTimeString()}</p>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                                        {!n.read && (
                                                            <button onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }} className="text-blue-500 hover:text-blue-700" title="Mark as read">
                                                                <CheckCircle2 size={14} />
                                                            </button>
                                                        )}
                                                        <button onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Dismiss">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )) : <p className="p-4 text-center text-sm text-slate-400">No notifications</p>}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* User Profile */}
                        <div className="relative">
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors">
                                <img src={currentUser?.avatar} alt="User" />
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden p-2 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-3 p-3 mb-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <img src={currentUser?.avatar} alt="" className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-sm text-slate-900 dark:text-white">{currentUser?.name}</p>
                                                <p className="text-xs text-slate-500">{currentUser?.email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { goToProfile(); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2">
                                            <User size={16} /> Edit Profile
                                        </button>
                                        <button className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2">
                                            <Settings size={16} /> Preferences
                                        </button>
                                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                                        <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2">
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* View Container */}
                <div className="flex-1 overflow-hidden relative">
                    {currentView === 'WORKSPACE' && <Workspace />}
                    {currentView === 'PROJECT' && <ProjectView />}
                    {currentView === 'PROFILE' && <Profile />}
                </div>
            </div>
        </div>
    );
}

const SidebarItem = ({ icon, active = false, label, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all mx-auto relative
      ${active
                ? 'bg-blue-600/10 text-blue-500 after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-8 after:bg-blue-500 after:rounded-l-full'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
        title={label}
    >
        {icon}
    </button>
);