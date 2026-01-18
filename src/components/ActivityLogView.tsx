import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { Activity, History, Clock } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './Shared';

export const ActivityLogView: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { activities, users, tasks } = useStore();

    const handleTaskClick = (taskId: string) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('selectedIssue', taskId);
        setSearchParams(nextParams);
    };

    return (
        <div className="max-w-4xl mx-auto w-full">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-blue-500" />
                    Project Activity Log
                </h3>
                <div className="space-y-6">
                    {activities.map(act => {
                        const user = users.find(u => u.id === act.userId);
                        const task = tasks.find(t => t.id === act.taskId);
                        const isStatusUpdate = act.action.includes('status to');
                        const statusFromAction = isStatusUpdate ? (act.action.split('to ')[1] || '').trim() : '';

                        const isPriorityUpdate = act.action.includes('priority to');
                        const priorityFromAction = isPriorityUpdate ? (act.action.split('to ')[1] || '').trim() : '';

                        return (
                            <div
                                key={act.id}
                                className={`flex gap-4 items-start p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${task ? 'cursor-pointer' : ''}`}
                                onClick={() => task && handleTaskClick(task.id)}
                            >
                                <img src={user?.avatar} className="w-10 h-10 rounded-full bg-slate-200 shadow-sm object-cover" alt="" />
                                <div className="flex-1">
                                    <p className="text-base text-slate-800 dark:text-slate-200 leading-snug">
                                        <span className="font-bold text-slate-900 dark:text-white">{user?.name}</span>

                                        {isStatusUpdate && statusFromAction ? (
                                            <> updated status to <StatusBadge status={statusFromAction} /></>
                                        ) : isPriorityUpdate && priorityFromAction ? (
                                            <> updated priority to <PriorityBadge priority={priorityFromAction} /></>
                                        ) : (
                                            <> {act.action} </>
                                        )}

                                        <span className="font-medium text-blue-600 dark:text-blue-400 hover:underline">"{act.target}"</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {new Date(act.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    {activities.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            No activity recorded yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
