import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  clientId: string | null;
  clientName: string | null;
  dealId: string | null;
  dealName: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeAvatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskClient {
  id: string;
  name: string;
}

export interface TaskUser {
  id: string;
  name: string;
  email: string;
}

export interface TaskDeal {
  id: string;
  name: string;
}

interface TasksState {
  items: Task[];
  clients: TaskClient[];
  users: TaskUser[];
  clientDeals: TaskDeal[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  clients: [],
  users: [],
  clientDeals: [],
  loading: false,
  error: null,
};

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export const fetchAllTasks = createAsyncThunk("tasks/fetchAll", async () => {
  const resp = await fetch("/.netlify/functions/tasks");
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Failed to fetch tasks");
  }
  return resp.json() as Promise<Task[]>;
});

export const fetchTaskClients = createAsyncThunk("tasks/fetchClients", async () => {
  const resp = await fetch("/.netlify/functions/clients");
  if (!resp.ok) throw new Error("Failed to fetch clients");
  const data = await resp.json();
  return (data as { id: string; name: string }[]).map((c) => ({ id: c.id, name: c.name }));
});

export const fetchTaskUsers = createAsyncThunk("tasks/fetchUsers", async () => {
  const resp = await fetch("/.netlify/functions/users");
  if (!resp.ok) throw new Error("Failed to fetch users");
  return resp.json() as Promise<TaskUser[]>;
});

export const fetchClientDeals = createAsyncThunk("tasks/fetchClientDeals", async (clientId: string) => {
  const resp = await fetch(`/.netlify/functions/deals?clientId=${encodeURIComponent(clientId)}`);
  if (!resp.ok) throw new Error("Failed to fetch deals");
  const data = await resp.json();
  return (data as { id: string; name: string }[]).map((d) => ({ id: d.id, name: d.name }));
});

export const createTask = createAsyncThunk(
  "tasks/create",
  async (task: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: string;
    clientId?: string;
    dealId?: string;
    assigneeId?: string;
  }) => {
    const resp = await fetch("/.netlify/functions/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(task),
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Failed to create task");
    }
    return resp.json() as Promise<Task>;
  }
);

export const updateTaskStatus = createAsyncThunk(
  "tasks/updateStatus",
  async ({ taskId, status }: { taskId: string; status: string }) => {
    const resp = await fetch(`/.netlify/functions/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Failed to update task");
    }
    return { taskId, status };
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (taskId: string) => {
    const resp = await fetch(`/.netlify/functions/tasks/${taskId}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Failed to delete task");
    }
    return taskId;
  }
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearClientDeals(state) {
      state.clientDeals = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTasks.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch tasks";
      })
      .addCase(fetchTaskClients.fulfilled, (state, action: PayloadAction<TaskClient[]>) => {
        state.clients = action.payload;
      })
      .addCase(fetchTaskUsers.fulfilled, (state, action: PayloadAction<TaskUser[]>) => {
        state.users = action.payload;
      })
      .addCase(fetchClientDeals.fulfilled, (state, action: PayloadAction<TaskDeal[]>) => {
        state.clientDeals = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTaskStatus.fulfilled, (state, action: PayloadAction<{ taskId: string; status: string }>) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.taskId);
        if (idx !== -1) {
          state.items[idx].status = action.payload.status;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearClientDeals } = tasksSlice.actions;
export const tasksReducer = tasksSlice.reducer;
