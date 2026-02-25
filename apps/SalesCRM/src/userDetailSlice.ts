import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export interface UserDetail {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  activeDeals: number;
  totalDeals: number;
  openTasks: number;
}

export interface UserDeal {
  id: string;
  name: string;
  clientId: string;
  clientName: string | null;
  value: number | null;
  stage: string;
  status: string;
  createdAt: string;
}

export interface UserTask {
  id: string;
  title: string;
  dueDate: string | null;
  priority: string;
  status: string;
  clientId: string | null;
  clientName: string | null;
  createdAt: string;
}

export interface UserActivity {
  id: string;
  eventType: string;
  description: string;
  createdAt: string;
}

interface UserDetailResponse extends UserDetail {
  deals: UserDeal[];
  tasks: UserTask[];
  activity: UserActivity[];
}

interface UserDetailState {
  user: UserDetail | null;
  deals: UserDeal[];
  tasks: UserTask[];
  activity: UserActivity[];
  loading: boolean;
  error: string | null;
}

const initialState: UserDetailState = {
  user: null,
  deals: [],
  tasks: [],
  activity: [],
  loading: false,
  error: null,
};

export const fetchUserDetail = createAsyncThunk(
  "userDetail/fetchUserDetail",
  async (userId: string) => {
    const resp = await fetch(`/.netlify/functions/users/${userId}`);
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Failed to fetch user");
    }
    return resp.json() as Promise<UserDetailResponse>;
  }
);

const userDetailSlice = createSlice({
  name: "userDetail",
  initialState,
  reducers: {
    clearUserDetail(state) {
      state.user = null;
      state.deals = [];
      state.tasks = [];
      state.activity = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetail.pending, (state) => {
        if (!state.user) state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetail.fulfilled, (state, action: PayloadAction<UserDetailResponse>) => {
        state.loading = false;
        const { deals, tasks, activity, ...user } = action.payload;
        state.user = user;
        state.deals = deals;
        state.tasks = tasks;
        state.activity = activity;
      })
      .addCase(fetchUserDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch user";
      });
  },
});

export const { clearUserDetail } = userDetailSlice.actions;
export const userDetailReducer = userDetailSlice.reducer;
