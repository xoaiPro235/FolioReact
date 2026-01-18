import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProjects, createProject, deleteProjectApi, fetchProjectMembers } from '../services/api';
import { Project, Role } from '../types';

export const useProjects = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['projects', userId],
        queryFn: () => fetchProjects(userId!),
        enabled: !!userId,
    });
};

export const useProject = (projectId: string | undefined) => {
    return useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            // In a real app, this might be a single project fetch
            // For now, we simulate what store.ts was doing
            const members = await fetchProjectMembers(projectId!);
            return {
                id: projectId!,
                members: members.map((m) => ({ userId: m.id, role: m.role })),
                memberDetails: members,
            };
        },
        enabled: !!projectId,
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string; description?: string }) => createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (projectId: string) => deleteProjectApi(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
};
