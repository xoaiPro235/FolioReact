
import { create } from 'zustand';
import { Task, Project, User, TaskStatus, ViewState, Role, ActivityLog, AppNotification, Theme, Priority, Comment, FileAttachment, ProjectMember } from './types';
import { fetchTasks, fetchProjects, fetchUsers, fetchActivities, loginUser, registerUser, uploadFile, fetchProjectMembers, createProject, deleteProjectApi, createTask, updateTask, deleteTask, addProjectMember, removeProjectMember, updateProjectMemberRole, createComment, deleteFile, deleteComment, updateProfile, removeUser, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, updateProjectApi, resetPasswordForEmail, updatePassword as updatePasswordApi } from './services/api';
import { supabase } from './supabaseClient';
import { queryClient } from './queryClient';

interface AppState {
  // Global State
  currentUser: User | null;
  // currentView: ViewState; // Routing handles this now
  theme: Theme;
  notifications: AppNotification[];
  toasts: { id: string; message: string; type: AppNotification['type'] }[];

  // Navigation & Modal State
  selectedTaskId: string | null; // Global modal control
  globalTaskSearch: string;      // Global search term

  // Workspace State
  projects: Project[];
  workspaceSearchQuery: string;

  currentProject: Project | null;
  tasks: Task[];
  users: User[];
  activities: ActivityLog[];
  isLoading: boolean;
  isProjectTasksLoaded: boolean;
  isInitialAuthChecked: boolean;

  // Actions
  initializeAuth: () => Promise<void>;
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string, avatarUrl?: string, bio?: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  deleteAccount: () => void;

  goToWorkspace: () => void;
  goToProfile: () => void;

  setSelectedTask: (taskId: string | null) => void;
  setGlobalTaskSearch: (query: string) => void;
  setWorkspaceSearch: (query: string) => void;

  createProject: (name: string, description: string) => void;
  updateProject: (projectId: string, name: string, description: string) => Promise<void>;
  deleteProject: (projectId: string) => void;

  loadProjectData: (projectId: string) => Promise<void>;
  loadProjectInitial: (projectId: string) => Promise<void>;
  loadProjectTasks: (projectId: string) => Promise<void>;
  loadTaskById: (taskId: string) => Promise<void>;
  loadWorkspaceData: (userId: string) => Promise<void>;

  // Task Actions
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  patchTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addAttachment: (taskId: string, file: File) => Promise<void>;
  removeAttachment: (taskId: string, fileId: string) => Promise<void>;

  addComment: (taskId: string, content: string) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;

  // Notifications
  addNotification: (msg: string, type?: AppNotification['type']) => void;
  addDetailedNotification: (notification: Partial<AppNotification> & { message: string }) => void;
  loadNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  deleteNotification: (id: string) => Promise<void>;

  handleSignalRUpdate: (type: string, payload: any) => void;

  // Toast Actions
  addToast: (message: string, type?: AppNotification['type']) => void;
  removeToast: (id: string) => void;

  // Team
  changeMemberRole: (userId: string, newRole: Role) => void;
  inviteUserToProject: (user: User, role: Role) => void;
  removeMemberFromProject: (userId: string) => void;

  // Selectors
  getUserRole: () => Role | null;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  // currentView: 'AUTH',
  theme: 'light',
  notifications: [],
  toasts: [],
  selectedTaskId: null,
  globalTaskSearch: '',
  projects: [],
  workspaceSearchQuery: '',
  currentProject: null,
  tasks: [],
  users: [],
  activities: [],
  isLoading: false,
  isProjectTasksLoaded: false,
  isInitialAuthChecked: false,

  // Initialize auth state from Supabase session
  initializeAuth: async () => {
    try {
      // Restore theme from localStorage
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        set({ theme: savedTheme });
        const htmlElement = document.documentElement;
        if (savedTheme === 'dark') {
          htmlElement.classList.add('dark');
        } else {
          htmlElement.classList.remove('dark');
        }
      }

      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        // Restore user from Supabase session
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        const user: User = {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: profile?.name ?? data.session.user.user_metadata?.full_name ?? data.session.user.email!.split("@")[0],
          avatar: profile?.avatar_url ?? data.session.user.user_metadata?.avatar_url ?? "",
          bio: profile?.bio ?? "",
          isOnline: true,
        };

        set({ currentUser: user });

        // Check if there was a previous view/project open
        const lastView = localStorage.getItem('lastView') as ViewState;
        const lastProjectId = localStorage.getItem('lastProjectId');

        if (lastView === 'PROJECT' && lastProjectId) {
          // MUST load workspace data first so projects list is populated
          await get().loadWorkspaceData(data.session.user.id);
          // Restore to previous project
          await get().loadProjectData(lastProjectId);

          // Connect SignalR for real-time notifications - MOVED to loadProjectInitial
          const user = get().currentUser;
          if (user) {
            await get().loadNotifications();
          }
        } else if (lastView === 'PROFILE') {
          await get().loadWorkspaceData(data.session.user.id);
          get().goToProfile();
        } else {
          // Default to workspace handled by App.tsx router index route
        }
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
    } finally {
      set({ isInitialAuthChecked: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      // 1. Gọi API đăng nhập để lấy thông tin User
      const user = await loginUser(email, password);

      if (!user) {
        throw new Error('Login failed');
      }

      // 2. Lưu currentUser vào Store ngay lập tức
      set({ currentUser: user, isLoading: false });

      // 3. Connect SignalR if there was a last project
      const lastProjectId = localStorage.getItem('lastProjectId');
      if (lastProjectId && user) {
        const { signalRService } = await import('./services/api');
        await signalRService.connect(lastProjectId, user.name, user.avatar, (type, payload) => {
          get().handleSignalRUpdate(type, payload);
        });
        await get().loadNotifications();
      }
      // Navigation will be handled by App.tsx because currentUser is now set

    } catch (e) {
      // Nếu có lỗi thì tắt loading và ném lỗi ra
      set({ isLoading: false });
      throw new Error("Incorrect email or password.");
    }
  },

  register: async (data) => {
    set({ isLoading: true });

    try {
      // 1. Gọi API đăng ký
      await registerUser(data);

      // 2. Thông báo thành công
      get().addNotification(`Account created successfully!`, 'SUCCESS');

      // 3. Tự động đăng nhập luôn
      try {
        await get().login(data.email, data.password);
      } catch (loginError) {
        // Trường hợp hiếm: Đăng ký xong nhưng login thất bại 
        // (Ví dụ: Supabase bắt confirm email)
        console.warn("Auto-login failed:", loginError);
        set({ isLoading: false }); // Quay về trang login để họ tự nhập lại
        get().addNotification("Please check email or login manually.", "INFO");
      }

    } catch (error: any) {
      set({ isLoading: false }); // Chỉ tắt loading khi có lỗi đăng ký thực sự
      throw error; // Ném ra để Auth.tsx hiển thị lỗi đỏ
    }
  },

  logout: async () => {
    localStorage.removeItem('lastView');
    localStorage.removeItem('lastProjectId');
    const { signalRService } = await import('./services/api');
    await signalRService.disconnect();
    set({ currentUser: null, currentProject: null, selectedTaskId: null, tasks: [], activities: [] });
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const updatedUser = await updateProfile(data);
      set({
        currentUser: updatedUser,
        isLoading: false
      });
      get().addNotification("Profile updated successfully", "SUCCESS");
    } catch (error) {
      set({ isLoading: false });
      get().addNotification("Failed to update profile", "ERROR");
      throw error;
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true });
    try {
      await resetPasswordForEmail(email);
      set({ isLoading: false });
      get().addNotification("Reset link sent to your email!", "SUCCESS");
    } catch (error: any) {
      set({ isLoading: false });
      get().addNotification(error.message || "Failed to send reset link", "ERROR");
      throw error;
    }
  },

  updatePassword: async (password) => {
    set({ isLoading: true });
    try {
      await updatePasswordApi(password);
      set({ isLoading: false });
      get().addNotification("Password updated successfully!", "SUCCESS");
    } catch (error: any) {
      set({ isLoading: false });
      get().addNotification(error.message || "Failed to update password", "ERROR");
      throw error;
    }
  },

  deleteAccount: async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

    set({ isLoading: true });
    try {
      await removeUser();
      localStorage.removeItem('lastView');
      localStorage.removeItem('lastProjectId');
      set({
        currentUser: null,
        currentProject: null,
        selectedTaskId: null,
        tasks: [],
        activities: [],
        isLoading: false
      });
      get().addNotification("Account deleted successfully", "INFO");
    } catch (error) {
      set({ isLoading: false });
      get().addNotification("Failed to delete account", "ERROR");
      throw error;
    }
  },

  toggleTheme: () => {
    set(state => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';

      // Update HTML class
      const htmlElement = document.documentElement;
      if (newTheme === 'dark') {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }

      // Persist to localStorage
      localStorage.setItem('theme', newTheme);

      return { theme: newTheme };
    });
  },

  goToWorkspace: async () => {
    const { currentUser } = get();

    if (currentUser) {
      set({ isLoading: true }); // Bật loading cho chuyên nghiệp

      try {
        // 1. Chỉ gọi duy nhất API fetchProjects
        const apiResponse = await fetchProjects(currentUser.id);

        // 2. XỬ LÝ DỮ LIỆU (Mapping)

        // A. Tạo danh sách Projects chuẩn cho Store
        // Cấu trúc Store cần: Project { id, ..., members: [{ userId, role }] }
        const normalizedProjects: Project[] = apiResponse.map((item: any) => ({
          ...item.project,
          ownerId: item.project.ownerId,
          members: item.members.map((m: any) => ({
            userId: m.id,
            role: m.role
          }))
        }));

        // B. Trích xuất danh sách Users từ mảng members
        // Gom tất cả member từ tất cả dự án lại thành 1 danh sách user duy nhất
        const allMembers = apiResponse.flatMap((item: any) => item.members);

        // Lọc trùng (Deduplicate) - Vì 1 người có thể ở trong nhiều dự án
        const uniqueUsersMap = new Map();
        allMembers.forEach((m: any) => {
          if (!uniqueUsersMap.has(m.id)) {
            uniqueUsersMap.set(m.id, {
              id: m.id,
              name: m.name,
              email: m.email,
              avatar: m.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`,
              bio: m.bio || '',
              isOnline: m.isOnline
            });
          }
        });

        // Chuyển Map thành Array để lưu vào Store
        const extractedUsers = Array.from(uniqueUsersMap.values());

        // 3. Cập nhật State
        set({
          // currentView: 'WORKSPACE',
          currentProject: null,
          selectedTaskId: null,
          projects: normalizedProjects,
          users: extractedUsers,
          isLoading: false
        });

        // Persist view state
        localStorage.setItem('lastView', 'WORKSPACE');
        localStorage.removeItem('lastProjectId');

      } catch (error) {
        console.error("Lỗi tải workspace:", error);
        set({ isLoading: false });
      }
    } else {
      set({ currentProject: null, selectedTaskId: null });
    }
  },

  goToProfile: () => {
    localStorage.setItem('lastView', 'PROFILE');
    set({ selectedTaskId: null });
  },

  loadWorkspaceData: async (userId: string) => {
    set({ isLoading: true });

    try {
      // 1. Chỉ gọi duy nhất API fetchProjects (Giống hệt goToWorkspace)
      const apiResponse = await fetchProjects(userId);

      // 2. XỬ LÝ DỮ LIỆU (Mapping & Extracting)

      // A. Chuẩn hóa danh sách Projects
      const normalizedProjects: Project[] = apiResponse.map((item: any) => ({
        ...item.project,
        members: item.members.map((m: any) => ({
          userId: m.id,
          role: m.role
        }))
      }));

      // B. Trích xuất danh sách Users từ mảng members (Logic "Tái chế")
      const allMembers = apiResponse.flatMap((item: any) => item.members);

      const uniqueUsersMap = new Map();
      allMembers.forEach((m: any) => {
        if (!uniqueUsersMap.has(m.id)) {
          uniqueUsersMap.set(m.id, {
            id: m.id,
            name: m.name,
            email: m.email,
            avatar: m.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`,
            isOnline: m.isOnline || false
          });
        }
      });

      const extractedUsers = Array.from(uniqueUsersMap.values());

      // 3. Cập nhật Store
      set({
        projects: normalizedProjects,
        users: extractedUsers, // List user này được trích xuất từ chính project, không cần fetch riêng
        isLoading: false
      });

    } catch (error) {
      console.error("Failed to load workspace data", error);
      set({ isLoading: false });
    }
  },

  setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),
  setGlobalTaskSearch: (query) => set({ globalTaskSearch: query }),
  setWorkspaceSearch: (query) => set({ workspaceSearchQuery: query }),

  createProject: async (name, desc) => {
    set({ isLoading: true });
    try {
      const newProject = await createProject({ name: name, description: desc });
      const currentUser = get().currentUser;

      if (!currentUser) throw new Error("User not found");

      const newProjectWithOwner: Project = {
        ...newProject,
        members: [{ userId: currentUser.id, role: Role.OWNER }]
      };

      set((state) => ({
        projects: [...state.projects, newProjectWithOwner],
        isLoading: false
      }));

      get().addNotification("Project created successfully", "SUCCESS");

    } catch (error) {
      console.error("Failed to create project", error);
      set({ isLoading: false });
      get().addNotification("Failed to create project", "ERROR");
    }
  },

  updateProject: async (projectId, name, desc) => {
    set({ isLoading: true });
    try {
      const updatedProject = await updateProjectApi(projectId, { name, description: desc });

      set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? { ...p, ...updatedProject } : p),
        currentProject: state.currentProject?.id === projectId
          ? { ...state.currentProject, ...updatedProject }
          : state.currentProject,
        isLoading: false
      }));

      get().addNotification("Project updated successfully", "SUCCESS");
    } catch (error) {
      console.error("Failed to update project", error);
      set({ isLoading: false });
      get().addNotification("Failed to update project", "ERROR");
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    set({ isLoading: true });

    try {
      // 1. Gọi API (Dùng tên hàm API đã import, không dùng deleteProject trùng tên)
      await deleteProjectApi(projectId);

      // 2. Cập nhật State khi thành công
      set((state) => ({
        projects: state.projects.filter(p => p.id !== projectId),
        // currentView: 'WORKSPACE',
        currentProject: null,
        isLoading: false
      }));

      get().addNotification("Project deleted successfully", "INFO");

    } catch (error) {
      console.error("Failed to delete project", error);
      set({ isLoading: false }); // Tắt loading khi lỗi
      get().addNotification("Failed to delete project", "ERROR");
    }
  },


  loadProjectData: async (projectId: string) => {
    // Legacy support: combines both
    await get().loadProjectInitial(projectId);
    await get().loadProjectTasks(projectId);
  },

  loadProjectInitial: async (projectId: string) => {
    set({ isLoading: true });
    try {
      localStorage.setItem('lastView', 'PROJECT');
      localStorage.setItem('lastProjectId', projectId);

      const project = get().projects.find(p => p.id === projectId) || null;
      const memberUsers = await fetchProjectMembers(projectId);

      const projectMembers: ProjectMember[] = memberUsers.map((user: any) => ({
        userId: user.id,
        role: user.role
      }));

      const users = memberUsers.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
        bio: user.bio,
        isOnline: user.isOnline ?? false
      }));

      const updatedProject = project
        ? { ...project, members: projectMembers }
        : {
          id: projectId,
          name: 'Unknown Project',
          description: '',
          ownerId: '',
          members: projectMembers
        };

      set({
        currentProject: updatedProject,
        users,
        isProjectTasksLoaded: false, // Reset tasks loaded flag for new project
        isLoading: false
      });

      // Reconnect SignalR for the new project
      const { signalRService } = await import('./services/api');
      const user = get().currentUser;
      if (user) {
        await signalRService.connect(projectId, user.name, user.avatar, (type, payload) => {
          get().handleSignalRUpdate(type, payload);
        });
      }
    } catch (error) {
      console.error("Failed to load project initial data", error);
      set({ isLoading: false });
    }
  },

  loadProjectTasks: async (projectId: string) => {
    if (get().isProjectTasksLoaded && get().currentProject?.id === projectId) return;

    set({ isLoading: true });
    try {
      const [tasks, activities] = await Promise.all([
        fetchTasks(projectId),
        fetchActivities(projectId)
      ]);

      set({
        tasks,
        activities,
        isProjectTasksLoaded: true,
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to load project tasks", error);
      set({ isLoading: false });
    }
  },

  loadTaskById: async (taskId: string) => {
    // This could fetch full details including comments/history specifically if not already present
    // For now, it ensures the task is in the tasks array with its latest state
    try {
      const { tasks } = get();
      const existingTask = tasks.find(t => t.id === taskId);

      // If we already have it, we might still want to refresh it or its activities
      // But let's keep it simple for now as fetchTasks usually gets everything
      // In a real Jira-like app, this would call GET /api/task/{id}
    } catch (error) {
      console.error("Failed to load task by ID", error);
    }
  },


  addTask: async (task) => {
    set({ isLoading: true });
    try {
      const responseTask = await createTask(task);

      set((state) => ({
        tasks: [...state.tasks, responseTask],
        isLoading: false
      }));

      get().addNotification("Task created successfully", "SUCCESS");

    } catch (error) {
      set({ isLoading: false });
      get().addNotification("Failed to create project", "ERROR");
    }
  },

  updateTaskStatus: async (taskId, newStatus) => {
    // Gọi trực tiếp patchTask, truyền status vào object updates
    get().patchTask(taskId, { status: newStatus });
  },
  patchTask: async (taskId, updates) => {
    // 1. VALIDATE TRƯỚC
    const { currentUser, users, tasks } = get();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Kiểm tra xem có trường nào thực sự thay đổi không
    const hasChanges = (Object.keys(updates) as Array<keyof Task>).some(key => {
      return task[key] !== updates[key];
    });

    if (!hasChanges) return; // Không thay đổi -> Không gọi API

    // 2. GỌI API
    try {
      await updateTask(taskId, updates);

      // 3. CẬP NHẬT STATE
      set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      }));
    } catch (error) {
      get().addNotification("Cập nhật task thất bại", "ERROR");
    }
  },

  deleteTask: async (taskId) => {
    // 1. GỌI API
    try {
      await deleteTask(taskId);

      // 2. CẬP NHẬT STATE (Chỉ chạy khi API thành công)
      set((state) => {
        const targetTask = state.tasks.find(t => t.id === taskId);
        if (!targetTask) return {};

        // Logic xóa cha và con: OK
        const updatedTasks = state.tasks.filter((t) => t.id !== taskId && t.parentTaskId !== taskId);

        // Logic đóng Modal thông minh: OK
        let nextSelectedId = state.selectedTaskId;
        const currentlyOpenTask = state.tasks.find(t => t.id === state.selectedTaskId);

        if (state.selectedTaskId === taskId) {
          nextSelectedId = null;
        } else if (currentlyOpenTask && currentlyOpenTask.parentTaskId === taskId) {
          nextSelectedId = null;
        }

        return {
          tasks: updatedTasks,
          selectedTaskId: nextSelectedId
        };
      });

      get().addNotification("Xóa task thành công", "INFO");

    } catch (error) {
      get().addNotification("Xóa task thất bại", "ERROR");
    }
  },

  addAttachment: async (taskId, file) => {
    const uploadedFile = await uploadFile(taskId, file);

    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, files: [...(t.files || []), uploadedFile] } : t
      )
    }));

    // Invalidate React Query cache to sync UI
    queryClient.invalidateQueries({ queryKey: ['tasks'] });

    get().addNotification("File uploaded", "SUCCESS");
  },

  removeAttachment: async (taskId, fileId) => {
    try {
      await deleteFile(taskId, fileId);
    } catch (error) {
      get().addNotification("Xóa file thất bại", "ERROR");
      return;
    }
    set(state => ({
      tasks: state.tasks.map(t => {
        if (t.id !== taskId) return t;
        // Immediate filter to remove ghost item
        const currentFiles = t.files || [];
        return { ...t, files: currentFiles.filter(f => f.id !== fileId) };
      })
    }));
    // Invalidate React Query cache to sync UI
    queryClient.invalidateQueries({ queryKey: ['tasks'] });

    get().addNotification("File removed", "INFO");
  },



  addComment: async (taskId, content) => {
    const { currentUser } = get();
    if (!currentUser) return;

    let newComment: any;
    try {
      newComment = await createComment(taskId, content);
    } catch (error) {
      get().addNotification("Thêm bình luận thất bại", "ERROR");
      return;
    }

    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t
      )
    }));

    // Send detailed notification about new comment
    const task = get().tasks.find(t => t.id === taskId);
    if (task) {
      get().addDetailedNotification({
        message: `${currentUser.name} added a comment to "${task.title}"`,
        title: 'New Comment',
        type: 'INFO',
        link: `/project/${task.projectId}/board?selectedIssue=${taskId}`
      });

      // Invalidate React Query cache to sync UI
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  },

  deleteComment: async (taskId, commentId) => {
    try {
      await deleteComment(taskId, commentId);

      set(state => ({
        tasks: state.tasks.map(t =>
          t.id === taskId
            ? { ...t, comments: (t.comments || []).filter(c => c.id !== commentId) }
            : t
        )
      }));

      get().addNotification("Comment deleted", "INFO");
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      console.error("Failed to delete comment", error);
      get().addNotification("Failed to delete comment", "ERROR");
    }
  },

  addNotification: (msg, type: AppNotification['type'] = 'INFO') => {
    const newNotif: AppNotification = {
      id: `toast-${Date.now()}`,
      message: msg,
      read: true,
      type: type,
      createdAt: new Date().toISOString(),
      title: type === 'ERROR' ? 'Error' : type === 'SUCCESS' ? 'Success' : 'Info'
    };
    set(state => ({ notifications: [newNotif, ...state.notifications] }));
    get().addToast(msg, type);
  },

  addDetailedNotification: (notif) => {
    const allowedTitles = ["New Task Assigned", "New Comment", "Task Overdue", "Task Due Soon"];
    if (notif.title && !allowedTitles.includes(notif.title)) {
      console.log("Notification filtered out:", notif.title);
      return;
    }

    const newNotif: AppNotification = {
      // Use the provided ID (from DB) or generate a local temporary one
      id: notif.id || `n${Date.now()}`,
      message: notif.message,
      read: false,
      type: notif.type || 'INFO',
      createdAt: notif.createdAt || new Date().toISOString(),
      link: notif.link,
      title: notif.title
    };
    set(state => {
      // Prevent duplicate notifications if the same ID already exists
      if (state.notifications.some(n => n.id === newNotif.id)) {
        return state;
      }
      return { notifications: [newNotif, ...state.notifications] };
    });
    get().addToast(newNotif.message, newNotif.type);
  },

  loadNotifications: async () => {
    try {
      const data = await fetchNotifications();
      const mapped: AppNotification[] = data.map((n: any) => ({
        id: n.id,
        message: n.message,
        read: n.isRead,
        type: n.type,
        createdAt: n.createdAt,
        link: n.link,
        title: n.title
      }));
      set({ notifications: mapped });
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  },

  markNotificationRead: async (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));

    // If the ID is a local temporary one (starts with 'n'), don't call the backend
    if (id.startsWith('n')) {
      return;
    }

    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllNotificationsRead: async () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true }))
    }));
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  },

  dismissNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  deleteNotification: async (id) => {
    // 1. Update UI immediately
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));

    // 2. Call API (If not a temporary toast-like notification)
    if (!id.startsWith('toast-') && !id.startsWith('n')) {
      try {
        const { deleteNotification: deleteApi } = await import('./services/api');
        await deleteApi(id);
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    }
  },

  handleSignalRUpdate: (type, payload) => {
    console.log(`[SignalR] Handling update: ${type}`, payload);

    const projectId = get().currentProject?.id;

    switch (type) {
      case 'ReceiveNotification':
        get().addDetailedNotification(payload);
        break;

      case 'TaskUpdated':
        console.log('[SignalR] TaskUpdated:', payload);
        const taskUpdates: any = {};
        Object.keys(payload).forEach(key => {
          if (payload[key] !== null) {
            taskUpdates[key] = payload[key];
          }
        });

        // 1. Update Zustand State
        set(state => ({
          tasks: state.tasks.map(t => t.id === payload.id ? { ...t, ...taskUpdates } : t)
        }));

        // 2. Update React Query Cache for IMMEDIATE UI update
        const targetProjectId = payload.projectId || projectId;
        if (targetProjectId) {
          queryClient.setQueryData(['tasks', targetProjectId], (old: Task[] | undefined) => {
            if (!old) return old;
            return old.map(t => t.id === payload.id ? { ...t, ...taskUpdates } : t);
          });
          queryClient.invalidateQueries({ queryKey: ['tasks', targetProjectId] });
        }
        break;

      case 'TaskCreated':
        console.log('[SignalR] TaskCreated:', payload);
        if (get().currentProject?.id === payload.projectId) {
          // 1. Update Zustand State
          const exists = get().tasks.some(t => t.id === payload.id);
          if (!exists) {
            set(state => ({ tasks: [payload as Task, ...state.tasks] }));
          }

          // 2. Update React Query Cache
          queryClient.setQueryData(['tasks', payload.projectId], (old: Task[] | undefined) => {
            if (!old) return [payload];
            if (old.some(t => t.id === payload.id)) return old;
            return [payload as Task, ...old];
          });
          queryClient.invalidateQueries({ queryKey: ['tasks', payload.projectId] });
        }
        break;

      case 'CommentAdded':
        console.log('[SignalR] CommentAdded:', payload);
        // 1. Update Zustand State
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === payload.taskId
              ? { ...t, comments: [...(t.comments || []), payload] }
              : t
          )
        }));

        // 2. Update React Query Cache
        if (projectId) {
          queryClient.setQueryData(['tasks', projectId], (old: Task[] | undefined) => {
            if (!old) return old;
            return old.map(t =>
              t.id === payload.taskId
                ? { ...t, comments: [...(t.comments || []), payload] }
                : t
            );
          });
          queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        }
        break;

      case 'CommentDeleted':
        console.log('[SignalR] CommentDeleted:', payload);
        // 1. Update Zustand State
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === payload.taskId
              ? { ...t, comments: (t.comments || []).filter((c: any) => c.id !== payload.commentId) }
              : t
          )
        }));

        // 2. Update React Query Cache
        if (projectId) {
          queryClient.setQueryData(['tasks', projectId], (old: Task[] | undefined) => {
            if (!old) return old;
            return old.map(t =>
              t.id === payload.taskId
                ? { ...t, comments: (t.comments || []).filter((c: any) => c.id !== payload.commentId) }
                : t
            );
          });
          queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        }
        break;

      case 'ActivityLogAdded':
        console.log('[SignalR] ActivityLogAdded:', payload);
        const normalizedActivity = {
          ...payload,
          userId: payload.userId || (payload as any).UserId,
          taskId: payload.taskId || (payload as any).TaskId,
          projectId: payload.projectId || (payload as any).ProjectId,
          action: payload.action || (payload as any).Action,
          target: payload.target || (payload as any).Target,
          createdAt: payload.createdAt || (payload as any).CreatedAt,
        };
        set(state => ({
          activities: [normalizedActivity as ActivityLog, ...state.activities]
        }));
        break;
    }
  },

  changeMemberRole: async (userId, newRole) => {
    const { currentProject, users } = get();
    if (!currentProject) return;
    try {
      await updateProjectMemberRole(currentProject.id, userId, newRole);
      set((state) => {
        if (!state.currentProject) return {};
        const updatedMembers = state.currentProject.members.map(m =>
          m.userId === userId ? { ...m, role: newRole } : m
        );
        return {
          currentProject: { ...state.currentProject, members: updatedMembers }
        };
      });
      const memberName = users.find(u => u.id === userId)?.name || 'User';
      get().addNotification(`Updated ${memberName}'s role to ${newRole}`, "SUCCESS");
    } catch (error) {
      console.error("Failed to update member role", error);
      get().addNotification("Failed to update member role", "ERROR");
    }
  },

  inviteUserToProject: async (user, role) => {
    const { currentProject } = get();
    if (!currentProject) return;
    try {
      const response = await addProjectMember(currentProject.id, user.id, role);
      if (!response) throw new Error("API response is undefined");
      const newMember: ProjectMember = {
        userId: response.userId,
        role: response.role
      };
      set((state) => {
        if (!state.currentProject) return {};
        if (state.currentProject.members.some(m => m.userId === user.id)) return {};
        const userExists = state.users.some(u => u.id === user.id);
        return {
          currentProject: { ...state.currentProject, members: [...state.currentProject.members, newMember] },
          users: userExists ? state.users : [...state.users, user]
        };
      });
      get().addNotification(`Invited ${user.name} to project`, 'SUCCESS');
    } catch (error) {
      console.error("Failed to invite member", error);
      get().addNotification("Failed to invite member", "ERROR");
    }
  },

  removeMemberFromProject: async (userId) => {
    const { currentUser, currentProject } = get();
    if (!currentProject || !currentUser) return;
    if (currentProject.ownerId !== currentUser.id) {
      get().addNotification("Only project owner can remove members", "WARNING");
      return;
    }
    if (userId === currentProject.ownerId) {
      get().addNotification("Cannot remove project owner", "WARNING");
      return;
    }
    try {
      await removeProjectMember(currentProject.id, userId);
      set((state) => {
        if (!state.currentProject) return {};
        return {
          currentProject: {
            ...state.currentProject,
            members: state.currentProject.members.filter(m => m.userId !== userId)
          },
          tasks: state.tasks.map(task =>
            task.assigneeId === userId ? { ...task, assigneeId: undefined } : task
          )
        };
      });
      get().addNotification("Member removed from project", "SUCCESS");
    } catch (error) {
      console.error("Failed to remove member", error);
      get().addNotification("Failed to remove member", "ERROR");
    }
  },

  getUserRole: () => {
    const { currentProject, currentUser } = get();
    if (!currentProject || !currentUser) return null;
    const member = currentProject.members.find(m => m.userId === currentUser.id);
    return member ? (member.role as Role) : null;
  },

  addToast: (message, type = 'INFO') => {
    const id = Math.random().toString(36).substring(2, 9);
    set(state => ({
      toasts: [...state.toasts, { id, message, type }]
    }));

    // Auto remove after 2s
    setTimeout(() => {
      get().removeToast(id);
    }, 2000);
  },

  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  }
}));