import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { Task, TaskStatus, Priority, Role } from '../types';
import { ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserSelect } from './UserSelect';
import { StatusSelect, PrioritySelect, ConfirmDialog } from './Shared';
import { useTasks, useUpdateTask, useCreateTask, useDeleteTask } from '../hooks/useTasks';
import { Skeleton } from './Skeleton';

const TaskRow = ({ task, allTasks, canEdit, onSelect, onAddSubtask, onAssigneeChange, onPatch, onDelete, projectMembers }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newStatus, setNewStatus] = useState<TaskStatus>(TaskStatus.TODO);
    const [newPriority, setNewPriority] = useState<Priority>(Priority.MEDIUM);
    const [newAssignee, setNewAssignee] = useState('');

    const subtasks = allTasks.filter((t: Task) => t.parentTaskId === task.id);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTitle.trim()) {
            onAddSubtask({
                title: newTitle,
                status: newStatus,
                priority: newPriority,
                assigneeId: newAssignee || undefined
            });
            setNewTitle('');
            setNewStatus(TaskStatus.TODO);
            setNewAssignee('');
        }
    };

    return (
        <>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group border-b border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 w-96 min-w-[300px]">
                    <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <span className="font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:text-blue-600 truncate" onClick={onSelect}>{task.title}</span>
                        {canEdit && (
                            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); setTimeout(() => document.getElementById(`add-sub-${task.id}`)?.focus(), 100); }} className="opacity-0 group-hover:opacity-100 p-1 bg-blue-50 text-blue-600 rounded text-xs ml-2 hover:bg-blue-100 flex-shrink-0">
                                <Plus className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4 w-48">
                    <UserSelect users={projectMembers} selectedUserId={task.assigneeId} onChange={(userId: string) => onAssigneeChange(task.id, userId)} readOnly={!canEdit} />
                </td>
                <td className="px-6 py-4 w-40"><StatusSelect value={task.status} onChange={(v: TaskStatus) => onPatch(task.id, { status: v })} readOnly={!canEdit} /></td>
                <td className="px-6 py-4 w-40"><PrioritySelect value={task.priority} onChange={(v: Priority) => onPatch(task.id, { priority: v })} readOnly={!canEdit} /></td>
                <td className="px-6 py-4 w-36">
                    <input type="date" value={task.startDate || ''} onChange={(e) => onPatch(task.id, { startDate: e.target.value })} disabled={!canEdit} className="bg-transparent text-sm text-slate-600 dark:text-slate-400 font-mono w-full outline-none dark:[color-scheme:dark]" />
                </td>
                <td className="px-6 py-4 w-36">
                    <input type="date" value={task.dueDate || ''} onChange={(e) => onPatch(task.id, { dueDate: e.target.value })} disabled={!canEdit} className="bg-transparent text-sm text-slate-600 dark:text-slate-400 font-mono w-full outline-none dark:[color-scheme:dark]" />
                </td>
                <td className="px-6 py-4 w-12 text-right">
                    {canEdit && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </td>
            </tr>
            <AnimatePresence>
                {isExpanded && (
                    <tr className="bg-slate-50/30 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800">
                        <td colSpan={7} className="p-0 border-none">
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="px-6 py-4 ml-8 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-2">
                                    {subtasks.map((st: Task) => (
                                        <div key={st.id} className="flex items-center gap-3 py-2 group/sub">
                                            <div className="flex-1 flex items-center gap-3 min-w-0">
                                                <div className="w-6 border-b-2 border-slate-200 dark:border-slate-700 h-3 -mt-3 flex-shrink-0"></div>
                                                <span className={`text-sm cursor-pointer hover:text-blue-600 truncate ${st.status === TaskStatus.DONE ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-400'}`} onClick={() => onSelect(st.id)}>{st.title}</span>
                                            </div>
                                            <div className="w-40 flex-shrink-0"><UserSelect users={projectMembers} selectedUserId={st.assigneeId} onChange={(id: string) => onAssigneeChange(st.id, id)} readOnly={!canEdit} /></div>
                                            <StatusSelect minimal value={st.status} onChange={(v: TaskStatus) => onPatch(st.id, { status: v })} readOnly={!canEdit} />
                                            <PrioritySelect minimal value={st.priority} onChange={(v: Priority) => onPatch(st.id, { priority: v })} readOnly={!canEdit} />
                                            {canEdit && <button onClick={() => onDelete(st.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 p-1"><Trash2 className="w-3 h-3" /></button>}
                                        </div>
                                    ))}
                                    {canEdit && (
                                        <form onSubmit={handleAdd} className="flex items-center gap-3 mt-2 pl-9 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <input id={`add-sub-${task.id}`} type="text" placeholder="Add subtask..." value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-transparent border-none text-sm focus:ring-0 flex-1 outline-none dark:text-white" />
                                            <div className="w-36"><UserSelect users={projectMembers} selectedUserId={newAssignee} onChange={setNewAssignee} /></div>
                                            <StatusSelect value={newStatus} onChange={setNewStatus} />
                                            <PrioritySelect value={newPriority} onChange={setNewPriority} />
                                            <button type="submit" disabled={!newTitle.trim()} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 disabled:opacity-50"><Plus className="w-4 h-4" /></button>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
                        </td>
                    </tr>
                )}
            </AnimatePresence>
        </>
    );
};

export const TaskListView: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentProject, globalTaskSearch, users, getUserRole } = useStore();
    const { data: tasks = [], isLoading } = useTasks(projectId);
    const updateMutation = useUpdateTask();
    const createMutation = useCreateTask();
    const deleteMutation = useDeleteTask();
    const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);

    const projectMembers = React.useMemo(() => users.filter(u => currentProject?.members.some(m => m.userId === u.id)), [users, currentProject]);
    const canEdit = getUserRole() !== Role.VIEWER;

    const filteredTasks = tasks.filter(t => !t.parentTaskId && (t.title.toLowerCase().includes(globalTaskSearch.toLowerCase()) || t.status.toLowerCase().includes(globalTaskSearch.toLowerCase())));

    const handleTaskClick = (taskId: string) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('selectedIssue', taskId);
        setSearchParams(nextParams);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col min-h-[500px]">
            <div className="overflow-x-auto pb-12 flex-1">
                <table className="w-full text-left border-collapse min-w-[1200px] table-fixed">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4 w-96">Task</th>
                            <th className="px-6 py-4 w-48">Assignee</th>
                            <th className="px-6 py-4 w-40">Status</th>
                            <th className="px-6 py-4 w-40">Priority</th>
                            <th className="px-6 py-4 w-36">Start</th>
                            <th className="px-6 py-4 w-36">Due</th>
                            <th className="px-6 py-4 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                                    <td className="px-6 py-4 w-96"><Skeleton className="h-6 w-3/4" /></td>
                                    <td className="px-6 py-4 w-48"><Skeleton className="h-6 w-32" /></td>
                                    <td className="px-6 py-4 w-40"><Skeleton className="h-6 w-24" /></td>
                                    <td className="px-6 py-4 w-40"><Skeleton className="h-6 w-24" /></td>
                                    <td className="px-6 py-4 w-36"><Skeleton className="h-6 w-24" /></td>
                                    <td className="px-6 py-4 w-36"><Skeleton className="h-6 w-24" /></td>
                                    <td className="px-6 py-4 w-12"></td>
                                </tr>
                            ))
                        ) : (
                            filteredTasks.map(task => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    allTasks={tasks}
                                    canEdit={canEdit}
                                    onSelect={() => handleTaskClick(task.id)}
                                    onAddSubtask={(data: any) => createMutation.mutate({ projectId: projectId!, parentTaskId: task.id, ...data })}
                                    onAssigneeChange={(taskId: string, userId: string) => updateMutation.mutate({ taskId, updates: { assigneeId: userId } })}
                                    onPatch={(taskId: string, updates: any) => updateMutation.mutate({ taskId, updates })}
                                    onDelete={(id: string) => setTaskToDelete(id)}
                                    projectMembers={projectMembers}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {taskToDelete && <ConfirmDialog isOpen={!!taskToDelete} title="Delete Task" message="Are you sure you want to delete this task? This will also delete all subtasks." onConfirm={() => { deleteMutation.mutate(taskToDelete); setTaskToDelete(null); }} onCancel={() => setTaskToDelete(null)} variant="danger" />}
        </div>
    );
};