import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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

export const createAccount = createAsyncThunk(
  "accounts/createAccount",
  async (data: Partial<Account>) => {
    const res = await fetch("/.netlify/functions/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create account");
    return (await res.json()) as Account;
  }
);

export const updateAccount = createAsyncThunk(
  "accounts/updateAccount",
  async (data: Partial<Account> & { id: string }) => {
    const res = await fetch(`/.netlify/functions/accounts/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update account");
    return (await res.json()) as Account;
  }
);

export const archiveAccount = createAsyncThunk(
  "accounts/archiveAccount",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/accounts/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to archive account");
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
      .addCase(createAccount.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentAccount?.id === action.payload.id) {
          state.currentAccount = action.payload;
        }
      })
      .addCase(archiveAccount.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a.id === action.payload);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], status: "archived" };
      });
  },
});

export const { clearCurrentAccount } = accountsSlice.actions;
export const accountsReducer = accountsSlice.reducer;
