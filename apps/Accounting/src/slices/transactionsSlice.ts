import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Transaction } from "../types";

interface TransactionsState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (accountId?: string) => {
    const url = accountId
      ? `/.netlify/functions/transactions?accountId=${accountId}`
      : "/.netlify/functions/transactions";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch transactions");
    return (await res.json()) as Transaction[];
  }
);

export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async (data: {
    date: string;
    description: string;
    currency: string;
    entries: Array<{ account_id: string; entry_type: string; amount: number }>;
    tags: string[];
  }) => {
    const res = await fetch("/.netlify/functions/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create transaction");
    return (await res.json()) as Transaction;
  }
);

export const deleteTransaction = createAsyncThunk(
  "transactions/deleteTransaction",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/transactions/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete transaction");
    return id;
  }
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearTransactions(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch transactions";
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearTransactions } = transactionsSlice.actions;
export const transactionsReducer = transactionsSlice.reducer;
