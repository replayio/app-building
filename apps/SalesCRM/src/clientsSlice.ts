import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export interface ClientContact {
  name: string;
  role: string | null;
}

export interface ClientDeals {
  count: number;
  totalValue: number;
}

export interface ClientTask {
  title: string;
  dueDate: string | null;
}

export interface Client {
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
  primaryContact: ClientContact | null;
  openDeals: ClientDeals;
  nextTask: ClientTask | null;
}

interface ClientsState {
  items: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchClients = createAsyncThunk("clients/fetchClients", async () => {
  const resp = await fetch("/.netlify/functions/clients");
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Failed to fetch clients");
  }
  return resp.json() as Promise<Client[]>;
});

export const createClient = createAsyncThunk(
  "clients/createClient",
  async (client: {
    name: string;
    type: string;
    status: string;
    tags: string[];
    sourceType?: string;
    sourceDetail?: string;
    campaign?: string;
    channel?: string;
    dateAcquired?: string;
  }) => {
    const resp = await fetch("/.netlify/functions/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Failed to create client");
    }
    return resp.json() as Promise<Client>;
  }
);

export const deleteClient = createAsyncThunk(
  "clients/deleteClient",
  async (clientId: string) => {
    const resp = await fetch(`/.netlify/functions/clients/${clientId}`, {
      method: "DELETE",
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Failed to delete client");
    }
    return clientId;
  }
);

export const importClients = createAsyncThunk(
  "clients/importClients",
  async (rows: Record<string, string>[]) => {
    const resp = await fetch("/.netlify/functions/clients/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await resp.json();
    if (data.errors && data.errors.length > 0) {
      return { errors: data.errors as { row: number; errors: string[] }[] };
    }
    return { errors: undefined };
  }
);

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action: PayloadAction<Client[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch clients";
      })
      .addCase(createClient.fulfilled, (state, action: PayloadAction<Client>) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteClient.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export const clientsReducer = clientsSlice.reducer;
