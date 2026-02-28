import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface ContainerInfo {
  container_id: string
  name: string
  status: string
  prompt: string | null
  last_event_at: string
}

export interface WebhookEvent {
  id: number
  container_id: string
  event_type: string
  payload: Record<string, unknown>
  received_at: string
}

interface StatusState {
  containers: ContainerInfo[]
  webhookEvents: WebhookEvent[]
  defaultPrompt: string | null
  loading: boolean
  initialized: boolean
  error: string | null
}

const initialState: StatusState = {
  containers: [],
  webhookEvents: [],
  defaultPrompt: null,
  loading: false,
  initialized: false,
  error: null,
}

export const fetchStatus = createAsyncThunk('status/fetchStatus', async () => {
  const response = await fetch('/.netlify/functions/status')
  if (!response.ok) throw new Error('Failed to fetch status')
  return response.json() as Promise<{
    containers: ContainerInfo[]
    webhookEvents: WebhookEvent[]
    defaultPrompt: string | null
  }>
})

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatus.pending, (state) => {
        if (!state.initialized) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchStatus.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.containers = action.payload.containers
        state.webhookEvents = action.payload.webhookEvents
        state.defaultPrompt = action.payload.defaultPrompt
      })
      .addCase(fetchStatus.rejected, (state, action) => {
        state.loading = false
        state.initialized = true
        state.error = action.error.message || 'Failed to fetch status'
      })
  },
})

export default statusSlice.reducer
