import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, TaskStatus, Priority, Role, TabType } from '../types';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { LayoutGrid, Kanban, List, Calendar as CalendarIcon, Users, ArrowLeft, History, Plus, Activity, Clock, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { TaskModal } from './TaskModal';
import { CreateTaskModal } from './CreateTaskModal';

interface ProjectViewProps {
  children?: React.ReactNode;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: projectId } = useParams<{ id: string }>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    currentProject,
    getUserRole,
    selectedTaskId,
    setSelectedTask,
    updateProject,
    users
  } = useStore();

  const role = getUserRole();
  const canEdit = role !== Role.VIEWER;
  const isOwner = role === Role.OWNER;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    if (currentProject) {
      setEditName(currentProject.name);
      setEditDesc(currentProject.description);
    }
  }, [currentProject]);

  const handleSaveProject = async () => {
    if (!currentProject) return;
    try {
      await updateProject(currentProject.id, editName, editDesc);
      setIsEditing(false);
    } catch (error) {
      // Error handled by store notification
    }
  };

  const [searchParams] = useSearchParams();
  const selectedIssue = searchParams.get('selectedIssue');

  // Sync URL parameter -> Store
  // URL is the SOURCE OF TRUTH. Components should update URL to open/close task.
  useEffect(() => {
    if (selectedIssue !== selectedTaskId) {
      setSelectedTask(selectedIssue);
    }
  }, [selectedIssue, selectedTaskId, setSelectedTask]);

  const currentTab = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/overview')) return 'overview';
    if (path.includes('/board')) return 'kanban';
    if (path.includes('/list')) return 'list';
    if (path.includes('/calendar')) return 'calendar';
    if (path.includes('/team')) return 'team';
    if (path.includes('/activity')) return 'activity';
    return 'kanban';
  }, [location.pathname]);

  if (!currentProject) return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-md" />
        </div>
      </div>
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-t-lg" />)}
      </div>
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse" />
    </div>
  );

  const onlineMembers = currentProject.members
    .map(m => users.find(u => u.id === m.userId))
    .filter((u): u is typeof u => !!u && u.isOnline === true);


  const handleTabChange = (tab: TabType) => {
    const pathMap: Record<TabType, string> = {
      overview: 'overview',
      kanban: 'board',
      list: 'list',
      calendar: 'calendar',
      team: 'team',
      activity: 'activity'
    };
    navigate(`/project/${projectId}/${pathMap[tab]}${location.search}`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950">
      {/* Header */}
      <header className="px-8 pt-6 pb-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <button
          onClick={() => navigate('/workspace')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors mb-2"
          title="Back to Workspace"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex justify-between items-start mb-4">
          <div>
            {isEditing ? (
              <div className="space-y-3 min-w-[300px]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-2xl font-bold bg-slate-50 dark:bg-slate-800 border border-blue-500 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Project Name"
                    autoFocus
                  />
                  <button onClick={handleSaveProject} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => { setIsEditing(false); setEditName(currentProject.name); setEditDesc(currentProject.description); }} className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Project Description"
                />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 group">
                  {currentProject.name}
                  <span className="text-xs font-normal bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{role} VIEW</span>
                  {isOwner && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{currentProject.description}</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center -space-x-2">
              {onlineMembers.slice(0, 5).map((user, i) => (
                <div key={user?.id || i} className="relative group/avatar cursor-help">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center overflow-hidden">
                    {user ? <img src={user.avatar} className="w-full h-full object-cover shadow-inner" /> : <Users className="w-4 h-4 text-slate-400" />}
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
            </div>

            {canEdit && (
              <button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all hover:shadow-blue-500/20">
                <Plus className="w-4 h-4" /> New Task
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          <TabButton active={currentTab === 'overview'} onClick={() => handleTabChange('overview')} icon={<LayoutGrid className="w-4 h-4" />} label="Overview" />
          <TabButton active={currentTab === 'kanban'} onClick={() => handleTabChange('kanban')} icon={<Kanban className="w-4 h-4" />} label="Board" />
          <TabButton active={currentTab === 'list'} onClick={() => handleTabChange('list')} icon={<List className="w-4 h-4" />} label="List" />
          <TabButton active={currentTab === 'calendar'} onClick={() => handleTabChange('calendar')} icon={<CalendarIcon className="w-4 h-4" />} label="Calendar" />
          <TabButton active={currentTab === 'team'} onClick={() => handleTabChange('team')} icon={<Users className="w-4 h-4" />} label="Team" />
          <TabButton active={currentTab === 'activity'} onClick={() => handleTabChange('activity')} icon={<History className="w-4 h-4" />} label="Activity Log" />
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 p-4 sm:p-8 ${currentTab === 'kanban' ? 'flex flex-col' : ''}`}>
          <div className={`mx-auto w-full ${currentTab === 'kanban' ? 'flex-1 flex flex-col' : 'max-w-[1600px] min-h-full'}`}>
            {children}
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
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap relative ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
  >
    {icon} {label}
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </button>
);
