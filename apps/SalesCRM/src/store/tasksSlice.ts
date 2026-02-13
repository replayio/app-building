import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Task } from '../types'

interface TasksState {
  items: Task[]
  loading: boolean
  error: string | null
  total: number
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
}

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: { search?: string; priority?: string; assignee?: string; clientId?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.priority) query.set('priority', params.priority)
    if (params.assignee) query.set('assignee', params.assignee)
    if (params.clientId) query.set('clientId', params.clientId)
    const res = await fetch(`/.netlify/functions/tasks?${query}`)
    if (!res.ok) throw new Error('Failed to fetch tasks')
    return res.json() as Promise<{ tasks: Task[]; total: number }>
  }
)

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.tasks
        state.total = action.payload.total
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Unknown error'
      })
  },
})
