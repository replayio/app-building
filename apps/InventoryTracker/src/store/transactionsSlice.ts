import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Transaction } from '../types';
import * as api from '../lib/api';

interface TransactionsState {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
  currentTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  total: 0,
  page: 1,
  totalPages: 0,
  currentTransaction: null,
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params?: {
    dateFrom?: string;
    dateTo?: string;
    accountIds?: string[];
    materialIds?: string[];
    type?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  }) => {
    return api.fetchTransactions(params);
  }
);

export const fetchTransaction = createAsyncThunk(
  'transactions/fetchTransaction',
  async (transactionId: string) => {
    return api.fetchTransaction(transactionId);
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (data: {
    date: string;
    referenceId: string;
    description: string;
    type: string;
    transfers: {
      sourceAccountId: string;
      destinationAccountId: string;
      amount: number;
      unit: string;
      sourceBatchId?: string;
    }[];
    batchAllocations: {
      materialId: string;
      quantity: number;
    }[];
  }) => {
    return api.createTransaction(data);
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearCurrentTransaction(state) {
      state.currentTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(fetchTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transaction';
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
        state.total += 1;
      });
  },
});

export const { clearCurrentTransaction } = transactionsSlice.actions;
export default transactionsSlice.reducer;
