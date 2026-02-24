import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Account, AccountMaterial } from '../types';
import * as api from '../lib/api';

interface AccountsState {
  accounts: Account[];
  currentAccount: (Account & { materials?: AccountMaterial[] }) | null;
  accountMaterials: AccountMaterial[];
  loading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  currentAccount: null,
  accountMaterials: [],
  loading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk('accounts/fetchAccounts', async () => {
  return api.fetchAccounts();
});

export const fetchAccountDetail = createAsyncThunk(
  'accounts/fetchAccountDetail',
  async (accountId: string) => {
    const raw = await api.fetchAccountDetail(accountId);
    const materials = (raw.materials as Record<string, unknown>[]) || [];
    return {
      account: {
        id: raw.id as string,
        name: raw.name as string,
        type: raw.type as 'stock' | 'input' | 'output',
        description: (raw.description || '') as string,
        isDefault: raw.isDefault as boolean,
        status: (raw.status || 'active') as 'active' | 'archived',
        createdAt: (raw.createdAt || '') as string,
        updatedAt: (raw.createdAt || '') as string,
      } as Account,
      materials: materials.map((m) => ({
        materialId: m.materialId as string,
        materialName: m.materialName as string,
        categoryName: (m.categoryName || '') as string,
        unitOfMeasure: (m.unitOfMeasure || 'units') as string,
        totalQuantity: Number(m.totalQuantity || 0),
        numberOfBatches: Number(m.batchCount || 0),
      })) as AccountMaterial[],
    };
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (data: { name: string; type: string; description: string }) => {
    const raw = await api.createAccount(data);
    return {
      id: raw.id as string,
      name: raw.name as string,
      type: raw.type as 'stock' | 'input' | 'output',
      description: (raw.description || '') as string,
      isDefault: raw.isDefault as boolean,
      status: (raw.status || 'active') as 'active' | 'archived',
      createdAt: (raw.createdAt || '') as string,
      updatedAt: (raw.createdAt || '') as string,
    } as Account;
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ accountId, data }: { accountId: string; data: { name?: string; description?: string; status?: string } }) => {
    const raw = await api.updateAccount(accountId, data);
    return {
      id: raw.id as string,
      name: raw.name as string,
      type: raw.type as 'stock' | 'input' | 'output',
      description: (raw.description || '') as string,
      isDefault: raw.isDefault as boolean,
      status: (raw.status || 'active') as 'active' | 'archived',
      createdAt: (raw.createdAt || '') as string,
      updatedAt: (raw.createdAt || '') as string,
    } as Account;
  }
);

export const archiveAccount = createAsyncThunk(
  'accounts/archiveAccount',
  async (accountId: string) => {
    await api.archiveAccount(accountId);
    return accountId;
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearCurrentAccount(state) {
      state.currentAccount = null;
      state.accountMaterials = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch accounts';
      })
      .addCase(fetchAccountDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAccount = action.payload.account;
        state.accountMaterials = action.payload.materials;
      })
      .addCase(fetchAccountDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch account';
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const idx = state.accounts.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.accounts[idx] = action.payload;
        if (state.currentAccount?.id === action.payload.id) {
          state.currentAccount = action.payload;
        }
      })
      .addCase(archiveAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter((a) => a.id !== action.payload);
      });
  },
});

export const { clearCurrentAccount } = accountsSlice.actions;
export default accountsSlice.reducer;
