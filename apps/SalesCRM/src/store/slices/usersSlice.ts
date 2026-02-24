import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  active_deals_count: number
  open_tasks_count: number
  created_at: string
}

export interface UserDeal {
  id: string
  name: string
  value: number | null
  stage: string
  status: string
  expected_close_date: string | null
  client_name: string | null
}

export interface UserTask {
  id: string
  title: string
  priority: string
  status: string
  due_date: string | null
  client_name: string | null
}

export interface UserActivity {
  id: string
  event_type: string
  description: string
  created_at: string
  client_name: string | null
}

export interface UserDetail extends User {
  role: string | null
  total_deals_count: number
  deals: UserDeal[]
  tasks: UserTask[]
  activity: UserActivity[]
}

interface UsersState {
  items: User[]
  current: UserDetail | null
  loading: boolean
  error: string | null
}

const initialState: UsersState = {
  items: [],
  current: null,
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/.netlify/functions/users')
      if (!res.ok) return rejectWithValue('Failed to fetch users')
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/.netlify/functions/users/${id}`)
      if (!res.ok) return rejectWithValue('Failed to fetch user')
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        if (state.items.length === 0) state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.users
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchUser.pending, (state) => {
        if (!state.current) state.loading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false
        state.current = action.payload
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCurrent } = usersSlice.actions
export default usersSlice.reducer
