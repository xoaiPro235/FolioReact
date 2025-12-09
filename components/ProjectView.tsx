import React, { useState, useEffect } from 'react';
import { TabType, Role, Task, Priority } from '../types';
import { Overview } from './Overview';
import { KanbanBoard } from './KanbanBoard';
import { TaskListView } from './TaskListView';
import { CalendarView } from './CalendarView';
import { TeamView } from './TeamView';
import { LayoutGrid, Kanban, List, Calendar as CalendarIcon, Users, ArrowLeft, History, Plus, Activity, Clock } from 'lucide-react';
import { useStore } from '../store';
import { signalRService } from '../services/api';
import { TaskModal } from './TaskModal';
import { CreateTaskModal } from './CreateTaskModal';
import { StatusBadge } from './Shared';

export const ProjectView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Create Task Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { currentProject, loadProjectData, activities, goToWorkspace, getUserRole, addNotification, selectedTaskId, setSelectedTask, users } = useStore();

  const role = getUserRole();
  const canEdit = role !== Role.VIEWER;

  useEffect(() => {
    if (currentProject) {
      loadProjectData(currentProject.id);
      signalRService.connect(currentProject.id, (type, payload) => {
        if (type === 'COMMENT') {
           addNotification(payload.message, 'INFO');
        }
      });
    }
    return () => signalRService.disconnect();
  }, [currentProject?.id]);

  if (!currentProject) return <div className="p-10 dark:text-white flex items-center justify-center">Loading Project...</div>;

  // Filter online members
  const onlineMembers = currentProject.members
      .map(m => users.find(u => u.id === m.userId))
      .filter((u): u is typeof u => !!u && u.isOnline === true);

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950">
      {/* Header */}
      <header className="px-8 pt-6 pb-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <button onClick={goToWorkspace} className="flex items-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Workspace
        </button>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {currentProject.name}
              <span className="text-xs font-normal bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{role} VIEW</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{currentProject.description}</p>
          </div>
          
          <div className="flex items-center gap-6">
              {/* Active Members - Moved to Header */}
              <div className="hidden lg:flex items-center -space-x-2">
                  {onlineMembers.slice(0, 5).map((user, i) => (
                        <div key={user?.id || i} className="relative group/avatar cursor-help">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center overflow-hidden">
                                {user ? <img src={user.avatar} className="w-full h-full object-cover" /> : <Users className="w-4 h-4 text-slate-400" />}
                            </div>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {user?.name}
                            </div>
                        </div>
                  ))}
                  {onlineMembers.length > 5 && (
                     <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                         +{onlineMembers.length - 5}
                     </div>
                  )}
                  {onlineMembers.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No active members</span>
                  )}
              </div>

              {canEdit && (
                <button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all hover:shadow-blue-500/20">
                    <Plus className="w-4 h-4" /> New Task
                </button>
              )}
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutGrid className="w-4 h-4" />} label="Overview" />
          <TabButton active={activeTab === 'kanban'} onClick={() => setActiveTab('kanban')} icon={<Kanban className="w-4 h-4" />} label="Board" />
          <TabButton active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={<List className="w-4 h-4" />} label="List" />
          <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarIcon className="w-4 h-4" />} label="Calendar" />
          <TabButton active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={<Users className="w-4 h-4" />} label="Team" />
          <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={<History className="w-4 h-4" />} label="Activity Log" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-950">
        <div className={`absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 p-4 sm:p-8 ${activeTab === 'kanban' ? 'flex flex-col' : ''}`}>
            <div className={`mx-auto w-full h-full ${activeTab === 'kanban' ? 'flex flex-col' : 'max-w-[1600px]'}`}>
              
              {activeTab === 'overview' && (
                  <div className="max-w-6xl mx-auto w-full">
                      <Overview />
                  </div>
              )}
              
              {activeTab === 'kanban' && (
                  <div className="flex-1 min-h-[500px] w-full">
                      <KanbanBoard />
                  </div>
              )}

              {activeTab === 'list' && <TaskListView canEdit={canEdit} onSelectTask={setSelectedTask} />}

              {activeTab === 'calendar' && <CalendarView onSelectTask={setSelectedTask} />}

              {activeTab === 'team' && <TeamView />}

              {activeTab === 'activity' && (
                <div className="max-w-4xl mx-auto w-full">
                     <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3">
                            <Activity className="w-6 h-6 text-blue-500" /> 
                            Project Activity Log
                        </h3>
                        <div className="space-y-6">
                            {activities.map(act => {
                                const user = users.find(u => u.id === act.userId);
                                const task = useStore.getState().tasks.find(t => t.title === act.target);
                                
                                // Status Badge Parsing Logic
                                const isStatusUpdate = act.action.includes('status');
                                const statusFromAction = isStatusUpdate ? (act.action.split('to ')[1] || '').trim() : '';

                                return (
                                    <div 
                                        key={act.id} 
                                        className={`flex gap-4 items-start p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${task ? 'cursor-pointer' : ''}`}
                                        onClick={() => task && setSelectedTask(task.id)}
                                    >
                                        <img src={user?.avatar} className="w-10 h-10 rounded-full bg-slate-200 shadow-sm" alt="" />
                                        <div className="flex-1">
                                            <p className="text-base text-slate-800 dark:text-slate-200 leading-snug">
                                                <span className="font-bold text-slate-900 dark:text-white">{user?.name}</span> 
                                                {isStatusUpdate && statusFromAction ? (
                                                    <> updated status to <StatusBadge status={statusFromAction}/></>
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
              )}
            </div>
        </div>
      </main>

      {/* Global Task Modal */}
      {selectedTaskId && <TaskModal />}

      {/* Create Task Modal */}
      {isCreateOpen && (
          <CreateTaskModal 
              isOpen={isCreateOpen}
              onClose={() => setIsCreateOpen(false)}
          />
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${active ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
  >
    {icon} {label}
  </button>
);