import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface Task {
  id: string
  title: string
  description: string | null
  due_date: string | null
  priority: 'high' | 'medium' | 'normal' | 'low'
  status: 'open' | 'completed' | 'cancelled'
  client_id: string | null
  client_name: string | null
  deal_id: string | null
  deal_name: string | null
  assignee: string | null
  assignee_id: string | null
  assignee_avatar: string | null
  assignee_role: string | null
  created_at: string
  updated_at: string
}

interface TasksState {
  items: Task[]
  current: Task | null
  loading: boolean
  error: string | null
  search: string
  filterPriority: string
  filterStatus: string
  sortBy: string
  sortDir: 'asc' | 'desc'
  page: number
  total: number
}

const initialState: TasksState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  search: '',
  filterPriority: '',
  filterStatus: 'open',
  sortBy: 'due_date',
  sortDir: 'asc',
  page: 1,
  total: 0,
}

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as { tasks: TasksState }).tasks
      const params = new URLSearchParams()
      if (state.search) params.set('search', state.search)
      if (state.filterPriority) params.set('priority', state.filterPriority)
      if (state.filterStatus) params.set('status', state.filterStatus)
      params.set('sortBy', state.sortBy)
      params.set('sortDir', state.sortDir)
      params.set('page', String(state.page))
      const res = await fetch(`/.netlify/functions/tasks?${params}`)
      if (!res.ok) return rejectWithValue('Failed to fetch tasks')
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/.netlify/functions/tasks/${id}`)
      if (!res.ok) return rejectWithValue('Failed to fetch task')
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload
      state.page = 1
    },
    setFilterPriority(state, action) {
      state.filterPriority = action.payload
      state.page = 1
    },
    setFilterStatus(state, action) {
      state.filterStatus = action.payload
      state.page = 1
    },
    setSortBy(state, action) {
      if (state.sortBy === action.payload) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        state.sortBy = action.payload
        state.sortDir = 'asc'
      }
    },
    setPage(state, action) {
      state.page = action.payload
    },
    clearCurrent(state) {
      state.current = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        if (state.items.length === 0) state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.tasks
        state.total = action.payload.total
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchTask.pending, (state) => {
        if (!state.current) state.loading = true
        state.error = null
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading = false
        state.current = action.payload
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setSearch, setFilterPriority, setFilterStatus, setSortBy, setPage, clearCurrent } = tasksSlice.actions
export default tasksSlice.reducer
