import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { MaterialCategory } from "../types";

interface CategoriesState {
  items: MaterialCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const res = await fetch("/.netlify/functions/categories");
    if (!res.ok) throw new Error("Failed to fetch categories");
    return (await res.json()) as MaterialCategory[];
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (data: { name: string; description: string }) => {
    const res = await fetch("/.netlify/functions/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return (await res.json()) as MaterialCategory;
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch categories";
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export const categoriesReducer = categoriesSlice.reducer;
