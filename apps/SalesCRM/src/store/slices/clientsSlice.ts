import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface Client {
  id: string
  name: string
  type: 'organization' | 'individual'
  status: 'active' | 'inactive' | 'prospect' | 'churned'
  tags: string[]
  source_type: string | null
  source_detail: string | null
  campaign: string | null
  channel: string | null
  date_acquired: string | null
  primary_contact_name: string | null
  open_deal_count: number
  next_task: string | null
  created_at: string
  updated_at: string
}

interface ClientsState {
  items: Client[]
  current: Client | null
  loading: boolean
  error: string | null
  search: string
  filterStatus: string
  filterTags: string[]
  sortBy: string
  sortDir: 'asc' | 'desc'
  page: number
  total: number
}

const initialState: ClientsState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  search: '',
  filterStatus: '',
  filterTags: [],
  sortBy: 'name',
  sortDir: 'asc',
  page: 1,
  total: 0,
}

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as { clients: ClientsState }).clients
      const params = new URLSearchParams()
      if (state.search) params.set('search', state.search)
      if (state.filterStatus) params.set('status', state.filterStatus)
      if (state.filterTags.length > 0) params.set('tags', state.filterTags.join(','))
      params.set('sortBy', state.sortBy)
      params.set('sortDir', state.sortDir)
      params.set('page', String(state.page))
      const res = await fetch(`/.netlify/functions/clients?${params}`)
      if (!res.ok) return rejectWithValue('Failed to fetch clients')
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

export const fetchClient = createAsyncThunk(
  'clients/fetchClient',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/.netlify/functions/clients/${id}`)
      if (!res.ok) return rejectWithValue('Failed to fetch client')
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload
      state.page = 1
    },
    setFilterStatus(state, action) {
      state.filterStatus = action.payload
      state.page = 1
    },
    setFilterTags(state, action) {
      state.filterTags = action.payload
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
      .addCase(fetchClients.pending, (state) => {
        if (state.items.length === 0) state.loading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.clients
        state.total = action.payload.total
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchClient.pending, (state) => {
        if (!state.current) state.loading = true
        state.error = null
      })
      .addCase(fetchClient.fulfilled, (state, action) => {
        state.loading = false
        state.current = action.payload
      })
      .addCase(fetchClient.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setSearch, setFilterStatus, setFilterTags, setSortBy, setPage, clearCurrent } = clientsSlice.actions
export default clientsSlice.reducer
