import axios from 'axios';
import { supabase } from '../supabaseClient';
import { Task, TaskStatus, Priority, User, Project, Role, ActivityLog, FileAttachment, ProjectMember } from '../types';
// import { AsteriskIcon } from 'lucide-react';  
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';

// // ==========================================
// // MOCK DATA - START
// // ==========================================

// export const MOCK_USERS: User[] = [
//   { id: 'u1', name: 'Alice Johnson', email: 'alice@minijira.app', avatar: 'https://picsum.photos/32/32?random=1', title: 'Product Owner', isOnline: true },
//   { id: 'u2', name: 'Bob Smith', email: 'bob@minijira.app', avatar: 'https://picsum.photos/32/32?random=2', title: 'Frontend Lead', isOnline: false },
//   { id: 'u3', name: 'Charlie Davis', email: 'charlie@minijira.app', avatar: 'https://picsum.photos/32/32?random=3', title: 'Backend Dev', isOnline: true },
//   { id: 'u4', name: 'Diana Prince', email: 'diana@minijira.app', avatar: 'https://picsum.photos/32/32?random=4', title: 'Designer', isOnline: true },
//   { id: 'u5', name: 'Evan Wright', email: 'evan@minijira.app', avatar: 'https://picsum.photos/32/32?random=5', title: 'QA Engineer', isOnline: false },
// ];

// export const MOCK_PROJECTS: Project[] = [
//   {
//     id: 'p1',
//     name: 'Mini-Jira Development',
//     description: 'Building a simplified project management tool with React and ASP.NET.',
//     ownerId: 'u1',
//     members: [
//       { userId: 'u1', role: Role.OWNER },
//       { userId: 'u2', role: Role.MEMBER },
//       { userId: 'u3', role: Role.VIEWER },
//     ]
//   },
//   {
//     id: 'p2',
//     name: 'Marketing Campaign Q4',
//     description: 'Social media and ad rollout for end of year.',
//     ownerId: 'u1',
//     members: [
//       { userId: 'u1', role: Role.OWNER },
//       { userId: 'u4', role: Role.MEMBER },
//     ]
//   },
// ];

// // FLAT TASK STRUCTURE
// const MOCK_TASKS: Task[] = [
//   // Parent Task 1
//   {
//     id: 't1',
//     projectId: 'p1',
//     title: 'Design System Architecture',
//     description: 'Create the initial diagrams for the microservices.',
//     status: TaskStatus.DONE,
//     priority: Priority.HIGH,
//     assigneeId: 'u1',
//     tags: ['Architecture', 'Backend'],
//     startDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
//     dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
//     createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
//     comments: [],
//     files: []
//   },
//   // Subtasks for t1
//   {
//     id: 'st1',
//     projectId: 'p1',
//     parentTaskId: 't1',
//     title: 'Draft diagram',
//     description: '',
//     status: TaskStatus.DONE,
//     priority: Priority.MEDIUM,
//     assigneeId: 'u1',
//     tags: [],
//     dueDate: '',
//     startDate: '',
//     createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
//     comments: [],
//     files: []
//   },
//   {
//     id: 'st2',
//     projectId: 'p1',
//     parentTaskId: 't1',
//     title: 'Review with team',
//     description: '',
//     status: TaskStatus.DONE,
//     priority: Priority.MEDIUM,
//     assigneeId: 'u2',
//     tags: [],
//     dueDate: '',
//     startDate: '',
//     createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
//     comments: [],
//     files: []
//   },

//   // Parent Task 2
//   {
//     id: 't2',
//     projectId: 'p1',
//     title: 'Frontend Authentication',
//     description: 'Implement login and register pages using Auth0.',
//     status: TaskStatus.IN_PROGRESS,
//     priority: Priority.HIGH,
//     assigneeId: 'u2',
//     tags: ['Frontend', 'Security'],
//     startDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
//     dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
//     createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
//     comments: [
//       { id: 'c1', userId: 'u3', content: 'Make sure to handle token refresh.', createdAt: '2023-11-02T10:00:00Z' }
//     ],
//     files: []
//   },
//   // Subtasks for t2
//   {
//     id: 'st3',
//     projectId: 'p1',
//     parentTaskId: 't2',
//     title: 'Login UI Component',
//     description: '',
//     status: TaskStatus.DONE,
//     priority: Priority.HIGH,
//     assigneeId: 'u2',
//     tags: [],
//     dueDate: '',
//     startDate: '',
//     createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
//     comments: [],
//     files: []
//   },
//   {
//     id: 'st4',
//     projectId: 'p1',
//     parentTaskId: 't2',
//     title: 'Integrate API',
//     description: '',
//     status: TaskStatus.IN_PROGRESS,
//     priority: Priority.HIGH,
//     assigneeId: 'u2',
//     tags: [],
//     dueDate: '',
//     startDate: '',
//     createdAt: new Date().toISOString(),
//     comments: [],
//     files: []
//   },

//   // Parent Task 3
//   {
//     id: 't3',
//     projectId: 'p1',
//     title: 'Database Schema Migration',
//     description: 'Update the users table to include new profile fields.',
//     status: TaskStatus.PENDING, // New Status
//     priority: Priority.MEDIUM,
//     assigneeId: 'u3',
//     tags: ['Database'],
//     startDate: '2023-11-15',
//     dueDate: '2023-11-20',
//     createdAt: '2023-11-10T10:00:00Z',
//     comments: [],
//     files: []
//   },

//   // Parent Task 4
//   {
//     id: 't4',
//     projectId: 'p1',
//     title: 'Implement Dark Mode',
//     description: 'Add dark mode support using Tailwind CSS.',
//     status: TaskStatus.TODO,
//     priority: Priority.LOW,
//     assigneeId: 'u2',
//     tags: ['Frontend', 'UI'],
//     startDate: '2023-11-21',
//     dueDate: '2023-11-25',
//     createdAt: '2023-11-15T15:00:00Z',
//     comments: [],
//     files: []
//   },
// ];

// const MOCK_ACTIVITIES: ActivityLog[] = [
//   { id: 'a1', userId: 'u1', action: 'created task', target: 'Design System Architecture', createdAt: '2023-11-01T09:00:00Z' },
//   { id: 'a2', userId: 'u2', action: 'updated status to IN_PROGRESS', target: 'Frontend Authentication', createdAt: '2023-11-02T14:30:00Z' },
//   { id: 'a3', userId: 'u3', action: 'commented on', target: 'Frontend Authentication', createdAt: '2023-11-02T15:00:00Z' },
// ];

// // ==========================================
// // MOCK DATA - END
// // ==========================================

// // Mock user credentials for demo
// const MOCK_CREDENTIALS: Record<string, string> = {
//   'alice@minijira.app': 'password123',
//   'bob@minijira.app': 'password123',
//   'charlie@minijira.app': 'password123',
//   'diana@minijira.app': 'password123',
//   'evan@minijira.app': 'password123',
// };

// export const loginUser = async (email: string, password: string): Promise<User | null> => {
//   // TODO: API INTEGRATION [POST] /api/auth/login
//   await new Promise(r => setTimeout(r, 500));

//   // Validate email exists
//   const user = MOCK_USERS.find(u => u.email === email);
//   if (!user) {
//     throw new Error('User not found');
//   }

//   // Validate password
//   const correctPassword = MOCK_CREDENTIALS[email];
//   if (!correctPassword || password !== correctPassword) {
//     throw new Error('Invalid password');
//   }

//   return user;
// };

// export const registerUser = async (userData: any): Promise<User> => {
// BASE_URL lấy từ biến môi trường (ví dụ: http://localhost:5000)
// const BASE_URL = import.meta.env.VITE_API_URL || ''; 

//   // GỌI API THẬT
//   const response = await fetch(`${BASE_URL}/api/auth/register`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       firstName: userData.firstName,
//       lastName: userData.lastName,
//       email: userData.email,
//       password: userData.password
//     })
//   });

//   // Xử lý lỗi từ Backend trả về (VD: 409 Conflict - Email trùng)
//   if (!response.ok) {
//     // Cố gắng đọc tin nhắn lỗi từ server trả về (nếu có)
//     const errorData = await response.json().catch(() => null);
//     throw new Error(errorData?.message || 'Đăng ký thất bại');
//   }

//   // Trả về thông tin User đã tạo thành công
//   return await response.json();
// };

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
);

// --------AUTH------------

export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  // 1. Đăng nhập vào hệ thống Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Login failed");

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error("Lỗi khi lấy profile:", profileError.message);
  }

  // 3. Kết hợp dữ liệu và trả về
  return {
    id: data.user.id,
    email: data.user.email!,
    // Ưu tiên lấy Name và Avatar từ bảng profiles trong DB
    name: profile?.name ?? data.user.user_metadata?.full_name ?? data.user.email!.split("@")[0],
    avatar: profile?.avatar_url ?? data.user.user_metadata?.avatar_url ?? "",
    isOnline: true,
  };
};


export const registerUser = async (userData: any): Promise<void> => {
  const { error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: `${userData.firstName} ${userData.lastName}`,
        avatar: `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=random`,
      },
    },
  });

  if (error) throw new Error(error.message);
};

// --------USER------------

export const fetchUsers = async (): Promise<User[]> => {
  // TODO: API INTEGRATION [GET] /api/users/all
  return await axiosClient.get('/users/all');
};

export const searchUsers = async (query: string): Promise<User[]> => {
  // TODO: API INTEGRATION [GET] /api/users/search?q={query}
  return await axiosClient.get(`/users/search?q=${encodeURIComponent(query)}`);
};

// --------PROJECT------------
export const fetchProjects = async (userId: string): Promise<Project[]> => {
  // TODO: API INTEGRATION [GET] /api/users/{userId}/projects
  return await axiosClient.get(`/project`)
};

export const createProject = async (data: { name: string, description?: string }): Promise<Project> => {
  return await axiosClient.post('/project', data);
};

export const fetchProjectMembers = async (projectId: string): Promise<(User & { role: Role })[]> => {
  return await axiosClient.get(`/project/${projectId}/members`);
};

export const deleteProjectApi = async (projectId: string): Promise<void> => {
  return await axiosClient.delete(`/project/${projectId}`);
}

export const addProjectMember = async (projectId: string, userId: string, role: Role): Promise<ProjectMember> => {
  return await axiosClient.post(`/project/${projectId}/members`, { userId, role });
};

export const removeProjectMember = async (projectId: string, userId: string): Promise<void> => {
  return await axiosClient.delete(`/project/${projectId}/members/${userId}`);
}

// --------TASK------------

export const fetchTasks = async (projectId: string): Promise<Task[]> => {
  // TODO: API INTEGRATION [GET] /api/projects/{projectId}/tasks
  return await axiosClient.get(`task?projectId=${projectId}`);
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
  return await axiosClient.post('/task', task);
};

export const updateTask = async (taskId: string, update: any): Promise<void> => {
  return await axiosClient.patch(`/task/${taskId}`, update);
};


export const deleteTask = async (taskId: string): Promise<void> => {
  return await axiosClient.delete(`/task/${taskId}`);
};

// --------ACTIVITIES------------

export const fetchActivities = async (projectId: string): Promise<ActivityLog[]> => {
  // TODO: API INTEGRATION [GET] /api/projects/{projectId}/activities
  return await axiosClient.get(`project/${projectId}/activities`);
};

export const fetchTaskActivities = async (taskId: string): Promise<ActivityLog[]> => {
  return await axiosClient.get(`task/${taskId}/activities`);
}

// --------FILES------------

export const deleteFile = async (taskId: string, fileId: string): Promise<void> => {
  return await axiosClient.delete(`/task/${taskId}/attachments/${fileId}`);
}


export const uploadFile = async (taskId: string, file: File): Promise<FileAttachment> => {
  try {
    const fileName = `${taskId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(fileName);

    const payload = {
      fileName: file.name,
      fileUrl: urlData.publicUrl,
      fileType: file.type,
      fileSize: file.size
    };

    const res = await axiosClient.post(`/task/${taskId}/attachments`, payload);
    const data = res.data;

    return {
      id: data.id,
      name: data.fileName,
      url: data.fileUrl,
      type: data.fileType,
      size: data.fileSize.toString()
    };
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

// --------SIGNALR / REALTIME------------

export class SignalRService {
  private connection: HubConnection | null = null;

  public async connect(projectId: string, onUpdate: (type: string, payload: any) => void) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    this.connection = new HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    this.connection.on("TaskUpdated", (task) => onUpdate("TaskUpdated", task));
    this.connection.on("TaskCreated", (task) => onUpdate("TaskCreated", task));
    this.connection.on("AttachmentAdded", (file) => onUpdate("AttachmentAdded", file));
    this.connection.on("AttachmentDeleted", (data) => onUpdate("AttachmentDeleted", data));

    try {
      await this.connection.start();
      await this.connection.invoke("JoinProject", projectId);
      console.log(`[SignalR] Connected to project: ${projectId}`);
    } catch (err) {
      console.error("[SignalR] Connection failed:", err);
    }
  }

  public disconnect() {
    if (this.connection) {
      this.connection.stop();
      console.log('[SignalR] Disconnected');
    }
  }
}
export const signalRService = new SignalRService();
