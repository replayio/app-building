import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

export interface TaskRow {
  id: string
  title: string
  description: string | null
  client_id: string | null
  deal_id: string | null
  assignee: string | null
  assignee_role: string | null
  priority: 'High' | 'Medium' | 'Low' | 'Normal'
  completed: boolean
  due_date: string | null
  client_name: string | null
  deal_name: string | null
  created_at: string
  updated_at: string
}

export interface ClientOption {
  id: string
  name: string
}

export interface DealOption {
  id: string
  name: string
  client_id: string
}

export interface AssigneeOption {
  name: string
  role: string | null
}

interface TasksState {
  items: TaskRow[]
  loading: boolean
  error: string | null
  filterType: string
  filterText: string
  clients: ClientOption[]
  deals: DealOption[]
  assignees: AssigneeOption[]
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
  filterType: 'all',
  filterText: '',
  clients: [],
  deals: [],
  assignees: [],
}

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async () => {
    const res = await fetch('/.netlify/functions/tasks')
    if (!res.ok) throw new Error('Failed to fetch tasks')
    return res.json()
  }
)

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (data: {
    title: string
    description?: string
    client_id?: string
    deal_id?: string
    assignee?: string
    assignee_role?: string
    priority?: string
    due_date?: string
  }) => {
    const res = await fetch('/.netlify/functions/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create task')
    return res.json()
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (data: {
    id: string
    title?: string
    description?: string
    client_id?: string
    deal_id?: string
    assignee?: string
    assignee_role?: string
    priority?: string
    due_date?: string
    completed?: boolean
  }) => {
    const { id, ...rest } = data
    const res = await fetch(`/.netlify/functions/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rest),
    })
    if (!res.ok) throw new Error('Failed to update task')
    return res.json()
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/tasks/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete task')
    return id
  }
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilterType(state, action: PayloadAction<string>) {
      state.filterType = action.payload
      state.filterText = ''
    },
    setFilterText(state, action: PayloadAction<string>) {
      state.filterText = action.payload
    },
  },
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
        state.clients = action.payload.clients
        state.deals = action.payload.deals
        state.assignees = action.payload.assignees
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch tasks'
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const updated = action.payload as TaskRow
        if (updated.completed) {
          state.items = state.items.filter(t => t.id !== updated.id)
        } else {
          const idx = state.items.findIndex(t => t.id === updated.id)
          if (idx !== -1) {
            state.items[idx] = updated
          }
        }
      })
  },
})

export const { setFilterType, setFilterText } = tasksSlice.actions
export default tasksSlice.reducer
