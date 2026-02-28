import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AppInfo, AppStatus } from '../types';

interface AppsState {
  items: AppInfo[];
  loading: boolean;
  error: string | null;
  filter: AppStatus;
}

const initialState: AppsState = {
  items: [],
  loading: false,
  error: null,
  filter: 'building',
};

export const fetchApps = createAsyncThunk(
  'apps/fetchApps',
  async (status: AppStatus) => {
    const res = await fetch(`/.netlify/functions/apps?status=${status}`);
    if (!res.ok) throw new Error('Failed to fetch apps');
    return (await res.json()) as AppInfo[];
  }
);

const appsSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    setFilter(state, action: { payload: AppStatus }) {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApps.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchApps.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchApps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch apps';
      });
  },
});

export const { setFilter } = appsSlice.actions;
export default appsSlice.reducer;
