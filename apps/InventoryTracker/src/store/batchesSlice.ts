import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Batch, Transaction } from '../types';
import * as api from '../lib/api';

interface BatchLineage {
  sourceTransaction: Transaction | null;
  inputBatches: Batch[];
  outputBatch: Batch;
}

interface UsageHistoryEntry {
  date: string;
  transactionId: string;
  type: string;
  movement: 'in' | 'out';
  amount: number;
  unit: string;
  createdBatches: { id: string; materialName: string }[];
}

interface BatchesState {
  currentBatch: Batch | null;
  lineage: BatchLineage | null;
  usageHistory: UsageHistoryEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: BatchesState = {
  currentBatch: null,
  lineage: null,
  usageHistory: [],
  loading: false,
  error: null,
};

export const fetchBatch = createAsyncThunk('batches/fetchBatch', async (batchId: string) => {
  return api.fetchBatch(batchId);
});

export const fetchBatchLineage = createAsyncThunk(
  'batches/fetchLineage',
  async (batchId: string) => {
    return api.fetchBatchLineage(batchId);
  }
);

export const fetchBatchUsageHistory = createAsyncThunk(
  'batches/fetchUsageHistory',
  async (batchId: string) => {
    return api.fetchBatchUsageHistory(batchId);
  }
);

export const createBatch = createAsyncThunk(
  'batches/createBatch',
  async (data: {
    materialId: string;
    accountId: string;
    quantity: number;
    lotNumber?: string;
    expirationDate?: string;
  }) => {
    return api.createBatch(data);
  }
);

const batchesSlice = createSlice({
  name: 'batches',
  initialState,
  reducers: {
    clearCurrentBatch(state) {
      state.currentBatch = null;
      state.lineage = null;
      state.usageHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBatch = action.payload;
      })
      .addCase(fetchBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch batch';
      })
      .addCase(fetchBatchLineage.fulfilled, (state, action) => {
        state.lineage = action.payload;
      })
      .addCase(fetchBatchUsageHistory.fulfilled, (state, action) => {
        state.usageHistory = action.payload;
      });
  },
});

export const { clearCurrentBatch } = batchesSlice.actions;
export default batchesSlice.reducer;
