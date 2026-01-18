import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { Task, TaskStatus } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarView: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { tasks, loadProjectTasks, isProjectTasksLoaded } = useStore();

    useEffect(() => {
        if (projectId && !isProjectTasksLoaded) {
            loadProjectTasks(projectId);
        }
    }, [projectId, loadProjectTasks, isProjectTasksLoaded]);

    const handleTaskClick = (taskId: string) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('selectedIssue', taskId);
        setSearchParams(nextParams);
    };

    const [currentDate, setCurrentDate] = useState(new Date());

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const prevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

    const days = useMemo(() => {
        const daysArray = [];
        // Padding for prev month
        for (let i = 0; i < firstDayOfMonth; i++) {
            daysArray.push(null);
        }
        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            daysArray.push(i);
        }
        return daysArray;
    }, [currentMonth, currentYear]);

    const getTasksForDay = (day: number) => {
        return tasks.filter(t => {
            if (!t.dueDate) return false;
            const d = new Date(t.dueDate);
            return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-4">
                    {/* SỬA LỖI: Thêm min-w-[220px] để cố định chiều rộng, tránh nhảy nút */}
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize min-w-[220px]">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                        <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors text-slate-500 dark:text-slate-300">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={goToToday} className="px-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors text-slate-500 dark:text-slate-300">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="text-sm text-slate-500">
                    {tasks.filter(t => t.dueDate && new Date(t.dueDate).getMonth() === currentMonth && new Date(t.dueDate).getFullYear() === currentYear).length} tasks due
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
                {weekDays.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 grid-rows-5 flex-1 bg-slate-100 dark:bg-slate-800 gap-px border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
                {days.map((day, idx) => (
                    <div key={idx} className={`bg-white dark:bg-slate-900 min-h-[100px] p-2 flex flex-col hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${!day ? 'bg-slate-50/50 dark:bg-slate-900/50' : ''}`}>
                        {day && (
                            <>
                                <span className={`text-sm font-semibold mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {day}
                                </span>
                                <div className="space-y-1 overflow-y-auto scrollbar-thin max-h-[120px]">
                                    {getTasksForDay(day).map(task => (
                                        <div
                                            key={task.id}
                                            onClick={() => handleTaskClick(task.id)}
                                            className={`text-[10px] px-2 py-1.5 rounded-md truncate cursor-pointer transition-all border-l-2 shadow-sm hover:shadow-md hover:-translate-y-0.5
                                            ${task.status === TaskStatus.DONE
                                                    ? 'bg-green-50 text-green-700 border-green-500 dark:bg-green-900/20 dark:text-green-300'
                                                    : task.status === TaskStatus.PENDING
                                                        ? 'bg-orange-50 text-orange-700 border-orange-500 dark:bg-orange-900/20 dark:text-orange-300'
                                                        : task.status === TaskStatus.IN_PROGRESS
                                                            ? 'bg-blue-50 text-blue-700 border-blue-500 dark:bg-blue-900/20 dark:text-blue-300'
                                                            : 'bg-slate-100 text-slate-600 border-slate-400 dark:bg-slate-800 dark:text-slate-400'
                                                }
                                        `}
                                            title={task.title}
                                        >
                                            {task.title}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};