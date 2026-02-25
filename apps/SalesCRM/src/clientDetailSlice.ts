import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

// --- Types ---

export interface ClientDetail {
  id: string;
  name: string;
  type: string;
  status: string;
  tags: string[];
  sourceType: string | null;
  sourceDetail: string | null;
  campaign: string | null;
  channel: string | null;
  dateAcquired: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
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

export interface DealItem {
  id: string;
  name: string;
  clientId: string;
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

export interface AttachmentItem {
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

export interface PersonItem {
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

export interface TimelineEvent {
  id: string;
  clientId: string | null;
  eventType: string;
  description: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdBy: string;
  createdAt: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface ClientDetailState {
  client: ClientDetail | null;
  tasks: TaskItem[];
  deals: DealItem[];
  attachments: AttachmentItem[];
  people: PersonItem[];
  timeline: TimelineEvent[];
  users: UserItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientDetailState = {
  client: null,
  tasks: [],
  deals: [],
  attachments: [],
  people: [],
  timeline: [],
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

export const fetchClientDetail = createAsyncThunk(
  "clientDetail/fetchClient",
  async (clientId: string) => {
    const resp = await fetch(`/.netlify/functions/clients/${clientId}`);
    if (!resp.ok) throw new Error("Failed to fetch client");
    return resp.json() as Promise<ClientDetail>;
  }
);

export const updateClient = createAsyncThunk(
  "clientDetail/updateClient",
  async ({ clientId, data }: { clientId: string; data: Partial<ClientDetail> }) => {
    const resp = await fetch(`/.netlify/functions/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Failed to update client");
    return resp.json() as Promise<ClientDetail>;
  }
);

export const fetchTasks = createAsyncThunk(
  "clientDetail/fetchTasks",
  async (clientId: string) => {
    const resp = await fetch(`/.netlify/functions/tasks?clientId=${clientId}`);
    if (!resp.ok) throw new Error("Failed to fetch tasks");
    return resp.json() as Promise<TaskItem[]>;
  }
);

export const createTask = createAsyncThunk(
  "clientDetail/createTask",
  async (task: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: string;
    clientId: string;
    dealId?: string;
    assigneeId?: string;
  }) => {
    const resp = await fetch("/.netlify/functions/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(task),
    });
    if (!resp.ok) throw new Error("Failed to create task");
    return resp.json() as Promise<TaskItem>;
  }
);

export const completeTask = createAsyncThunk(
  "clientDetail/completeTask",
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

export const fetchDeals = createAsyncThunk(
  "clientDetail/fetchDeals",
  async (clientId: string) => {
    const resp = await fetch(`/.netlify/functions/deals?clientId=${clientId}`);
    if (!resp.ok) throw new Error("Failed to fetch deals");
    return resp.json() as Promise<DealItem[]>;
  }
);

export const createDeal = createAsyncThunk(
  "clientDetail/createDeal",
  async (deal: {
    name: string;
    clientId: string;
    value?: number;
    stage?: string;
    ownerId?: string;
    probability?: number;
    expectedCloseDate?: string;
  }) => {
    const resp = await fetch("/.netlify/functions/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(deal),
    });
    if (!resp.ok) throw new Error("Failed to create deal");
    return resp.json() as Promise<DealItem>;
  }
);

export const fetchAttachments = createAsyncThunk(
  "clientDetail/fetchAttachments",
  async (clientId: string) => {
    const resp = await fetch(`/.netlify/functions/attachments?clientId=${clientId}`);
    if (!resp.ok) throw new Error("Failed to fetch attachments");
    return resp.json() as Promise<AttachmentItem[]>;
  }
);

export const createAttachmentLink = createAsyncThunk(
  "clientDetail/createAttachmentLink",
  async (attachment: { filename: string; url: string; clientId: string; dealId?: string }) => {
    const resp = await fetch("/.netlify/functions/attachments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attachment),
    });
    if (!resp.ok) throw new Error("Failed to create attachment");
    return resp.json() as Promise<AttachmentItem>;
  }
);

export const uploadAttachmentFile = createAsyncThunk(
  "clientDetail/uploadAttachmentFile",
  async ({ file, clientId, dealId }: { file: File; clientId: string; dealId?: string }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", clientId);
    if (dealId) formData.append("dealId", dealId);

    const resp = await fetch("/.netlify/functions/attachments", {
      method: "POST",
      body: formData,
    });
    if (!resp.ok) throw new Error("Failed to upload attachment");
    return resp.json() as Promise<AttachmentItem>;
  }
);

export const deleteAttachment = createAsyncThunk(
  "clientDetail/deleteAttachment",
  async (attachmentId: string) => {
    const resp = await fetch(`/.netlify/functions/attachments/${attachmentId}`, {
      method: "DELETE",
    });
    if (!resp.ok) throw new Error("Failed to delete attachment");
    return attachmentId;
  }
);

export const fetchPeople = createAsyncThunk(
  "clientDetail/fetchPeople",
  async (clientId: string) => {
    const resp = await fetch(`/.netlify/functions/individuals?clientId=${clientId}`);
    if (!resp.ok) throw new Error("Failed to fetch people");
    return resp.json() as Promise<PersonItem[]>;
  }
);

export const createPerson = createAsyncThunk(
  "clientDetail/createPerson",
  async (person: {
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    role?: string;
    clientId: string;
  }) => {
    const resp = await fetch("/.netlify/functions/individuals", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(person),
    });
    if (!resp.ok) throw new Error("Failed to create person");
    return resp.json() as Promise<PersonItem>;
  }
);

export const fetchTimeline = createAsyncThunk(
  "clientDetail/fetchTimeline",
  async (clientId: string) => {
    const resp = await fetch(`/.netlify/functions/timeline?clientId=${clientId}`);
    if (!resp.ok) throw new Error("Failed to fetch timeline");
    return resp.json() as Promise<TimelineEvent[]>;
  }
);

export const fetchUsers = createAsyncThunk(
  "clientDetail/fetchUsers",
  async () => {
    const resp = await fetch("/.netlify/functions/users");
    if (!resp.ok) throw new Error("Failed to fetch users");
    return resp.json() as Promise<UserItem[]>;
  }
);

// --- Slice ---

const clientDetailSlice = createSlice({
  name: "clientDetail",
  initialState,
  reducers: {
    clearClientDetail(state) {
      state.client = null;
      state.tasks = [];
      state.deals = [];
      state.attachments = [];
      state.people = [];
      state.timeline = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Client
      .addCase(fetchClientDetail.pending, (state) => {
        if (!state.client) state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientDetail.fulfilled, (state, action: PayloadAction<ClientDetail>) => {
        state.loading = false;
        state.client = action.payload;
      })
      .addCase(fetchClientDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch client";
      })
      .addCase(updateClient.fulfilled, (state, action: PayloadAction<ClientDetail>) => {
        state.client = action.payload;
      })
      // Tasks
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<TaskItem[]>) => {
        state.tasks = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<TaskItem>) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(completeTask.fulfilled, (state, action: PayloadAction<string>) => {
        const task = state.tasks.find((t) => t.id === action.payload);
        if (task) task.status = "completed";
      })
      // Deals
      .addCase(fetchDeals.fulfilled, (state, action: PayloadAction<DealItem[]>) => {
        state.deals = action.payload;
      })
      .addCase(createDeal.fulfilled, (state, action: PayloadAction<DealItem>) => {
        state.deals.unshift(action.payload);
      })
      // Attachments
      .addCase(fetchAttachments.fulfilled, (state, action: PayloadAction<AttachmentItem[]>) => {
        state.attachments = action.payload;
      })
      .addCase(createAttachmentLink.fulfilled, (state, action: PayloadAction<AttachmentItem>) => {
        state.attachments.unshift(action.payload);
      })
      .addCase(uploadAttachmentFile.fulfilled, (state, action: PayloadAction<AttachmentItem>) => {
        state.attachments.unshift(action.payload);
      })
      .addCase(deleteAttachment.fulfilled, (state, action: PayloadAction<string>) => {
        state.attachments = state.attachments.filter((a) => a.id !== action.payload);
      })
      // People
      .addCase(fetchPeople.fulfilled, (state, action: PayloadAction<PersonItem[]>) => {
        state.people = action.payload;
      })
      .addCase(createPerson.fulfilled, (state, action: PayloadAction<PersonItem>) => {
        state.people.push(action.payload);
      })
      // Timeline
      .addCase(fetchTimeline.fulfilled, (state, action: PayloadAction<TimelineEvent[]>) => {
        state.timeline = action.payload;
      })
      // Users
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<UserItem[]>) => {
        state.users = action.payload;
      });
  },
});

export const { clearClientDetail } = clientDetailSlice.actions;
export const clientDetailReducer = clientDetailSlice.reducer;
