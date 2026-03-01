import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface ActivityEntry {
  id: number
  app_id: string
  timestamp: string
  log_type: string
  message: string
  detail: string | null
  detail_label: string | null
  expandable: boolean
}

interface ActivityState {
  entries: ActivityEntry[]
  loading: boolean
  error: string | null
}

const initialState: ActivityState = {
  entries: [],
  loading: false,
  error: null,
}

export const fetchActivity = createAsyncThunk(
  'activity/fetchActivity',
  async (appId: string) => {
    const response = await fetch(`/.netlify/functions/activity/${appId}`)
    if (!response.ok) throw new Error('Failed to fetch activity')
    return response.json() as Promise<ActivityEntry[]>
  },
)

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearActivity() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivity.pending, (state) => {
        if (state.entries.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchActivity.fulfilled, (state, action) => {
        state.loading = false
        state.entries = action.payload
      })
      .addCase(fetchActivity.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch activity'
      })
  },
})

export const { clearActivity } = activitySlice.actions
export default activitySlice.reducer
