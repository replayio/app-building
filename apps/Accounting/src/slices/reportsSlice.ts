import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Report, ReportItem } from "../types";

interface ReportsState {
  items: Report[];
  currentReport: Report | null;
  currentReportItems: ReportItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  items: [],
  currentReport: null,
  currentReportItems: [],
  loading: false,
  error: null,
};

export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async () => {
    const res = await fetch("/.netlify/functions/reports");
    if (!res.ok) throw new Error("Failed to fetch reports");
    return (await res.json()) as Report[];
  }
);

export const fetchReportById = createAsyncThunk(
  "reports/fetchReportById",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/reports/${id}`);
    if (!res.ok) throw new Error("Failed to fetch report");
    return (await res.json()) as { report: Report; items: ReportItem[] };
  }
);

export const createReport = createAsyncThunk(
  "reports/createReport",
  async (data: {
    name: string;
    report_type: string;
    date_range_start: string;
    date_range_end: string;
    categories_filter: string | null;
    include_zero_balance: boolean;
  }) => {
    const res = await fetch("/.netlify/functions/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create report");
    return (await res.json()) as Report;
  }
);

export const deleteReport = createAsyncThunk(
  "reports/deleteReport",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/reports/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete report");
    return id;
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearCurrentReport(state) {
      state.currentReport = null;
      state.currentReportItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch reports";
      })
      .addCase(fetchReportById.pending, (state) => {
        if (!state.currentReport) state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.currentReport = action.payload.report;
        state.currentReportItems = action.payload.items;
        state.loading = false;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch report";
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      });
  },
});

export const { clearCurrentReport } = reportsSlice.actions;
export const reportsReducer = reportsSlice.reducer;
