
import { create } from 'zustand';
import { Task, Project, User, TaskStatus, ViewState, Role, ActivityLog, AppNotification, Theme, Priority, Comment, FileAttachment, ProjectMember } from './types';
import { fetchTasks, fetchProjects, fetchUsers, fetchActivities, loginUser, registerUser, uploadFile, fetchProjectMembers, createProject, deleteProjectApi, createTask, updateTask, deleteTask, addProjectMember, removeProjectMember, updateProjectMemberRole, createComment, deleteFile } from './services/api';
import { supabase } from './supabaseClient';
import { queryClient } from './queryClient';

interface AppState {
  // Global State
  currentUser: User | null;
  // currentView: ViewState; // Routing handles this now
  theme: Theme;
  notifications: AppNotification[];

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

  // Notifications
  addNotification: (msg: string, type?: AppNotification['type']) => void;
  addDetailedNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
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
  // currentView: 'AUTH',
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
      // Không set isLoading: false ở đây. 
      // Hãy để hàm login tự lo liệu việc đó. Nếu set false ở đây màn hình sẽ bị nháy.

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

  logout: () => {
    localStorage.removeItem('lastView');
    localStorage.removeItem('lastProjectId');
    set({ currentUser: null, currentProject: null, selectedTaskId: null, tasks: [], activities: [] });
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
    set({ currentUser: null });
    alert("Account deleted.");
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

      // Activity Log logic
      const { currentUser } = get();
      let newActivities = get().activities;

      if (currentUser) {
        const actionText = task.parentTaskId ? 'created subtask' : 'created task';
        const log: ActivityLog = {
          id: `act-${Date.now()}`,
          userId: currentUser.id,
          action: actionText,
          target: task.title,
          taskId: responseTask.id, // Dùng ID thật từ server trả về
          createdAt: new Date().toISOString()
        };
        newActivities = [log, ...newActivities];
      }

      set((state) => ({
        tasks: [...state.tasks, responseTask],
        activities: newActivities,
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

      // 4. LOGGING (Logic của bạn viết đoạn này rất tốt, giữ nguyên)
      if (currentUser) {
        const key = Object.keys(updates)[0];
        let actionText = `updated ${key} on`;

        switch (key) {
          case 'status': actionText = `updated status to ${updates.status}`; break;
          case 'priority': actionText = `updated priority to ${updates.priority}`; break;
          case 'assigneeId':
            const newAssignee = users.find(u => u.id === updates.assigneeId);
            actionText = newAssignee ? `assigned to ${newAssignee.name}` : `removed assignee from`;
            break;
          case 'startDate': actionText = `set start date to ${updates.startDate}`; break;
          case 'dueDate': actionText = `set due date to ${updates.dueDate}`; break;
          case 'title': actionText = `renamed task`; break;
          case 'description': actionText = `updated description of`; break;
        }

        const log: ActivityLog = {
          id: `act-${Date.now()}`,
          userId: currentUser.id,
          action: actionText,
          target: task.title,
          taskId: task.id,
          createdAt: new Date().toISOString()
        };
        set(state => ({ activities: [log, ...state.activities] }));
      }
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

        // Logic Log
        let newActivities = state.activities;
        if (state.currentUser) {
          const log: ActivityLog = {
            id: `act-${Date.now()}`,
            userId: state.currentUser.id,
            action: 'deleted task',
            target: targetTask.title,
            taskId: targetTask.id,
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

    // Log Comment Activity
    const task = get().tasks.find(t => t.id === taskId);
    if (task) {
      const log: ActivityLog = { id: `act-${Date.now()}`, userId: currentUser.id, action: 'commented on', target: task.title, taskId: task.id, createdAt: new Date().toISOString() };
      set(state => ({ activities: [log, ...state.activities] }));

      // Send detailed notification about new comment
      get().addDetailedNotification({
        message: `${currentUser.name} added a comment to "${task.title}"`,
        type: 'INFO',
        actionType: 'VIEW_TASK',
        targetId: taskId,
        targetName: task.title
      });

      // Invalidate React Query cache to sync UI
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  },

  addNotification: (msg, type: AppNotification['type'] = 'INFO') => {
    const newNotif: AppNotification = {
      id: `n${Date.now()}`,
      message: msg,
      read: false,
      type,
      createdAt: new Date().toISOString(),
      actionType: 'NONE'
    };
    set(state => ({ notifications: [newNotif, ...state.notifications] }));
  },

  addDetailedNotification: (notif) => {
    const newNotif: AppNotification = {
      id: `n${Date.now()}`,
      message: notif.message,
      read: false,
      type: notif.type || 'INFO',
      createdAt: new Date().toISOString(),
      actionType: notif.actionType || 'NONE',
      targetId: notif.targetId,
      targetName: notif.targetName
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

  changeMemberRole: async (userId, newRole) => {
    const { currentProject, users } = get();
    if (!currentProject) return;

    // Kiểm tra member tồn tại
    const memberExists = currentProject.members.some(m => m.userId === userId);
    if (!memberExists) {
      get().addNotification("Member not found in project", "WARNING");
      return;
    }

    try {
      // Call API
      await updateProjectMemberRole(currentProject.id, userId, newRole);

      // Update state
      set((state) => {
        if (!state.currentProject) return {};
        const updatedMembers = state.currentProject.members.map(m =>
          m.userId === userId ? { ...m, role: newRole } : m
        );
        return {
          currentProject: { ...state.currentProject, members: updatedMembers }
        };
      });

      // Success notification
      const user = users.find(u => u.id === userId);
      const memberName = user?.name || 'User';
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

      if (!response) {
        throw new Error("API response is undefined");
      }

      const newMember: ProjectMember = {
        userId: response.userId,
        role: response.role
      };

      set((state) => {
        if (!state.currentProject) return {};
        if (state.currentProject.members.some(m => m.userId === user.id)) return {};

        // Check if user already in users list
        const userExists = state.users.some(u => u.id === user.id);

        return {
          currentProject: { ...state.currentProject, members: [...state.currentProject.members, newMember] },
          // Add user to users list nếu chưa có
          users: userExists ? state.users : [...state.users, user]
        };
      });

      get().addDetailedNotification({
        message: `Invited ${user.name} as ${role} to "${currentProject?.name}"`,
        type: 'SUCCESS',
        actionType: 'VIEW_PROJECT',
        targetId: currentProject?.id,
        targetName: currentProject?.name
      });

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

    const user = get().users.find(u => u.id === userId);

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

      if (user) {
        get().addDetailedNotification({
          message: `Removed ${user.name} from "${currentProject.name}"`,
          type: 'SUCCESS',
          actionType: 'VIEW_PROJECT',
          targetId: currentProject.id,
          targetName: currentProject.name
        });
      }

    } catch (err) {
      console.error("Failed to remove member", err);
      get().addNotification("Failed to remove member", "ERROR");
    }
  },

  getUserRole: () => {
    const { currentProject, currentUser } = get();
    if (!currentProject || !currentUser) return null;
    const member = currentProject.members.find(m => m.userId === currentUser.id);
    return member ? member.role : null;
  }
}));