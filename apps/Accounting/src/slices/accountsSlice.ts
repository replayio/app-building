import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Account } from "../types";

interface AccountsState {
  items: Account[];
  currentAccount: Account | null;
  loading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  items: [],
  currentAccount: null,
  loading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk(
  "accounts/fetchAccounts",
  async () => {
    const res = await fetch("/.netlify/functions/accounts");
    if (!res.ok) throw new Error("Failed to fetch accounts");
    return (await res.json()) as Account[];
  }
);

export const fetchAccountById = createAsyncThunk(
  "accounts/fetchAccountById",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/accounts/${id}`);
    if (!res.ok) throw new Error("Failed to fetch account");
    return (await res.json()) as Account;
  }
);

export const deleteAccount = createAsyncThunk(
  "accounts/deleteAccount",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/accounts/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete account");
    return id;
  }
);

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    clearCurrentAccount(state) {
      state.currentAccount = null;
    },
    setCurrentAccount(state, action: PayloadAction<Account>) {
      state.currentAccount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch accounts";
      })
      .addCase(fetchAccountById.pending, (state) => {
        if (!state.currentAccount) state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.currentAccount = action.payload;
        state.loading = false;
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch account";
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      });
  },
});

export const { clearCurrentAccount, setCurrentAccount } = accountsSlice.actions;
export const accountsReducer = accountsSlice.reducer;
