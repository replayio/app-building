import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Task, TaskUser } from "./tasksSlice";

export interface TaskNote {
  id: string;
  taskId: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

interface TaskDetailState {
  task: Task | null;
  notes: TaskNote[];
  users: TaskUser[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskDetailState = {
  task: null,
  notes: [],
  users: [],
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

export const fetchTaskDetail = createAsyncThunk("taskDetail/fetchTask", async (taskId: string) => {
  const resp = await fetch(`/.netlify/functions/tasks/${taskId}`);
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Failed to fetch task");
  }
  return resp.json() as Promise<Task>;
});

export const fetchTaskNotes = createAsyncThunk("taskDetail/fetchNotes", async (taskId: string) => {
  const resp = await fetch(`/.netlify/functions/task-notes?taskId=${encodeURIComponent(taskId)}`);
  if (!resp.ok) {
    throw new Error("Failed to fetch notes");
  }
  return resp.json() as Promise<TaskNote[]>;
});

export const fetchTaskDetailUsers = createAsyncThunk("taskDetail/fetchUsers", async () => {
  const resp = await fetch("/.netlify/functions/users");
  if (!resp.ok) throw new Error("Failed to fetch users");
  return resp.json() as Promise<TaskUser[]>;
});

export const addTaskNote = createAsyncThunk(
  "taskDetail/addNote",
  async ({ taskId, content }: { taskId: string; content: string }) => {
    const resp = await fetch("/.netlify/functions/task-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ taskId, content }),
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Failed to add note");
    }
    return resp.json() as Promise<TaskNote>;
  }
);

export const deleteTaskNote = createAsyncThunk("taskDetail/deleteNote", async (noteId: string) => {
  const resp = await fetch(`/.netlify/functions/task-notes/${noteId}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Failed to delete note");
  }
  return noteId;
});

export const updateTaskDetailStatus = createAsyncThunk(
  "taskDetail/updateStatus",
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
    return status;
  }
);

export const updateTaskDetailAssignee = createAsyncThunk(
  "taskDetail/updateAssignee",
  async ({ taskId, assigneeId }: { taskId: string; assigneeId: string }) => {
    const resp = await fetch(`/.netlify/functions/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ assigneeId }),
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Failed to update task");
    }
    return assigneeId;
  }
);

const taskDetailSlice = createSlice({
  name: "taskDetail",
  initialState,
  reducers: {
    clearTaskDetail(state) {
      state.task = null;
      state.notes = [];
      state.users = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskDetail.pending, (state) => {
        if (!state.task) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchTaskDetail.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        state.task = action.payload;
      })
      .addCase(fetchTaskDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch task";
      })
      .addCase(fetchTaskNotes.fulfilled, (state, action: PayloadAction<TaskNote[]>) => {
        state.notes = action.payload;
      })
      .addCase(fetchTaskDetailUsers.fulfilled, (state, action: PayloadAction<TaskUser[]>) => {
        state.users = action.payload;
      })
      .addCase(addTaskNote.fulfilled, (state, action: PayloadAction<TaskNote>) => {
        state.notes.unshift(action.payload);
      })
      .addCase(deleteTaskNote.fulfilled, (state, action: PayloadAction<string>) => {
        state.notes = state.notes.filter((n) => n.id !== action.payload);
      })
      .addCase(updateTaskDetailStatus.fulfilled, (state, action: PayloadAction<string>) => {
        if (state.task) {
          state.task.status = action.payload;
        }
      })
      .addCase(updateTaskDetailAssignee.fulfilled, (state, action: PayloadAction<string>) => {
        if (state.task) {
          state.task.assigneeId = action.payload || null;
          // We'll refetch to get the updated name
        }
      });
  },
});

export const { clearTaskDetail } = taskDetailSlice.actions;
export const taskDetailReducer = taskDetailSlice.reducer;
