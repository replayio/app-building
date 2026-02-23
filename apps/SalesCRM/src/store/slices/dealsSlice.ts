import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface Deal {
  id: string
  name: string
  client_id: string
  client_name: string
  value: number | null
  stage: string
  status: string
  owner: string | null
  owner_id: string | null
  probability: number | null
  expected_close_date: string | null
  created_at: string
  updated_at: string
}

interface DealsState {
  items: Deal[]
  current: Deal | null
  loading: boolean
  error: string | null
  search: string
  filterStage: string
  filterClient: string
  filterStatus: string
  sortBy: string
  sortDir: 'asc' | 'desc'
  viewMode: 'table' | 'pipeline'
  page: number
  total: number
}

const initialState: DealsState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  search: '',
  filterStage: '',
  filterClient: '',
  filterStatus: '',
  sortBy: 'created_at',
  sortDir: 'desc',
  viewMode: 'table',
  page: 1,
  total: 0,
}

export const fetchDeals = createAsyncThunk(
  'deals/fetchDeals',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as { deals: DealsState }).deals
      const params = new URLSearchParams()
      if (state.search) params.set('search', state.search)
      if (state.filterStage) params.set('stage', state.filterStage)
      if (state.filterClient) params.set('client', state.filterClient)
      if (state.filterStatus) params.set('status', state.filterStatus)
      params.set('sortBy', state.sortBy)
      params.set('sortDir', state.sortDir)
      params.set('page', String(state.page))
      const res = await fetch(`/.netlify/functions/deals?${params}`)
      if (!res.ok) return rejectWithValue('Failed to fetch deals')
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

export const fetchDeal = createAsyncThunk(
  'deals/fetchDeal',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/.netlify/functions/deals/${id}`)
      if (!res.ok) return rejectWithValue('Failed to fetch deal')
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload
      state.page = 1
    },
    setFilterStage(state, action) {
      state.filterStage = action.payload
      state.page = 1
    },
    setFilterClient(state, action) {
      state.filterClient = action.payload
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
    setViewMode(state, action) {
      state.viewMode = action.payload
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
      .addCase(fetchDeals.pending, (state) => {
        if (state.items.length === 0) state.loading = true
        state.error = null
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.deals
        state.total = action.payload.total
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchDeal.pending, (state) => {
        if (!state.current) state.loading = true
        state.error = null
      })
      .addCase(fetchDeal.fulfilled, (state, action) => {
        state.loading = false
        state.current = action.payload
      })
      .addCase(fetchDeal.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  setSearch,
  setFilterStage,
  setFilterClient,
  setFilterStatus,
  setSortBy,
  setViewMode,
  setPage,
  clearCurrent,
} = dealsSlice.actions
export default dealsSlice.reducer
