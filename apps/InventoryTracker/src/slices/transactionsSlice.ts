import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Transaction } from "../types";

interface TransactionsState {
  items: Transaction[];
  currentTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  items: [],
  currentTransaction: null,
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (params?: {
    account_id?: string;
    material_id?: string;
    transaction_type?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.account_id) query.set("account_id", params.account_id);
    if (params?.material_id) query.set("material_id", params.material_id);
    if (params?.transaction_type) query.set("transaction_type", params.transaction_type);
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    const res = await fetch(`/.netlify/functions/transactions${qs ? `?${qs}` : ""}`);
    if (!res.ok) throw new Error("Failed to fetch transactions");
    return (await res.json()) as Transaction[];
  }
);

export const fetchTransactionById = createAsyncThunk(
  "transactions/fetchTransactionById",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/transactions/${id}`);
    if (!res.ok) throw new Error("Failed to fetch transaction");
    return (await res.json()) as Transaction;
  }
);

export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async (data: {
    date: string;
    reference_id: string;
    description: string;
    transaction_type: string;
    transfers: {
      source_account_id: string;
      destination_account_id: string;
      material_id: string;
      amount: number;
      unit: string;
      source_batch_id?: string;
    }[];
    batches_created: {
      material_id: string;
      quantity: number;
      unit: string;
    }[];
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
    clearCurrentTransaction(state) {
      state.currentTransaction = null;
    },
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
      .addCase(fetchTransactionById.pending, (state) => {
        if (!state.currentTransaction) state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.currentTransaction = action.payload;
        state.loading = false;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch transaction";
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearCurrentTransaction, clearTransactions } = transactionsSlice.actions;
export const transactionsReducer = transactionsSlice.reducer;
