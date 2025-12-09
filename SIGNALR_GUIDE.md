# SignalR Integration Guide for Mini-Jira

Hướng dẫn này giúp bạn tích hợp SignalR vào Mini-Jira để hỗ trợ real-time features như notifications, comments, và cập nhật task.

## 1. Cài đặt Dependencies

Trước tiên, cài đặt SignalR client package:

```bash
npm install @microsoft/signalr
```

## 2. Tạo SignalR Service

Tạo file `services/signalr.ts` để quản lý kết nối SignalR:

```typescript
// services/signalr.ts
import * as signalR from "@microsoft/signalr";
import { useStore } from '../store';

let hubConnection: signalR.HubConnection | null = null;

export const initializeSignalR = async (userId: string) => {
  try {
    hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/notifications-hub`, {
        accessTokenFactory: () => localStorage.getItem('authToken') || '',
        withCredentials: true
      })
      .withAutomaticReconnect([0, 0, 3000, 5000, 10000, 30000])
      .withHubProtocol(new signalR.JsonHubProtocol())
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Định nghĩa các sự kiện nhận từ server
    hubConnection.on('ReceiveNotification', (notification) => {
      const store = useStore.getState();
      store.addDetailedNotification(notification);
    });

    hubConnection.on('CommentAdded', (taskId, comment, userName) => {
      const store = useStore.getState();
      store.addDetailedNotification({
        message: `${userName} added a comment to "${comment.taskTitle}"`,
        type: 'INFO',
        actionType: 'VIEW_TASK',
        targetId: taskId,
        targetName: comment.taskTitle,
        autoDissmiss: false
      });
    });

    hubConnection.on('TaskCreated', (task) => {
      const store = useStore.getState();
      store.addDetailedNotification({
        message: `New task "${task.title}" was created`,
        type: 'INFO',
        actionType: 'VIEW_TASK',
        targetId: task.id,
        targetName: task.title,
        autoDissmiss: false
      });
    });

    hubConnection.on('TaskStatusChanged', (taskId, newStatus, taskTitle) => {
      const store = useStore.getState();
      store.addDetailedNotification({
        message: `Task status changed to ${newStatus}`,
        type: 'INFO',
        actionType: 'VIEW_TASK',
        targetId: taskId,
        targetName: taskTitle,
        autoDissmiss: false
      });
    });

    hubConnection.on('TaskUpdated', (taskId, updates, taskTitle) => {
      const store = useStore.getState();
      store.addDetailedNotification({
        message: `Task "${taskTitle}" was updated`,
        type: 'INFO',
        actionType: 'VIEW_TASK',
        targetId: taskId,
        targetName: taskTitle,
        autoDissmiss: false
      });
    });

    hubConnection.on('TaskDeleted', (taskId, taskTitle) => {
      const store = useStore.getState();
      store.addDetailedNotification({
        message: `Task "${taskTitle}" was deleted`,
        type: 'WARNING',
        actionType: 'NONE',
        autoDissmiss: false
      });
    });

    hubConnection.on('MemberRemoved', (userId, projectId, projectName) => {
      const store = useStore.getState();
      store.addDetailedNotification({
        message: `You were removed from "${projectName}"`,
        type: 'WARNING',
        actionType: 'NONE',
        autoDissmiss: false
      });
    });

    hubConnection.on('MemberInvited', (projectId, projectName, role) => {
      const store = useStore.getState();
      store.addDetailedNotification({
        message: `You were invited to "${projectName}" as ${role}`,
        type: 'SUCCESS',
        actionType: 'VIEW_PROJECT',
        targetId: projectId,
        targetName: projectName,
        autoDissmiss: false
      });
    });

    await hubConnection.start();
    console.log('SignalR connected');
    
    // Thông báo cho server rằng user này đã kết nối
    await hubConnection.invoke('JoinUser', userId);
    
  } catch (error) {
    console.error('SignalR connection failed:', error);
  }
};

export const stopSignalR = async () => {
  if (hubConnection) {
    await hubConnection.stop();
    hubConnection = null;
  }
};

export const getHubConnection = () => hubConnection;

export const createTask = async (task: any) => {
  if (hubConnection?.state === signalR.HubConnectionState.Connected) {
    await hubConnection.invoke('CreateTask', task);
  }
};

export const updateTaskStatus = async (taskId: string, newStatus: string) => {
  if (hubConnection?.state === signalR.HubConnectionState.Connected) {
    await hubConnection.invoke('UpdateTaskStatus', taskId, newStatus);
  }
};

export const updateTask = async (taskId: string, updates: any) => {
  if (hubConnection?.state === signalR.HubConnectionState.Connected) {
    await hubConnection.invoke('UpdateTask', taskId, updates);
  }
};

export const deleteTask = async (taskId: string) => {
  if (hubConnection?.state === signalR.HubConnectionState.Connected) {
    await hubConnection.invoke('DeleteTask', taskId);
  }
};

export const sendComment = async (taskId: string, content: string) => {
  if (hubConnection?.state === signalR.HubConnectionState.Connected) {
    await hubConnection.invoke('AddComment', taskId, content);
  }
};

export const inviteMember = async (projectId: string, userId: string, role: string) => {
  if (hubConnection?.state === signalR.HubConnectionState.Connected) {
    await hubConnection.invoke('InviteMember', projectId, userId, role);
  }
};

export const removeMember = async (projectId: string, userId: string) => {
  if (hubConnection?.state === signalR.HubConnectionState.Connected) {
    await hubConnection.invoke('RemoveMember', projectId, userId);
  }
};
```

## 3. Integrate SignalR vào Store

Cập nhật `store.ts` để sử dụng SignalR. Những chỗ có `TODO: SignalR` cần được cập nhật:

### 3.1. Login - Khởi tạo kết nối
**File: `store.ts` - `login` action**
```typescript
login: async (email: string, password: string) => {
  try {
    const response = await loginUser(email, password);
    if (response) {
      // Initialize SignalR after successful login
      const { initializeSignalR } = await import('./services/signalr');
      await initializeSignalR(response.id);
      
      set({ currentUser: response, currentView: 'WORKSPACE' });
    }
  } catch (error) {
    // Handle error
  }
},
```

### 3.2. Logout - Dừng kết nối
**File: `store.ts` - `logout` action**
```typescript
logout: () => {
  const { stopSignalR } = require('./services/signalr');
  stopSignalR();
  set({ currentUser: null, currentView: 'AUTH', projects: [], tasks: [], notifications: [] });
},
```

### 3.3. addTask - Tạo task real-time
**File: `store.ts` - Line ~232 (addTask action)**

Hiện tại có TODO:
```typescript
addTask: (task) => {
  // TODO: API Call - [POST] /api/tasks
  // TODO: SignalR - hubConnection.invoke("CreateTask", task);
  
  // ... existing code ...
  set(state => ({ tasks: [...state.tasks, safeTask] }));
},
```

Cập nhật thành:
```typescript
addTask: (task) => {
  // TODO: API Call - [POST] /api/tasks
  const { createTask } = require('./services/signalr');
  createTask(task); // Gọi SignalR để broadcast task tới tất cả users
  
  // ... existing code ...
  set(state => ({ tasks: [...state.tasks, safeTask] }));
},
```

### 3.4. updateTaskStatus - Cập nhật trạng thái task
**File: `store.ts` - Line ~255 (updateTaskStatus action)**

Hiện tại có TODO:
```typescript
updateTaskStatus: (taskId, newStatus) => {
  // TODO: API Call - [PATCH] /api/tasks/{id}/status
  // TODO: SignalR - hubConnection.invoke("UpdateTaskStatus", taskId, newStatus);
  
  // ... existing code ...
},
```

Cập nhật thành:
```typescript
updateTaskStatus: (taskId, newStatus) => {
  // TODO: API Call - [PATCH] /api/tasks/{id}/status
  const { updateTaskStatus } = require('./services/signalr');
  updateTaskStatus(taskId, newStatus); // Broadcast status change
  
  // ... existing code ...
},
```

### 3.5. patchTask - Cập nhật task (assignee, priority, dates, etc)
**File: `store.ts` - Line ~278 (patchTask action)**

Hiện tại có TODO:
```typescript
patchTask: (taskId, updates) => {
  // TODO: API Call - [PATCH] /api/tasks/{id}
  // TODO: SignalR - hubConnection.invoke("UpdateTask", taskId, updates);
  
  // ... existing code ...
},
```

Cập nhật thành:
```typescript
patchTask: (taskId, updates) => {
  // TODO: API Call - [PATCH] /api/tasks/{id}
  const { updateTask } = require('./services/signalr');
  updateTask(taskId, updates); // Broadcast updates (assignee, priority, dates, etc)
  
  // ... existing code ...
},
```

### 3.6. deleteTask - Xóa task
**File: `store.ts` - Line ~314 (deleteTask action)**

Hiện tại có TODO:
```typescript
deleteTask: (taskId) => {
  // 1. Immediate State Update to prevent "Ghost Items"
  // TODO: API Call - [DELETE] /api/tasks/{id}
  // TODO: SignalR - hubConnection.invoke("DeleteTask", taskId);
  
  // ... existing code ...
},
```

Cập nhật thành:
```typescript
deleteTask: (taskId) => {
  // 1. Immediate State Update to prevent "Ghost Items"
  // TODO: API Call - [DELETE] /api/tasks/{id}
  const { deleteTask } = require('./services/signalr');
  deleteTask(taskId); // Broadcast task deletion
  
  // ... existing code ...
},
```

### 3.7. addComment - Thêm comment
**File: `store.ts` - Line ~426 (addComment action)**

Hiện tại có TODO:
```typescript
addComment: (taskId, content) => {
  // TODO: API Call - [POST] /api/tasks/{id}/comments
  // TODO: SignalR - hubConnection.invoke("AddComment", taskId, content);
  
  // ... existing code ...
},
```

Cập nhật thành:
```typescript
addComment: (taskId, content) => {
  // TODO: API Call - [POST] /api/tasks/{id}/comments
  const { sendComment } = require('./services/signalr');
  sendComment(taskId, content); // Broadcast comment thêm mới
  
  // ... existing code ...
  
  // Send detailed notification about new comment
  get().addDetailedNotification({
    message: `${currentUser.name} added a comment to "${task.title}"`,
    type: 'INFO',
    actionType: 'VIEW_TASK',
    targetId: taskId,
    targetName: task.title,
    autoDissmiss: false
  });
},
```

### 3.8. inviteUserToProject - Mời member
**File: `store.ts` - (inviteUserToProject action)**

Cập nhật:
```typescript
inviteUserToProject: (user, role) => {
  // TODO: API Call - [POST] /api/projects/{id}/members
  const { inviteMember } = require('./services/signalr');
  const { currentProject } = get();
  
  inviteMember(currentProject?.id, user.id, role); // Notify invited user
  
  // ... existing code ...
  
  get().addDetailedNotification({
    message: `Invited ${user.name} as ${role} to "${currentProject?.name}"`,
    type: 'SUCCESS',
    actionType: 'VIEW_PROJECT',
    targetId: currentProject?.id,
    targetName: currentProject?.name,
    autoDissmiss: false
  });
},
```

### 3.9. removeMemberFromProject - Xóa member
**File: `store.ts` - (removeMemberFromProject action)**

Cập nhật:
```typescript
removeMemberFromProject: (userId) => {
  // TODO: API Call - [DELETE] /api/projects/{id}/members/{userId}
  const { removeMember } = require('./services/signalr');
  const { currentProject } = get();
  
  removeMember(currentProject?.id, userId); // Notify removed user
  
  // ... existing code ...
  
  // Notify project owner (or other admins) about removal with project context
  if (user) {
    get().addDetailedNotification({
      message: `Removed ${user.name} from "${projectName}"`,
      type: 'SUCCESS',
      actionType: 'VIEW_PROJECT',
      targetId: currentProject?.id,
      targetName: projectName,
      autoDissmiss: false
    });

    // TODO: Notify the removed user via email/system notification about removal
    // In a real app, send notification to the removed user
    // Example: fetch(`/api/notifications/users/${userId}`, ...)
    // This could be handled by backend when processing the removal
  }
},
```

## 4. Backend - ASP.NET Core SignalR Hub

Trên backend, tạo SignalR Hub để xử lý real-time:

```csharp
// NotificationsHub.cs
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;

public class NotificationsHub : Hub
{
    private static Dictionary<string, string> _userConnections = new();

    public async Task JoinUser(string userId)
    {
        if (_userConnections.ContainsKey(userId))
            _userConnections[userId] = Context.ConnectionId;
        else
            _userConnections.Add(userId, Context.ConnectionId);
        
        await Clients.All.SendAsync("UserOnline", userId);
    }

    public async Task AddComment(string taskId, string content)
    {
        // 1. Save comment to database
        var comment = await _commentService.AddCommentAsync(taskId, content);
        
        // 2. Broadcast to all connected users
        await Clients.All.SendAsync("CommentAdded", taskId, comment, Context.User?.FindFirst("sub")?.Value);
    }

    public async Task CreateTask(dynamic task)
    {
        // 1. Save to database
        var newTask = await _taskService.CreateTaskAsync(task);
        
        // 2. Broadcast to all connected users
        await Clients.All.SendAsync("TaskCreated", newTask);
    }

    public async Task UpdateTaskStatus(string taskId, string newStatus)
    {
        // 1. Update in database
        var task = await _taskService.UpdateStatusAsync(taskId, newStatus);
        
        // 2. Broadcast to all connected users
        await Clients.All.SendAsync("TaskStatusChanged", taskId, newStatus, task.Title);
    }

    public async Task UpdateTask(string taskId, dynamic updates)
    {
        // 1. Update task in database
        var task = await _taskService.UpdateTaskAsync(taskId, updates);
        
        // 2. Broadcast update to all connected users
        await Clients.All.SendAsync("TaskUpdated", taskId, updates, task.Title);
    }

    public async Task DeleteTask(string taskId)
    {
        // 1. Delete from database
        var task = await _taskService.DeleteTaskAsync(taskId);
        
        // 2. Broadcast deletion to all connected users
        await Clients.All.SendAsync("TaskDeleted", taskId, task.Title);
    }

    public async Task InviteMember(string projectId, string userId, string role)
    {
        // 1. Add member to project in database
        await _projectService.AddMemberAsync(projectId, userId, role);
        
        // 2. Send notification to invited user
        if (_userConnections.TryGetValue(userId, out var connectionId))
        {
            var project = await _projectService.GetProjectAsync(projectId);
            await Clients.Client(connectionId).SendAsync("MemberInvited", projectId, project.Name, role);
        }
    }

    public async Task RemoveMember(string projectId, string userId)
    {
        // 1. Remove member from project in database
        await _projectService.RemoveMemberAsync(projectId, userId);
        
        // 2. Send notification to removed user
        if (_userConnections.TryGetValue(userId, out var connectionId))
        {
            var project = await _projectService.GetProjectAsync(projectId);
            await Clients.Client(connectionId).SendAsync("MemberRemoved", userId, projectId, project.Name);
        }
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var userId = Context.User?.FindFirst("sub")?.Value;
        if (userId != null)
        {
            _userConnections.Remove(userId);
        }
        await Clients.All.SendAsync("UserOffline", userId);
        await base.OnDisconnectedAsync(exception);
    }
}

// Program.cs
builder.Services.AddSignalR();

// Configure middleware
app.MapHub<NotificationsHub>("/notifications-hub");
```

## 5. Cập nhật Environment Variables

Thêm API URL vào `.env`:

```
VITE_API_URL=http://localhost:5000
```

## 6. Real-Time Features Được Hỗ Trợ

| Feature | Frontend Event | Backend Method | Store.ts Function | Location |
|---------|---|---|---|---|
| **Tạo Task** | `TaskCreated` | `CreateTask()` | `addTask()` | Line ~232 |
| **Cập nhật Trạng Thái Task** | `TaskStatusChanged` | `UpdateTaskStatus()` | `updateTaskStatus()` | Line ~255 |
| **Cập nhật Task** | `TaskUpdated` | `UpdateTask()` | `patchTask()` | Line ~278 |
| **Xóa Task** | `TaskDeleted` | `DeleteTask()` | `deleteTask()` | Line ~314 |
| **Comment** | `CommentAdded` | `AddComment()` | `addComment()` | Line ~426 |
| **Member Removal** | `MemberRemoved` | `RemoveMember()` | `removeMemberFromProject()` | ~ |
| **Member Invitation** | `MemberInvited` | `InviteMember()` | `inviteUserToProject()` | ~ |
| **Online Status** | `UserOnline/UserOffline` | (implicit) | - | - |

## 7. Các Việc Cần Làm Tiếp

- [ ] Xây dựng backend API endpoints
- [ ] Cài đặt SignalR trên backend
- [ ] Test real-time features
- [ ] Thêm typing indicators (ai đang nhập)
- [ ] Thêm online presence (ai đang online)
- [ ] Lưu offline messages (để gửi khi user online lại)
- [ ] Thêm presence indicators trên UI (green dot)
- [ ] Implement read receipts (ai đã đọc notification)

## 8. Best Practices

✅ **Luôn kiểm tra connection state trước khi invoke**
```typescript
if (hubConnection?.state === signalR.HubConnectionState.Connected) {
  await hubConnection.invoke('Method', args);
}
```

✅ **Cleanup on logout**
```typescript
stopSignalR(); // Gọi khi logout
```

✅ **Handle reconnection gracefully**
```typescript
hubConnection?.onreconnected(() => {
  console.log('Reconnected!');
  // Re-sync data if needed
});
```

✅ **Use dependency injection trên backend**
```csharp
public NotificationsHub(INotificationService notificationService)
{
  _notificationService = notificationService;
}
```

❌ **Không lưu connection ID ở frontend - nó thay đổi mỗi khi reconnect**

❌ **Không gửi sensitive data qua SignalR nếu không encrypt**

## Troubleshooting

**Connection timeout?**
- Check CORS settings
- Verify firewall allows WebSocket
- Check SignalR URL matches backend

**Messages không nhận được?**
- Kiểm tra hub connection state
- Verify user ID matching
- Check server-side logs

**Memory leak?**
- Luôn gọi `stopSignalR()` khi logout
- Unsubscribe từ events khi component unmount
- Kiểm tra các TimeOut không được cleanup
