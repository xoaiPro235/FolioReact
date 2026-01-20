import axios from 'axios';
import { supabase } from '../supabaseClient';
import { Task, TaskStatus, Priority, User, Project, Role, ActivityLog, FileAttachment, ProjectMember } from '../types';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';

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

export const updateProjectMemberRole = async (projectId: string, userId: string, newRole: Role): Promise<void> => {
  return await axiosClient.patch(`/project/${projectId}/members/${userId}`, { role: newRole });
};

// --------TASK------------

export const fetchTasks = async (projectId: string): Promise<Task[]> => {
  const response: any[] = await axiosClient.get(`task?projectId=${projectId}`);
  return response.map((task: any) => ({
    ...task,
    files: task.attachments?.map((att: any) => ({
      id: att.id,
      name: att.fileName,
      url: att.fileUrl,
      type: att.fileType,
      size: att.fileSize?.toString() || '0'
    })) || []
  }));
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

export const uploadFile = async (
  taskId: string,
  file: File
): Promise<FileAttachment> => {

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error('Not authenticated');
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${taskId}/${Date.now()}-${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: urlData } =
    supabase.storage.from('attachments').getPublicUrl(filePath);

  const payload = {
    fileName: sanitizedName,
    fileUrl: urlData.publicUrl,
    fileType: file.type,
    fileSize: file.size.toString()
  };

  const response: any = await axiosClient.post(`/task/${taskId}/attachments`, payload);

  return {
    id: response.id,
    name: response.fileName,
    url: response.fileUrl,
    type: response.fileType,
    size: response.fileSize
  };
};




// --------COMMENT------------

export const createComment = async (taskId: string, content: string): Promise<Comment> => {
  return await axiosClient.post(`/task/${taskId}/comments`, { content });
}



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
