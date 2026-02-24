import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { LowInventoryAlert, DashboardCategoryOverview, Transaction } from '../types';
import * as api from '../lib/api';

interface DashboardState {
  alerts: LowInventoryAlert[];
  categories: DashboardCategoryOverview[];
  recentTransactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  alerts: [],
  categories: [],
  recentTransactions: [],
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (params?: { dateFrom?: string; dateTo?: string; categoryId?: string }) => {
    return api.fetchDashboardData(params);
  }
);

export const dismissAlert = createAsyncThunk(
  'dashboard/dismissAlert',
  async (alertId: string) => {
    await api.dismissAlert(alertId);
    return alertId;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload.alerts;
        state.categories = action.payload.categories;
        state.recentTransactions = action.payload.recentTransactions;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      })
      .addCase(dismissAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.filter((a) => a.id !== action.payload);
      });
  },
});

export default dashboardSlice.reducer;
