import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, updateTask, createTask, deleteTask as deleteTaskApi } from '../services/api';
import { Task, TaskStatus } from '../types';

export const useTasks = (projectId: string | undefined) => {
    return useQuery({
        queryKey: ['tasks', projectId],
        queryFn: () => fetchTasks(projectId!),
        enabled: !!projectId,
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) =>
            updateTask(taskId, updates),

        // Optimistic UI logic
        onMutate: async ({ taskId, updates }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['tasks'] });

            // Snapshot the previous value
            const previousTasksCollections = queryClient.getQueriesData<Task[]>({ queryKey: ['tasks'] });

            // Optimistically update to the new value in all cached task lists
            queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) => {
                if (!old) return old;
                return old.map((task) =>
                    task.id === taskId ? { ...task, ...updates } : task
                );
            });

            // Return a context object with the snapshotted value
            return { previousTasksCollections };
        },

        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, variables, context) => {
            if (context?.previousTasksCollections) {
                context.previousTasksCollections.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },

        // Always refetch after error or success:
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (task: Partial<Task>) => createTask(task),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (taskId: string) => deleteTaskApi(taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};
