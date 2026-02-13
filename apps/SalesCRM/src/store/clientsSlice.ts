import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Client } from '../types'

interface ClientsState {
  items: Client[]
  currentClient: Client | null
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
  availableTags: string[]
  availableSources: string[]
}

const initialState: ClientsState = {
  items: [],
  currentClient: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 50,
  availableTags: [],
  availableSources: [],
}

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (params: { page?: number; search?: string; status?: string; tag?: string; source?: string; sort?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.search) query.set('search', params.search)
    if (params.status) query.set('status', params.status)
    if (params.tag) query.set('tag', params.tag)
    if (params.source) query.set('source', params.source)
    if (params.sort) query.set('sort', params.sort)
    const res = await fetch(`/.netlify/functions/clients?${query}`)
    if (!res.ok) throw new Error('Failed to fetch clients')
    return res.json() as Promise<{ clients: Client[]; total: number; tags: string[]; sources: string[] }>
  }
)

export const fetchClient = createAsyncThunk(
  'clients/fetchClient',
  async (clientId: string) => {
    const res = await fetch(`/.netlify/functions/clients/${clientId}`)
    if (!res.ok) throw new Error('Failed to fetch client')
    return res.json() as Promise<Client>
  }
)

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (data: {
    name: string
    type: string
    status?: string
    tags?: string[]
    source_type?: string
    source_detail?: string
    campaign?: string
    channel?: string
    date_acquired?: string
  }) => {
    const res = await fetch('/.netlify/functions/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create client')
    return res.json() as Promise<Client>
  }
)

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ clientId, data }: { clientId: string; data: Record<string, unknown> }) => {
    const res = await fetch(`/.netlify/functions/clients/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update client')
    return res.json() as Promise<Client>
  }
)

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (clientId: string) => {
    const res = await fetch(`/.netlify/functions/clients/${clientId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete client')
    return clientId
  }
)

export const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.clients
        state.total = action.payload.total
        state.availableTags = action.payload.tags ?? []
        state.availableSources = action.payload.sources ?? []
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Unknown error'
      })
      .addCase(fetchClient.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClient.fulfilled, (state, action) => {
        state.loading = false
        state.currentClient = action.payload
      })
      .addCase(fetchClient.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Unknown error'
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.currentClient = action.payload
        const idx = state.items.findIndex((c) => c.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload)
        state.total -= 1
      })
  },
})

export const { setPage } = clientsSlice.actions
