import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AppInfo, ActivityLogEntry } from '../types';

interface AppDetailState {
  app: AppInfo | null;
  logs: ActivityLogEntry[];
  loadingApp: boolean;
  loadingLogs: boolean;
  error: string | null;
}

const initialState: AppDetailState = {
  app: null,
  logs: [],
  loadingApp: false,
  loadingLogs: false,
  error: null,
};

export const fetchAppDetail = createAsyncThunk(
  'appDetail/fetchApp',
  async (appId: string) => {
    const res = await fetch(`/.netlify/functions/apps/${appId}`);
    if (!res.ok) throw new Error('Failed to fetch app');
    return (await res.json()) as AppInfo;
  }
);

export const fetchActivityLog = createAsyncThunk(
  'appDetail/fetchLog',
  async (appId: string) => {
    const res = await fetch(`/.netlify/functions/activity-log?appId=${appId}`);
    if (!res.ok) throw new Error('Failed to fetch activity log');
    return (await res.json()) as ActivityLogEntry[];
  }
);

const appDetailSlice = createSlice({
  name: 'appDetail',
  initialState,
  reducers: {
    clearAppDetail(state) {
      state.app = null;
      state.logs = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppDetail.pending, (state) => {
        if (!state.app) state.loadingApp = true;
        state.error = null;
      })
      .addCase(fetchAppDetail.fulfilled, (state, action) => {
        state.loadingApp = false;
        state.app = action.payload;
      })
      .addCase(fetchAppDetail.rejected, (state, action) => {
        state.loadingApp = false;
        state.error = action.error.message || 'Failed to load app';
      })
      .addCase(fetchActivityLog.pending, (state) => {
        if (state.logs.length === 0) state.loadingLogs = true;
      })
      .addCase(fetchActivityLog.fulfilled, (state, action) => {
        state.loadingLogs = false;
        state.logs = action.payload;
      })
      .addCase(fetchActivityLog.rejected, (state, action) => {
        state.loadingLogs = false;
        state.error = action.error.message || 'Failed to load activity log';
      });
  },
});

export const { clearAppDetail } = appDetailSlice.actions;
export default appDetailSlice.reducer;
