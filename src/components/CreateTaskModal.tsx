import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { useStore } from '../store';
import { X, Calendar, AlignLeft, Flag, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateTask } from '../hooks/useTasks';
// Import các component UI đẹp đã có
import { UserSelect } from './UserSelect';
import { StatusSelect, PrioritySelect } from './Shared';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentTaskId?: string;
  initialStatus?: TaskStatus;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, parentTaskId, initialStatus }) => {
  const { currentProject, users, addNotification } = useStore();
  const createTaskMutation = useCreateTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus || TaskStatus.TODO);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);

  // Logic: Mặc định là '' (Unassigned)
  const [assigneeId, setAssigneeId] = useState<string>('');

  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Lọc danh sách user: Chỉ lấy những người thuộc project hiện tại
  // const projectMembers = users.filter(u =>
  //   currentProject?.members.some(m => m.userId === u.id)
  // );

  useEffect(() => {
    if (initialStatus) setStatus(initialStatus);
  }, [initialStatus]);

  if (!isOpen || !currentProject) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTaskMutation.mutate({
      projectId: currentProject.id,
      parentTaskId,
      title,
      description,
      status,
      priority,
      assigneeId: assigneeId || undefined,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
    }, {
      onSuccess: () => {
        addNotification(parentTaskId ? 'Subtask created successfully' : 'Task created successfully', 'SUCCESS');
        // Reset Form
        setTitle('');
        setDescription('');
        setStatus(TaskStatus.TODO);
        setPriority(Priority.MEDIUM);
        setAssigneeId('');
        setStartDate('');
        setDueDate('');
        onClose();
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] z-10"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {parentTaskId ? <><CheckCircle2 className="w-5 h-5 text-blue-500" /> Add Subtask</> : 'Create New Task'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 text-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" /> Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Add details..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <StatusSelect
                    value={status}
                    onChange={setStatus}
                    className="w-full justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                    <Flag className="w-4 h-4" /> Priority
                  </label>
                  <PrioritySelect
                    value={priority}
                    onChange={setPriority}
                    className="w-full justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
                  <UserSelect
                    users={users}
                    selectedUserId={assigneeId}
                    onChange={setAssigneeId}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-11"
                  />
                </div>

                <div className="flex gap-3 md:col-span-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2"><Calendar className="w-4 h-4" /> Start</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2"><Calendar className="w-4 h-4" /> Due</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:[color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || createTaskMutation.isPending}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
              >
                {createTaskMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {parentTaskId ? 'Add Subtask' : 'Create Task'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};