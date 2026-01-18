
export enum TaskStatus {
  TODO = 'TODO',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum Role {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  isOnline?: boolean;
}

export interface ProjectMember {
  userId: string;
  role: Role;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  action: string;
  target: string;
  taskId?: string;
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  tags?: string[];
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  comments?: Comment[];
  files?: FileAttachment[];
  projectId: string;
  // Recursive relationship
  parentTaskId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: ProjectMember[];
}

export interface AppNotification {
  id: string;
  message: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  createdAt: string;
  // Action details for clickable notifications
  actionType?: 'VIEW_PROJECT' | 'VIEW_TASK' | 'VIEW_COMMENT' | 'NONE';
  targetId?: string; // projectId, taskId, or commentId
  targetName?: string; // Project name, Task title, etc.
}

export type Theme = 'light' | 'dark';
export type TabType = 'overview' | 'kanban' | 'list' | 'calendar' | 'team' | 'activity';
export type ViewState = 'AUTH' | 'WORKSPACE' | 'PROJECT' | 'PROFILE';
