import React, { useState, useEffect, useMemo } from 'react';
import { TaskStatus, Priority, ActivityLog, Role } from '../types';
import { X, Calendar, MessageSquare, Plus, Trash2, Paperclip, MoreVertical, CheckCircle, Clock, Tag, UserPlus, AlertCircle, History, ChevronRight, Hash, Type, AlignLeft, CornerUpLeft, Send, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { useTasks, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { CreateTaskModal } from './CreateTaskModal';
import { UserSelect } from './UserSelect';
import {
  StatusSelect, PrioritySelect, AttachmentList, ConfirmDialog,
  StatusBadge, PriorityBadge
} from './Shared';
import { fetchTaskActivities } from '../services/api';

export const TaskModal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    selectedTaskId,
    setSelectedTask,
    users,
    currentUser,
    addComment,
    deleteComment,
    currentProject,
    addAttachment,
    removeAttachment,
    getUserRole
  } = useStore();

  const { id: projectId } = useParams<{ id: string }>();
  const { data: tasks = [] } = useTasks(projectId);
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const handleClose = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('selectedIssue');
    setSearchParams(nextParams);
  };

  const navigateToTask = (taskId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('selectedIssue', taskId);
    setSearchParams(nextParams);
  };

  const [commentText, setCommentText] = useState('');
  const [isCreateSubtaskOpen, setIsCreateSubtaskOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [taskLogs, setTaskLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'TASK' | 'SUBTASK' | 'ATTACHMENT' | 'COMMENT';
    id: string;
    extraId?: string; // For taskId when deleting comment
  }>({ isOpen: false, type: 'TASK', id: '' });

  const [localTitle, setLocalTitle] = useState('');
  const [localDesc, setLocalDesc] = useState('');

  const task = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);

  const projectMembers = useMemo(() => {
    return users.filter(u => {
      const member = currentProject?.members.find(m => m.userId === u.id);
      return member && member.role !== Role.VIEWER;
    });
  }, [users, currentProject?.members]);

  useEffect(() => {
    if (task) {
      setLocalTitle(task.title);
      setLocalDesc(task.description);
    }
  }, [task?.id, task?.title, task?.description]);

  useEffect(() => {
    if (activeTab === 'activity' && task?.id) {
      setIsLoadingLogs(true);
      fetchTaskActivities(task.id)
        .then(logs => setTaskLogs(logs))
        .catch(console.error)
        .finally(() => setIsLoadingLogs(false));
    }
  }, [activeTab, task?.id]);

  if (!task) return null;

  const isSubtask = !!task.parentTaskId;
  const parentTask = isSubtask ? tasks.find(t => t.id === task.parentTaskId) : null;
  const subtasks = tasks.filter(t => t.parentTaskId === task.id);
  const role = getUserRole();
  const readOnly = role === Role.VIEWER || role === null;

  const handleStatusChange = (newStatus: string) => {
    updateMutation.mutate({ taskId: task.id, updates: { status: newStatus as TaskStatus } });
  };

  const handleAssigneeChange = (newUserId: string) => {
    updateMutation.mutate({ taskId: task.id, updates: { assigneeId: newUserId } });
  };

  const handleDateChange = (field: 'startDate' | 'dueDate', value: string) => {
    updateMutation.mutate({ taskId: task.id, updates: { [field]: value } });
  };

  const handleBlurTitle = () => {
    if (localTitle !== task.title) {
      updateMutation.mutate({ taskId: task.id, updates: { title: localTitle } });
    }
  };

  const handleBlurDesc = () => {
    if (localDesc !== task.description) {
      updateMutation.mutate({ taskId: task.id, updates: { description: localDesc } });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || readOnly) return;
    addComment(task.id, commentText);
    setCommentText('');
  };

  const handleDeleteTaskClick = () => {
    setDeleteConfirm({ isOpen: true, type: 'TASK', id: task.id });
  };

  const handleDeleteSubtaskClick = (subtaskId: string) => {
    setDeleteConfirm({ isOpen: true, type: 'SUBTASK', id: subtaskId });
  };

  const handleRemoveAttachmentClick = (fileId: string) => {
    setDeleteConfirm({ isOpen: true, type: 'ATTACHMENT', id: fileId });
  };

  const executeDelete = () => {
    if (deleteConfirm.type === 'TASK') {
      deleteMutation.mutate(deleteConfirm.id);
      handleClose();
    } else if (deleteConfirm.type === 'SUBTASK') {
      deleteMutation.mutate(deleteConfirm.id);
    } else if (deleteConfirm.type === 'ATTACHMENT') {
      removeAttachment(task.id, deleteConfirm.id);
    } else if (deleteConfirm.type === 'COMMENT') {
      deleteComment(task.id, deleteConfirm.id);
    }
  };

  const handleUpload = (file: File) => {
    addAttachment(task.id, file);
  };

  const getUser = (userId: string) => users.find(u => u.id === userId);
  const completedSubtasks = subtasks.filter(s => s.status === TaskStatus.DONE).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-[85vh] md:h-[90vh] lg:h-[85vh] max-h-[100dvh] sm:max-h-[90vh] border border-slate-200 dark:border-slate-800 z-10"
      >

        {/* Header */}
        <div className="flex flex-col gap-3 p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto no-scrollbar">
            {isSubtask && parentTask && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/50 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors whitespace-nowrap" onClick={() => navigateToTask(parentTask.id)}>
                <CornerUpLeft className="w-3.5 h-3.5" />
                <span className="font-semibold">Parent: {parentTask.title}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <StatusSelect value={task.status} onChange={handleStatusChange} readOnly={readOnly} large />
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <div className="hidden sm:block">
                <UserSelect
                  users={projectMembers}
                  selectedUserId={task.assigneeId}
                  onChange={handleAssigneeChange}
                  readOnly={readOnly}
                  className="w-48 md:w-64 h-10"
                />
              </div>
              {!readOnly && (
                <button onClick={handleDeleteTaskClick} className="p-2 sm:p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-slate-400 hover:text-red-600 transition-colors" title="Delete Task">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button onClick={handleClose} className="p-2 sm:p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Assignee Picker */}
          <div className="sm:hidden w-full">
            <UserSelect
              users={projectMembers}
              selectedUserId={task.assigneeId}
              onChange={handleAssigneeChange}
              readOnly={readOnly}
              className="w-full h-11"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            <input
              readOnly={readOnly}
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleBlurTitle}
              className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6 bg-transparent border-none outline-none w-full placeholder:text-slate-300"
              placeholder="Task Title"
            />

            <div className="mb-8 group">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Description</h3>
              <textarea
                readOnly={readOnly}
                value={localDesc}
                onChange={(e) => setLocalDesc(e.target.value)}
                onBlur={handleBlurDesc}
                className="w-full min-h-[120px] text-slate-600 dark:text-slate-300 leading-relaxed bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg p-3 transition-colors resize-none focus:bg-slate-50 dark:focus:bg-slate-800/50 focus:border-blue-500 outline-none text-base"
                placeholder="Add a description..."
              />
            </div>

            <div className="mb-8">
              <AttachmentList files={task.files} onUpload={readOnly ? undefined : handleUpload} onDelete={readOnly ? undefined : handleRemoveAttachmentClick} />
            </div>

            {/* Subtasks */}
            {!isSubtask && (
              <div className="mb-8 p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-slate-400" /> Subtasks
                  </h3>
                  <span className="text-xs text-slate-500 font-medium bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">{completedSubtasks}/{subtasks.length} Done</span>
                </div>

                {subtasks.length > 0 && (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mb-6 overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
                )}

                <div className="space-y-3 mb-5">
                  {subtasks.map(st => (
                    <div
                      key={st.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <StatusSelect minimal value={st.status} onChange={(val) => updateMutation.mutate({ taskId: st.id, updates: { status: val } })} readOnly={readOnly} />
                        </div>
                        <span
                          className={`flex-1 text-sm font-semibold truncate cursor-pointer hover:text-blue-600 ${st.status === TaskStatus.DONE ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}
                          onClick={() => navigateToTask(st.id)}
                        >
                          {st.title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-8 sm:pl-0">
                        <div className="flex items-center gap-2">
                          <PrioritySelect minimal value={st.priority} onChange={(val) => updateMutation.mutate({ taskId: st.id, updates: { priority: val } })} readOnly={readOnly} />
                          <UserSelect
                            users={projectMembers}
                            selectedUserId={st.assigneeId}
                            onChange={(uid) => updateMutation.mutate({ taskId: st.id, updates: { assigneeId: uid } })}
                            readOnly={readOnly}
                            className="w-28 sm:w-32"
                          />
                        </div>
                        {!readOnly && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteSubtaskClick(st.id); }}
                            className="sm:opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {subtasks.length === 0 && <p className="text-slate-400 text-sm italic py-2">No subtasks yet.</p>}
                </div>

                {!readOnly && (
                  <button
                    onClick={() => setIsCreateSubtaskOpen(true)}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-3 rounded-lg transition-colors w-full justify-center border border-dashed border-blue-200 dark:border-blue-800"
                  >
                    <Plus className="w-4 h-4" /> Add New Subtask
                  </button>
                )}
              </div>
            )}

            {/* TAB SYSTEM */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-6 mb-6 border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'comments' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  <MessageSquare className="w-4 h-4" /> Comments ({task.comments?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'activity' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  <History className="w-4 h-4" /> Activity Log
                </button>
              </div>

              {activeTab === 'comments' && (
                <div className="space-y-6 mb-6">
                  {(task.comments?.length || 0) > 0 ? [...(task.comments || [])].reverse().map(c => {
                    const u = getUser(c.userId);
                    return (
                      <div key={c.id} className="flex gap-4 group">
                        <img src={u?.avatar} className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-900" alt="" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{u?.name}</span>
                              <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                            </div>
                            {c.userId === currentUser?.id && (
                              <button
                                onClick={() => setDeleteConfirm({ isOpen: true, type: 'COMMENT', id: c.id })}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-all"
                                title="Delete comment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            {c.content}
                          </div>
                        </div>
                      </div>
                    );
                  }) : <p className="text-slate-400 text-sm italic">No comments yet.</p>}

                  {!readOnly && (
                    <form onSubmit={handleAddComment} className="flex gap-4 mt-4">
                      <img src={currentUser?.avatar} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 hidden sm:block" alt="" />
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full pl-4 pr-12 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all h-12"
                        />
                        <button type="submit" disabled={!commentText.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6 mb-6">
                  {isLoadingLogs ? (
                    <div className="flex items-center justify-center py-12 text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium">Loading history...</p>
                      </div>
                    </div>
                  ) : taskLogs.length > 0 ? (
                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-8 py-4">
                      {taskLogs.map(log => {
                        const uId = log.userId || (log as any).UserId;
                        const u = getUser(uId);
                        const lowerAction = log.action.toLowerCase();
                        const isStatusUpdate = lowerAction.includes('status to');
                        const statusFromAction = isStatusUpdate ? (log.action.split(/to /i)[1] || '').trim().toUpperCase() : '';

                        const isPriorityUpdate = lowerAction.includes('priority to');
                        const priorityFromAction = isPriorityUpdate ? (log.action.split(/to /i)[1] || '').trim().toUpperCase() : '';

                        return (
                          <div key={log.id} className="relative pl-8">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 ring-4 ring-white dark:ring-slate-900"></div>
                            <div className="flex flex-col gap-1.5">
                              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                <span className="font-bold text-slate-900 dark:text-white mr-1.5">{u?.name || 'Unknown'}</span>
                                {isStatusUpdate && statusFromAction ? (
                                  <>
                                    {log.action.split(/to /i)[0]} to <StatusBadge status={statusFromAction} />
                                  </>
                                ) : isPriorityUpdate && priorityFromAction ? (
                                  <>
                                    {log.action.split(/to /i)[0]} to <PriorityBadge priority={priorityFromAction} />
                                  </>
                                ) : (
                                  <span className="capitalize">{log.action}</span>
                                )}

                                <span
                                  className="ml-1.5 font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                                  onClick={() => log.taskId && navigateToTask(log.taskId)}
                                >
                                  "{log.target}"
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {new Date(log.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      <History className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm font-medium">No activity recorded for this task.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 p-6 sm:p-8 space-y-8 overflow-y-auto">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Details</h4>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5 flex items-center gap-2"><Calendar className="w-3 h-3" /> Start Date</label>
                    <input
                      disabled={readOnly}
                      type="date"
                      value={task.startDate?.split('T')[0] ?? ''}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-4 py-2.5 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5 flex items-center gap-2"><Calendar className="w-3 h-3" /> Due Date</label>
                    <input
                      disabled={readOnly}
                      type="date"
                      value={task.dueDate?.split('T')[0] ?? ''}
                      onChange={(e) => handleDateChange('dueDate', e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-4 py-2.5 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5 block">Priority</label>
                  <PrioritySelect
                    value={task.priority}
                    onChange={(val) => updateMutation.mutate({ taskId: task.id, updates: { priority: val } })}
                    readOnly={readOnly}
                    className="w-full"
                    large
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              <p>Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </motion.div>
      {isCreateSubtaskOpen && (
        <CreateTaskModal
          isOpen={isCreateSubtaskOpen}
          onClose={() => setIsCreateSubtaskOpen(false)}
          parentTaskId={task.id}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={executeDelete}
        title={
          deleteConfirm.type === 'TASK' ? 'Delete Task?' :
            deleteConfirm.type === 'SUBTASK' ? 'Delete Subtask?' :
              deleteConfirm.type === 'COMMENT' ? 'Delete Comment?' :
                'Remove File?'
        }
        description="Are you sure? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};