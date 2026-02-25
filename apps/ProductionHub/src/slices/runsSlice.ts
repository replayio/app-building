import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { ProductionRun, RunDetail } from "../types";

interface RunsState {
  items: ProductionRun[];
  currentRun: RunDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: RunsState = {
  items: [],
  currentRun: null,
  loading: false,
  error: null,
};

export const fetchRuns = createAsyncThunk("runs/fetchRuns", async () => {
  const res = await fetch("/.netlify/functions/runs");
  if (!res.ok) throw new Error("Failed to fetch runs");
  return (await res.json()) as ProductionRun[];
});

export const fetchRunById = createAsyncThunk(
  "runs/fetchRunById",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/runs/${id}`);
    if (!res.ok) throw new Error("Failed to fetch run");
    return (await res.json()) as RunDetail;
  }
);

export const createRun = createAsyncThunk(
  "runs/createRun",
  async (data: {
    recipe_id: string;
    start_date: string;
    end_date: string;
    planned_quantity: number;
    unit: string;
    notes: string;
  }) => {
    const res = await fetch("/.netlify/functions/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create run");
    return (await res.json()) as ProductionRun;
  }
);

export const updateRun = createAsyncThunk(
  "runs/updateRun",
  async (data: Partial<ProductionRun> & { id: string }) => {
    const res = await fetch(`/.netlify/functions/runs/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update run");
    return (await res.json()) as RunDetail;
  }
);

const runsSlice = createSlice({
  name: "runs",
  initialState,
  reducers: {
    clearCurrentRun(state) {
      state.currentRun = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRuns.pending, (state) => {
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchRuns.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchRuns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch runs";
      })
      .addCase(fetchRunById.pending, (state) => {
        if (!state.currentRun) state.loading = true;
        state.error = null;
      })
      .addCase(fetchRunById.fulfilled, (state, action) => {
        state.currentRun = action.payload;
        state.loading = false;
      })
      .addCase(fetchRunById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch run";
      })
      .addCase(createRun.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateRun.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentRun?.id === action.payload.id) {
          state.currentRun = action.payload;
        }
      });
  },
});

export const { clearCurrentRun } = runsSlice.actions;
export const runsReducer = runsSlice.reducer;
