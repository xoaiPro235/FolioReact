# 📋 API Integration Guide - Mini-Jira Pro

Tài liệu này liệt kê tất cả các endpoint API cần được kết nối. Mỗi endpoint có code mẫu sẵn để implement.

---

## 🔐 Authentication APIs

### 1. **Login** - `POST /api/auth/login`
**File:** `store.ts` (Line 104)
**Hiện trạng:** Đã có mock login với password validation
**Code mẫu:**
```typescript
// Replace this in store.ts login action:
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

if (!response.ok) throw new Error('Login failed');
const user = await response.json();
```

### 2. **Register** - `POST /api/auth/register`
**File:** `store.ts` (Line 123)
**Hiện trạng:** Đã có mock registration
**Code mẫu:**
```typescript
// Replace this in store.ts register action:
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password
  })
});

if (!response.ok) throw new Error('Registration failed');
const newUser = await response.json();
```

---

## 👤 User APIs

### 3. **Update Profile** - `PATCH /api/users/me`
**File:** `store.ts` (Line 144)
**Hiện trạng:** Chỉ update local state
**Code mẫu:**
```typescript
// In updateProfile action:
const response = await fetch('/api/users/me', {
  method: 'PATCH',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // thêm token nếu cần
  },
  body: JSON.stringify(data)
});

if (!response.ok) throw new Error('Update failed');
const updatedUser = await response.json();
set({ currentUser: updatedUser });
```

### 4. **Delete Account** - `DELETE /api/users/me`
**File:** `store.ts` (Line 152)
**Hiện trạng:** Chỉ logout local
**Code mẫu:**
```typescript
// In deleteAccount action:
const response = await fetch('/api/users/me', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

if (!response.ok) throw new Error('Delete account failed');
// Logout sau khi xóa thành công
set({ currentUser: null, currentView: 'AUTH' });
```

---

## 📁 Project APIs

### 5. **Create Project** - `POST /api/projects`
**File:** `store.ts` (Line 192)
**Hiện trạng:** Chỉ tạo local
**Code mẫu:**
```typescript
// In createProject action:
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name,
    description: desc,
    ownerId: currentUser.id
  })
});

if (!response.ok) throw new Error('Create project failed');
const newProject = await response.json();
set({ projects: [...projects, newProject] });
```

### 6. **Delete Project** - `DELETE /api/projects/{id}`
**File:** `store.ts` (Line 204)
**Hiện trạng:** Chỉ xóa local
**Code mẫu:**
```typescript
// In deleteProject action:
const response = await fetch(`/api/projects/${projectId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

if (!response.ok) throw new Error('Delete project failed');
// Xóa từ state sau khi xóa thành công
set((state) => ({
  projects: state.projects.filter(p => p.id !== projectId),
  currentView: 'WORKSPACE',
  currentProject: null
}));
```

### 7. **Get Project Tasks** - `GET /api/projects/{projectId}/tasks`
**File:** `services/api.ts` (dùng trong loadProjectData)
**Hiện trạng:** Đã có mock fetchTasks
**Code mẫu:**
```typescript
// In services/api.ts fetchTasks:
export const fetchTasks = async (projectId: string): Promise<Task[]> => {
  const response = await fetch(`/api/projects/${projectId}/tasks`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return await response.json();
};
```

---

## ✅ Task APIs

### 8. **Create Task** - `POST /api/tasks`
**File:** `store.ts` (Line 230)
**Hiện trạng:** Chỉ tạo local
**Code mẫu:**
```typescript
// In addTask action:
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(task)
});

if (!response.ok) throw new Error('Create task failed');
const createdTask = await response.json();
set((state) => ({ tasks: [...state.tasks, createdTask] }));
```

### 9. **Update Task Status** - `PATCH /api/tasks/{id}/status`
**File:** `store.ts` (Line 253)
**Hiện trạng:** Chỉ update local
**Code mẫu:**
```typescript
// In updateTaskStatus action:
const response = await fetch(`/api/tasks/${taskId}/status`, {
  method: 'PATCH',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ status: newStatus })
});

if (!response.ok) throw new Error('Update status failed');
const updatedTask = await response.json();
set((state) => ({
  tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
}));
```

### 10. **Update Task** - `PATCH /api/tasks/{id}`
**File:** `store.ts` (Line 276)
**Hiện trạng:** Chỉ update local
**Code mẫu:**
```typescript
// In patchTask action:
const response = await fetch(`/api/tasks/${taskId}`, {
  method: 'PATCH',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updates)
});

if (!response.ok) throw new Error('Update task failed');
const updatedTask = await response.json();
set((state) => ({
  tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
}));
```

### 11. **Delete Task** - `DELETE /api/tasks/{id}`
**File:** `store.ts` (Line 312)
**Hiện trạng:** Chỉ xóa local
**Code mẫu:**
```typescript
// In deleteTask action:
const response = await fetch(`/api/tasks/${taskId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

if (!response.ok) throw new Error('Delete task failed');
// Xóa local sau khi xóa thành công
set((state) => ({
  tasks: state.tasks.filter(t => t.id !== taskId && t.parentTaskId !== taskId)
}));
```

---

## 📎 Attachment APIs

### 12. **Upload Attachment** - `POST /api/tasks/{id}/attachments`
**File:** `store.ts` (Line 363)
**Hiện trạng:** Chỉ mock upload
**Code mẫu:**
```typescript
// In addAttachment action:
const formData = new FormData();
formData.append('file', file);

const response = await fetch(`/api/tasks/${taskId}/attachments`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

if (!response.ok) throw new Error('Upload failed');
const fileAttachment = await response.json();
set((state) => ({
  tasks: state.tasks.map(t => 
    t.id === taskId ? { ...t, files: [...(t.files || []), fileAttachment] } : t
  )
}));
```

### 13. **Delete Attachment** - `DELETE /api/tasks/{id}/attachments/{fileId}`
**File:** `store.ts` (Line 376)
**Hiện trạng:** Chỉ xóa local
**Code mẫu:**
```typescript
// In removeAttachment action:
const response = await fetch(`/api/tasks/${taskId}/attachments/${fileId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

if (!response.ok) throw new Error('Delete attachment failed');
// Xóa local sau khi xóa thành công
set((state) => ({
  tasks: state.tasks.map(t =>
    t.id === taskId ? { ...t, files: t.files?.filter(f => f.id !== fileId) } : t
  )
}));
```

---

## 💬 Comment APIs

### 14. **Add Comment** - `POST /api/tasks/{id}/comments`
**File:** `store.ts` (Line 424)
**Hiện trạng:** Chỉ add local
**Code mẫu:**
```typescript
// In addComment action:
const response = await fetch(`/api/tasks/${taskId}/comments`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ content })
});

if (!response.ok) throw new Error('Add comment failed');
const newComment = await response.json();
set((state) => ({
  tasks: state.tasks.map(t =>
    t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t
  )
}));
```

---

## 👥 Project Member APIs

### 15. **Change Member Role** - `PATCH /api/projects/{id}/members/{userId}`
**File:** `store.ts` (Line 471)
**Hiện trạng:** Chỉ update local
**Code mẫu:**
```typescript
// In changeMemberRole action:
const response = await fetch(`/api/projects/${currentProject.id}/members/${userId}`, {
  method: 'PATCH',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ role: newRole })
});

if (!response.ok) throw new Error('Change role failed');
set((state) => {
  if (!state.currentProject) return {};
  const updatedMembers = state.currentProject.members.map(m => 
    m.userId === userId ? { ...m, role: newRole } : m
  );
  return { currentProject: { ...state.currentProject, members: updatedMembers } };
});
```

### 16. **Invite Member** - `POST /api/projects/{id}/members`
**File:** `store.ts` (Line 484)
**Hiện trạng:** Chỉ add local
**Code mẫu:**
```typescript
// In inviteUserToProject action:
const response = await fetch(`/api/projects/${currentProject.id}/members`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    userId: user.id,
    role: role
  })
});

if (!response.ok) throw new Error('Invite failed');
set((state) => {
  if (!state.currentProject) return {};
  const newMember = { userId: user.id, role };
  return {
    currentProject: { 
      ...state.currentProject, 
      members: [...state.currentProject.members, newMember] 
    }
  };
});
get().addNotification(`Invited ${user.name} as ${role}`, 'SUCCESS');
```

### 17. **Remove Member** - `DELETE /api/projects/{id}/members/{userId}`
**File:** `store.ts` (Line 498)
**Hiện trạng:** Chỉ remove local (+ unassign tasks)
**Code mẫu:**
```typescript
// In removeMemberFromProject action:
const response = await fetch(`/api/projects/${currentProject.id}/members/${userId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

if (!response.ok) throw new Error('Remove member failed');
set((state) => {
  if (!state.currentProject) return {};
  const updatedMembers = state.currentProject.members.filter(m => m.userId !== userId);
  const updatedTasks = state.tasks.map(task => 
    task.assigneeId === userId ? { ...task, assigneeId: undefined } : task
  );
  return {
    currentProject: { ...state.currentProject, members: updatedMembers },
    tasks: updatedTasks
  };
});
```

---

## 📊 Additional APIs

### 18. **Get Users** - `GET /api/users/all`
**File:** `services/api.ts` - fetchUsers
**Hiện trạng:** Đã có mock
**Code mẫu:**
```typescript
export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Fetch users failed');
  return await response.json();
};
```

### 19. **Get Projects** - `GET /api/users/{userId}/projects`
**File:** `services/api.ts` - fetchProjects
**Hiện trạng:** Đã có mock
**Code mẫu:**
```typescript
export const fetchProjects = async (userId: string): Promise<Project[]> => {
  const response = await fetch(`/api/users/${userId}/projects`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Fetch projects failed');
  return await response.json();
};
```

### 20. **Get Activities** - `GET /api/projects/{projectId}/activities`
**File:** `services/api.ts` - fetchActivities
**Hiện trạng:** Đã có mock
**Code mẫu:**
```typescript
export const fetchActivities = async (projectId: string): Promise<ActivityLog[]> => {
  const response = await fetch(`/api/projects/${projectId}/activities`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Fetch activities failed');
  return await response.json();
};
```

### 21. **Search Users** - `GET /api/users/search?q={query}`
**File:** `services/api.ts` - searchUsers
**Hiện trạng:** Đã có mock
**Code mẫu:**
```typescript
export const searchUsers = async (query: string): Promise<User[]> => {
  const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Search failed');
  return await response.json();
};
```

---

## 🔑 Token Management

Tất cả các API calls cần include authentication token. Đề xuất:

```typescript
// Thêm helper function trong services/api.ts
let authToken: string = '';

export const setAuthToken = (token: string) => {
  authToken = token;
};

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authToken}`
});
```

Sau đó update mọi fetch calls để dùng `getAuthHeaders()`.

---

## ✅ Checklist for Implementation

- [ ] Setup authentication token storage (localStorage hoặc cookies)
- [ ] Cập nhật BASE_URL cho API server
- [ ] Implement tất cả 21 API calls
- [ ] Add error handling cho mỗi API call
- [ ] Add loading states
- [ ] Add toast notifications cho success/error
- [ ] Test tất cả endpoints
- [ ] Remove mock data khi API ready

---

**Ghi chú:** Tất cả các TODO comment đã được đánh dấu ở file `store.ts` và `components/TaskModal.tsx` theo dõi nơi cần implement.
