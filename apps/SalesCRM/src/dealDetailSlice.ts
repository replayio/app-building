import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

// --- Types ---

export interface DealDetail {
  id: string;
  name: string;
  clientId: string;
  clientName: string | null;
  value: number | null;
  stage: string;
  ownerId: string | null;
  ownerName: string | null;
  probability: number | null;
  expectedCloseDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealHistoryEntry {
  id: string;
  dealId: string;
  oldStage: string | null;
  newStage: string;
  changedBy: string;
  changedAt: string;
}

export interface Writeup {
  id: string;
  dealId: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface WriteupVersion {
  id: string;
  writeupId: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface DealTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  clientId: string | null;
  dealId: string | null;
  dealName: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealAttachment {
  id: string;
  filename: string;
  fileType: string | null;
  url: string;
  size: number | null;
  clientId: string | null;
  dealId: string | null;
  dealName: string | null;
  createdAt: string;
}

export interface DealIndividual {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  role: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface DealUser {
  id: string;
  name: string;
  email: string;
}

interface DealDetailState {
  deal: DealDetail | null;
  history: DealHistoryEntry[];
  writeups: Writeup[];
  tasks: DealTask[];
  attachments: DealAttachment[];
  individuals: DealIndividual[];
  users: DealUser[];
  loading: boolean;
  error: string | null;
}

const initialState: DealDetailState = {
  deal: null,
  history: [],
  writeups: [],
  tasks: [],
  attachments: [],
  individuals: [],
  users: [],
  loading: false,
  error: null,
};

// --- Helper ---

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

// --- Thunks ---

export const fetchDealDetail = createAsyncThunk(
  "dealDetail/fetchDeal",
  async (dealId: string) => {
    const resp = await fetch(`/.netlify/functions/deals/${dealId}`);
    if (!resp.ok) throw new Error("Failed to fetch deal");
    return resp.json() as Promise<DealDetail>;
  }
);

export const updateDealDetail = createAsyncThunk(
  "dealDetail/updateDeal",
  async ({ dealId, data }: { dealId: string; data: Partial<DealDetail> }) => {
    const resp = await fetch(`/.netlify/functions/deals/${dealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Failed to update deal");
    return resp.json() as Promise<DealDetail>;
  }
);

export const fetchDealHistory = createAsyncThunk(
  "dealDetail/fetchHistory",
  async (dealId: string) => {
    const resp = await fetch(`/.netlify/functions/deal-history?dealId=${dealId}`);
    if (!resp.ok) throw new Error("Failed to fetch deal history");
    return resp.json() as Promise<DealHistoryEntry[]>;
  }
);

export const fetchWriteups = createAsyncThunk(
  "dealDetail/fetchWriteups",
  async (dealId: string) => {
    const resp = await fetch(`/.netlify/functions/writeups?dealId=${dealId}`);
    if (!resp.ok) throw new Error("Failed to fetch writeups");
    return resp.json() as Promise<Writeup[]>;
  }
);

export const createWriteup = createAsyncThunk(
  "dealDetail/createWriteup",
  async (data: { dealId: string; title: string; content: string }) => {
    const resp = await fetch("/.netlify/functions/writeups", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error || "Failed to create writeup");
    }
    return resp.json() as Promise<Writeup>;
  }
);

export const updateWriteup = createAsyncThunk(
  "dealDetail/updateWriteup",
  async ({ writeupId, data }: { writeupId: string; data: { title?: string; content?: string } }) => {
    const resp = await fetch(`/.netlify/functions/writeups/${writeupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Failed to update writeup");
    return resp.json() as Promise<Writeup>;
  }
);

export const fetchWriteupVersions = createAsyncThunk(
  "dealDetail/fetchWriteupVersions",
  async (writeupId: string) => {
    const resp = await fetch(`/.netlify/functions/writeups/${writeupId}?versions=true`);
    if (!resp.ok) throw new Error("Failed to fetch writeup versions");
    return resp.json() as Promise<WriteupVersion[]>;
  }
);

export const fetchDealTasks = createAsyncThunk(
  "dealDetail/fetchTasks",
  async (dealId: string) => {
    const resp = await fetch(`/.netlify/functions/tasks?dealId=${dealId}`);
    if (!resp.ok) throw new Error("Failed to fetch tasks");
    return resp.json() as Promise<DealTask[]>;
  }
);

export const createDealTask = createAsyncThunk(
  "dealDetail/createTask",
  async (task: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: string;
    clientId: string;
    dealId: string;
    assigneeId?: string;
  }) => {
    const resp = await fetch("/.netlify/functions/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(task),
    });
    if (!resp.ok) throw new Error("Failed to create task");
    return resp.json() as Promise<DealTask>;
  }
);

export const completeDealTask = createAsyncThunk(
  "dealDetail/completeTask",
  async (taskId: string) => {
    const resp = await fetch(`/.netlify/functions/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ status: "completed" }),
    });
    if (!resp.ok) throw new Error("Failed to complete task");
    return taskId;
  }
);

export const fetchDealAttachments = createAsyncThunk(
  "dealDetail/fetchAttachments",
  async (dealId: string) => {
    const resp = await fetch(`/.netlify/functions/attachments?dealId=${dealId}`);
    if (!resp.ok) throw new Error("Failed to fetch attachments");
    return resp.json() as Promise<DealAttachment[]>;
  }
);

export const uploadDealAttachment = createAsyncThunk(
  "dealDetail/uploadAttachment",
  async ({ file, clientId, dealId }: { file: File; clientId: string; dealId: string }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", clientId);
    formData.append("dealId", dealId);

    const resp = await fetch("/.netlify/functions/attachments", {
      method: "POST",
      body: formData,
    });
    if (!resp.ok) throw new Error("Failed to upload attachment");
    return resp.json() as Promise<DealAttachment>;
  }
);

export const deleteDealAttachment = createAsyncThunk(
  "dealDetail/deleteAttachment",
  async (attachmentId: string) => {
    const resp = await fetch(`/.netlify/functions/attachments/${attachmentId}`, {
      method: "DELETE",
    });
    if (!resp.ok) throw new Error("Failed to delete attachment");
    return attachmentId;
  }
);

export const fetchDealIndividuals = createAsyncThunk(
  "dealDetail/fetchIndividuals",
  async (clientId: string) => {
    const resp = await fetch(`/.netlify/functions/individuals?clientId=${clientId}`);
    if (!resp.ok) throw new Error("Failed to fetch individuals");
    return resp.json() as Promise<DealIndividual[]>;
  }
);

export const fetchDealUsers = createAsyncThunk(
  "dealDetail/fetchUsers",
  async () => {
    const resp = await fetch("/.netlify/functions/users");
    if (!resp.ok) throw new Error("Failed to fetch users");
    return resp.json() as Promise<DealUser[]>;
  }
);

// --- Slice ---

const dealDetailSlice = createSlice({
  name: "dealDetail",
  initialState,
  reducers: {
    clearDealDetail(state) {
      state.deal = null;
      state.history = [];
      state.writeups = [];
      state.tasks = [];
      state.attachments = [];
      state.individuals = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Deal
      .addCase(fetchDealDetail.pending, (state) => {
        if (!state.deal) state.loading = true;
        state.error = null;
      })
      .addCase(fetchDealDetail.fulfilled, (state, action: PayloadAction<DealDetail>) => {
        state.loading = false;
        state.deal = action.payload;
      })
      .addCase(fetchDealDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch deal";
      })
      .addCase(updateDealDetail.fulfilled, (state, action: PayloadAction<DealDetail>) => {
        state.deal = action.payload;
      })
      // History
      .addCase(fetchDealHistory.fulfilled, (state, action: PayloadAction<DealHistoryEntry[]>) => {
        state.history = action.payload;
      })
      // Writeups
      .addCase(fetchWriteups.fulfilled, (state, action: PayloadAction<Writeup[]>) => {
        state.writeups = action.payload;
      })
      .addCase(createWriteup.fulfilled, (state, action: PayloadAction<Writeup>) => {
        state.writeups.unshift(action.payload);
      })
      .addCase(updateWriteup.fulfilled, (state, action: PayloadAction<Writeup>) => {
        const idx = state.writeups.findIndex((w) => w.id === action.payload.id);
        if (idx !== -1) {
          state.writeups[idx] = action.payload;
        }
      })
      // Tasks
      .addCase(fetchDealTasks.fulfilled, (state, action: PayloadAction<DealTask[]>) => {
        state.tasks = action.payload;
      })
      .addCase(createDealTask.fulfilled, (state, action: PayloadAction<DealTask>) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(completeDealTask.fulfilled, (state, action: PayloadAction<string>) => {
        const task = state.tasks.find((t) => t.id === action.payload);
        if (task) {
          task.status = "completed";
          task.updatedAt = new Date().toISOString();
        }
      })
      // Attachments
      .addCase(fetchDealAttachments.fulfilled, (state, action: PayloadAction<DealAttachment[]>) => {
        state.attachments = action.payload;
      })
      .addCase(uploadDealAttachment.fulfilled, (state, action: PayloadAction<DealAttachment>) => {
        state.attachments.unshift(action.payload);
      })
      .addCase(deleteDealAttachment.fulfilled, (state, action: PayloadAction<string>) => {
        state.attachments = state.attachments.filter((a) => a.id !== action.payload);
      })
      // Individuals
      .addCase(fetchDealIndividuals.fulfilled, (state, action: PayloadAction<DealIndividual[]>) => {
        state.individuals = action.payload;
      })
      // Users
      .addCase(fetchDealUsers.fulfilled, (state, action: PayloadAction<DealUser[]>) => {
        state.users = action.payload;
      });
  },
});

export const { clearDealDetail } = dealDetailSlice.actions;
export const dealDetailReducer = dealDetailSlice.reducer;
