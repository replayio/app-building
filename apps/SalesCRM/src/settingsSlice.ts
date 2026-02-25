import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface NotificationPreferences {
  clientUpdated: boolean;
  dealCreated: boolean;
  dealStageChanged: boolean;
  taskCreated: boolean;
  taskCompleted: boolean;
  contactAdded: boolean;
  noteAdded: boolean;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  platform: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SettingsState {
  preferences: NotificationPreferences;
  preferencesLoading: boolean;
  webhooks: Webhook[];
  webhooksLoading: boolean;
}

const defaultPreferences: NotificationPreferences = {
  clientUpdated: true,
  dealCreated: true,
  dealStageChanged: true,
  taskCreated: true,
  taskCompleted: true,
  contactAdded: true,
  noteAdded: true,
};

const initialState: SettingsState = {
  preferences: defaultPreferences,
  preferencesLoading: false,
  webhooks: [],
  webhooksLoading: false,
};

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem("auth_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export const fetchPreferences = createAsyncThunk(
  "settings/fetchPreferences",
  async () => {
    const resp = await fetch("/.netlify/functions/notification-preferences", {
      headers: getAuthHeaders(),
    });
    if (!resp.ok) throw new Error("Failed to fetch preferences");
    return resp.json() as Promise<NotificationPreferences>;
  }
);

export const updatePreferences = createAsyncThunk(
  "settings/updatePreferences",
  async (prefs: NotificationPreferences) => {
    const resp = await fetch("/.netlify/functions/notification-preferences", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(prefs),
    });
    if (!resp.ok) throw new Error("Failed to update preferences");
    return resp.json() as Promise<NotificationPreferences>;
  }
);

export const fetchWebhooks = createAsyncThunk(
  "settings/fetchWebhooks",
  async () => {
    const resp = await fetch("/.netlify/functions/webhooks", {
      headers: getAuthHeaders(),
    });
    if (!resp.ok) throw new Error("Failed to fetch webhooks");
    return resp.json() as Promise<Webhook[]>;
  }
);

export const createWebhook = createAsyncThunk(
  "settings/createWebhook",
  async (data: { name: string; url: string; events: string[]; platform: string }) => {
    const resp = await fetch("/.netlify/functions/webhooks", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Failed to create webhook");
    return resp.json() as Promise<Webhook>;
  }
);

export const updateWebhook = createAsyncThunk(
  "settings/updateWebhook",
  async (data: { id: string; name?: string; url?: string; events?: string[]; platform?: string; enabled?: boolean }) => {
    const { id, ...rest } = data;
    const resp = await fetch(`/.netlify/functions/webhooks/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(rest),
    });
    if (!resp.ok) throw new Error("Failed to update webhook");
    return resp.json() as Promise<Webhook>;
  }
);

export const deleteWebhook = createAsyncThunk(
  "settings/deleteWebhook",
  async (id: string) => {
    const resp = await fetch(`/.netlify/functions/webhooks/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!resp.ok) throw new Error("Failed to delete webhook");
    return id;
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferences.pending, (state) => {
        state.preferencesLoading = true;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
        state.preferencesLoading = false;
      })
      .addCase(fetchPreferences.rejected, (state) => {
        state.preferencesLoading = false;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      .addCase(fetchWebhooks.pending, (state) => {
        if (state.webhooks.length === 0) {
          state.webhooksLoading = true;
        }
      })
      .addCase(fetchWebhooks.fulfilled, (state, action) => {
        state.webhooks = action.payload;
        state.webhooksLoading = false;
      })
      .addCase(fetchWebhooks.rejected, (state) => {
        state.webhooksLoading = false;
      })
      .addCase(createWebhook.fulfilled, (state, action) => {
        state.webhooks.unshift(action.payload);
      })
      .addCase(updateWebhook.fulfilled, (state, action) => {
        const idx = state.webhooks.findIndex((w) => w.id === action.payload.id);
        if (idx !== -1) state.webhooks[idx] = action.payload;
      })
      .addCase(deleteWebhook.fulfilled, (state, action) => {
        state.webhooks = state.webhooks.filter((w) => w.id !== action.payload);
      });
  },
});

export const settingsReducer = settingsSlice.reducer;
