
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { X, CheckSquare, MessageSquare, Send, Plus, Trash2, ArrowRight, CornerUpLeft, Clock, Calendar } from 'lucide-react';
import { useStore } from '../store';
import { CreateTaskModal } from './CreateTaskModal';
import { UserSelect } from './UserSelect';
import { StatusSelect, PrioritySelect, AttachmentList, ConfirmDialog } from './Shared';

export const TaskModal: React.FC = () => {
  const { users, currentUser, addNotification, deleteTask, addComment, tasks, patchTask, selectedTaskId, setSelectedTask, addAttachment, removeAttachment } = useStore();
  const [commentText, setCommentText] = useState('');
  const [isCreateSubtaskOpen, setIsCreateSubtaskOpen] = useState(false);
  
  // Confirmation Dialog State
  const [deleteConfirm, setDeleteConfirm] = useState<{
      isOpen: boolean;
      type: 'TASK' | 'SUBTASK' | 'ATTACHMENT';
      id: string;
  }>({ isOpen: false, type: 'TASK', id: '' });
  
  // Local State for Debounced Text Inputs
  const [localTitle, setLocalTitle] = useState('');
  const [localDesc, setLocalDesc] = useState('');

  const task = tasks.find(t => t.id === selectedTaskId);
  
  // Sync local state when task changes
  useEffect(() => {
    if (task) {
        setLocalTitle(task.title);
        setLocalDesc(task.description);
    }
  }, [task?.id, task?.title, task?.description]); 
  
  if (!task) return null;

  // STRICT LOGIC: Identify if this is a Subtask
  const isSubtask = !!task.parentTaskId;
  const parentTask = isSubtask ? tasks.find(t => t.id === task.parentTaskId) : null;
  
  // Find Recursive Children (Only valid if NOT a subtask)
  const subtasks = tasks.filter(t => t.parentTaskId === task.id);
  
  const readOnly = false; // Could be derived from RBAC if needed

  const handleStatusChange = (newStatus: string) => {
      // TODO: API Call - [PATCH] /api/tasks/{id} (status)
      patchTask(task.id, { status: newStatus as TaskStatus });
  };

  const handleAssigneeChange = (newUserId: string) => {
      // TODO: API Call - [PATCH] /api/tasks/{id} (assignee)
      patchTask(task.id, { assigneeId: newUserId });
  };

  const handleDateChange = (field: 'startDate' | 'dueDate', value: string) => {
      // TODO: API Call - [PATCH] /api/tasks/{id} (dates)
      patchTask(task.id, { [field]: value });
  };

  const handleBlurTitle = () => {
      if (localTitle !== task.title) {
          patchTask(task.id, { title: localTitle });
      }
  };

  const handleBlurDesc = () => {
      if (localDesc !== task.description) {
          patchTask(task.id, { description: localDesc });
      }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || readOnly) return;
    addComment(task.id, commentText);
    setCommentText('');
    addNotification("Comment added", "SUCCESS");
  };

  // Delete Handlers using Custom Dialog
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
          deleteTask(deleteConfirm.id);
          // Store handles modal closing
      } else if (deleteConfirm.type === 'SUBTASK') {
          deleteTask(deleteConfirm.id);
      } else if (deleteConfirm.type === 'ATTACHMENT') {
          removeAttachment(task.id, deleteConfirm.id);
      }
  };
  
  const handleUpload = (file: File) => {
      // TODO: API Call - [POST] /api/tasks/{id}/attachments
      addAttachment(task.id, file);
  };

  // Progress Bar
  const completedSubtasks = subtasks.filter(s => s.status === TaskStatus.DONE).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedTask(null)} />
      
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] border border-slate-200 dark:border-slate-800">
        
        {/* Interactive Header */}
        <div className="flex flex-col gap-4 p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
          
          {/* Breadcrumbs / Parent Link */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
             {isSubtask && parentTask && (
                 <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors" onClick={() => setSelectedTask(parentTask.id)}>
                     <CornerUpLeft className="w-3 h-3" />
                     <span className="font-medium">Belongs to: {parentTask.title}</span>
                 </div>
             )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <StatusSelect value={task.status} onChange={handleStatusChange} readOnly={readOnly} large />
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
               <UserSelect 
                  users={users} 
                  selectedUserId={task.assigneeId} 
                  onChange={handleAssigneeChange} 
                  readOnly={readOnly}
                  className="w-full sm:w-64 h-10"
               />
               
               <button onClick={handleDeleteTaskClick} className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-slate-400 hover:text-red-600 transition-colors" title="Delete Task">
                  <Trash2 className="w-5 h-5" />
               </button>
               <button onClick={() => setSelectedTask(null)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            <input 
               value={localTitle}
               onChange={(e) => setLocalTitle(e.target.value)}
               onBlur={handleBlurTitle}
               className="text-3xl font-bold text-slate-900 dark:text-white mb-6 bg-transparent border-none outline-none w-full placeholder:text-slate-300"
               placeholder="Task Title"
            />
            
            {/* Description */}
            <div className="mb-8 group">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Description</h3>
              <textarea 
                value={localDesc}
                onChange={(e) => setLocalDesc(e.target.value)}
                onBlur={handleBlurDesc}
                className="w-full min-h-[120px] text-slate-600 dark:text-slate-300 leading-relaxed bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg p-3 transition-colors resize-none focus:bg-slate-50 dark:focus:bg-slate-800/50 focus:border-blue-500 outline-none text-base"
                placeholder="Add a description..."
              />
            </div>
            
            {/* Attachments */}
            <div className="mb-8">
                <AttachmentList files={task.files} onUpload={handleUpload} onDelete={handleRemoveAttachmentClick} />
            </div>

            {/* Subtasks - Detailed List (ONLY FOR ROOT TASKS) */}
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
                            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                        >
                            {/* Status Select Inline */}
                            <div className="flex-shrink-0">
                            <StatusSelect minimal value={st.status} onChange={(val) => patchTask(st.id, { status: val })} />
                            </div>

                            {/* Title (Clickable to Drill Down) */}
                            <span 
                            className={`flex-1 text-sm font-medium cursor-pointer hover:text-blue-600 ${st.status === TaskStatus.DONE ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}
                            onClick={() => setSelectedTask(st.id)}
                            >
                            {st.title}
                            </span>

                            {/* Inline Controls */}
                            <div className="flex items-center gap-3">
                                <PrioritySelect minimal value={st.priority} onChange={(val) => patchTask(st.id, { priority: val })} />
                                
                                <UserSelect 
                                    users={users} 
                                    selectedUserId={st.assigneeId} 
                                    onChange={(id) => patchTask(st.id, { assigneeId: id })}
                                    className="w-32"
                                />

                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteSubtaskClick(st.id); }} 
                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 rounded transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
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

            {/* Comments */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" /> Comments
              </h3>
              
              <div className="space-y-6 mb-6">
                 {task.comments.length > 0 ? [...task.comments].reverse().map(c => {
                   const u = users.find(usr => usr.id === c.userId);
                   return (
                     <div key={c.id} className="flex gap-4 group">
                       <img src={u?.avatar} className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-900" alt="" />
                       <div className="flex-1">
                         <div className="flex items-baseline gap-2">
                           <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{u?.name}</span>
                           <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                         <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800">
                             {c.content}
                         </div>
                       </div>
                     </div>
                   );
                 }) : <p className="text-slate-400 text-sm italic ml-14">No comments yet.</p>}
              </div>

              {!readOnly && (
                <form onSubmit={handleAddComment} className="flex gap-4">
                  <img src={currentUser?.avatar} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 hidden sm:block" alt="" />
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Write a comment..." 
                      className="w-full pl-4 pr-12 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm h-12"
                    />
                    <button type="submit" disabled={!commentText.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar Properties */}
          <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 border-l border-slate-100 dark:border-slate-800 p-8 space-y-8 overflow-y-auto">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Details</h4>
              <div className="space-y-6">
                
                {/* Dates Section */}
                <div className="space-y-4">
                    <div className="group">
                        <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5 flex items-center gap-2"><Calendar className="w-3 h-3"/> Start Date</label>
                        <input 
                            disabled={readOnly}
                            type="date" 
                            value={task.startDate || ''}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-4 py-2.5 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 shadow-sm dark:[color-scheme:dark]"
                        />
                    </div>
                    <div className="group">
                        <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5 flex items-center gap-2"><Calendar className="w-3 h-3"/> Due Date</label>
                        <input 
                            disabled={readOnly}
                            type="date" 
                            value={task.dueDate || ''}
                            onChange={(e) => handleDateChange('dueDate', e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-4 py-2.5 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 shadow-sm dark:[color-scheme:dark]"
                        />
                    </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5 block">Priority</label>
                  <PrioritySelect 
                      value={task.priority} 
                      onChange={(val) => patchTask(task.id, { priority: val })} 
                      readOnly={readOnly}
                      className="w-full justify-center"
                      large
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                 <div className="text-xs text-slate-400 space-y-2 font-mono">
                     <p>Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}</p>
                 </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Subtask Modal */}
      {isCreateSubtaskOpen && (
          <CreateTaskModal 
             isOpen={isCreateSubtaskOpen}
             onClose={() => setIsCreateSubtaskOpen(false)}
             parentTaskId={task.id}
          />
      )}

      {/* Reusable Confirm Dialog */}
      <ConfirmDialog 
         isOpen={deleteConfirm.isOpen}
         onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
         onConfirm={executeDelete}
         title={deleteConfirm.type === 'TASK' ? 'Delete Task?' : deleteConfirm.type === 'SUBTASK' ? 'Delete Subtask?' : 'Remove File?'}
         description={
             deleteConfirm.type === 'TASK' ? "Are you sure you want to delete this task? This action cannot be undone." :
             deleteConfirm.type === 'SUBTASK' ? "Are you sure you want to delete this subtask?" :
             "Are you sure you want to remove this attachment?"
         }
         confirmText="Delete"
      />
    </div>
  );
};
