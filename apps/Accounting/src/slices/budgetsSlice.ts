import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Budget } from "../types";

interface BudgetsState {
  items: Budget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchBudgets = createAsyncThunk(
  "budgets/fetchBudgets",
  async (accountId?: string) => {
    const url = accountId
      ? `/.netlify/functions/budgets?accountId=${accountId}`
      : "/.netlify/functions/budgets";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch budgets");
    return (await res.json()) as Budget[];
  }
);

export const createBudget = createAsyncThunk(
  "budgets/createBudget",
  async (data: {
    account_id: string;
    name: string;
    amount: number;
    period: string;
  }) => {
    const res = await fetch("/.netlify/functions/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create budget");
    return (await res.json()) as Budget;
  }
);

export const updateBudget = createAsyncThunk(
  "budgets/updateBudget",
  async (data: { id: string; name: string; amount: number; period: string }) => {
    const res = await fetch(`/.netlify/functions/budgets/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update budget");
    return (await res.json()) as Budget;
  }
);

export const deleteBudget = createAsyncThunk(
  "budgets/deleteBudget",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/budgets/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete budget");
    return id;
  }
);

const budgetsSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {
    clearBudgets(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch budgets";
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      });
  },
});

export const { clearBudgets } = budgetsSlice.actions;
export const budgetsReducer = budgetsSlice.reducer;
