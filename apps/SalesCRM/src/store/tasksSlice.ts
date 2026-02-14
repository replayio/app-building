import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Task, TaskPriority } from '../types'

interface TasksState {
  items: Task[]
  loading: boolean
  error: string | null
  total: number
  availableAssignees: { assignee_name: string; assignee_role: string | null }[]
  availableClients: { id: string; name: string }[]
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
  availableAssignees: [],
  availableClients: [],
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
    return res.json() as Promise<{
      tasks: Task[]
      total: number
      assignees: { assignee_name: string; assignee_role: string | null }[]
      clients: { id: string; name: string }[]
    }>
  }
)

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (data: {
    title: string
    description?: string
    due_date?: string
    priority?: TaskPriority
    assignee_name?: string
    assignee_role?: string
    client_id?: string
    deal_id?: string
  }) => {
    const res = await fetch('/.netlify/functions/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create task')
    return res.json() as Promise<Task>
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, data }: {
    taskId: string
    data: {
      completed?: boolean
      title?: string
      description?: string
      due_date?: string
      priority?: TaskPriority
      assignee_name?: string
      assignee_role?: string
    }
  }) => {
    const res = await fetch(`/.netlify/functions/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update task')
    return res.json() as Promise<Task>
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => {
    const res = await fetch(`/.netlify/functions/tasks/${taskId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete task')
    return taskId
  }
)

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.tasks
        state.total = action.payload.total
        state.availableAssignees = action.payload.assignees
        state.availableClients = action.payload.clients
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Unknown error'
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id)
        if (action.payload.completed) {
          state.items = state.items.filter((t) => t.id !== action.payload.id)
          state.total = Math.max(0, state.total - 1)
        } else if (idx !== -1) {
          state.items[idx] = action.payload
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload)
        state.total = Math.max(0, state.total - 1)
      })
  },
})
