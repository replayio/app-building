import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export interface Deal {
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

export interface DealClient {
  id: string;
  name: string;
}

export interface DealUser {
  id: string;
  name: string;
  email: string;
}

interface DealsState {
  items: Deal[];
  clients: DealClient[];
  users: DealUser[];
  loading: boolean;
  error: string | null;
}

const initialState: DealsState = {
  items: [],
  clients: [],
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

export const fetchDeals = createAsyncThunk("deals/fetchDeals", async () => {
  const resp = await fetch("/.netlify/functions/deals");
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Failed to fetch deals");
  }
  return resp.json() as Promise<Deal[]>;
});

export const fetchDealClients = createAsyncThunk("deals/fetchClients", async () => {
  const resp = await fetch("/.netlify/functions/clients");
  if (!resp.ok) throw new Error("Failed to fetch clients");
  const data = await resp.json();
  return (data as { id: string; name: string }[]).map((c) => ({ id: c.id, name: c.name }));
});

export const fetchDealUsers = createAsyncThunk("deals/fetchUsers", async () => {
  const resp = await fetch("/.netlify/functions/users");
  if (!resp.ok) throw new Error("Failed to fetch users");
  return resp.json() as Promise<DealUser[]>;
});

export const createDeal = createAsyncThunk(
  "deals/createDeal",
  async (deal: {
    name: string;
    clientId: string;
    value?: number;
    stage?: string;
    ownerId?: string;
    probability?: number;
    expectedCloseDate?: string;
    status?: string;
  }) => {
    const resp = await fetch("/.netlify/functions/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(deal),
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Failed to create deal");
    }
    return resp.json() as Promise<Deal>;
  }
);

export const updateDeal = createAsyncThunk(
  "deals/updateDeal",
  async ({ dealId, data }: { dealId: string; data: Partial<Deal> }) => {
    const resp = await fetch(`/.netlify/functions/deals/${dealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      const d = await resp.json();
      throw new Error(d.error || "Failed to update deal");
    }
    return resp.json() as Promise<Deal>;
  }
);

export const deleteDeal = createAsyncThunk(
  "deals/deleteDeal",
  async (dealId: string) => {
    const resp = await fetch(`/.netlify/functions/deals/${dealId}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Failed to delete deal");
    }
    return dealId;
  }
);

export const importDeals = createAsyncThunk(
  "deals/importDeals",
  async (rows: Record<string, string>[]) => {
    const resp = await fetch("/.netlify/functions/deals/import", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ rows }),
    });
    const data = await resp.json();
    if (data.errors && data.errors.length > 0) {
      return { errors: data.errors as { row: number; errors: string[] }[] };
    }
    return { errors: undefined };
  }
);

const dealsSlice = createSlice({
  name: "deals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action: PayloadAction<Deal[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch deals";
      })
      .addCase(fetchDealClients.fulfilled, (state, action: PayloadAction<DealClient[]>) => {
        state.clients = action.payload;
      })
      .addCase(fetchDealUsers.fulfilled, (state, action: PayloadAction<DealUser[]>) => {
        state.users = action.payload;
      })
      .addCase(createDeal.fulfilled, (state, action: PayloadAction<Deal>) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateDeal.fulfilled, (state, action: PayloadAction<Deal>) => {
        const idx = state.items.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(deleteDeal.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((d) => d.id !== action.payload);
      });
  },
});

export const dealsReducer = dealsSlice.reducer;
