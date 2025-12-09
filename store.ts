
import { create } from 'zustand';
import { Task, Project, User, TaskStatus, ViewState, Role, ActivityLog, AppNotification, Theme, Priority, Comment, FileAttachment } from './types';
import { fetchTasks, fetchProjects, fetchUsers, fetchActivities, loginUser, MOCK_USERS, uploadFile } from './services/api';

interface AppState {
  // Global State
  currentUser: User | null;
  currentView: ViewState;
  theme: Theme;
  notifications: AppNotification[];

  // Navigation & Modal State
  selectedTaskId: string | null; // Global modal control
  globalTaskSearch: string;      // Global search term

  // Workspace State
  projects: Project[];
  workspaceSearchQuery: string;

  // Project Scope State
  currentProject: Project | null;
  tasks: Task[]; // Now contains both Parents and Subtasks flat
  users: User[];
  activities: ActivityLog[];
  isLoading: boolean;

  // Actions
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  deleteAccount: () => void;

  goToWorkspace: () => void;
  goToProfile: () => void;

  setSelectedTask: (taskId: string | null) => void;
  setGlobalTaskSearch: (query: string) => void;
  setWorkspaceSearch: (query: string) => void;

  createProject: (name: string, description: string) => void;
  deleteProject: (projectId: string) => void;

  loadProjectData: (projectId: string) => Promise<void>;
  loadWorkspaceData: (userId: string) => Promise<void>;

  // Task Actions
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  patchTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addAttachment: (taskId: string, file: File) => Promise<void>;
  removeAttachment: (taskId: string, fileId: string) => void;

  // Subtask Legacy Support (Prefer addTask)
  createSubtask: (parentTaskId: string, title: string) => void;

  addComment: (taskId: string, content: string) => void;

  // Notifications
  addNotification: (msg: string, type?: AppNotification['type']) => void;
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;

  // Team
  changeMemberRole: (userId: string, newRole: Role) => void;
  inviteUserToProject: (user: User, role: Role) => void;
  removeMemberFromProject: (userId: string) => void;

  // Selectors
  getUserRole: () => Role | null;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  currentView: 'AUTH',
  theme: 'light',
  notifications: [],
  selectedTaskId: null,
  globalTaskSearch: '',
  projects: [],
  workspaceSearchQuery: '',
  currentProject: null,
  tasks: [],
  users: [],
  activities: [],
  isLoading: false,

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: newTheme });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      // TODO: API Call - [POST] /api/auth/login
      const user = await loginUser(email, password);
      if (!user) {
        throw new Error('Login failed');
      }
      const [projects, users] = await Promise.all([
        fetchProjects(user.id),
        fetchUsers()
      ]);
      set({ currentUser: user, projects, users, currentView: 'WORKSPACE', isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      const errorMessage = e instanceof Error ? e.message : "Login failed";
      throw new Error(errorMessage);
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    // TODO: API Call - [POST] /api/auth/register
    await new Promise(r => setTimeout(r, 800)); // Mock delay

    const newUser: User = {
      id: `u${Date.now()}`,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      avatar: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=random`,
      title: 'New Member',
      isOnline: true
    };

    // Auto login
    set({ currentUser: newUser, projects: [], users: MOCK_USERS, currentView: 'WORKSPACE', isLoading: false });
  },

  logout: () => {
    set({ currentUser: null, currentView: 'AUTH', currentProject: null });
  },

  updateProfile: (data) => {
    // TODO: API Call - [PATCH] /api/users/me
    set(state => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...data } : null
    }));
    get().addNotification("Profile updated successfully", "SUCCESS");
  },

  deleteAccount: () => {
    // TODO: API Call - [DELETE] /api/users/me
    set({ currentUser: null, currentView: 'AUTH' });
    alert("Account deleted.");
  },

  goToWorkspace: async () => {
    const { currentUser } = get();
    if (currentUser) {
      // Refresh workspace data
      const [projects, users] = await Promise.all([
        fetchProjects(currentUser.id),
        fetchUsers()
      ]);
      set({ currentView: 'WORKSPACE', currentProject: null, selectedTaskId: null, projects, users });
    } else {
      set({ currentView: 'WORKSPACE', currentProject: null, selectedTaskId: null });
    }
  },

  goToProfile: () => {
    set({ currentView: 'PROFILE', selectedTaskId: null });
  },

  loadWorkspaceData: async (userId) => {
    // Helper to just load users/projects if needed
    const [projects, users] = await Promise.all([
      fetchProjects(userId),
      fetchUsers()
    ]);
    set({ projects, users });
  },

  setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),
  setGlobalTaskSearch: (query) => set({ globalTaskSearch: query }),
  setWorkspaceSearch: (query) => set({ workspaceSearchQuery: query }),

  createProject: (name, desc) => {
    const { currentUser, projects } = get();
    if (!currentUser) return;

    // TODO: API Call - [POST] /api/projects
    const newProject: Project = {
      id: `p${Date.now()}`,
      name,
      description: desc,
      ownerId: currentUser.id,
      members: [{ userId: currentUser.id, role: Role.OWNER }]
    };
    set({ projects: [...projects, newProject] });
  },

  deleteProject: (projectId) => {
    // TODO: API Call - [DELETE] /api/projects/{id}
    set((state) => ({
      projects: state.projects.filter(p => p.id !== projectId),
      currentView: 'WORKSPACE',
      currentProject: null
    }));
    get().addNotification("Project deleted", "INFO");
  },

  loadProjectData: async (projectId: string) => {
    set({ isLoading: true, currentView: 'PROJECT' });
    try {
      const project = get().projects.find(p => p.id === projectId) || null;
      const [tasks, users, activities] = await Promise.all([
        fetchTasks(projectId),
        fetchUsers(),
        fetchActivities(projectId)
      ]);
      set({ currentProject: project, tasks, users, activities, isLoading: false });
    } catch (error) {
      console.error("Failed to load project data", error);
      set({ isLoading: false });
    }
  },

  addTask: (task) => {
    // TODO: API Call - [POST] /api/tasks
    // TODO: SignalR - hubConnection.invoke("CreateTask", task);

    // Strict Logic: Ensure created date and default null assignee
    const safeTask = {
      ...task,
      assigneeId: task.assigneeId || undefined, // Unassigned if empty
      createdAt: new Date().toISOString(),
      files: []
    };

    set((state) => ({ tasks: [...state.tasks, safeTask] }));

    // Activity Log
    const { currentUser } = get();
    if (currentUser) {
      const actionText = task.parentTaskId ? 'created subtask' : 'created task';
      const log: ActivityLog = { id: `act-${Date.now()}`, userId: currentUser.id, action: actionText, target: task.title, createdAt: new Date().toISOString() };
      set(state => ({ activities: [log, ...state.activities] }));
    }
  },

  updateTaskStatus: (taskId, newStatus) => {
    // TODO: API Call - [PATCH] /api/tasks/{id}/status
    // TODO: SignalR - hubConnection.invoke("UpdateTaskStatus", taskId, newStatus);

    // Prevent spam: Check if status actually changed
    const task = get().tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    }));

    // Add Activity Log
    const { currentUser } = get();
    if (currentUser) {
      // Standardization: Log Format
      const log: ActivityLog = { id: `act-${Date.now()}`, userId: currentUser.id, action: `updated status to ${newStatus}`, target: task.title, createdAt: new Date().toISOString() };
      set(state => ({ activities: [log, ...state.activities] }));
    }
  },

  patchTask: (taskId, updates) => {
    // TODO: API Call - [PATCH] /api/tasks/{id}
    // TODO: SignalR - hubConnection.invoke("UpdateTask", taskId, updates);

    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if anything actually changed (Spam Prevention)
    const hasChanges = Object.keys(updates).some(key => {
      // @ts-ignore
      return task[key] !== updates[key];
    });

    if (!hasChanges) return;

    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }));

    // Add Activity Log (Generic)
    const { currentUser } = get();
    if (currentUser && Object.keys(updates).length > 0) {
      const key = Object.keys(updates)[0];
      let actionText = `updated ${key} on`;

      // Special case for status formatting in logs
      if (key === 'status') {
        actionText = `updated status to ${updates.status}`;
      }

      const log: ActivityLog = { id: `act-${Date.now()}`, userId: currentUser.id, action: actionText, target: task.title, createdAt: new Date().toISOString() };
      set(state => ({ activities: [log, ...state.activities] }));
    }
  },

  deleteTask: (taskId) => {
    // 1. Immediate State Update to prevent "Ghost Items"
    // TODO: API Call - [DELETE] /api/tasks/{id}
    // TODO: SignalR - hubConnection.invoke("DeleteTask", taskId);

    set((state) => {
      const targetTask = state.tasks.find(t => t.id === taskId);
      if (!targetTask) return {}; // Task already gone or invalid

      // Filter out the task itself AND any subtasks (children)
      // This handles "Deleting a Parent" -> Removes Parent + Children
      // This handles "Deleting a Subtask" -> Removes Subtask only
      const updatedTasks = state.tasks.filter((t) => t.id !== taskId && t.parentTaskId !== taskId);

      // Modal Handling: Close modal if we deleted the currently open task
      // OR if we deleted the parent of the currently open task
      let nextSelectedId = state.selectedTaskId;

      const currentlyOpenTask = state.tasks.find(t => t.id === state.selectedTaskId);

      // Case 1: The open task IS the deleted task
      if (state.selectedTaskId === taskId) {
        nextSelectedId = null;
      }
      // Case 2: The open task is a child of the deleted task
      else if (currentlyOpenTask && currentlyOpenTask.parentTaskId === taskId) {
        nextSelectedId = null;
      }

      // Logging
      let newActivities = state.activities;
      if (state.currentUser) {
        const log: ActivityLog = {
          id: `act-${Date.now()}`,
          userId: state.currentUser.id,
          action: 'deleted task',
          target: targetTask.title,
          createdAt: new Date().toISOString()
        };
        newActivities = [log, ...state.activities];
      }

      return {
        tasks: updatedTasks,
        selectedTaskId: nextSelectedId,
        activities: newActivities
      };
    });

    get().addNotification("Task deleted successfully", "INFO");
  },

  addAttachment: async (taskId, file) => {
    // TODO: API Call - [POST] /api/tasks/{id}/attachments
    const uploadedFile = await uploadFile(file);

    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, files: [...(t.files || []), uploadedFile] } : t
      )
    }));

    get().addNotification("File uploaded", "SUCCESS");
  },

  removeAttachment: (taskId, fileId) => {
    // TODO: API Call - [DELETE] /api/tasks/{id}/attachments/{fileId}
    set(state => ({
      tasks: state.tasks.map(t => {
        if (t.id !== taskId) return t;
        // Immediate filter to remove ghost item
        const currentFiles = t.files || [];
        return { ...t, files: currentFiles.filter(f => f.id !== fileId) };
      })
    }));
    get().addNotification("File removed", "INFO");
  },

  createSubtask: (parentTaskId, title) => {
    // Simplified inline creation (Legacy support, preferred method is addTask from modal)
    const { currentProject, currentUser } = get();
    if (!currentProject) return;

    // TODO: API Call - [POST] /api/tasks
    const newSubtask: Task = {
      id: `t${Date.now()}`,
      projectId: currentProject.id,
      parentTaskId: parentTaskId,
      title: title,
      description: '',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      tags: [],
      dueDate: new Date().toISOString().split('T')[0],
      comments: [],
      createdAt: new Date().toISOString(),
      assigneeId: undefined,
      files: []
    };

    set((state) => ({
      tasks: [...state.tasks, newSubtask]
    }));

    if (currentUser) {
      const log: ActivityLog = { id: `act-${Date.now()}`, userId: currentUser.id, action: 'created subtask', target: title, createdAt: new Date().toISOString() };
      set(state => ({ activities: [log, ...state.activities] }));
    }
  },

  addComment: (taskId, content) => {
    const { currentUser } = get();
    if (!currentUser) return;

    // TODO: API Call - [POST] /api/tasks/{id}/comments
    // TODO: SignalR - hubConnection.invoke("AddComment", taskId, content);
    const newComment: Comment = {
      id: `c${Date.now()}`,
      userId: currentUser.id,
      content,
      createdAt: new Date().toISOString()
    };

    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t
      )
    }));

    // Log Comment Activity
    const task = get().tasks.find(t => t.id === taskId);
    if (task) {
      const log: ActivityLog = { id: `act-${Date.now()}`, userId: currentUser.id, action: 'commented on', target: task.title, createdAt: new Date().toISOString() };
      set(state => ({ activities: [log, ...state.activities] }));
    }
  },

  addNotification: (msg, type: AppNotification['type'] = 'INFO') => {
    const newNotif: AppNotification = {
      id: `n${Date.now()}`,
      message: msg,
      read: false,
      type,
      createdAt: new Date().toISOString()
    };
    set(state => ({ notifications: [newNotif, ...state.notifications] }));
  },

  markNotificationRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  },

  dismissNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  changeMemberRole: (userId, newRole) => {
    // TODO: API Call - [PATCH] /api/projects/{id}/members/{userId}
    set((state) => {
      if (!state.currentProject) return {};
      const updatedMembers = state.currentProject.members.map(m =>
        m.userId === userId ? { ...m, role: newRole } : m
      );
      return {
        currentProject: { ...state.currentProject, members: updatedMembers }
      };
    });
  },

  inviteUserToProject: (user, role) => {
    // TODO: API Call - [POST] /api/projects/{id}/members
    set((state) => {
      if (!state.currentProject) return {};
      if (state.currentProject.members.find(m => m.userId === user.id)) return {};

      const newMember = { userId: user.id, role };
      return {
        currentProject: { ...state.currentProject, members: [...state.currentProject.members, newMember] }
      };
    });
    get().addNotification(`Invited ${user.name} as ${role}`, 'SUCCESS');
  },

  removeMemberFromProject: (userId) => {
    // TODO: API Call - [DELETE] /api/projects/{id}/members/{userId}
    const { currentUser, currentProject } = get();

    // Check if current user is owner
    if (!currentUser || currentProject?.ownerId !== currentUser.id) {
      get().addNotification("Only project owner can remove members", "WARNING");
      return;
    }

    // Cannot remove owner
    if (userId === currentProject?.ownerId) {
      get().addNotification("Cannot remove project owner", "WARNING");
      return;
    }

    set((state) => {
      if (!state.currentProject) return {};
      const removedMember = state.currentProject.members.find(m => m.userId === userId);
      const updatedMembers = state.currentProject.members.filter(m => m.userId !== userId);

      const user = state.users.find(u => u.id === userId);
      if (user) {
        const log: ActivityLog = { id: `act-${Date.now()}`, userId: currentUser.id, action: 'removed member', target: user.name, createdAt: new Date().toISOString() };
        state.activities.unshift(log);
      }

      return {
        currentProject: { ...state.currentProject, members: updatedMembers },
        activities: state.activities
      };
    });

    const removedMember = currentProject?.members.find(m => m.userId === userId);
    const user = get().users.find(u => u.id === userId);
    if (user) {
      get().addNotification(`Removed ${user.name} from project`, "SUCCESS");
    }
  },

  getUserRole: () => {
    const { currentProject, currentUser } = get();
    if (!currentProject || !currentUser) return null;
    const member = currentProject.members.find(m => m.userId === currentUser.id);
    return member ? member.role : null;
  }
}));
