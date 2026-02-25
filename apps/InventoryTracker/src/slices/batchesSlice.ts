import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Batch, BatchLineage, BatchUsageEntry } from "../types";

interface BatchesState {
  items: Batch[];
  currentBatch: Batch | null;
  lineage: BatchLineage[];
  usageHistory: BatchUsageEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: BatchesState = {
  items: [],
  currentBatch: null,
  lineage: [],
  usageHistory: [],
  loading: false,
  error: null,
};

export const fetchBatches = createAsyncThunk(
  "batches/fetchBatches",
  async (params?: { material_id?: string; account_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.material_id) query.set("material_id", params.material_id);
    if (params?.account_id) query.set("account_id", params.account_id);
    const qs = query.toString();
    const res = await fetch(`/.netlify/functions/batches${qs ? `?${qs}` : ""}`);
    if (!res.ok) throw new Error("Failed to fetch batches");
    return (await res.json()) as Batch[];
  }
);

export const fetchBatchById = createAsyncThunk(
  "batches/fetchBatchById",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/batches/${id}`);
    if (!res.ok) throw new Error("Failed to fetch batch");
    return (await res.json()) as { batch: Batch; lineage: BatchLineage[] };
  }
);

export const fetchBatchUsageHistory = createAsyncThunk(
  "batches/fetchBatchUsageHistory",
  async (batchId: string) => {
    const res = await fetch(`/.netlify/functions/batch-usage/${batchId}`);
    if (!res.ok) throw new Error("Failed to fetch batch usage history");
    return (await res.json()) as BatchUsageEntry[];
  }
);

const batchesSlice = createSlice({
  name: "batches",
  initialState,
  reducers: {
    clearCurrentBatch(state) {
      state.currentBatch = null;
      state.lineage = [];
      state.usageHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatches.pending, (state) => {
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch batches";
      })
      .addCase(fetchBatchById.pending, (state) => {
        if (!state.currentBatch) state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchById.fulfilled, (state, action) => {
        state.currentBatch = action.payload.batch;
        state.lineage = action.payload.lineage;
        state.loading = false;
      })
      .addCase(fetchBatchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch batch";
      })
      .addCase(fetchBatchUsageHistory.fulfilled, (state, action) => {
        state.usageHistory = action.payload;
      });
  },
});

export const { clearCurrentBatch } = batchesSlice.actions;
export const batchesReducer = batchesSlice.reducer;
