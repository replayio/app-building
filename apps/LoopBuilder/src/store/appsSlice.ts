import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export type AppStatus = 'building' | 'finished' | 'queued'

export interface AppEntry {
  id: string
  name: string
  description: string
  status: AppStatus
  progress: number
  created_at: string
  model: string | null
  deployment_url: string | null
  source_url: string | null
}

interface AppsState {
  items: AppEntry[]
  loading: boolean
  error: string | null
  activeFilter: AppStatus
}

const initialState: AppsState = {
  items: [],
  loading: false,
  error: null,
  activeFilter: 'building',
}

export const fetchApps = createAsyncThunk('apps/fetchApps', async () => {
  const response = await fetch('/.netlify/functions/apps')
  if (!response.ok) throw new Error('Failed to fetch apps')
  return response.json() as Promise<AppEntry[]>
})

export const fetchAppById = createAsyncThunk('apps/fetchAppById', async (id: string) => {
  const response = await fetch(`/.netlify/functions/apps/${id}`)
  if (!response.ok) throw new Error('Failed to fetch app')
  return response.json() as Promise<AppEntry>
})

const appsSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    setActiveFilter(state, action: { payload: AppStatus }) {
      state.activeFilter = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApps.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchApps.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchApps.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch apps'
      })
      .addCase(fetchAppById.fulfilled, (state, action) => {
        const index = state.items.findIndex((a) => a.id === action.payload.id)
        if (index >= 0) {
          state.items[index] = action.payload
        } else {
          state.items.push(action.payload)
        }
      })
  },
})

export const { setActiveFilter } = appsSlice.actions
export default appsSlice.reducer
