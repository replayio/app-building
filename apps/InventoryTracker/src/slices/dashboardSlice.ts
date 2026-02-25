import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { LowInventoryAlert, CategoryOverview, Transaction } from "../types";

interface DashboardState {
  alerts: LowInventoryAlert[];
  categoryOverviews: CategoryOverview[];
  recentTransactions: Transaction[];
  loading: boolean;
  error: string | null;
  dismissedMaterialIds: string[];
}

const initialState: DashboardState = {
  alerts: [],
  categoryOverviews: [],
  recentTransactions: [],
  loading: false,
  error: null,
  dismissedMaterialIds: [],
};

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (params?: { date_from?: string; date_to?: string; category_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    if (params?.category_id) query.set("category_id", params.category_id);
    const qs = query.toString();
    const res = await fetch(`/.netlify/functions/dashboard${qs ? `?${qs}` : ""}`);
    if (!res.ok) throw new Error("Failed to fetch dashboard data");
    return (await res.json()) as {
      alerts: LowInventoryAlert[];
      categoryOverviews: CategoryOverview[];
      recentTransactions: Transaction[];
    };
  }
);

export const dismissAlert = createAsyncThunk(
  "dashboard/dismissAlert",
  async (materialId: string) => {
    const res = await fetch("/.netlify/functions/dismiss-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ material_id: materialId }),
    });
    if (!res.ok) throw new Error("Failed to dismiss alert");
    return materialId;
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        if (state.categoryOverviews.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.alerts = action.payload.alerts.filter(
          (a) => !state.dismissedMaterialIds.includes(a.material_id)
        );
        state.categoryOverviews = action.payload.categoryOverviews;
        state.recentTransactions = action.payload.recentTransactions;
        state.loading = false;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch dashboard data";
      })
      .addCase(dismissAlert.fulfilled, (state, action) => {
        state.dismissedMaterialIds.push(action.payload);
        state.alerts = state.alerts.filter((a) => a.material_id !== action.payload);
      });
  },
});

export const dashboardReducer = dashboardSlice.reducer;
