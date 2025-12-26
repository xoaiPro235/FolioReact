import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Task, TaskStatus, Priority, Role } from '../types';
import { ChevronRight, ChevronDown, Plus, Trash2, Calendar } from 'lucide-react';
import { UserSelect } from './UserSelect';
import { StatusSelect, PrioritySelect, ConfirmDialog } from './Shared';

interface TaskListViewProps {
    canEdit: boolean;
    onSelectTask: (taskId: string) => void;
}

const TaskRow = ({ task, canEdit, onSelect, onAddSubtask, onAssigneeChange, onPatch, onDelete, projectMembers }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Quick Add Subtask State
    const [newTitle, setNewTitle] = useState('');
    const [newStatus, setNewStatus] = useState<TaskStatus>(TaskStatus.TODO);
    const [newPriority, setNewPriority] = useState<Priority>(Priority.MEDIUM);
    const [newAssignee, setNewAssignee] = useState(''); // Mặc định Unassigned

    const { tasks } = useStore();

    // Find children in global state
    const subtasks = tasks.filter((t: Task) => t.parentTaskId === task.id);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTitle.trim()) {
            onAddSubtask({
                title: newTitle,
                status: newStatus,
                priority: newPriority,
                assigneeId: newAssignee || undefined // Gửi undefined nếu rỗng
            });
            setNewTitle('');
            setNewStatus(TaskStatus.TODO);
            setNewAssignee(''); // Reset về Unassigned
        }
    };

    return (
        <>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border-b border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <span className="font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:text-blue-600" onClick={onSelect}>{task.title}</span>
                        {canEdit && (
                            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); setTimeout(() => document.getElementById(`add-sub-${task.id}`)?.focus(), 100); }} className="opacity-0 group-hover:opacity-100 p-1 bg-blue-50 text-blue-600 rounded text-xs ml-2 hover:bg-blue-100">
                                <Plus className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4">
                    {/* SỬA LỖI: Bọc trong div cố định chiều rộng */}
                    <div className="w-40">
                        <UserSelect
                            users={projectMembers}
                            selectedUserId={task.assigneeId}
                            onChange={(userId) => onAssigneeChange(task.id, userId)}
                            readOnly={!canEdit}
                        />
                    </div>
                </td>
                <td className="px-6 py-4"><StatusSelect value={task.status} onChange={(v) => onPatch(task.id, { status: v })} readOnly={!canEdit} /></td>
                <td className="px-6 py-4"><PrioritySelect value={task.priority} onChange={(v) => onPatch(task.id, { priority: v })} readOnly={!canEdit} /></td>
                <td className="px-6 py-4">
                    <input
                        type="date"
                        value={task.startDate || ''}
                        onChange={(e) => onPatch(task.id, { startDate: e.target.value })}
                        disabled={!canEdit}
                        className="bg-transparent text-sm text-slate-600 dark:text-slate-400 font-mono w-28 focus:bg-white dark:focus:bg-slate-800 rounded px-1 outline-none focus:ring-1 focus:ring-blue-500 dark:[color-scheme:dark]"
                    />
                </td>
                <td className="px-6 py-4">
                    <input
                        type="date"
                        value={task.dueDate || ''}
                        onChange={(e) => onPatch(task.id, { dueDate: e.target.value })}
                        disabled={!canEdit}
                        className="bg-transparent text-sm text-slate-600 dark:text-slate-400 font-mono w-28 focus:bg-white dark:focus:bg-slate-800 rounded px-1 outline-none focus:ring-1 focus:ring-blue-500 dark:[color-scheme:dark]"
                    />
                </td>
                <td className="px-6 py-4 text-right">
                    {canEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800/50"
                            title="Delete Task"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </td>
            </tr>

            {/* Subtasks Expanded View */}
            {isExpanded && (
                <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                    <td colSpan={7} className="px-6 py-2">
                        <div className="ml-8 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-2">
                            {subtasks.map((st: Task) => (
                                <div key={st.id} className="flex items-center gap-3 py-2 group/sub border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <div className="flex-1 flex items-center gap-3">
                                        <div className="w-6 border-b-2 border-slate-200 dark:border-slate-700 h-3 -mt-3"></div>
                                        <span
                                            className={`text-sm cursor-pointer hover:text-blue-600 ${st.status === TaskStatus.DONE ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}
                                            onClick={() => onSelect(st.id)}
                                        >
                                            {st.title}
                                        </span>
                                    </div>

                                    {/* SỬA LỖI: Bọc UserSelect subtask */}
                                    <div className="w-32 flex-shrink-0">
                                        <UserSelect users={projectMembers} selectedUserId={st.assigneeId} onChange={(id) => onAssigneeChange(st.id, id)} readOnly={!canEdit} />
                                    </div>

                                    <StatusSelect minimal value={st.status} onChange={(v) => onPatch(st.id, { status: v })} readOnly={!canEdit} />
                                    <PrioritySelect minimal value={st.priority} onChange={(v) => onPatch(st.id, { priority: v })} readOnly={!canEdit} />

                                    {/* Subtask Dates */}
                                    <input
                                        type="date"
                                        value={st.startDate || ''}
                                        onChange={(e) => onPatch(st.id, { startDate: e.target.value })}
                                        disabled={!canEdit}
                                        className="bg-transparent text-xs text-slate-500 font-mono w-24 focus:bg-white dark:focus:bg-slate-800 rounded px-1 outline-none focus:ring-1 focus:ring-blue-500 dark:[color-scheme:dark]"
                                        placeholder="Start"
                                    />
                                    <input
                                        type="date"
                                        value={st.dueDate || ''}
                                        onChange={(e) => onPatch(st.id, { dueDate: e.target.value })}
                                        disabled={!canEdit}
                                        className="bg-transparent text-xs text-slate-500 font-mono w-24 focus:bg-white dark:focus:bg-slate-800 rounded px-1 outline-none focus:ring-1 focus:ring-blue-500 dark:[color-scheme:dark]"
                                        placeholder="Due"
                                    />

                                    {canEdit && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(st.id); }}
                                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                            title="Delete Subtask"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Quick Add Subtask Row */}
                            {canEdit && (
                                <form onSubmit={handleAdd} className="flex items-center gap-3 mt-2 pl-9 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <input
                                        id={`add-sub-${task.id}`}
                                        type="text"
                                        placeholder="New subtask title..."
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        className="bg-transparent border-none text-sm focus:ring-0 placeholder:text-slate-400 dark:text-slate-300 flex-1 min-w-[200px] outline-none"
                                    />

                                    {/* SỬA LỖI: Bọc UserSelect trong Quick Add Form */}
                                    <div className="w-36 flex-shrink-0">
                                        <UserSelect users={projectMembers} selectedUserId={newAssignee} onChange={setNewAssignee} />
                                    </div>

                                    <StatusSelect value={newStatus} onChange={setNewStatus} />
                                    <PrioritySelect value={newPriority} onChange={setNewPriority} />
                                    <button type="submit" disabled={!newTitle.trim()} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 disabled:opacity-50">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export const TaskListView: React.FC<TaskListViewProps> = ({ canEdit, onSelectTask }) => {
    const { tasks, addTask, patchTask, deleteTask, currentProject, globalTaskSearch, users } = useStore();

    // Filter users to only show project members
    // const projectMembers = users.filter(u =>
    //     currentProject?.members.some(m => m.userId === u.id)
    // );

    const projectMembers = React.useMemo(() => {
        return users.filter(u => {
            const member = currentProject?.members.find(m => m.userId === u.id);
            return member && member.role !== Role.VIEWER;
        });
    }, [users, currentProject?.members]);

    // Delete State
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    // Search Logic (Client Side)
    const filteredTasks = tasks.filter(t =>
        !t.parentTaskId &&
        (t.title.toLowerCase().includes(globalTaskSearch.toLowerCase()) ||
            t.status.toLowerCase().includes(globalTaskSearch.toLowerCase()))
    );
    // Cần sửa lại để gọi api
    const handleQuickAddSubtask = (parentTaskId: string, data: any) => {
        if (!currentProject) return;
        const task: Task = {
            id: `t${Date.now()}`,
            projectId: currentProject.id,
            parentTaskId,
            title: data.title,
            status: data.status,
            priority: data.priority,
            assigneeId: data.assigneeId,
            description: '',
            tags: [],
            comments: [],
            dueDate: '',
            startDate: '',
            createdAt: new Date().toISOString(),
            files: []
        };
        addTask(task);
    };

    const executeDelete = () => {
        if (taskToDelete) {
            deleteTask(taskToDelete);
            setTaskToDelete(null);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px]">
                <div className="overflow-x-auto pb-32">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4 w-1/3">Task</th>
                                <th className="px-6 py-4">Assignee</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Start</th>
                                <th className="px-6 py-4">Due</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map(task => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    canEdit={canEdit}
                                    onSelect={() => onSelectTask(task.id)}
                                    onAddSubtask={(data: any) => handleQuickAddSubtask(task.id, data)}
                                    onAssigneeChange={(taskId: string, userId: string) => patchTask(taskId, { assigneeId: userId })}
                                    onPatch={patchTask}
                                    onDelete={(id: string) => setTaskToDelete(id)}
                                    projectMembers={projectMembers}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={executeDelete}
                title="Delete Task?"
                description="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete"
            />
        </>
    );
};