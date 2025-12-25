
import { Task, TaskStatus, Priority, User, Project, Role, ActivityLog, FileAttachment } from '../types';

// ==========================================
// MOCK DATA - START
// ==========================================

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@minijira.app', avatar: 'https://picsum.photos/32/32?random=1', title: 'Product Owner', isOnline: true },
  { id: 'u2', name: 'Bob Smith', email: 'bob@minijira.app', avatar: 'https://picsum.photos/32/32?random=2', title: 'Frontend Lead', isOnline: false },
  { id: 'u3', name: 'Charlie Davis', email: 'charlie@minijira.app', avatar: 'https://picsum.photos/32/32?random=3', title: 'Backend Dev', isOnline: true },
  { id: 'u4', name: 'Diana Prince', email: 'diana@minijira.app', avatar: 'https://picsum.photos/32/32?random=4', title: 'Designer', isOnline: true },
  { id: 'u5', name: 'Evan Wright', email: 'evan@minijira.app', avatar: 'https://picsum.photos/32/32?random=5', title: 'QA Engineer', isOnline: false },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Mini-Jira Development',
    description: 'Building a simplified project management tool with React and ASP.NET.',
    ownerId: 'u1',
    members: [
      { userId: 'u1', role: Role.OWNER },
      { userId: 'u2', role: Role.MEMBER },
      { userId: 'u3', role: Role.VIEWER },
    ]
  },
  {
    id: 'p2',
    name: 'Marketing Campaign Q4',
    description: 'Social media and ad rollout for end of year.',
    ownerId: 'u1',
    members: [
      { userId: 'u1', role: Role.OWNER },
      { userId: 'u4', role: Role.MEMBER },
    ]
  },
  {
    id: 'p3',
    name: 'Website Redesign',
    description: 'Complete overhaul of the corporate website.',
    ownerId: 'u2',
    members: [
      { userId: 'u2', role: Role.OWNER },
      { userId: 'u5', role: Role.MEMBER },
    ]
  },
];

// FLAT TASK STRUCTURE
const MOCK_TASKS: Task[] = [
  // Parent Task 1
  {
    id: 't1',
    projectId: 'p1',
    title: 'Design System Architecture',
    description: 'Create the initial diagrams for the microservices.',
    status: TaskStatus.DONE,
    priority: Priority.HIGH,
    assigneeId: 'u1',
    tags: ['Architecture', 'Backend'],
    startDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    comments: [],
    files: []
  },
  // Subtasks for t1
  {
    id: 'st1',
    projectId: 'p1',
    parentTaskId: 't1',
    title: 'Draft diagram',
    description: '',
    status: TaskStatus.DONE,
    priority: Priority.MEDIUM,
    assigneeId: 'u1',
    tags: [],
    dueDate: '',
    startDate: '',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    comments: [],
    files: []
  },
  {
    id: 'st2',
    projectId: 'p1',
    parentTaskId: 't1',
    title: 'Review with team',
    description: '',
    status: TaskStatus.DONE,
    priority: Priority.MEDIUM,
    assigneeId: 'u2',
    tags: [],
    dueDate: '',
    startDate: '',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    comments: [],
    files: []
  },

  // Parent Task 2
  {
    id: 't2',
    projectId: 'p1',
    title: 'Frontend Authentication',
    description: 'Implement login and register pages using Auth0.',
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    assigneeId: 'u2',
    tags: ['Frontend', 'Security'],
    startDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    comments: [
      { id: 'c1', userId: 'u3', content: 'Make sure to handle token refresh.', createdAt: '2023-11-02T10:00:00Z' }
    ],
    files: []
  },
  // Subtasks for t2
  {
    id: 'st3',
    projectId: 'p1',
    parentTaskId: 't2',
    title: 'Login UI Component',
    description: '',
    status: TaskStatus.DONE,
    priority: Priority.HIGH,
    assigneeId: 'u2',
    tags: [],
    dueDate: '',
    startDate: '',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    comments: [],
    files: []
  },
  {
    id: 'st4',
    projectId: 'p1',
    parentTaskId: 't2',
    title: 'Integrate API',
    description: '',
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    assigneeId: 'u2',
    tags: [],
    dueDate: '',
    startDate: '',
    createdAt: new Date().toISOString(),
    comments: [],
    files: []
  },

  // Parent Task 3
  {
    id: 't3',
    projectId: 'p1',
    title: 'Database Schema Migration',
    description: 'Update the users table to include new profile fields.',
    status: TaskStatus.PENDING, // New Status
    priority: Priority.MEDIUM,
    assigneeId: 'u3',
    tags: ['Database'],
    startDate: '2023-11-15',
    dueDate: '2023-11-20',
    createdAt: '2023-11-10T10:00:00Z',
    comments: [],
    files: []
  },

  // Parent Task 4
  {
    id: 't4',
    projectId: 'p1',
    title: 'Implement Dark Mode',
    description: 'Add dark mode support using Tailwind CSS.',
    status: TaskStatus.TODO,
    priority: Priority.LOW,
    assigneeId: 'u2',
    tags: ['Frontend', 'UI'],
    startDate: '2023-11-21',
    dueDate: '2023-11-25',
    createdAt: '2023-11-15T15:00:00Z',
    comments: [],
    files: []
  },
];

const MOCK_ACTIVITIES: ActivityLog[] = [
  { id: 'a1', userId: 'u1', action: 'created task', target: 'Design System Architecture', createdAt: '2023-11-01T09:00:00Z' },
  { id: 'a2', userId: 'u2', action: 'updated status to IN_PROGRESS', target: 'Frontend Authentication', createdAt: '2023-11-02T14:30:00Z' },
  { id: 'a3', userId: 'u3', action: 'commented on', target: 'Frontend Authentication', createdAt: '2023-11-02T15:00:00Z' },
];

// ==========================================
// MOCK DATA - END
// ==========================================

// Mock user credentials for demo
const MOCK_CREDENTIALS: Record<string, string> = {
  'alice@minijira.app': 'password123',
  'bob@minijira.app': 'password123',
  'charlie@minijira.app': 'password123',
  'diana@minijira.app': 'password123',
  'evan@minijira.app': 'password123',
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  // TODO: API INTEGRATION [POST] /api/auth/login
  await new Promise(r => setTimeout(r, 500));

  // Validate email exists
  const user = MOCK_USERS.find(u => u.email === email);
  if (!user) {
    throw new Error('User not found');
  }

  // Validate password
  const correctPassword = MOCK_CREDENTIALS[email];
  if (!correctPassword || password !== correctPassword) {
    throw new Error('Invalid password');
  }

  return user;
};

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

export const fetchProjects = async (userId: string): Promise<Project[]> => {
  // TODO: API INTEGRATION [GET] /api/users/{userId}/projects
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_PROJECTS.filter(p => p.members.some(m => m.userId === userId));
};

export const fetchTasks = async (projectId: string): Promise<Task[]> => {
  // TODO: API INTEGRATION [GET] /api/projects/{projectId}/tasks
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_TASKS.filter(t => t.projectId === projectId);
};

export const fetchUsers = async (): Promise<User[]> => {
  // TODO: API INTEGRATION [GET] /api/users/all
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_USERS;
};

export const fetchActivities = async (projectId: string): Promise<ActivityLog[]> => {
  // TODO: API INTEGRATION [GET] /api/projects/{projectId}/activities
  await new Promise(r => setTimeout(r, 300));
  return MOCK_ACTIVITIES;
};

export const searchUsers = async (query: string): Promise<User[]> => {
  // TODO: API INTEGRATION [GET] /api/users/search?q={query}
  await new Promise(r => setTimeout(r, 300));
  if (!query) return [];
  return MOCK_USERS.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));
};

export const uploadFile = async (file: File): Promise<FileAttachment> => {
  // TODO: API INTEGRATION [POST] /api/files/upload
  await new Promise(r => setTimeout(r, 1500)); // Mock upload delay
  return {
    id: `f${Date.now()}`,
    name: file.name,
    url: '#',
    size: `${(file.size / 1024).toFixed(1)} KB`,
    type: file.type.split('/')[1] || 'file'
  };
};

export class SignalRService {
  public async connect(projectId: string, onUpdate: (type: string, payload: any) => void) {
    // TODO: API INTEGRATION - SignalR
    console.log(`[SignalR] Connecting to project channel: ${projectId}...`);
  }

  public disconnect() {
    console.log('[SignalR] Disconnecting...');
  }
}

export const signalRService = new SignalRService();

export const fetchTaskActivities = async (taskId: string): Promise<ActivityLog[]> => {
  // TODO: API INTEGRATION [GET] /api/tasks/{taskId}/activities
  // Gọi về Backend để lấy logs của riêng task này
  await new Promise(r => setTimeout(r, 300)); // Mock delay

  // MOCK DATA: Trả về dữ liệu giả lập để test giao diện
  // Trong thực tế bạn sẽ return await response.json();
  return [
    {
      id: `log-${Date.now()}`,
      userId: 'u1',
      action: 'created task',
      target: 'Design System',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: `log-${Date.now() + 1}`,
      userId: 'u2',
      action: 'changed status to',
      target: 'IN_PROGRESS',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: `log-${Date.now() + 2}`,
      userId: 'u1',
      action: 'commented on',
      target: 'this task',
      createdAt: new Date().toISOString()
    }
  ];
};