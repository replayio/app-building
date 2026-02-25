import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Recipe,
  RecipeMaterial,
  RecipeProduct,
  RecipeEquipment,
} from "../types";

interface RecipeDetail extends Recipe {
  materials: RecipeMaterial[];
  products: RecipeProduct[];
  equipment: RecipeEquipment[];
}

interface RecipesState {
  items: Recipe[];
  currentRecipe: RecipeDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: RecipesState = {
  items: [],
  currentRecipe: null,
  loading: false,
  error: null,
};

export const fetchRecipes = createAsyncThunk(
  "recipes/fetchRecipes",
  async () => {
    const res = await fetch("/.netlify/functions/recipes");
    if (!res.ok) throw new Error("Failed to fetch recipes");
    return (await res.json()) as Recipe[];
  }
);

export const fetchRecipeById = createAsyncThunk(
  "recipes/fetchRecipeById",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/recipes/${id}`);
    if (!res.ok) throw new Error("Failed to fetch recipe");
    return (await res.json()) as RecipeDetail;
  }
);

export const createRecipe = createAsyncThunk(
  "recipes/createRecipe",
  async (data: Partial<Recipe>) => {
    const res = await fetch("/.netlify/functions/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create recipe");
    return (await res.json()) as Recipe;
  }
);

export const updateRecipe = createAsyncThunk(
  "recipes/updateRecipe",
  async (
    data: Partial<Recipe> & {
      id: string;
      materials?: RecipeMaterial[];
      products?: RecipeProduct[];
      equipment?: RecipeEquipment[];
    }
  ) => {
    const res = await fetch(`/.netlify/functions/recipes/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update recipe");
    return (await res.json()) as RecipeDetail;
  }
);

export const deleteRecipe = createAsyncThunk(
  "recipes/deleteRecipe",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/recipes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete recipe");
    return id;
  }
);

const recipesSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    clearCurrentRecipe(state) {
      state.currentRecipe = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch recipes";
      })
      .addCase(fetchRecipeById.pending, (state) => {
        if (!state.currentRecipe) state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.currentRecipe = action.payload;
        state.loading = false;
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch recipe";
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentRecipe?.id === action.payload.id) {
          state.currentRecipe = action.payload;
        }
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      });
  },
});

export const { clearCurrentRecipe } = recipesSlice.actions;
export const recipesReducer = recipesSlice.reducer;
