import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Material, MaterialAccountDistribution, Batch, Transaction } from '../types';
import * as api from '../lib/api';

interface MaterialsState {
  materials: Material[];
  total: number;
  page: number;
  totalPages: number;
  currentMaterial: Material | null;
  distribution: MaterialAccountDistribution[];
  batches: Batch[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: MaterialsState = {
  materials: [],
  total: 0,
  page: 1,
  totalPages: 0,
  currentMaterial: null,
  distribution: [],
  batches: [],
  transactions: [],
  loading: false,
  error: null,
};

export const fetchMaterials = createAsyncThunk(
  'materials/fetchMaterials',
  async (params?: {
    search?: string;
    categoryId?: string;
    accountId?: string;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  }) => {
    return api.fetchMaterials(params);
  }
);

export const fetchMaterial = createAsyncThunk(
  'materials/fetchMaterial',
  async (materialId: string) => {
    return api.fetchMaterial(materialId);
  }
);

export const createMaterial = createAsyncThunk(
  'materials/createMaterial',
  async (data: { name: string; categoryId: string; unitOfMeasure: string; description?: string }) => {
    return api.createMaterial(data);
  }
);

export const updateMaterial = createAsyncThunk(
  'materials/updateMaterial',
  async ({
    materialId,
    data,
  }: {
    materialId: string;
    data: { name?: string; categoryId?: string; unitOfMeasure?: string; description?: string };
  }) => {
    return api.updateMaterial(materialId, data);
  }
);

export const fetchMaterialDistribution = createAsyncThunk(
  'materials/fetchDistribution',
  async (materialId: string) => {
    return api.fetchMaterialDistribution(materialId);
  }
);

export const fetchMaterialBatches = createAsyncThunk(
  'materials/fetchBatches',
  async ({ materialId, params }: { materialId: string; params?: { accountId?: string; dateFrom?: string; dateTo?: string } }) => {
    return api.fetchMaterialBatches(materialId, params);
  }
);

export const fetchMaterialTransactions = createAsyncThunk(
  'materials/fetchTransactions',
  async ({ materialId, params }: { materialId: string; params?: { type?: string; dateFrom?: string; dateTo?: string } }) => {
    return api.fetchMaterialTransactions(materialId, params);
  }
);

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    clearCurrentMaterial(state) {
      state.currentMaterial = null;
      state.distribution = [];
      state.batches = [];
      state.transactions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch materials';
      })
      .addCase(fetchMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMaterial = action.payload;
      })
      .addCase(fetchMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch material';
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.materials.push(action.payload);
        state.total += 1;
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        const idx = state.materials.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.materials[idx] = action.payload;
        if (state.currentMaterial?.id === action.payload.id) {
          state.currentMaterial = action.payload;
        }
      })
      .addCase(fetchMaterialDistribution.fulfilled, (state, action) => {
        state.distribution = action.payload;
      })
      .addCase(fetchMaterialBatches.fulfilled, (state, action) => {
        state.batches = action.payload;
      })
      .addCase(fetchMaterialTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      });
  },
});

export const { clearCurrentMaterial } = materialsSlice.actions;
export default materialsSlice.reducer;
