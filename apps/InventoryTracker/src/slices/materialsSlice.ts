import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Material, AccountMaterial } from "../types";

interface MaterialsState {
  items: Material[];
  currentMaterial: Material | null;
  accountMaterials: AccountMaterial[];
  loading: boolean;
  error: string | null;
}

const initialState: MaterialsState = {
  items: [],
  currentMaterial: null,
  accountMaterials: [],
  loading: false,
  error: null,
};

export const fetchMaterials = createAsyncThunk(
  "materials/fetchMaterials",
  async (params?: { category_id?: string; account_id?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category_id) query.set("category_id", params.category_id);
    if (params?.account_id) query.set("account_id", params.account_id);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    const res = await fetch(`/.netlify/functions/materials${qs ? `?${qs}` : ""}`);
    if (!res.ok) throw new Error("Failed to fetch materials");
    return (await res.json()) as Material[];
  }
);

export const fetchMaterialById = createAsyncThunk(
  "materials/fetchMaterialById",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/materials/${id}`);
    if (!res.ok) throw new Error("Failed to fetch material");
    return (await res.json()) as Material;
  }
);

export const createMaterial = createAsyncThunk(
  "materials/createMaterial",
  async (data: Partial<Material>) => {
    const res = await fetch("/.netlify/functions/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create material");
    return (await res.json()) as Material;
  }
);

export const updateMaterial = createAsyncThunk(
  "materials/updateMaterial",
  async (data: Partial<Material> & { id: string }) => {
    const res = await fetch(`/.netlify/functions/materials/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update material");
    return (await res.json()) as Material;
  }
);

export const fetchAccountMaterials = createAsyncThunk(
  "materials/fetchAccountMaterials",
  async (accountId: string) => {
    const res = await fetch(`/.netlify/functions/account-materials?account_id=${accountId}`);
    if (!res.ok) throw new Error("Failed to fetch account materials");
    return (await res.json()) as AccountMaterial[];
  }
);

const materialsSlice = createSlice({
  name: "materials",
  initialState,
  reducers: {
    clearCurrentMaterial(state) {
      state.currentMaterial = null;
    },
    clearAccountMaterials(state) {
      state.accountMaterials = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch materials";
      })
      .addCase(fetchMaterialById.pending, (state) => {
        if (!state.currentMaterial) state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterialById.fulfilled, (state, action) => {
        state.currentMaterial = action.payload;
        state.loading = false;
      })
      .addCase(fetchMaterialById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch material";
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentMaterial?.id === action.payload.id) {
          state.currentMaterial = action.payload;
        }
      })
      .addCase(fetchAccountMaterials.fulfilled, (state, action) => {
        state.accountMaterials = action.payload;
      });
  },
});

export const { clearCurrentMaterial, clearAccountMaterials } = materialsSlice.actions;
export const materialsReducer = materialsSlice.reducer;
