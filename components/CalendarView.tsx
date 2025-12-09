
import React, { useMemo } from 'react';
import { useStore } from '../store';
import { Task, TaskStatus } from '../types';

export const CalendarView: React.FC<{ onSelectTask: (taskId: string) => void }> = ({ onSelectTask }) => {
  const { tasks } = useStore();
  
  // Simple month generation logic
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
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
    // Show only root tasks on calendar? Or all? Let's show all for now as deadlines matter for subtasks too.
    return tasks.filter(t => {
        if(!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="text-sm text-slate-500">
                {tasks.filter(t => new Date(t.dueDate).getMonth() === currentMonth).length} tasks this month
            </div>
        </div>
        
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
            {weekDays.map(day => (
                <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                    {day}
                </div>
            ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-5 flex-1 bg-slate-100 dark:bg-slate-800 gap-px border-l border-slate-200 dark:border-slate-800">
            {days.map((day, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 min-h-[100px] p-2 flex flex-col hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    {day && (
                        <>
                            <span className={`text-sm font-semibold mb-2 ${day === today.getDate() ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-700 dark:text-slate-300'}`}>
                                {day}
                            </span>
                            <div className="space-y-1 overflow-y-auto max-h-[100px]">
                                {getTasksForDay(day).map(task => (
                                    <div 
                                        key={task.id}
                                        onClick={() => onSelectTask(task.id)}
                                        className={`text-[10px] px-1.5 py-1 rounded truncate cursor-pointer transition-colors border-l-2
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
