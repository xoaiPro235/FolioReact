
import React, { useMemo } from 'react';
import { useStore } from '../store';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TaskStatus, Task } from '../types';
import { STATUS_CONFIG, StatusBadge } from './Shared';
import { Activity, Calendar, Clock, AlertCircle } from 'lucide-react';

export const Overview: React.FC = () => {
  const { tasks, users, activities, setSelectedTask } = useStore();

  // CRITICAL: Analytics now INCLUDE Subtasks (as requested)
  const allTasks = tasks;

  const statusData = useMemo(() => {
    const counts = allTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

    return [
      { name: 'To Do', value: counts[TaskStatus.TODO] || 0, color: '#94a3b8' }, // Slate
      { name: 'Pending', value: counts[TaskStatus.PENDING] || 0, color: '#fbbf24' }, // Amber
      { name: 'In Progress', value: counts[TaskStatus.IN_PROGRESS] || 0, color: '#3b82f6' }, // Blue
      { name: 'Done', value: counts[TaskStatus.DONE] || 0, color: '#22c55e' }, // Green
    ].filter(item => item.value > 0);
  }, [allTasks]);

  const workloadData = useMemo(() => {
    const assigneeCounts = allTasks.reduce((acc, task) => {
      const assigneeName = users.find(u => u.id === task.assigneeId)?.name || 'Unassigned';
      acc[assigneeName] = (acc[assigneeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(assigneeCounts).map(([name, count]) => ({
      name,
      tasks: count,
    }));
  }, [allTasks, users]);

  // Widgets Split
  const todoCount = allTasks.filter(t => t.status === TaskStatus.TODO).length;
  const inProgressCount = allTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const pendingCount = allTasks.filter(t => t.status === TaskStatus.PENDING).length;
  const doneCount = allTasks.filter(t => t.status === TaskStatus.DONE).length;

  // Upcoming Events Logic
  const upcomingTasks = useMemo(() => {
     const now = new Date();
     const threeDaysFromNow = new Date();
     threeDaysFromNow.setDate(now.getDate() + 3);

     return allTasks.filter(t => {
        if(!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d >= now && d <= threeDaysFromNow && t.status !== TaskStatus.DONE;
     }).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [allTasks]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard 
            icon={STATUS_CONFIG[TaskStatus.TODO].icon} 
            color={STATUS_CONFIG[TaskStatus.TODO].color} 
            label="To Do" 
            value={todoCount} 
        />
        <SummaryCard 
            icon={STATUS_CONFIG[TaskStatus.PENDING].icon} 
            color={STATUS_CONFIG[TaskStatus.PENDING].color} 
            label="Pending" 
            value={pendingCount} 
        />
        <SummaryCard 
            icon={STATUS_CONFIG[TaskStatus.IN_PROGRESS].icon} 
            color={STATUS_CONFIG[TaskStatus.IN_PROGRESS].color} 
            label="In Progress" 
            value={inProgressCount} 
        />
        <SummaryCard 
            icon={STATUS_CONFIG[TaskStatus.DONE].icon} 
            color={STATUS_CONFIG[TaskStatus.DONE].color} 
            label="Done" 
            value={doneCount} 
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">Status Distribution (Includes Subtasks)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">Workload by Assignee</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" strokeOpacity={0.5}/>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#64748b'}} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="tasks" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
             <Activity className="w-5 h-5 text-orange-500" />
             Recent Activity
           </h3>
           <div className="space-y-4">
             {activities.slice(0, 5).map(act => {
               const user = users.find(u => u.id === act.userId);
               const task = tasks.find(t => t.title === act.target); 
               
               // Helper to check if action contains status info
               // Defensive split to ensure we get a string or empty string, preventing undefined
               const isStatusUpdate = act.action.includes('status');
               const statusFromAction = isStatusUpdate ? (act.action.split('to ')[1] || '').trim() : '';

               return (
                 <div 
                    key={act.id} 
                    className={`flex gap-3 items-start p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${task ? 'cursor-pointer' : ''}`}
                    onClick={() => task && setSelectedTask(task.id)}
                 >
                   <img src={user?.avatar} className="w-8 h-8 rounded-full bg-slate-200" alt="" />
                   <div>
                     <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
                       <span className="font-semibold">{user?.name}</span> 
                       {isStatusUpdate && statusFromAction ? (
                          <> updated status to <StatusBadge status={statusFromAction}/></>
                       ) : (
                          <> {act.action} </>
                       )}
                       <span className="font-medium text-blue-600 dark:text-blue-400">"{act.target}"</span>
                     </p>
                     <p className="text-xs text-slate-400 mt-1">{new Date(act.createdAt).toLocaleString()}</p>
                   </div>
                 </div>
               );
             })}
             {activities.length === 0 && <p className="text-slate-400 text-sm">No recent activity.</p>}
           </div>
        </div>

        {/* Upcoming Deadlines (RESTORED) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Upcoming Deadlines (Next 3 Days)
            </h3>
            <div className="space-y-3">
                {upcomingTasks.length > 0 ? upcomingTasks.map(task => (
                    <div 
                        key={task.id}
                        onClick={() => setSelectedTask(task.id)}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg cursor-pointer hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold leading-tight">
                                <span className="text-[10px] uppercase">{new Date(task.dueDate).toLocaleString('default', {month: 'short'})}</span>
                                <span className="text-lg">{new Date(task.dueDate).getDate()}</span>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">{task.title}</p>
                                <p className="text-xs text-red-500 font-medium">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <Calendar className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm">No immediate deadlines.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, color, label, value }: any) => (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow`}>
        <div className={`p-3 rounded-lg border ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
        </div>
    </div>
);
