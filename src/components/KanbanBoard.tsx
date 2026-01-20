import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { Task, TaskStatus, Role, Priority } from '../types';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Edit2, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_CONFIG, PRIORITY_CONFIG } from './Shared';
import { CreateTaskModal } from './CreateTaskModal';
import { useTasks, useUpdateTask } from '../hooks/useTasks';
import { KanbanSkeleton } from './Skeleton';

const KanbanCard: React.FC<{ task: Task; onClick: () => void; canEdit: boolean }> = ({ task, onClick, canEdit }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: !canEdit,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const { users, tasks } = useStore();
  const assignee = users.find(u => u.id === task.assigneeId);

  const subtasks = tasks.filter(t => t.parentTaskId === task.id);
  const completedSubtasks = subtasks.filter(s => s.status === TaskStatus.DONE).length;
  const totalSubtasks = subtasks.length;

  const PriorityIcon = PRIORITY_CONFIG[task.priority].icon;

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-2 border-blue-500 opacity-50 h-[140px]" />
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-700 transition-all group relative flex flex-col gap-3 ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="text-base font-medium text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{task.title}</h4>
        {canEdit && (
          <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-600 transition-opacity bg-slate-50 dark:bg-slate-700 rounded-md">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {totalSubtasks > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
          <span className="font-medium whitespace-nowrap">{completedSubtasks}/{totalSubtasks}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50">
        <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${PRIORITY_CONFIG[task.priority].color}`}>
          <PriorityIcon className="w-3 h-3" />
          {task.priority}
        </div>
        {assignee && (
          <img src={assignee.avatar} alt={assignee.name} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" title={assignee.name} />
        )}
      </div>
    </motion.div>
  );
};

const KanbanColumn = ({ status, tasks, onTaskClick, canEdit, onCreate }: any) => {
  const { setNodeRef } = useDroppable({ id: status });
  const config = STATUS_CONFIG[status as TaskStatus];

  return (
    <div className="flex flex-col h-full min-w-[280px] sm:min-w-[350px] w-[85vw] sm:w-auto flex-shrink-0 sm:flex-1">
      <div className={`flex items-center justify-between mb-4 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border-t-4 shadow-sm ${config.color.split(' ')[2]}`}>
        <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-base">
          {config.label}
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-mono">{tasks.length}</span>
        </h3>
      </div>

      <div ref={setNodeRef} className="flex-1 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl p-2 sm:p-3 space-y-3 overflow-y-auto border border-dashed border-slate-200 dark:border-slate-800 relative group/column">
        <SortableContext items={tasks.map((t: Task) => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.map((task: Task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task.id)}
                canEdit={canEdit}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {/* Contextual Create Button */}
        {canEdit && (
          <button
            onClick={() => onCreate(status)}
            className="w-full py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm transition-all text-sm font-bold mt-2 sm:opacity-0 group-hover/column:opacity-100"
          >
            <Plus className="w-5 h-5" /> Create New Task
          </button>
        )}
      </div>
    </div>
  );
};

export const KanbanBoard: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getUserRole, globalTaskSearch } = useStore();

  const { data: tasks = [], isLoading } = useTasks(projectId);
  const updateMutation = useUpdateTask();

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleTaskClick = (taskId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('selectedIssue', taskId);
    setSearchParams(nextParams);
  };

  // Create Modal State specific to Kanban contextual add
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>(TaskStatus.TODO);

  const role = getUserRole();
  const canEdit = role !== Role.VIEWER;

  // Filter Tasks
  const rootTasks = tasks.filter(t =>
    !t.parentTaskId &&
    (t.title.toLowerCase().includes(globalTaskSearch.toLowerCase()) ||
      t.status.toLowerCase().includes(globalTaskSearch.toLowerCase()))
  );

  const columns = Object.values(TaskStatus);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!canEdit) return;

    // Prevent logging/update if dropped in same column
    if (over) {
      // If dropped over a container
      const isContainer = Object.values(TaskStatus).includes(over.id as TaskStatus);
      const currentTask = active.data.current?.task as Task;

      if (isContainer) {
        if (currentTask.status !== over.id) {
          updateMutation.mutate({ taskId: active.id as string, updates: { status: over.id as TaskStatus } });
        }
      } else {
        const overTask = tasks.find(t => t.id === over.id);
        if (overTask && currentTask.status !== overTask.status) {
          updateMutation.mutate({ taskId: active.id as string, updates: { status: overTask.status } });
        }
      }
    }
    setActiveId(null);
  };

  const handleCreateClick = (status: TaskStatus) => {
    setInitialStatus(status);
    setIsCreateOpen(true);
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  if (isLoading) return <KanbanSkeleton />;

  return (
    <div className="h-full flex flex-col w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => canEdit && setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full w-full gap-4 sm:gap-6 overflow-x-auto pb-6 sm:pb-4 px-4 sm:px-2 snap-x snap-mandatory sm:snap-none no-scrollbar">
          {columns.map(status => (
            <div key={status} className="snap-center">
              <KanbanColumn
                status={status}
                tasks={rootTasks.filter(t => t.status === status)}
                onTaskClick={handleTaskClick}
                canEdit={canEdit}
                onCreate={handleCreateClick}
              />
            </div>
          ))}
        </div>
        <DragOverlay zIndex={100}>
          {activeTask ? (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border-2 border-blue-500 w-[350px] rotate-3 cursor-grabbing">
              <h4 className="text-base font-medium text-slate-900 dark:text-slate-100 line-clamp-2">{activeTask.title}</h4>
              <div className="flex items-center gap-1.5 mt-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold w-fit bg-slate-50 dark:bg-slate-700/50">
                {activeTask.priority}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {isCreateOpen && (
        <CreateTaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          initialStatus={initialStatus}
        />
      )}
    </div>
  );
};