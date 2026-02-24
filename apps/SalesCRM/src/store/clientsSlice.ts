import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'

export interface ClientRow {
  id: string
  name: string
  type: 'Organization' | 'Individual'
  status: 'Active' | 'Inactive' | 'Prospect' | 'Churned'
  tags: string[]
  source: string | null
  primary_contact: { name: string; role: string } | null
  open_deals: { count: number; totalValue: number } | null
  next_task: { title: string; dueDate: string | null } | null
  updated_at: string
}

interface ClientsState {
  items: ClientRow[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  error: string | null
  filters: {
    search: string
    status: string
    tag: string
    source: string
    sort: string
  }
  availableTags: string[]
  availableSources: string[]
}

const initialState: ClientsState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 50,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: '',
    tag: '',
    source: '',
    sort: 'recently_updated',
  },
  availableTags: [],
  availableSources: [],
}

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { getState }) => {
    const state = (getState() as RootState).clients
    const params = new URLSearchParams()
    params.set('page', state.page.toString())
    params.set('pageSize', state.pageSize.toString())
    if (state.filters.search) params.set('search', state.filters.search)
    if (state.filters.status) params.set('status', state.filters.status)
    if (state.filters.tag) params.set('tag', state.filters.tag)
    if (state.filters.source) params.set('source', state.filters.source)
    if (state.filters.sort) params.set('sort', state.filters.sort)

    const res = await fetch(`/.netlify/functions/clients?${params}`)
    if (!res.ok) throw new Error('Failed to fetch clients')
    return res.json()
  }
)

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (data: { name: string; type: string; status: string; tags: string[]; source: string }) => {
    const res = await fetch('/.netlify/functions/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create client')
    return res.json()
  }
)

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async (data: { id: string; name: string; type: string; status: string; tags: string[]; source: string }) => {
    const { id, ...rest } = data
    const res = await fetch(`/.netlify/functions/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rest),
    })
    if (!res.ok) throw new Error('Failed to update client')
    return res.json()
  }
)

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/clients/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete client')
    return id
  }
)

export const importClients = createAsyncThunk(
  'clients/importClients',
  async (clients: { name: string; type?: string; status?: string; tags?: string; source?: string }[]) => {
    const res = await fetch('/.netlify/functions/clients?action=import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clients }),
    })
    if (!res.ok) throw new Error('Failed to import clients')
    return res.json()
  }
)

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload
      state.page = 1
    },
    setStatusFilter(state, action: PayloadAction<string>) {
      state.filters.status = action.payload
      state.page = 1
    },
    setTagFilter(state, action: PayloadAction<string>) {
      state.filters.tag = action.payload
      state.page = 1
    },
    setSourceFilter(state, action: PayloadAction<string>) {
      state.filters.source = action.payload
      state.page = 1
    },
    setSort(state, action: PayloadAction<string>) {
      state.filters.sort = action.payload
      state.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.clients
        state.total = action.payload.total
        state.page = action.payload.page
        state.pageSize = action.payload.pageSize
        state.availableTags = action.payload.availableTags
        state.availableSources = action.payload.availableSources
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch clients'
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload)
        state.total = Math.max(0, state.total - 1)
      })
  },
})

export const { setSearch, setStatusFilter, setTagFilter, setSourceFilter, setSort, setPage } = clientsSlice.actions
export default clientsSlice.reducer
