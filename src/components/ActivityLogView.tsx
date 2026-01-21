import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { Activity, History, Clock, User, CheckCircle2, MessageSquare, PlusCircle, Pencil, Trash2, Paperclip, AlertCircle } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './Shared';
import { motion } from 'framer-motion';

const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('created')) return <PlusCircle className="w-4 h-4 text-green-500" />;
    if (act.includes('deleted')) return <Trash2 className="w-4 h-4 text-red-500" />;
    if (act.includes('comment')) return <MessageSquare className="w-4 h-4 text-blue-500" />;
    if (act.includes('file') || act.includes('attachment')) return <Paperclip className="w-4 h-4 text-purple-500" />;
    if (act.includes('status')) return <CheckCircle2 className="w-4 h-4 text-indigo-500" />;
    if (act.includes('priority')) return <AlertCircle className="w-4 h-4 text-orange-500" />;
    return <Pencil className="w-4 h-4 text-slate-400" />;
};

export const ActivityLogView: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { activities, users, tasks } = useStore();

    const handleTaskClick = (taskId: string) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('selectedIssue', taskId);
        setSearchParams(nextParams);
    };

    return (
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-0">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        Timeline Activity
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 ml-14">Track every change and update in your project.</p>
                </div>

                <div className="p-8 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[47px] top-8 bottom-8 w-0.5 bg-slate-100 dark:bg-slate-800" />

                    <div className="space-y-10 relative">
                        {[...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((act, idx) => {
                            const uId = act.userId || (act as any).UserId;
                            const user = users.find(u => u.id === uId);
                            const task = tasks.find(t => t.id === act.taskId || (act as any).TaskId);

                            // Parse action for badges
                            const lowerAction = act.action.toLowerCase();
                            const isStatusUpdate = lowerAction.includes('status to');
                            const statusFromAction = isStatusUpdate ? (act.action.split(/to /i)[1] || '').trim().toUpperCase() : '';

                            const isPriorityUpdate = lowerAction.includes('priority to');
                            const priorityFromAction = isPriorityUpdate ? (act.action.split(/to /i)[1] || '').trim().toUpperCase() : '';

                            return (
                                <motion.div
                                    key={act.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex gap-6 items-start group"
                                >
                                    {/* User Avatar with Icon Badge */}
                                    <div className="relative flex-shrink-0 z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center overflow-hidden">
                                            {user?.avatar ? (
                                                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <User className="w-6 h-6 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                                            {getActionIcon(act.action)}
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 pt-1">
                                        <div
                                            className={`p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 ${task ? 'cursor-pointer' : ''}`}
                                            onClick={() => task && handleTaskClick(task.id)}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                <span className="font-bold text-slate-900 dark:text-white text-base">
                                                    {user?.name || 'Unknown User'}
                                                </span>
                                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(act.createdAt).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {isStatusUpdate && statusFromAction ? (
                                                    <>
                                                        {act.action.split(/to /i)[0]} to <StatusBadge status={statusFromAction} />
                                                    </>
                                                ) : isPriorityUpdate && priorityFromAction ? (
                                                    <>
                                                        {act.action.split(/to /i)[0]} to <PriorityBadge priority={priorityFromAction} />
                                                    </>
                                                ) : (
                                                    <span className="capitalize">{act.action}</span>
                                                )}

                                                <span className="ml-1.5 font-bold text-blue-600 dark:text-blue-400 group-hover:underline transition-all">
                                                    "{act.target}"
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {activities.length === 0 && (
                            <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                <History className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No activity recorded yet.</p>
                                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Changes you make will appear here as a timeline.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
